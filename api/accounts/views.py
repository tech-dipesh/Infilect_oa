from django.contrib.auth import authenticate
from rest_framework.generics import GenericAPIView, RetrieveAPIView
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken

from accounts.serializers import LoginSerializer, RegisterSerializer, UserSerializer


def with_tokens(user):
    refresh = RefreshToken.for_user(user)
    return {"user": UserSerializer(user).data, "access": str(refresh.access_token), "refresh": str(refresh)}


class RegisterView(GenericAPIView):
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, req):
        serializer = self.get_serializer(data=req.data)
        serializer.is_valid(raise_exception=True)
        return Response(with_tokens(serializer.save()), status=201)


class LoginView(GenericAPIView):
    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    authentication_classes = []

    def post(self, req):
        serializer = self.get_serializer(data=req.data)
        serializer.is_valid(raise_exception=True)
        email, password = serializer.validated_data["email"].lower(), serializer.validated_data["password"]
        user = authenticate(username=email, password=password)
        if not user: return Response({"error": "Invalid email or password"}, status=401)
        return Response(with_tokens(user))


class MeView(RetrieveAPIView):
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
