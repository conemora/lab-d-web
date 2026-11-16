
from django.db import DatabaseError, transaction

from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from .auth_serializers import RegistroSerializer

from .models import Datos_Grafica, Movimiento
from .serializers import (
    DatosGraficaSerializer,
    MovimientoSerializer,
    MovimientoIngresoSerializer,
    MovimientoAjusteSerializer,
)

# 1. GRÁFICA: SOLAMENTE GET
class DatosGraficaView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        datos = Datos_Grafica.objects.filter(
            usuario=request.user
        ).order_by("id")

        serializer = DatosGraficaSerializer(
            datos,
            many=True
        )

        return Response(serializer.data)


# 2. HISTORIAL: SOLAMENTE GET
class MovimientoHistorialView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        movimientos = Movimiento.objects.filter(
            usuario=request.user
        ).order_by("-Modificado_el", "-id")

        serializer = MovimientoSerializer(
            movimientos,
            many=True
        )

        return Response(serializer.data)


# 3. INGRESAR AHORRO: SOLAMENTE POST
class MovimientoIngresoView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MovimientoIngresoSerializer(
            data=request.data,
            context={"request": request}
        )

        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data

        try:
            with transaction.atomic():

                # Comprobar nuevamente que el mes no exista
                existe = Datos_Grafica.objects.filter(
                    usuario=request.user,
                    mes__iexact=datos["mes"]
                ).exists()

                if existe:
                    return Response(
                        {"mes": ["Este mes ya tiene un registro."]},
                        status=status.HTTP_400_BAD_REQUEST
                    )

                # Crear el registro de la gráfica
                Datos_Grafica.objects.create(
                    usuario=request.user,
                    mes=datos["mes"],
                    MontoTotal=datos["Monto"]
                )

                # Crear el movimiento del historial
                movimiento = Movimiento.objects.create(
                    usuario=request.user,
                    mes=datos["mes"],
                    Accion="ingresar",
                    Monto=datos["Monto"],
                    Descripcion=datos["Descripcion"],
                    activo=True
                )

            return Response(
                MovimientoSerializer(movimiento).data,
                status=status.HTTP_201_CREATED
            )

        except DatabaseError:
            return Response(
                {"detail": "No se pudo registrar el ahorro."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# 4. CAMBIAR O ELIMINAR MONTO: SOLAMENTE POST
class MovimientoAjusteView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MovimientoAjusteSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)
        datos = serializer.validated_data

        try:
            with transaction.atomic():

                dato_grafica = Datos_Grafica.objects.filter(
                    usuario=request.user,
                    mes__iexact=datos["mes"]
                ).first()

                if dato_grafica is None:
                    return Response(
                        {"mes": ["No existe un registro para ese mes."]},
                        status=status.HTTP_404_NOT_FOUND
                    )

                accion = datos["Accion"]
                monto = datos["Monto"]

                if accion == "cambiar":
                    # Sumar el monto, incluso si es negativo
                    dato_grafica.MontoTotal += monto

                elif accion == "eliminar":
                    # Reiniciar el mes a cero
                    dato_grafica.MontoTotal = 0

                dato_grafica.save(
                    update_fields=["MontoTotal"]
                )

                movimiento = Movimiento.objects.create(
                    usuario=request.user,
                    mes=dato_grafica.mes,
                    Accion=accion,
                    Monto=monto,
                    Descripcion=datos["Descripcion"],
                    activo=True
                )

            return Response(
                MovimientoSerializer(movimiento).data,
                status=status.HTTP_200_OK
            )

        except DatabaseError:
            return Response(
                {"detail": "No se pudo modificar el ahorro."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


# 5. ELIMINAR Movimientos y Datos de Gráfica: SOLAMENTE DELETE
class LimpiarMovimientosView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request):
        try:
            with transaction.atomic():

                # Eliminar todos los movimientos del usuario
                movimientos_eliminados, _ = (
                    Movimiento.objects.filter(
                        usuario=request.user
                    ).delete()
                )

                # Eliminar todos sus datos de la gráfica
                datos_eliminados, _ = (
                    Datos_Grafica.objects.filter(
                        usuario=request.user
                    ).delete()
                )

            return Response(
                {
                    "detail": "Tu información fue eliminada correctamente.",
                    "movimientos_eliminados": movimientos_eliminados,
                    "datos_grafica_eliminados": datos_eliminados
                },
                status=status.HTTP_200_OK
            )

        except DatabaseError:
            return Response(
                {"detail": "No se pudo eliminar la información."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

# 6. REGISTRO DE USUARIOS: PÚBLICO
class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)
        usuario = serializer.save()

        return Response(
            {
                "detail": "Usuario registrado correctamente.",
                "username": usuario.username
            },
            status=status.HTTP_201_CREATED
        )
