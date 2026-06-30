# Rapidito 🍗

Sistema de pedidos multi-tenant para restaurantes. MVP enfocado en **Crispy Chicken Lab** como inquilino de prueba.

## Arquitectura

```
┌─────────────────────────────────────┐
│         Frontend (Next.js 14)        │
│  localhost:3000                      │
│  Ruta: /[slug] → menú del tenant     │
└────────────┬────────────────────────┘
             │ HTTP (API REST)
┌────────────▼────────────────────────┐
│         Backend (FastAPI)            │
│  localhost:8000                      │
│  /api/v1/health                      │
│  /docs (Swagger)                     │
└────────────┬────────────────────────┘
             │ SQL / RLS
┌────────────▼────────────────────────┐
│     Supabase (PostgreSQL)            │
│  Tablas: empresas, categorias,       │
│  productos                           │
└─────────────────────────────────────┘
```

### Multi-tenant

El aislamiento entre inquilinos se maneja por columna `empresa_id` en cada tabla. Cada tenant tiene un `slug` único que se usa en la URL del frontend y como discriminador en las consultas. En producción se reforzará con Row Level Security (RLS) de Supabase.

```
/crispy-chicken-lab  →  menú de Crispy Chicken Lab
/otro-restaurante    →  menú de otro restaurante
```

## Stack

| Capa       | Tecnología                          |
| ---------- | ----------------------------------- |
| Frontend   | Next.js 14, React 18, Tailwind CSS 3, TypeScript 5 |
| Backend    | FastAPI, Python 3.12+, Pydantic 2, SQLAlchemy 2 |
| Base de datos | PostgreSQL 15+ / Supabase        |
| Infra      | Docker (próximamente)               |

## Estructura del proyecto

```
rapidito/
├── app/                          # Backend FastAPI
│   ├── api/
│   │   ├── v1/endpoints/
│   │   │   └── health.py         # GET /api/v1/health
│   │   └── deps.py               # Dependencias (verify_tenant, get_db)
│   ├── core/
│   │   └── config.py             # Settings con Pydantic
│   ├── crud/
│   │   └── base.py               # CRUD genérico
│   ├── models/
│   │   └── base.py               # SQLAlchemy Base + TenantMixin
│   ├── schemas/
│   │   └── common.py             # Pydantic models
│   └── main.py                   # App FastAPI + CORS
├── frontend/                     # Frontend Next.js
│   └── src/
│       ├── app/[slug]/page.tsx   # Página del menú
│       ├── components/           # Header, CategoryBar, ProductCard, CartBar
│       ├── context/              # CartContext (useReducer)
│       ├── data/                 # Mock data (Crispy Chicken Lab)
│       ├── types/                # Interfaces TypeScript
│       └── lib/                  # Utilidades
├── migrations/
│   └── 001_init.sql              # Tablas: empresas, categorias, productos
├── Makefile                      # Comandos para dev
└── .env.example                  # Variables de entorno (template)
```

## Cómo iniciar

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/tomasg213/rapidito.git
cd rapidito
make install
```

Esto ejecuta:
- `pip install -r requirements.txt` (backend)
- `npm install` dentro de `frontend/` (frontend)

### 2. Configurar variables de entorno

```bash
cp .env.example .env
```

Editar `.env` con los datos de Supabase (o dejarlo así para desarrollo con mock data).

### 3. Iniciar el sistema

```bash
make dev
```

Esto levanta ambos servicios en paralelo:

| Servicio  | URL                          |
| --------- | ---------------------------- |
| Frontend  | http://localhost:3000        |
| Backend   | http://localhost:8000        |
| Swagger   | http://localhost:8000/docs   |

El frontend redirige automáticamente a `/crispy-chicken-lab`.

### 4. Base de datos (opcional)

Ejecutar el script SQL en el Editor SQL de Supabase:

```sql
-- Pegar el contenido de migrations/001_init.sql
```

## Comandos disponibles

```bash
make install   # Instala dependencias de backend y frontend
make dev       # Levanta ambos servicios simultáneamente
make build     # Build de producción del frontend
make clean     # Elimina __pycache__ y .next
```

## Vistas del frontend

### Menú del cliente (`/[slug]`)
- Header con nombre del restaurante
- Barra de categorías sticky con scroll horizontal
- Lista de productos con precio y botón "Agregar"
- Carrito flotante en la parte inferior con badge de items y total

El carrito se gestiona con `useReducer` + Context y persiste mientras dure la sesión.

## Próximos pasos

- [ ] Conexión real a Supabase (reemplazar mock data)
- [ ] Autenticación de usuarios
- [ ] Panel de administración para gestionar productos
- [ ] Checkout y generación de pedidos
- [ ] RLS policies multi-tenant
- [ ] Dashboard de órdenes en tiempo real
