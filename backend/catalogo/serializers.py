
from rest_framework import serializers

from .models import Datos_Grafica, Movimiento


MESES_NUM_A_NOMBRE = {
    "1": "enero",
    "2": "febrero",
    "3": "marzo",
    "4": "abril",
    "5": "mayo",
    "6": "junio",
    "7": "julio",
    "8": "agosto",
    "9": "septiembre",
    "10": "octubre",
    "11": "noviembre",
    "12": "diciembre",
}

MESES_VALIDOS = set(MESES_NUM_A_NOMBRE.values())


def normalizar_mes(mes):
    mes = str(mes).strip().lower()

    if mes in MESES_NUM_A_NOMBRE:
        mes = MESES_NUM_A_NOMBRE[mes]

    if mes not in MESES_VALIDOS:
        raise serializers.ValidationError(
            "El mes ingresado no es válido."
        )

    return mes.capitalize()


# SOLO CONSULTA DE LA GRÁFICA
class DatosGraficaSerializer(serializers.ModelSerializer):

    class Meta:
        model = Datos_Grafica
        fields = ["id", "mes", "MontoTotal"]
        read_only_fields = fields


# HISTORIAL DE MOVIMIENTOS
class MovimientoSerializer(serializers.ModelSerializer):

    class Meta:
        model = Movimiento
        fields = [
            "id",
            "mes",
            "Accion",
            "Monto",
            "Descripcion",
            "activo",
            "Modificado_el",
        ]
        read_only_fields = fields


# SOLO INGRESAR AHORROS
class MovimientoIngresoSerializer(serializers.Serializer):

    mes = serializers.CharField(max_length=10)

    Monto = serializers.IntegerField(
        min_value=1
    )

    Descripcion = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        default="Ingreso de ahorro"
    )

    def validate_mes(self, mes):
        return normalizar_mes(mes)

    def validate(self, attrs):
        usuario = self.context["request"].user

        existe = Datos_Grafica.objects.filter(
            usuario=usuario,
            mes__iexact=attrs["mes"]
        ).exists()

        if existe:
            raise serializers.ValidationError({
                "mes": "Ya existe un registro para este mes."
            })

        return attrs


# CAMBIAR O ELIMINAR MONTOS
class MovimientoAjusteSerializer(serializers.Serializer):

    mes = serializers.CharField(max_length=10)

    Accion = serializers.ChoiceField(
        choices=["cambiar", "eliminar"]
    )

    Monto = serializers.IntegerField(
        required=False
    )

    Descripcion = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        default=""
    )

    def validate_mes(self, mes):
        return normalizar_mes(mes)

    def validate(self, attrs):

        accion = attrs["Accion"]

        if accion == "cambiar" and "Monto" not in attrs:
            raise serializers.ValidationError({
                "Monto": "Debes ingresar un monto para cambiar."
            })

        if accion == "eliminar":
            attrs["Monto"] = 0

            if not attrs["Descripcion"]:
                attrs["Descripcion"] = (
                    "Eliminación de monto mensual"
                )

        return attrs
