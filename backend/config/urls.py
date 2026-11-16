from django.contrib import admin

from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from catalogo.views import RegistroView

urlpatterns = [
    # Registro de usuarios
path(
    "api/registro/",
    RegistroView.as_view(),
    name="registro"
),

# Inicio de sesión
path(
    "api/token/",
    TokenObtainPairView.as_view(),
    name="token_obtain_pair"
),

# Renovar token
path(
    "api/token/refresh/",
    TokenRefreshView.as_view(),
    name="token_refresh"
),
path("admin/", admin.site.urls),
path("api/", include("catalogo.urls")), # todo lo de catalogo cuelga de /api/
]
