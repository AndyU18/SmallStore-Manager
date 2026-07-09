# SmallStore Manager - Instrucciones y Contexto para Agentes de IA

Este archivo contiene el contexto del proyecto, la arquitectura definida, las reglas de negocio y las directrices técnicas para desarrollar el sistema **SmallStore Manager**. Cualquier agente de IA que trabaje en esta base de código debe seguir estas especificaciones de manera rigurosa.

---

## 1. Contexto y Objetivos del Proyecto

El objetivo es construir un sistema de gestión web profesional y moderno para tiendas de comercio al por menor de pequeña escala. El sistema debe permitir administrar el catálogo de productos, gestionar las existencias, automatizar el registro de ventas (descontando stock y calculando ganancias reales), y proveer un dashboard administrativo visualmente atractivo.

---

## 2. Arquitectura de la Aplicación

El repositorio está estructurado como un monorepo simple:
- [frontend/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend): Interfaz Next.js (App Router), TypeScript, Tailwind CSS.
- [backend/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/backend): API REST NestJS, Prisma ORM, PostgreSQL.
- [docs/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/docs): Documentación de requerimientos, base de datos y endpoints.

```
[ Next.js Frontend ]  -->  [ NestJS REST API ]  -->  [ Prisma ORM ]  -->  [ PostgreSQL ]
```

---

## 3. Instrucciones de Implementación del Backend (NestJS)

El backend debe mantener una separación limpia de responsabilidades mediante módulos. Cada módulo contiene su controller, service y DTOs correspondientes.

### Reglas Críticas del Backend:
1. **Separación de Capas**: Los controladores (`Controllers`) solo deben encargarse de la recepción de peticiones (HTTP, validaciones DTO, control de rutas). Toda la lógica de negocio debe delegarse a los servicios (`Services`).
2. **Uso de Prisma**: Usar [PrismaService](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/backend/src/prisma/prisma.service.ts) para interactuar con la base de datos PostgreSQL.
3. **Validación de Datos**: Validar DTOs utilizando `class-validator` y `class-transformer`.
4. **Seguridad**:
   - Proteger los endpoints con JWT y guards personalizados de NestJS (`AuthGuard`, `RolesGuard`).
   - Las contraseñas de los usuarios deben encriptarse con `bcrypt` antes de almacenarse en la base de datos.

### Lógica de Negocio Específica:
- **Ventas y Stock**:
  - Al registrar una venta, el servicio debe usar una transacción de Prisma (`prisma.$transaction`) para asegurar consistencia.
  - Debe validar que haya suficiente stock disponible del producto antes de proceder.
  - Al completar la venta, el stock del producto debe reducirse automáticamente, y debe registrarse un registro de auditoría en la tabla `StockMovement` de tipo `OUT` (Salida).
  - Al anular una venta (`/sales/:id/cancel`): el estado de la venta pasa a `CANCELLED`, los productos correspondientes se vuelven a ingresar al stock, y se registra un movimiento de stock de tipo `RETURN` (Devolución) por anulación.
- **Movimientos de Stock**:
  - Toda alteración física o de inventario debe dejar huella en la tabla `StockMovement`.
  - Tipos de movimientos: `IN` (Reposición), `OUT` (Ventas), `ADJUSTMENT` (Ajustes manuales por pérdida o rotura), `RETURN` (Anulación de venta).
- **Cálculo de Ganancias**:
  - Cada ítem de venta (`SaleItem`) debe almacenar el `purchasePrice` (precio de compra) histórico del producto en ese momento, además del `price` (precio de venta).
  - La utilidad/ganancia de un ítem es: `(price - purchasePrice) * quantity`.
  - La ganancia total de la venta es la suma de las ganancias de sus ítems.

---

## 4. Instrucciones de Implementación del Frontend (Next.js)

El frontend está estructurado para maximizar la modularidad agrupando componentes y vistas por dominios de negocio.

