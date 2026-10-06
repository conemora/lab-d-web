from rest_framework import serializers

from .models import Servicio

class ServicioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Servicio
        fields = ["id", "nombre", "descripcion", "precio", "activo", "creado_en"]
        read_only_fields = ["id", "creado_en"] # los genera el servidor, no el cliente

    # Validación a medida: se ejecuta automáticamente para el campo "precio"
    def validate_precio(self, value):
        if value <= 0:
            raise serializers.ValidationError("El precio debe ser mayor que 0.")
        return value