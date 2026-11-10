from rest_framework.routers import DefaultRouter

from .views import ServicioViewSet

router = DefaultRouter()

router.register("Movimiento", ServicioViewSet, basename="Movimiento")
# El router genera /Movimiento/ y /Movimiento/<id>/ con sus métodos HTTP
urlpatterns = router.urls
