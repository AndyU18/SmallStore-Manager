# Requisitos del Sistema - SmallStore Manager

Sistema web para gestionar productos, controlar stock, registrar ventas, calcular ganancias y visualizar reportes de una tienda pequeña.

## Módulos Principales

### 1. Autenticación
- **Login**: Autenticación segura de usuarios (Administrador y Vendedor) mediante correo y contraseña.
- **Registro inicial**: Creación del primer usuario administrador al inicializar el sistema.
- **Protección de Rutas**: Acceso restringido en el frontend y backend basado en roles (ADMIN, SELLER) y tokens JWT.
- **Contraseña encriptada**: Uso de `bcrypt` para encriptar contraseñas.

### 2. Gestión de Productos
- **Creación / Edición**: Agregar nuevos productos y actualizar información existente (Nombre, SKU, Categoría, Precios, Stock Mínimo).
- **Desactivación / Eliminación**: Eliminación lógica (cambio de estado a inactivo) o física de productos.
- **Filtros y Búsqueda**: Buscar productos por nombre, SKU o categoría.
- **Indicadores de Stock**: Ver stock actual, precio de compra, precio de venta y ganancia estimada.

### 3. Categorías
- **Creación / Edición**: Administrar las categorías disponibles (ej. Tecnología, Belleza, Hogar, Accesorios, Otros).
- **Asociación**: Asignar y cambiar la categoría de cada producto de forma dinámica.

### 4. Registro y Gestión de Ventas
- **Punto de Venta (POS)**: Crear un carrito de ventas seleccionando uno o más productos.
- **Cálculo Automático**: Calcular subtotal, total e ingresos por ganancia de la transacción.
- **Control de Inventario**: Validar stock disponible antes de la venta y descontar el stock automáticamente al confirmarse.
- **Detalle de Venta**: Guardar el desglose histórico de cada venta.
- **Anulación**: Permitir anular ventas y reintegrar el stock de forma automática.

### 5. Movimientos de Stock
- **Historial de Inventario**: Registrar entradas por reposición, salidas por ventas, ajustes manuales (pérdidas, daños) y devoluciones por anulación.
- **Atributos del Movimiento**: Registrar cantidad, stock anterior, stock nuevo, motivo, fecha y usuario responsable.

### 6. Alertas de Stock Mínimo
- **Productos Críticos**: Visualizar listado de productos con stock actual menor o igual al stock mínimo.
- **Notificación en Dashboard**: Alerta visual visible inmediatamente en el dashboard del sistema.

### 7. Dashboard
- **Ventas del día / mes**: KPI financiero de ingresos.
- **Ganancias del día / mes**: Rentabilidad neta generada.
- **Contadores de Sistema**: Número de productos activos y número de productos en stock bajo.
- **Productos Más Vendidos**: Lista/Gráfico de los productos con mayor cantidad vendida.
- **Ventas Recientes**: Tabla de las últimas transacciones en tiempo real.
- **Gráfica de Ventas**: Historial visual de ventas de los últimos 7 días.

### 8. Reportes Avanzados
- **Rango de Fechas**: Filtrar ventas y ganancias entre fechas.
- **Exportación**: (Opcional) Exportar reportes en formatos Excel/CSV para auditoría externa.
