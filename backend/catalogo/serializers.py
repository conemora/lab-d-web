from django.db import DatabaseError, IntegrityError, transaction
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
    mes_limpio = str(mes).strip().lower()
    if mes_limpio in MESES_NUM_A_NOMBRE:
        mes_limpio = MESES_NUM_A_NOMBRE[mes_limpio]
    if mes_limpio not in MESES_VALIDOS:
        raise serializers.ValidationError(
            "El mes ingresado no es válido (mes inexistente o número fuera de [1, 12])."
        )
    return mes_limpio.capitalize()


class DatosGraficaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datos_Grafica
        fields = ["id", "mes", "MontoTotal"]
        read_only_fields = ["id"]

    def validate_mes(self, mes):
        return normalizar_mes(mes)

    def validate_MontoTotal(self, MontoTotal):
        if not isinstance(MontoTotal, (int, float)):
            raise serializers.ValidationError("El monto del mes debe ser un número.")
        return MontoTotal


class MovimientoSerializer(serializers.ModelSerializer):
    Accion = serializers.ChoiceField(
        choices=["ingresar", "cambiar", "eliminar"],
        default="ingresar",
    )
    Descripcion = serializers.CharField(
        max_length=200,
        required=False,
        allow_blank=True,
        default="",
    )

    class Meta:
        model = Movimiento
        fields = ["id", "mes", "Accion", "Monto", "Descripcion", "activo", "Modificado_el"]
        read_only_fields = ["id", "Modificado_el"]

    def validate_Monto(self, Monto):
        if not isinstance(Monto, (int, float)):
            raise serializers.ValidationError("El monto debe ser un número.")
        return Monto

    def validate_mes(self, mes):
        return normalizar_mes(mes)

    def validate(self, attrs):
        accion = attrs.get("Accion", "ingresar")
        mes = attrs.get("mes")

        if accion == "ingresar" and mes:
            try:
                ya_existe = Datos_Grafica.objects.filter(mes__iexact=mes).exists()
            except DatabaseError as exc:
                raise serializers.ValidationError({
                    "detail": "No se pudo verificar si el mes ya existe por un error en la base de datos."
                }) from exc

            if ya_existe:
                raise serializers.ValidationError({
                    "mes": f"El mes '{mes}' ya existe. Usa 'cambiar' o 'eliminar' para modificarlo."
                })

        return attrs

    def create(self, validated_data):
        mes_actual = validated_data.get("mes")
        monto_ingresado = validated_data.get("Monto", 0)
        accion = validated_data.get("Accion", "ingresar")

        try:
            with transaction.atomic():
                # Savepoint anidado para aislar errores de unicidad sin romper la transacción externa
                with transaction.atomic():
                    dato_grafica = Datos_Grafica.objects.filter(mes__iexact=mes_actual).first()

                    if dato_grafica is None:
                        monto_inicial = (
                            max(0, monto_ingresado)
                            if accion in ["ingresar", "cambiar"]
                            else 0
                        )
                        dato_grafica = Datos_Grafica.objects.create(
                            mes=mes_actual,
                            MontoTotal=monto_inicial,
                        )
                    else:
                        if accion in ["ingresar", "cambiar"]:
                            dato_grafica.MontoTotal = max(
                                0, dato_grafica.MontoTotal + monto_ingresado
                            )
                        elif accion == "eliminar":
                            dato_grafica.MontoTotal = 0
                        dato_grafica.save(update_fields=["MontoTotal"])

                # Solo se registra en Movimiento si Datos_Grafica se actualizó sin errores
                movimiento = Movimiento.objects.create(**validated_data)
                return movimiento

        except serializers.ValidationError:
            raise

        except IntegrityError as exc:
            raise serializers.ValidationError({
                "mes": f"El mes '{mes_actual}' ya existe o viola una restricción de unicidad."
            }) from exc

        except DatabaseError as exc:
            raise serializers.ValidationError({
                "detail": "Error temporal de base de datos en SQLite. Intenta nuevamente."
            }) from exc