### Estilo Visual y UI (Directrices de Diseño Premium):
1. **Diseño Moderno e Impactante**: Usar colores vibrantes, esquemas oscuros sofisticados y elementos interactivos modernos. Evitar colores primarios planos y componentes aburridos por defecto de los navegadores.
2. **Tipografía**: Importar y aplicar fuentes modernas (como Inter, Outfit o Roboto).
3. **Librería de Componentes**:
   - Usar `Tailwind CSS` para maquetación y diseño responsivo.
   - Utilizar la utilidad centralizada [utils.ts](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/lib/utils.ts) (`cn`) para construir clases condicionales limpiamente.
4. **Interactividad**: Incluir micro-animaciones en botones, estados hover dinámicos y transiciones suaves en loaders o tablas.
5. **Dashboard y Reportes**:
   - Representar datos financieros de ganancias y ventas mediante gráficos dinámicos con `Recharts` (líneas para tendencia de 7 días, barras para productos más vendidos).
   - Utilizar tablas con filtros avanzados basadas en `TanStack Table` para listas de productos y transacciones.
6. **Formularios**:
   - Utilizar `React Hook Form` combinado con `Zod` ([validations/index.ts](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/lib/validations/index.ts)) para la validación estricta en el cliente de entradas como productos, categorías y logins.

### Estructura de Carpetas del Frontend:
- [app/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/app): Rutas del App Router (`/login`, `/dashboard`, `/products`, `/categories`, `/sales`, `/stock`, `/reports`).
- [components/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/components): Componentes reutilizables generales organizados en `/ui`, `/layout`, `/tables`, `/charts`.
- [features/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/features): Lógica y subcomponentes encapsulados por dominio.
- [services/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/services): Clientes HTTP (Axios) y peticiones a la API del backend.
- [hooks/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/hooks): Custom hooks para encapsular lógica de estado y fetching.
- [lib/](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/frontend/src/lib): Herramientas y esquemas de validación.

---

## 5. Modelo de Base de Datos (Prisma)

El esquema de datos se encuentra definido en [schema.prisma](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/backend/prisma/schema.prisma). Cuenta con los siguientes modelos principales:
- **User**: Usuarios autorizados.
- **Category**: Clasificación de productos.
- **Product**: Catálogo de la tienda, con stock actual y stock mínimo.
- **Customer**: Clientes registrados (opcional).
- **Sale**: Historial de transacciones de venta.
- **SaleItem**: Detalle granular de productos incluidos en una venta con precios históricos.
- **StockMovement**: Historial de movimientos y auditoría física de existencias.

El script de semilla [seed.ts](file:///C:/Users/usuario/Documents/GitHub/SmallStore-Manager/backend/prisma/seed.ts) está configurado para poblar datos de prueba (administradores, categorías, productos de muestra y clientes).

---

## 6. Secuencia Recomendada para Desarrollar el Proyecto

Si vas a desarrollar este proyecto por fases, se recomienda el siguiente orden de prioridad:

1. **Infraestructura de Datos**:
   - Levantar el contenedor PostgreSQL con `docker compose up -d`.
   - Ejecutar la migración inicial de Prisma: `npx prisma migrate dev --name init`.
   - Ejecutar la semilla para cargar usuarios de prueba: `npx prisma db seed`.
2. **Módulo de Autenticación**:
   - Implementar el registro, login y generación de JWT en el backend.
   - Implementar la pantalla de Login y el hook `useAuth` en el frontend.
3. **Módulos de Categorías y Productos**:
   - Desarrollar las APIs CRUD de categorías y productos con validaciones class-validator.
   - Implementar las vistas en el frontend con tablas interactivas.
4. **Movimientos de Stock e Inventario**:
   - API de movimientos de stock.
   - Panel de stock bajo y alerta en el frontend.
5. **Módulo de Ventas (Punto de Venta)**:
   - Crear el controlador y servicio de ventas en el backend con transacciones ACID de Prisma.
   - Desarrollar la interfaz del POS (carrito de compras) en el frontend.
6. **Dashboard y Reportes**:
   - Desarrollar consultas agregadas en el backend.
   - Mostrar gráficos con Recharts en el frontend.
