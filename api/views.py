from backends.models import Job, AppliedJob, SavedJob
from .serializers import JobSerializer, JobExtractSerializer, AppliedJobSerializer, SavedJobSerializer
from rest_framework import viewsets,status
from rest_framework.response import Response
from backends.job_extractor import extract_job_info
from rest_framework.views import APIView
from django.contrib.auth.models import User
from .serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.db.models import Q            
from rest_framework import generics, status
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action

class UserCreate(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [AllowAny]
  
class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        return Response({"username": request.user.username})
    


from rest_framework.exceptions import PermissionDenied
from django.db.models import Q

class JobViewSet(viewsets.ModelViewSet):
    serializer_class = JobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        user_only = self.request.query_params.get('user_only')
        sort_by = self.request.query_params.get('sort_by')

        queryset = Job.objects.filter(is_active=True)

        applied_ids = AppliedJob.objects.filter(applicant_name=user).values_list('job_id', flat=True)
        saved_ids = SavedJob.objects.filter(applicant_name=user).values_list('job_id', flat=True)
        related_job_ids = set(list(applied_ids) + list(saved_ids))

        if user_only:
            return queryset.filter(
                Q(posted_by=user) | Q(id__in=related_job_ids)
            )

        else : queryset.filter(
            Q(visibility='PUBLIC') |
            Q(posted_by=user) |
            Q(id__in=related_job_ids)
        )
            # ✅ Sorting logic
        if sort_by == 'recent':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'most_viewed':
            queryset = queryset.order_by('-views')
            
        return queryset

    def perform_create(self, serializer):
        serializer.save(posted_by=self.request.user)

    def perform_update(self, serializer):
        if serializer.instance.posted_by != self.request.user:
            raise PermissionDenied("You cannot edit someone else's job.")
        serializer.save()

    def perform_destroy(self, instance):
        if instance.posted_by != self.request.user:
            raise PermissionDenied("You cannot delete someone else's job.")
        instance.delete()
    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        self.increment_view_count(instance, request.user)
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    @action(detail=True, methods=['post'], url_path='increment-view')
    def increment_view(self, request, pk=None):
        job = self.get_object()
        user = request.user

        if user != job.posted_by and not job.viewed_by.filter(id=user.id).exists():
            job.views += 1
            job.save(update_fields=['views'])
            job.viewed_by.add(user)  # mark user as having viewed

        return Response({'views': job.views})
     



            

class JobExtractView(APIView):
    """
    POST /api/v1/extract-job/
    Body: {"post_text": "We are hiring..."}
    """
    serializer_class = JobExtractSerializer  # Add this for DRF UI
    
    def post(self, request):
        serializer = JobExtractSerializer(data=request.data)
        
        if not serializer.is_valid():
            return Response(serializer.errors, 
                            status=status.HTTP_400_BAD_REQUEST)
        
        post_text = serializer.validated_data['post_text']
        job_url = serializer.validated_data.get('job_url', '')
        try:
            extracted = extract_job_info(post_text=post_text)
            extracted['job_url'] = job_url  # Debugging line
            extracted['post_text'] = post_text  # Include original text
            return Response(extracted, status=status.HTTP_200_OK)
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class AppliedJobsView(generics.ListCreateAPIView):
    serializer_class = AppliedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # List of jobs the current user applied to
        return AppliedJob.objects.filter(applicant_name=self.request.user)

    def create(self, request, *args, **kwargs):
        """Handle applying to a job (POST)"""
        job_id = request.data.get('job_id')

        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if job.posted_by != request.user and not job.viewed_by.filter(id=request.user.id).exists():
            job.views += 1
            job.viewed_by.add(request.user)
            job.save(update_fields=['views'])

        # If already applied, return message instead of error
        if AppliedJob.objects.filter(job=job, applicant_name=request.user).exists():
            return Response({"message": "Already applied"}, status=status.HTTP_200_OK)

        # Otherwise, create new application
        applied_job = AppliedJob.objects.create(job=job, applicant_name=request.user)
        serializer = AppliedJobSerializer(applied_job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        """Handle unapplying (DELETE)"""
        job_id = request.data.get('job_id')

        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            applied_job = AppliedJob.objects.get(
                job__id=job_id,
                applicant_name=request.user
            )
            applied_job.delete()
            return Response({"message": "Unapplied successfully"}, status=status.HTTP_204_NO_CONTENT)
        except AppliedJob.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)

class SavedJobsView(generics.ListCreateAPIView):
    serializer_class = SavedJobSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        # List of jobs the current user applied to
        return SavedJob.objects.filter(applicant_name=self.request.user)

    def create(self, request, *args, **kwargs):
        """Handle applying to a job (POST)"""
        job_id = request.data.get('job_id')

        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            job = Job.objects.get(id=job_id)
        except Job.DoesNotExist:
            return Response({"error": "Job not found"}, status=status.HTTP_404_NOT_FOUND)
        
        if job.posted_by != request.user and not job.viewed_by.filter(id=request.user.id).exists():
            job.views += 1
            job.viewed_by.add(request.user)
            job.save(update_fields=['views'])

        # If already applied, return message instead of error
        if SavedJob.objects.filter(job=job, applicant_name=request.user).exists():
            return Response({"message": "Already applied"}, status=status.HTTP_200_OK)

        # Otherwise, create new application
        applied_job = SavedJob.objects.create(job=job, applicant_name=request.user)
        serializer = SavedJobSerializer(applied_job)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    def delete(self, request, *args, **kwargs):
        """Handle unapplying (DELETE)"""
        job_id = request.data.get('job_id')

        if not job_id:
            return Response({"error": "job_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            applied_job = SavedJob.objects.get(
                job__id=job_id,
                applicant_name=request.user
            )
            applied_job.delete()
            return Response({"message": "Unsaved successfully"}, status=status.HTTP_204_NO_CONTENT)
        except SavedJob.DoesNotExist:
            return Response({"error": "Application not found"}, status=status.HTTP_404_NOT_FOUND)
