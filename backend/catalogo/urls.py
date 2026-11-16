
from django.urls import path

from .views import (
    DatosGraficaView,
    MovimientoHistorialView,
    MovimientoIngresoView,
    MovimientoAjusteView,
    LimpiarMovimientosView,
)

urlpatterns = [
    path(
        "Datos_Grafica/",
        DatosGraficaView.as_view(),
        name="datos_grafica"
    ),

    path(
        "Movimiento/",
        MovimientoHistorialView.as_view(),
        name="movimiento_historial"
    ),

    path(
        "Movimiento/ingresar/",
        MovimientoIngresoView.as_view(),
        name="movimiento_ingresar"
    ),

    path(
        "Movimiento/ajustar/",
        MovimientoAjusteView.as_view(),
        name="movimiento_ajustar"
    ),

    path(
        "limpiar/",
        LimpiarMovimientosView.as_view(),
        name="limpiar_movimientos"
    ),
]
