from django.contrib.auth import get_user_model
from rest_framework import serializers

from config.messages import msgs

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source="first_name")

    class Meta:
        model = User
        fields = ["id", "name", "email"]


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField(error_messages=msgs("email"))
    password = serializers.CharField(error_messages=msgs("password"))


class RegisterSerializer(LoginSerializer):
    name = serializers.CharField(max_length=50, error_messages=msgs("name"))
    short = "Please enter at least 8 characters for the password"
    password = serializers.CharField(min_length=8, error_messages={**msgs("password"), "min_length": short})

    def validate_email(self, value):
        email = value.lower()
        if User.objects.filter(username=email).exists(): raise serializers.ValidationError("This email is already registered")
        return email

    def create(self, data):
        return User.objects.create_user(username=data["email"], email=data["email"], password=data["password"], first_name=data["name"])
