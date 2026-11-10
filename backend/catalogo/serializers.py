from rest_framework import serializers

from .models import Movimiento
from .models import Datos_Grafica


class DatosGraficaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datos_Grafica
        fields = ["id", "mes", "MontoTotal"]
        read_only_fields = ["id"] # los genera el servidor, no el cliente

    def validate_mes(self, mes):
        mes_limpio = mes.strip().lower()
        if mes_limpio not in ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]:
            if mes_limpio not in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]:
                raise serializers.ValidationError("El mes ingresado no es valido(mes falso o numero fuera del intervalo [1,12]).")
        return mes_limpio.capitalize()
    def validate_MontoTotal(self, MontoTotal):

        if MontoTotal <= 0:
            raise serializers.ValidationError("El monto del mes debe ser mayor que 0.(el gasto del mes no puede disminuir el monto abajo de 0)")
        return MontoTotal
class MovimientoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Movimiento
        fields = ["id", "mes", "Accion", "Monto", "Descripcion", "activo", "Modificado_el"]
        read_only_fields = ["id", "Modificado_el"] # los genera el servidor, no el cliente

    # Validación a medida: se ejecuta automáticamente para el campo "precio"
    def validate_Monto(self, Monto):
        if Monto <= 0:
            raise serializers.ValidationError("El monto debe ser mayor que 0.")
        return Monto
    # Validacion de accion
    def validate_Accion(self, Accion):
        if Accion not in ["ingresar", "cambiar", "eliminar"]:
            raise serializers.ValidationError("La accion debe ser 'ingresar', 'cambiar' o 'eliminar'.")
        return Accion
    # Validación a medida: se ejecuta automáticamente para el campo "mes"
    def validate_mes(self, mes):
        mes_limpio = mes.strip().lower()
        if mes_limpio not in ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]:
            if mes_limpio not in ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]:
                raise serializers.ValidationError("El mes ingresado no es valido(mes falso o numero fuera del intervalo [1,12]).")
        return mes_limpio.capitalize()

    # Validación a medida: se ejecuta automáticamente para el campo "Descripcion"
    def validate_Descripcion(self, Descripcion):
        if len(Descripcion) > 200:
            raise serializers.ValidationError("La descripción no puede tener más de 200 caracteres.")
        return Descripcion
    
    def create(self, validated_data):
        # 1. Guardamos primero el movimiento de forma normal
        movimiento = Movimiento.objects.create(**validated_data)
        
        mes_actual = validated_data.get('mes')
        monto_ingresado = validated_data.get('Monto')

        # 2. Buscamos en la otra tabla (Datos_Grafica) por el mes
        # get_or_create busca si el mes ya existe; si no, lo crea.
        dato_grafica, creado = Datos_Grafica.objects.get_or_create(
            mes__iexact=mes_actual,
            defaults={'mes': mes_actual, 'MontoTotal': monto_ingresado}
        )

        # 3. Si ya existía, actualizamos su MontoTotal sumándole el nuevo monto
        if not creado:
            dato_grafica.MontoTotal += monto_ingresado
            dato_grafica.save()

        return movimiento

