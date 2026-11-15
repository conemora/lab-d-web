from django.contrib import admin

from .models import Movimiento

@admin.register(Movimiento)
class MovimientoAdmin(admin.ModelAdmin):
    list_display = ("mes","Accion", "Monto","Descripcion", "activo", "Modificado_el") # columnas del listado
    list_filter = ("activo",) # filtro lateral
    search_fields = ("mes",) # barra de búsqueda