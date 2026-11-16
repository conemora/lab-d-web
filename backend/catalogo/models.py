
from django.db import models
from django.conf import settings


class Movimiento(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="movimientos",
        null=True,
        blank=True
    )

    mes = models.CharField(max_length=10)
    Accion = models.CharField(max_length=9)
    Monto = models.IntegerField()
    Descripcion = models.TextField(max_length=200)
    activo = models.BooleanField(default=True)
    Modificado_el = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["mes"]
        verbose_name_plural = "Movimientos"

    def __str__(self):
        return (
            f"{self.mes} - {self.Accion}: "
            f"${self.Monto} ({self.Descripcion})"
        )


class Datos_Grafica(models.Model):
    usuario = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="datos_grafica",
        null=True,
        blank=True
    )

    mes = models.CharField(max_length=10)
    MontoTotal = models.IntegerField()

    class Meta:
        ordering = ["mes"]
        verbose_name_plural = "Datos_Grafica"

    def __str__(self):
        return f"{self.mes}: ${self.MontoTotal}"
