# SmallStore Manager

Sistema web moderno y profesional diseñado para gestionar productos, controlar stock, registrar ventas, calcular ganancias reales y visualizar reportes en tiempo real para tiendas pequeñas y comercios locales.

Este proyecto está organizado como un monorepo simple que separa el cliente y el servidor de forma limpia, facilitando su desarrollo y despliegue.

---

## 🛠️ Stack Tecnológico

El proyecto está construido sobre un stack moderno, escalable y completamente tipado con TypeScript:

### Frontend
- **Framework**: [Next.js](https://nextjs.org/) (App Router) & TypeScript
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Formularios y Validaciones**: [React Hook Form](https://react-hook-form.com/) & [Zod](https://zod.dev/)
- **Tablas de Datos**: [TanStack Table](https://tanstack.com/table)
- **Gráficas**: [Recharts](https://recharts.org/)
- **Peticiones HTTP**: [Axios](https://axios-http.com/)

### Backend
- **Framework**: [NestJS](https://nestjs.com/) (Arquitectura Modular) & TypeScript
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/)
- **ORM**: [Prisma ORM](https://www.prisma.io/)
- **Seguridad**: JWT (JSON Web Tokens) & Encriptación con `bcrypt`
- **Validaciones**: `class-validator` & `class-transformer`

### Herramientas y DevOps
- **Entorno de Contenedores**: Docker & Docker Compose (PostgreSQL + pgAdmin)
- **Documentación de API**: Swagger / OpenAPI
- **Calidad de Código**: ESLint & Prettier

---

## 📁 Estructura del Proyecto

```markdown
smallstore-manager/
├── frontend/                # Aplicación Next.js (Cliente)
│   ├── src/
│   │   ├── app/             # Rutas y páginas (login, dashboard, sales, etc.)
│   │   ├── components/      # Componentes UI reutilizables (ui, layout, tables, charts)
│   │   ├── features/        # Módulos específicos de negocio (products, sales, stock, etc.)
│   │   ├── services/        # Clientes y llamadas API (api.ts, auth.service.ts, etc.)
│   │   ├── hooks/           # Custom hooks para encapsular lógica de estado
│   │   ├── lib/             # Validaciones (Zod) y funciones útiles (utils.ts)
│   │   └── types/           # Interfaces de TypeScript (user, product, sale)
│   └── package.json
│
├── backend/                 # API REST NestJS (Servidor)
│   ├── src/
│   │   ├── auth/            # Módulo de Autenticación y JWT
│   │   ├── users/           # Módulo de Usuarios
│   │   ├── products/        # Módulo de Productos
│   │   ├── categories/      # Módulo de Categorías
│   │   ├── sales/           # Módulo de Punto de Venta (POS) y transacciones
│   │   ├── stock-movements/ # Historial y auditoría de inventario
│   │   ├── dashboard/       # Métricas y KPIs de ventas y stock bajo
│   │   ├── reports/         # Reportes financieros avanzados
│   │   ├── prisma/          # Integración con PrismaService
│   │   └── common/          # Decoradores, filtros y pipes globales
│   ├── prisma/
│   │   ├── schema.prisma    # Modelado de base de datos relacional
│   │   └── seed.ts          # Script de datos iniciales (semilla)
│   └── package.json
│
├── docs/                    # Documentación del proyecto
│   ├── requirements.md      # Requisitos de negocio detallados
│   ├── database-model.md    # Estructura de tablas y ERD
│   └── api-endpoints.md     # Documentación de endpoints REST
│
├── docker-compose.yml       # Orquestador local de PostgreSQL y pgAdmin
└── .env.example             # Plantilla de variables de entorno
```

---

## 🚀 Guía de Inicio Rápido

Sigue estos pasos para poner en marcha el entorno de desarrollo local:

### 1. Clonar el repositorio y configurar variables de entorno
Crea copias de los archivos de variables de entorno en frontend y backend:
- En la raíz del backend (`backend/`), asegúrate de que el archivo `.env` apunte a tu base de datos local de PostgreSQL.
- En la raíz del frontend (`frontend/`), asegúrate de que el archivo `.env.local` apunte a la URL de la API del backend.

### 2. Iniciar la Base de Datos con Docker
Asegúrate de tener Docker Desktop iniciado y ejecuta en la raíz del proyecto:
```bash
docker compose up -d
```
Esto levantará:
- **PostgreSQL** en el puerto `5432`
- **pgAdmin** en http://localhost:5050 (Credenciales: `admin@smallstore.com` / `admin`)

### 3. Configurar el Backend y la Base de Datos
Accede al directorio `backend/` e instala dependencias si no lo has hecho:
```bash
cd backend
npm install
```

Luego, genera el cliente de Prisma, aplica las migraciones y puebla la base de datos con la semilla:
```bash
# Aplicar migraciones iniciales a PostgreSQL
npx prisma migrate dev --name init

# Ejecutar el seed (poblar usuarios, productos y categorías de prueba)
npx prisma db seed
```

Finalmente, inicia el servidor de desarrollo del backend:
```bash
npm run start:dev
```
La API estará disponible en http://localhost:3000. Puedes acceder a la documentación de Swagger en http://localhost:3000/api/docs (cuando esté implementado el módulo Swagger).

### 4. Configurar el Frontend
Abre una nueva terminal, ve al directorio `frontend/` e instala las dependencias:
```bash
cd frontend
npm install
```

Inicia el servidor de Next.js en modo desarrollo:
```bash
npm run dev
```
La aplicación web estará disponible en http://localhost:3000.

---

## 🔑 Credenciales de Acceso por Defecto
El script de semilla (`seed.ts`) crea los siguientes usuarios por defecto para pruebas:

*   **Usuario Administrador**:
    *   **Email**: `admin@smallstore.com`
    *   **Contraseña**: `admin123`
*   **Usuario Vendedor**:
    *   **Email**: `seller@smallstore.com`
    *   **Contraseña**: `seller123`

---

## 🤖 Contexto para Agentes de IA
Este repositorio incluye configuraciones preparadas para agentes de programación autónomos en el directorio `.agents/AGENTS.md`. Al abrir el proyecto con herramientas compatibles, la IA cargará automáticamente el contexto técnico, reglas de diseño de interfaz premium y lógica de negocio necesarias para construir el sistema.