
from django.urls import path,include
from . import views
from rest_framework.routers import DefaultRouter
router = DefaultRouter()
router.register(r'jobs', views.JobViewSet, basename='job')
urlpatterns = [
    path('',include(router.urls)),
    path('extract-job/', views.JobExtractView.as_view(), name='extract-job'),
    path('applied-jobs/', views.AppliedJobsView.as_view(), name='applied-jobs'),
    path('saved-jobs/', views.SavedJobsView.as_view(), name='saved-jobs'),
    path('current-user/', views.CurrentUserView.as_view(), name='current-user'),
]