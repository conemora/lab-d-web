from django.db import models

class Movimiento(models.Model):
    mes = models.CharField(max_length=10) # texto corto
    Accion = models.CharField(max_length=9) # texto
    Monto = models.IntegerField(min_value=0) # número entero positivo
    Descripcion = models.TextField(max_length=200) # texto largo
    activo = models.BooleanField(default=True) # visible u oculto
    Modificado_el = models.DateTimeField(auto_now_add=True) # se llena solo al crear

class Meta:
    ordering = ["mes"] # orden por defecto de las consultas
    verbose_name_plural = "Movimientos" # cómo se ve en el admin

def __str__(self):
    # Texto que Django muestra cuando imprime el objeto (admin, shell)
    return self.Accion