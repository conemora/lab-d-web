from django.db import models

class Movimiento(models.Model):
    mes = models.CharField(max_length=10) # texto corto
    Accion = models.CharField(max_length=9) # texto
    Monto = models.IntegerField() # número entero
    Descripcion = models.TextField(max_length=200) # texto largo
    activo = models.BooleanField(default=True) # visible u oculto
    Modificado_el = models.DateTimeField(auto_now_add=True) # se llena solo al crear

    class Meta:
        ordering = ["mes"] # orden por defecto de las consultas
        verbose_name_plural = "Movimientos" # cómo se ve en el admin

    def __str__(self):
        return f"{self.mes} - {self.Accion}: ${self.Monto} ({self.Descripcion})"

class Datos_Grafica(models.Model):
    mes = models.CharField(max_length=10) # texto corto
    MontoTotal = models.IntegerField() # número entero

    class Meta:
        ordering = ["mes"] # orden por defecto de las consultas
        verbose_name_plural = "Datos_Grafica" # cómo se ve en el admin

    def __str__(self):
        # Texto que Django muestra cuando imprime el objeto (admin, shell)
        return f"{self.mes}: ${self.MontoTotal}"
