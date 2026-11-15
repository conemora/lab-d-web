from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import DatosGraficaViewSet, MovimientoViewSet, limpiar_todo

router = DefaultRouter()
router.register("Datos_Grafica", DatosGraficaViewSet, basename="Datos_Grafica")
router.register("Movimiento", MovimientoViewSet, basename="Movimiento")

urlpatterns = [
    path("limpiar/", limpiar_todo, name="limpiar_todo"),
    path("", include(router.urls)),
]