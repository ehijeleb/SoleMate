from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('users.urls')),  # This includes the users app URLs
    # Other app URLs can be included similarly
]
