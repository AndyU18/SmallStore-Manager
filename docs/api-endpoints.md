# Endpoints de la API REST - SmallStore Manager

La API backend se desarrolla con NestJS. Todos los endpoints REST se documentarán con Swagger en la ruta `/api/docs`.

## Seguridad y Encabezados
- Para endpoints protegidos se debe enviar el encabezado `Authorization: Bearer <JWT_TOKEN>`.

---

## 1. Autenticación (`/auth`)

### `POST /auth/login`
- **Público**
- **Descripción**: Inicia sesión de administrador o vendedor.
- **Request Body**:
  ```json
  {
    "email": "admin@smallstore.com",
    "password": "adminpassword"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "accessToken": "eyJhbGciOi...",
    "user": {
      "id": "uuid-v4-here",
      "email": "admin@smallstore.com",
      "name": "Administrador",
      "role": "ADMIN"
    }
  }
  ```

---

## 2. Categorías (`/categories`)

### `GET /categories`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Lista todas las categorías registradas.

### `POST /categories`
- **Protegido (ADMIN)**
- **Descripción**: Registra una nueva categoría.
- **Request Body**:
  ```json
  {
    "name": "Accesorios",
    "description": "Bolsos, relojes y joyería"
  }
  ```

### `PUT /categories/:id`
- **Protegido (ADMIN)**
- **Descripción**: Actualiza los datos de una categoría.

---

## 3. Productos (`/products`)

### `GET /products`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Lista los productos. Soporta filtros opcionales de query parameters (`?search=nombre_o_sku&categoryId=uuid&status=true`).

### `GET /products/:id`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Detalle de un producto específico.

### `POST /products`
- **Protegido (ADMIN)**
- **Descripción**: Registra un nuevo producto. Realiza la entrada de stock inicial en el historial.
- **Request Body**:
  ```json
  {
    "name": "Mouse Inalámbrico",
    "sku": "MOU-INA-XYZ",
    "description": "Mouse ergonómico USB",
    "purchasePrice": 30.0,
    "salePrice": 50.0,
    "stock": 10,
    "minStock": 5,
    "categoryId": "category-uuid-v4"
  }
  ```

### `PUT /products/:id`
- **Protegido (ADMIN)**
- **Descripción**: Actualiza campos del producto (precio, stock mínimo, etc.).

### `DELETE /products/:id`
- **Protegido (ADMIN)**
- **Descripción**: Desactiva el producto logicamente (cambio de status a `false`).

---

## 4. Ventas (`/sales`)

### `GET /sales`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Obtiene la lista histórica de ventas registradas.

### `GET /sales/:id`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Obtiene el detalle de una venta, incluyendo cada artículo (`sale_items`).

### `POST /sales`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Registra una venta, descuenta inventario y calcula los totales/ganancia.
- **Request Body**:
  ```json
  {
    "customerId": "customer-uuid-v4", // Opcional
    "items": [
      {
        "productId": "product-uuid-v4",
        "quantity": 2
      }
    ]
  }
  ```

### `POST /sales/:id/cancel`
- **Protegido (ADMIN)**
- **Descripción**: Anula la venta, actualiza el estado de la venta a `CANCELLED` y devuelve los productos al stock del inventario.

---

## 5. Movimientos de Stock (`/stock-movements`)

### `GET /stock-movements`
- **Protegido (ADMIN)**
- **Descripción**: Historial completo de movimientos de stock con filtros por producto y tipo.

### `POST /stock-movements/adjust`
- **Protegido (ADMIN)**
- **Descripción**: Registra un ajuste de stock manual (pérdidas, robos o reposición manual).
- **Request Body**:
  ```json
  {
    "productId": "product-uuid-v4",
    "quantity": 5,
    "type": "ADJUSTMENT", // "IN", "OUT", "ADJUSTMENT"
    "reason": "Reposición manual de stock dañado"
  }
  ```

---

## 6. Dashboard (`/dashboard`)

### `GET /dashboard`
- **Protegido (ADMIN, SELLER)**
- **Descripción**: Retorna las estadísticas agregadas para el panel principal.
- **Response (200 OK)**:
  ```json
  {
    "todaySales": 180.00,
    "todayProfit": 70.00,
    "monthlySales": 4500.00,
    "monthlyProfit": 1850.00,
    "activeProducts": 42,
    "lowStockProductsCount": 3,
    "salesLast7Days": [
      { "date": "2026-07-03", "total": 450 },
      { "date": "2026-07-04", "total": 780 }
    ],
    "topSellingProducts": [
      { "name": "Audífonos Bluetooth", "quantity": 14 }
    ]
  }
  ```

---

## 7. Reportes (`/reports`)

### `GET /reports/profit`
- **Protegido (ADMIN)**
- **Descripción**: Retorna un desglose financiero de compras vs ventas y utilidad en un rango de fechas.
  - Query parameters: `?startDate=2026-07-01&endDate=2026-07-09`
