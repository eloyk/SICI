# SICI - Sistema Integral de Control de Inventario

Sistema empresarial de gestion de inventario con seguimiento en tiempo real, gestion de almacenes multiples, y reportes avanzados.

## Descripcion

SICI es un sistema completo de gestion de inventarios disenado para empresas que necesitan:

- **Control de stock en tiempo real** en multiples almacenes
- **Gestion de movimientos**: entradas, salidas, transferencias y ajustes
- **Catalogo de productos** con categorias y niveles de stock minimo
- **Reportes** de inventario, valorizado, movimientos, bajo stock y kardex
- **Control de acceso** basado en roles mediante Keycloak

## Caracteristicas Principales

### Gestion de Productos
- Catalogo completo con codigo, descripcion, precio y categoria
- Configuracion de stock minimo por producto
- Estados activo/inactivo para productos

### Almacenes
- Multiples almacenes con ubicacion y responsable
- Visualizacion de stock por almacen
- Transferencias entre almacenes

### Movimientos de Inventario
- **Entradas**: Registro de ingreso de productos
- **Salidas**: Registro de despacho de productos
- **Transferencias**: Movimiento entre almacenes
- **Ajustes**: Correcciones de inventario

### Reportes
- Inventario actual por almacen
- Inventario valorizado
- Historial de movimientos
- Alertas de bajo stock
- Kardex por producto

### Seguridad
- Autenticacion mediante Keycloak (OpenID Connect)
- Roles: Administrador, Supervisor, Operador, Consulta
- Gestion de usuarios desde la aplicacion

## Tecnologias

### Frontend
- React con TypeScript
- Vite como bundler
- Tailwind CSS para estilos
- shadcn/ui para componentes
- TanStack Query para estado del servidor
- Wouter para routing

### Backend
- Express.js con TypeScript
- PostgreSQL como base de datos
- Drizzle ORM
- Passport.js con OpenID Connect

## Requisitos

- Node.js 18+
- PostgreSQL
- Keycloak (para autenticacion)

## Variables de Entorno

```env
DATABASE_URL=postgresql://...
SESSION_SECRET=tu-secreto-de-sesion
KEYCLOAK_URL=https://keycloak.pcw.com.do
KEYCLOAK_REALM=sici
KEYCLOAK_CLIENT_ID=sici-app
KEYCLOAK_CLIENT_SECRET=tu-client-secret
```

## Instalacion

1. Clonar el repositorio
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno
4. Ejecutar migraciones de base de datos:
   ```bash
   npm run db:push
   ```
5. Iniciar la aplicacion:
   ```bash
   npm run dev
   ```

## Estructura del Proyecto

```
├── client/           # Aplicacion React
│   ├── src/
│   │   ├── components/   # Componentes reutilizables
│   │   ├── pages/        # Paginas de la aplicacion
│   │   ├── hooks/        # Hooks personalizados
│   │   └── lib/          # Utilidades
├── server/           # API Express
│   ├── routes.ts     # Rutas de la API
│   ├── storage.ts    # Capa de acceso a datos
│   └── keycloak-admin.ts # Integracion con Keycloak
├── shared/           # Codigo compartido
│   └── schema.ts     # Esquema de base de datos
└── migrations/       # Migraciones SQL
```

## Roles y Permisos

| Rol | Descripcion |
|-----|-------------|
| Administrador | Acceso completo, gestion de usuarios |
| Supervisor | Gestion de inventario y reportes |
| Operador | Registro de movimientos |
| Consulta | Solo visualizacion |

## API Endpoints

### Productos
- `GET /api/products` - Listar productos
- `POST /api/products` - Crear producto
- `PATCH /api/products/:id` - Actualizar producto

### Almacenes
- `GET /api/warehouses` - Listar almacenes
- `POST /api/warehouses` - Crear almacen
- `PATCH /api/warehouses/:id` - Actualizar almacen

### Movimientos
- `GET /api/movements` - Listar movimientos
- `POST /api/movements` - Crear movimiento
- `GET /api/movements/:id/details` - Detalles del movimiento

### Stock
- `GET /api/stock` - Stock actual
- `GET /api/alerts/low-stock` - Alertas de bajo stock

### Usuarios (requiere Administrador)
- `GET /api/admin/users` - Listar usuarios de Keycloak
- `POST /api/admin/users` - Crear usuario
- `PATCH /api/admin/users/:id/roles` - Asignar roles

## Licencia

Todos los derechos reservados.
