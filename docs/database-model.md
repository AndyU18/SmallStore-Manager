# Modelo de Base de Datos - SmallStore Manager

El sistema utiliza una base de datos relacional PostgreSQL modelada mediante Prisma ORM.

## Diagrama Entidad-Relación (Relaciones Principales)

- Un **User** puede realizar muchas **Sales** y registrar muchos **StockMovements**.
- Una **Category** tiene muchos **Products**.
- Un **Product** pertenece a una **Category**, tiene muchos **SaleItems** (detalles de venta) y **StockMovements**.
- Un **Customer** puede tener muchas **Sales** asociadas.
- Una **Sale** tiene muchos **SaleItems**, es realizada por un **User** y pertenece opcionalmente a un **Customer**.
- Un **SaleItem** representa la venta de un **Product** específico en una **Sale** en particular.
- Un **StockMovement** registra la alteración de inventario de un **Product** realizada por un **User**.

## Esquema Físico (Tablas y Columnas)

### users
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador único del usuario |
| `email` | String | Unique | Correo electrónico de inicio de sesión |
| `password` | String | NOT NULL | Contraseña encriptada con bcrypt |
| `name` | String | NOT NULL | Nombre del usuario |
| `role` | Enum (Role) | DEFAULT `SELLER` | Rol del usuario (`ADMIN` o `SELLER`) |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de creación |
| `updatedAt` | DateTime | NOT NULL | Fecha de última actualización |

### categories
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador único de la categoría |
| `name` | String | Unique | Nombre de la categoría (ej. Tecnología) |
| `description`| String | Nullable | Descripción opcional |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de creación |
| `updatedAt` | DateTime | NOT NULL | Fecha de última actualización |

### products
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador único del producto |
| `name` | String | NOT NULL | Nombre comercial |
| `sku` | String | Unique | Código único SKU |
| `description`| String | Nullable | Descripción de producto |
| `purchasePrice`| Float | NOT NULL | Precio de compra unitario |
| `salePrice` | Float | NOT NULL | Precio de venta al público |
| `stock` | Int | DEFAULT `0` | Cantidad actual en inventario |
| `minStock` | Int | DEFAULT `5` | Stock mínimo de alerta |
| `status` | Boolean | DEFAULT `true` | Habilitado (`true`) o deshabilitado (`false`) |
| `categoryId` | UUID | FK -> `categories(id)` | Categoría asignada |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de creación |
| `updatedAt` | DateTime | NOT NULL | Fecha de última actualización |

### customers
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador del cliente |
| `name` | String | NOT NULL | Nombre del cliente |
| `email` | String | Nullable | Correo del cliente |
| `phone` | String | Nullable | Teléfono del cliente |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de creación |
| `updatedAt` | DateTime | NOT NULL | Fecha de última actualización |

### sales
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador de la venta |
| `subtotal` | Float | NOT NULL | Suma de precios por cantidad de ítems |
| `total` | Float | NOT NULL | Total a pagar |
| `profit` | Float | NOT NULL | Utilidad neta de la venta (ingreso - compra) |
| `status` | Enum (SaleStatus) | DEFAULT `COMPLETED`| Estado de venta (`COMPLETED`, `CANCELLED`) |
| `customerId` | UUID | FK -> `customers(id)`, Nullable| Cliente asociado (opcional) |
| `userId` | UUID | FK -> `users(id)` | Vendedor/Administrador que registró la venta |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de la venta |
| `updatedAt` | DateTime | NOT NULL | Fecha de última actualización |

### sale_items
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador único del ítem de venta |
| `saleId` | UUID | FK -> `sales(id)`, Cascade | Venta a la que pertenece |
| `productId` | UUID | FK -> `products(id)` | Producto vendido |
| `quantity` | Int | NOT NULL | Cantidad vendida |
| `price` | Float | NOT NULL | Precio cobrado unitario (histórico) |
| `purchasePrice`| Float | NOT NULL | Precio de compra unitario (histórico) |
| `profit` | Float | NOT NULL | Ganancia del ítem: `(price - purchasePrice) * quantity` |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de creación |

### stock_movements
| Campo | Tipo | Restricciones | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | UUID | PK, default `uuid()` | Identificador único del movimiento |
| `productId` | UUID | FK -> `products(id)` | Producto afectado |
| `type` | Enum (MovementType) | NOT NULL | Tipo de movimiento (`IN`, `OUT`, `ADJUSTMENT`, `RETURN`) |
| `quantity` | Int | NOT NULL | Cantidad modificada |
| `previousStock`| Int | NOT NULL | Inventario antes del movimiento |
| `newStock` | Int | NOT NULL | Inventario después del movimiento |
| `reason` | String | NOT NULL | Descripción del motivo (ej. "Venta registrada") |
| `userId` | UUID | FK -> `users(id)` | Usuario que realizó el movimiento |
| `createdAt` | DateTime | DEFAULT `now()` | Fecha de registro |
