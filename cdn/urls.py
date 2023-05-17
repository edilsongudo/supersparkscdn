from django.urls import path
from . import views


urlpatterns = [
    path('<str:file_slug>/', views.javascript_file_view, name='javascript_file_view'),
]
