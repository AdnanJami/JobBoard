from django.contrib import admin
from .models import Job, AppliedJob, SavedJob
#  Register your models here.
admin.site.register(Job)
admin.site.register(AppliedJob)
admin.site.register(SavedJob)

