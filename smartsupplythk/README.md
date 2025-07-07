# Smart Supply - Abastecimiento Inteligente

Smart Supply es una aplicación web inteligente diseñada para automatizar y optimizar el abastecimiento de productos para tiendas minoristas.

## 🚀 Características

- 📊 **Análisis de ventas históricas** (2-20 semanas configurables)
- 🔄 **Cálculo automático de stock ideal** basado en patrones de venta
- 📈 **Recomendaciones de abastecimiento** personalizadas
- 📋 **Exportación a Excel** con reportes detallados
- 🔍 **Filtros de búsqueda avanzados** por SKU y nombre
- 📱 **Diseño responsive** para cualquier dispositivo
- ⚡ **Procesamiento rápido** de archivos CSV y Excel

## 📋 Cómo usar

### Paso 1: Configura tu análisis
Selecciona cuántas semanas de historial de ventas deseas analizar (mínimo 2, máximo 20).

### Paso 2: Prepara tus datos
Tu archivo CSV o Excel debe contener las siguientes columnas:

- `ID_Producto / SKU` - Identificador único del producto
- `Nombre` - Nombre del producto
- `Fecha` - Fecha de la venta (formato DD/MM/AAAA)
- `Unidades_Vendidas` - Cantidad vendida
- `Semanas_Cobertura_Stock` - Semanas de cobertura deseadas
- `Stock_Actual` - Inventario actual
- `Lead_Time_Dias` - Tiempo de reposición en días
- `Frecuencia_Reposicion` - Frecuencia de reposición

### Paso 3: Sube tu archivo
Arrastra y suelta tu archivo CSV o Excel, o haz clic para seleccionarlo.

### Paso 4: Revisa y exporta
Los resultados se mostrarán instantáneamente. Puedes filtrar por SKU o nombre y exportar todo a Excel.

## 🎯 Beneficios