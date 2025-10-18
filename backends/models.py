from django.db import models
from django.contrib.auth.models import User

class Job(models.Model):
    JOB_TYPES = [
        ('FULL_TIME', 'Full Time'),
        ('PART_TIME', 'Part Time'),
        ('CONTRACT', 'Contract'),
        ('REMOTE', 'Remote'),
        ('INTERNSHIP', 'Internship'),
    ]

    VISIBILITY_CHOICES = [
        ('PUBLIC', 'Public'),
        ('PRIVATE', 'Private'),
        ('MUTUAL', 'Mutual'),
    ]

    title = models.CharField(max_length=255)
    company = models.CharField(max_length=255, blank=True, null=True)
    skills = models.JSONField(default=list)
    experience = models.TextField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    salary = models.CharField(max_length=100, blank=True, null=True)
    job_type = models.CharField(max_length=20, choices=JOB_TYPES, default='FULL_TIME')
    deadline = models.CharField(max_length=100, blank=True, null=True)
    description = models.TextField(blank=True, null=True)
    requirements = models.JSONField(default=list)
    benefits = models.JSONField(default=list)
    post_url = models.TextField(blank=True, null=True)
    original_text = models.TextField()

    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)
    views = models.IntegerField(default=0)
    viewed_by = models.ManyToManyField(User, blank=True, related_name='viewed_jobs')
    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='jobs',
        null=True,
        blank=True
    )

    # 👇 NEW FIELD — defaults to Public
    visibility = models.CharField(
        max_length=10,
        choices=VISIBILITY_CHOICES,
        default='PUBLIC',  # ✅ Default visibility
        help_text="Who can view this job: Public, Private, or Mutual"
    )

    def __str__(self):
        return f"{self.posted_by.username} posted {self.title} ({self.visibility})"

    
class AppliedJob(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='applications')
    applicant_name = models.ForeignKey(User, on_delete=models.CASCADE, related_name='applied_jobs')
    def __str__(self):
        return f"{self.applicant_name.username} applied for {self.job.title}"
    
class SavedJob(models.Model):
    job = models.ForeignKey(Job, on_delete=models.CASCADE, related_name='saved_jobs')
    applicant_name = models.ForeignKey(User, on_delete=models.CASCADE, related_name='saved_jobs')
    def __str__(self):
        return f"{self.applicant_name.username} saved {self.job.title}"