from rest_framework import serializers

from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ["id", "mes", "Accion", "Monto", "Descripcion", "activo", "Modificado_el"]
        read_only_fields = ["id", "Modificado_el"] # los genera el servidor, no el cliente

    # Validación a medida: se ejecuta automáticamente para el campo "precio"
    def validate_precio(self, Monto):
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
        if mes not in ["enero", "febrero", "marzo", "abril", "mayo", "junio", "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"]:
            raise serializers.ValidationError("El mes debe ser uno de los meses del año.")
        return mes
    # Validación a medida: se ejecuta automáticamente para el campo "Descripcion"
    def validate_Descripcion(self, Descripcion):
        if len(Descripcion) > 200:
            raise serializers.ValidationError("La descripción no puede tener más de 200 caracteres.")
        return Descripcion
    