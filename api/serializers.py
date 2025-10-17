from rest_framework import serializers
from backends.models import Job, AppliedJob, SavedJob
from django.contrib.auth.models import User
from rest_framework.permissions import IsAuthenticated
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'password']
        extra_kwargs = {'password': {'write_only': True}}
    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        return user

class JobSerializer(serializers.ModelSerializer):
    posted_by_username = serializers.CharField(source='posted_by.username', read_only=True)
    class Meta:
        model = Job
        fields = '__all__'
        extra_kwargs = {'posted_by': {'read_only': True}}

        
class JobExtractSerializer(serializers.Serializer):
    post_text = serializers.CharField(required=True, allow_blank=False)
    job_url = serializers.URLField(required=False, allow_blank=True)
    permission_classes = [IsAuthenticated] # Ensure only authenticated users can access

class AppliedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppliedJob
        fields = '__all__'
        extra_kwargs = {'applicant_name': {'read_only': True}}
        permission_classes = [IsAuthenticated] # Ensure only authenticated users can access
        
class SavedJobSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedJob
        fields = '__all__'
        extra_kwargs = {'applicant_name': {'read_only': True}}
        permission_classes = [IsAuthenticated] # Ensure only authenticated users can access