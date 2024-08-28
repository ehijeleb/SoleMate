from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny
from django.http import HttpResponseNotAllowed

class MyTokenObtainPairView(TokenObtainPairView):
    permission_classes = [AllowAny]

    def get(self, request, *args, **kwargs):
        return HttpResponseNotAllowed(['POST'])
