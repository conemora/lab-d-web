
from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password

from rest_framework import serializers


User = get_user_model()


class RegistroSerializer(serializers.Serializer):

    username = serializers.CharField(
        max_length=150
    )

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    def validate_username(self, username):
        if User.objects.filter(username=username).exists():
            raise serializers.ValidationError(
                "Este nombre de usuario ya está registrado."
            )

        return username

    def validate_password(self, password):
        validate_password(password)
        return password

    def create(self, validated_data):
        usuario = User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"]
        )

        return usuario
