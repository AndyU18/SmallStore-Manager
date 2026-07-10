# Guía de Ejecución y Configuración - SmallStore Manager

Esta guía detalla los pasos necesarios para configurar la base de datos, inicializar el backend (NestJS) y levantar el frontend (Next.js) de **SmallStore Manager** en tu entorno local.

---

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado en tu equipo:
*   **Node.js** (Versión 20 o superior recomendada)
*   **npm** (Gestor de paquetes de Node)
*   **Git** (Para control de versiones)

---

## 🛠️ Paso 1: Configurar Variables de Entorno

En la estructura del proyecto se incluyen plantillas para configurar las variables de entorno de cada aplicación. Debes crear los archivos reales copiando las plantillas:

1.  **Backend (`backend/`)**:
    *   Crea un archivo llamado `.env` en la carpeta `backend/`.
    *   Puedes tomar como referencia la plantilla `backend/.env` o copiar la del directorio raíz `.env.example`:
        ```env
        PORT=3000
        DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/smallstore_db?schema=public"
        JWT_SECRET="generate_a_secure_jwt_secret_here"
        JWT_EXPIRES_IN="1d"
        ```

2.  **Frontend (`frontend/`)**:
    *   Crea un archivo llamado `.env.local` en la carpeta `frontend/`.
    *   Define la URL base de la API REST del backend:
        ```env
        NEXT_PUBLIC_API_URL="http://localhost:3000"
        ```

---

## 🗄️ Paso 2: Configurar la Base de Datos (PostgreSQL)

Tienes **tres opciones independientes** para configurar la base de datos PostgreSQL. Elige la que mejor se adapte a tus necesidades.

---

### Opción A: Configurar con Docker (Recomendado y Rápido)

Esta opción descarga y arranca la base de datos y un administrador visual automáticamente sin ensuciar tu sistema. Requiere tener **Docker Desktop** instalado y abierto.

1.  Abre una terminal en la raíz del proyecto (donde se encuentra `docker-compose.yml`) y arranca los contenedores:
    ```bash
    docker compose up -d
    ```
    *Esto iniciará:*
    *   **PostgreSQL** en el puerto `5432`.
    *   **pgAdmin 4** en el puerto `5050` (Credenciales de acceso: Correo `admin@smallstore.com` / Contraseña `admin`).
2.  Tu cadena de conexión en `backend/.env` debe ser:
    ```env
    DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/smallstore_db?schema=public"
    ```
3.  Ve directamente al **Paso 3** para aplicar tablas y poblar datos.

---

### Opción B: Configurar con PostgreSQL Local (Instalación Nativa)

Utiliza esta opción si ya tienes instalado PostgreSQL en tu sistema operativo o prefieres descargarlo directamente.

