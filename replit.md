# SICI - Sistema Integral de Control de Inventario

## Overview

SICI is a comprehensive inventory management web application designed for real-time stock control, warehouse management, and report generation. The system is built for enterprise use, targeting inventory management professionals who need to track products across multiple warehouses, manage stock movements (entries, exits, transfers, adjustments), and generate operational reports.

The application follows a function-first design philosophy with an enterprise data-driven UI approach, prioritizing information clarity and workflow efficiency over visual embellishments.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight alternative to React Router)
- **State Management**: TanStack React Query for server state management
- **UI Components**: shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens and CSS variables for theming
- **Build Tool**: Vite with HMR support

The frontend follows a page-based architecture with reusable components. Key pages include Dashboard, Products, Warehouses, Movements, Stock, Reports, and Users. The design system uses Carbon Design System and Fluent Design principles optimized for data-heavy applications.

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript with ESM modules
- **API Pattern**: RESTful API endpoints under `/api/*`
- **Database ORM**: Drizzle ORM with PostgreSQL
- **Build Process**: esbuild for server bundling, Vite for client

The server uses a storage abstraction layer (`IStorage` interface) for database operations, making it easier to test and swap implementations. Routes are registered in a single file with validation using Zod schemas.

### Data Model
Core entities include:
- **Users**: Role-based access (admin, supervisor, operador, consulta)
- **Products**: Inventory items with categories, units, minimum stock levels
- **Warehouses**: Storage locations with managers and status
- **Stock**: Current inventory levels per product per warehouse
- **Movements**: Inventory transactions (entrada, salida, transferencia, ajuste)
- **MovementDetails**: Line items for each movement

### Design Patterns
- **Monorepo Structure**: Shared schema between client and server in `/shared`
- **Type Safety**: Drizzle-Zod integration generates validation schemas from database schema
- **API Client**: Centralized query client with error handling utilities
- **Theme System**: Light/dark mode with CSS variables and localStorage persistence

## External Dependencies

### Database
- **PostgreSQL**: Primary database (configured via `DATABASE_URL` environment variable)
- **Drizzle ORM**: Type-safe database queries and migrations
- **pg**: Node.js PostgreSQL client

### UI Libraries
- **Radix UI**: Accessible, unstyled component primitives (dialogs, dropdowns, tabs, etc.)
- **shadcn/ui**: Pre-built component library using Radix primitives
- **Lucide React**: Icon library
- **Embla Carousel**: Carousel component
- **CMDK**: Command palette component

### Data Handling
- **TanStack React Query**: Server state management and caching
- **Zod**: Runtime type validation
- **date-fns**: Date formatting and manipulation

### Development Tools
- **Vite**: Frontend build tool and dev server
- **TSX**: TypeScript execution for Node.js
- **Drizzle Kit**: Database migration tooling

### Fonts
- **Inter / IBM Plex Sans**: Primary UI font (via Google Fonts CDN)
- **IBM Plex Mono**: Monospace font for codes and numerical data