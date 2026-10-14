# API - Diego Lechona

API REST para la aplicación de gestión de calidad e inocuidad. Usa Node.js, Express, Sequelize y PostgreSQL en Neon.

## Requisitos

- Node.js 20 o superior
- Una base de datos PostgreSQL accesible (por ejemplo, Neon)

## Configuración local

1. Instala las dependencias:

   ```powershell
   npm install
   ```

2. Copia `.env.example` como `.env` y configura `DATABASE_URL`. Define también un `JWT_SECRET` aleatorio de al menos 32 bytes y `CORS_ORIGIN` con el origen del frontend.
3. Si la base está vacía y aún no existen las cuentas iniciales, aprovisiónalas una sola vez:

   ```powershell
   npm run create-users
   ```

   El comando muestra las contraseñas generadas solo al crear las cuentas. Guárdalas de forma segura.
4. Inicia el servidor en desarrollo:

   ```powershell
   npm run dev
   ```

La API escucha en `http://localhost:3000` por defecto. Para producción usa `npm start`; la plataforma debe proporcionar `DATABASE_URL`, `JWT_SECRET` y `CORS_ORIGIN`. No publiques el archivo `.env`.

## Autenticación

`GET /api/health` y `POST /api/auth/login` son públicos. Los demás endpoints requieren un JWT en el encabezado `Authorization: Bearer <token>`. Los tokens vencen en 8 horas.

Roles disponibles:

- `super`: administra todas las cuentas y puede asignar cualquier rol.
- `user_admin`: crea y desactiva usuarios normales.
- `user`: accede a los módulos de calidad.

## Endpoints principales

Todos usan el prefijo `/api`:

- `GET /health`: verifica la conexión a PostgreSQL.
- `POST /auth/login`, `GET /auth/me`: autenticación y cuenta actual.
- `GET`, `POST /auth/users`; `PATCH /auth/users/:id/status`: gestión de cuentas según el rol.
- `GET /bootstrap`, `/modules`, `/modules/:moduleId`: datos iniciales y programas.
- `/modules/:moduleId/{documents,formats,records,schedules,actions}`: operaciones de recursos de cada programa.
- `GET`, `POST`, `DELETE /masters/:category`: datos maestros.
- `GET /reports`, `/trace`, `/backup`: informes, trazabilidad y descarga opcional de copia JSON. No hay endpoints para subir o restaurar backups.

Al arrancar, Sequelize sincroniza los modelos y carga los formatos iniciales si faltan.
