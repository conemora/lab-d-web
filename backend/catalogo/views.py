from django.db import DatabaseError, IntegrityError, transaction
from rest_framework import status, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response

from .models import Datos_Grafica, Movimiento
from .serializers import (
    DatosGraficaSerializer,
    MovimientoSerializer,
    normalizar_mes,
)


class DatosGraficaViewSet(viewsets.ModelViewSet):
    queryset = Datos_Grafica.objects.all()
    serializer_class = DatosGraficaSerializer
    # GET /api/Datos_Grafica/ -> usa list() automáticamente para el gráfico


class MovimientoViewSet(viewsets.ModelViewSet):
    queryset = Movimiento.objects.all()
    serializer_class = MovimientoSerializer

    # 1. "ingresar" -> POST /api/Movimiento/ (usa create del serializer)
    def create(self, request, *args, **kwargs):
        data = request.data.copy()
        data["Accion"] = "ingresar"

        serializer = self.get_serializer(data=data)
        serializer.is_valid(raise_exception=True)
        movimiento = serializer.save()

        return Response(
            self.get_serializer(movimiento).data,
            status=status.HTTP_201_CREATED,
        )

    # 2. "cambio" -> POST /api/Movimiento/cambiar/
    @action(detail=False, methods=["post"], url_path="cambiar")
    def cambiar(self, request):
        try:
            mes = normalizar_mes(request.data.get("mes", ""))
        except Exception as exc:
            return Response(
                {"mes": [str(exc.detail[0]) if hasattr(exc, "detail") else str(exc)]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        monto = request.data.get("Monto")
        if not isinstance(monto, (int, float)):
            return Response(
                {"Monto": ["El monto debe ser un número."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        descripcion = request.data.get("Descripcion", "Cambio de monto")

        try:
            with transaction.atomic():
                dato_grafica = Datos_Grafica.objects.filter(mes__iexact=mes).first()
                if dato_grafica is None:
                    return Response(
                        {"mes": [f"El mes '{mes}' no existe en Datos_Grafica."]},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                dato_grafica.MontoTotal = max(0, dato_grafica.MontoTotal + monto)
                dato_grafica.save(update_fields=["MontoTotal"])

                movimiento = Movimiento.objects.create(
                    mes=mes,
                    Accion="cambiar",
                    Monto=monto,
                    Descripcion=descripcion,
                )

            return Response(
                MovimientoSerializer(movimiento).data,
                status=status.HTTP_200_OK,
            )

        except IntegrityError as exc:
            return Response(
                {"mes": [f"No se pudo actualizar '{mes}' por restricción de integridad."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except DatabaseError as exc:
            return Response(
                {"detail": "Error temporal de base de datos en SQLite. Intenta nuevamente."},
                status=status.HTTP_400_BAD_REQUEST,
            )

    # 3. "eliminar" -> DELETE /api/Movimiento/eliminar/?mes=...
    @action(detail=False, methods=["delete"], url_path="eliminar")
    def eliminar(self, request):
        mes_crudo = request.query_params.get("mes") or request.data.get("mes", "")

        try:
            mes = normalizar_mes(mes_crudo)
        except Exception as exc:
            return Response(
                {"mes": [str(exc.detail[0]) if hasattr(exc, "detail") else str(exc)]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                dato_grafica = Datos_Grafica.objects.filter(mes__iexact=mes).first()
                if dato_grafica is None:
                    return Response(
                        {"mes": [f"El mes '{mes}' no existe."]},
                        status=status.HTTP_404_NOT_FOUND,
                    )

                dato_grafica.MontoTotal = 0
                dato_grafica.save(update_fields=["MontoTotal"])

                movimiento = Movimiento.objects.create(
                    mes=mes,
                    Accion="eliminar",
                    Monto=0,
                    Descripcion="Eliminación de monto mensual",
                )

            return Response(
                MovimientoSerializer(movimiento).data,
                status=status.HTTP_200_OK,
            )

        except IntegrityError as exc:
            return Response(
                {"mes": [f"No se pudo limpiar '{mes}' por restricción de integridad."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except DatabaseError as exc:
            return Response(
                {"detail": "Error temporal de base de datos en SQLite. Intenta nuevamente."},
                status=status.HTTP_400_BAD_REQUEST,
            )
@api_view(["DELETE"])
def limpiar_todo(request):
    try:
        with transaction.atomic():
            Movimiento.objects.all().delete()
            Datos_Grafica.objects.all().delete()
        return Response(
            {"detail": "Toda la información de movimientos y gráfica fue eliminada."},
            status=status.HTTP_200_OK,
        )
    except DatabaseError:
        return Response(
            {"detail": "No se pudo limpiar la base de datos por un error de SQLite."},
            status=status.HTTP_400_BAD_REQUEST,
        )
