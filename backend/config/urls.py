from django.contrib import admin

from django.urls import path, include # <-- agregar include

urlpatterns = [
path("admin/", admin.site.urls),
path("api/", include("catalogo.urls")), # todo lo de catalogo cuelga de /api/
]