1.  **Instalar**:
    *   Descarga el instalador de PostgreSQL para tu sistema operativo desde la [Página de Descargas de PostgreSQL](https://www.postgresql.org/download/).
    *   Sigue el asistente de instalación. Te sugerirá instalar **pgAdmin 4**, asegúrate de marcarlo.
2.  **Credenciales**:
    *   Define una contraseña para el superusuario `postgres` durante el asistente (ej. `postgrespassword`).
    *   Mantén el puerto por defecto en `5432`.
3.  **Crear Base de Datos**:
    *   Abre **pgAdmin 4** en tu computadora.
    *   Inicia sesión con la contraseña que definiste.
    *   En el panel izquierdo, haz clic derecho sobre **Databases** -> **Create** -> **Database...**
    *   Escribe el nombre **`smallstore_db`** y haz clic en **Save**.
4.  **Actualizar variables**:
    *   Abre tu archivo `backend/.env` y ajusta los valores con tu contraseña local:
        ```env
        DATABASE_URL="postgresql://postgres:TU_CONTRASEÑA_DE_POSTGRES@localhost:5432/smallstore_db?schema=public"
        ```
5.  Ve al **Paso 3** para aplicar el esquema de base de datos.

---

### Opción C: Configurar con una Base de Datos en la Nube (Supabase / Neon)

Esta opción te permite usar un servidor de base de datos en la nube sin instalar nada localmente. Es útil para preparar despliegues a producción.

#### Sub-Opción C.1: Usando Neon (Servicio Serverless)
1.  Regístrate de forma gratuita en [Neon.tech](https://neon.tech/).
2.  Crea un nuevo proyecto y selecciona PostgreSQL 15 o 16.
3.  Neon te proporcionará una cadena de conexión. Copia la URL de tipo *Prisma / Connection String*.
4.  Pégala en tu archivo `backend/.env`. Añade `?sslmode=require` al final si no lo incluye:
    ```env
    DATABASE_URL="postgresql://neondb_owner:TU_TOKEN_DE_NEON@ep-cool-feather-a5.us-east-2.aws.neon.tech/neondb?sslmode=require"
    ```

#### Sub-Opción C.2: Usando Supabase
1.  Regístrate en [Supabase.com](https://supabase.com/).
2.  Crea un nuevo proyecto. Introduce un nombre y define una contraseña segura para la base de datos.
3.  Una vez creado, ve a **Project Settings** -> **Database** -> **Connection string** (selecciona la pestaña **URI**).
4.  Copia la URL provista, reemplaza `[YOUR-PASSWORD]` por la contraseña que configuraste al crear el proyecto y pégala en tu `backend/.env`:
    ```env
    DATABASE_URL="postgresql://postgres.TU_PROJECT_ID:TU_CONTRASEÑA@aws-0-us-west-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
    ```

---

## 🚀 Paso 3: Inicializar la Base de Datos y Prisma

Una vez que tengas la base de datos levantada y conectada mediante `DATABASE_URL` en `backend/.env`:

1.  Abre una terminal y navega al directorio del backend:
    ```bash
    cd backend
    ```
2.  Instala las dependencias necesarias:
    ```bash
    npm install
    ```
3.  Genera el cliente tipado de Prisma (necesario al cambiar de entorno o actualizar modelos):
    ```bash
    npx prisma generate
    ```
4.  Crea las tablas en la base de datos aplicando la migración inicial:
    ```bash
    npx prisma migrate dev --name init
    ```
5.  Puebla la base de datos con los registros semilla de prueba (usuarios admin/vendedor, categorías y productos iniciales):
    ```bash
    npx prisma db seed
    ```

---

## 💻 Paso 4: Levantar los Servidores de Desarrollo

Para probar el proyecto completo necesitas ejecutar ambos proyectos en terminales separadas:

### 1. Iniciar el Backend (NestJS)
Desde la carpeta `backend/`:
```bash
npm run start:dev
```
El backend compilará en modo de escucha y la API REST estará disponible en **`http://localhost:3000`**.
*(La documentación de Swagger para revisar e interactuar con los endpoints se habilitará en **`http://localhost:3000/api/docs`**)*.

### 2. Iniciar el Frontend (Next.js)
Abre **otra terminal diferente** en la raíz del monorepo, navega a la carpeta de la interfaz e inicia el servidor en el puerto `3001` (para evitar colisión de puertos con NestJS):
```bash
cd frontend
npm install
npm run dev -- -p 3001
```
La aplicación web se levantará en **`http://localhost:3001`**.

---

## 🔑 Credenciales de Acceso por Defecto

Usa los siguientes datos de prueba generados por el comando `seed` para ingresar al sistema:

*   **Usuario Administrador** (Acceso completo a todos los módulos y anulación de ventas):
    *   **Email**: `admin@smallstore.com`
    *   **Contraseña**: `admin123`
*   **Usuario Vendedor** (Acceso limitado a POS Dashboard y catálogo de productos, sin pestañas administrativas):
    *   **Email**: `seller@smallstore.com`
    *   **Contraseña**: `seller123`

---

## 🧪 Paso 5: Ejecutar Pruebas (Testing)

El backend viene equipado con una suite de pruebas estructurada en Jest. Desde la carpeta `backend/` puedes correr:

*   **Pruebas Unitarias**:
    ```bash
    npm run test
    ```
*   **Cobertura de código (Coverage)**:
    ```bash
    npm run test:cov
    ```
*   **Pruebas de Integración / End-to-End (E2E)**:
    ```bash
    npm run test:e2e
    ```