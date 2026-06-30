-- =============================================================================
-- Migración: 001_init.sql
-- Descripción: Tablas base del sistema multi-tenant para pedidos (restaurantes)
-- Estrategia multi-tenant: Aislamiento por columna `empresa_id` en cada tabla
--   que requiera pertenencia a un inquilino. En el futuro se aplicará RLS a
--   nivel de fila en Supabase usando ese mismo discriminador.
-- =============================================================================

-- Habilita la extensión uuid-ossp para gen_random_uuid() (común en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. empresas: Raíz del modelo multi-tenant. Cada fila = un inquilino.
--    Sin empresa_id (es la tabla raíz). El slug se usa en rutas dinámicas
--    y como identificador legible único.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS empresas (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    nombre      TEXT        NOT NULL,
    slug        TEXT        NOT NULL,
    creada_en   TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Índice único para búsquedas rápidas por slug (rutas dinámicas tipo /crispy-chicken-lab)
CREATE UNIQUE INDEX idx_empresas_slug ON empresas (slug);

-- Comentario: el slug es el identificador público del tenant. La unicidad
--   garantiza que no existan dos inquilinos con la misma ruta.

-- -----------------------------------------------------------------------------
-- 2. categorias: Agrupación de productos dentro de una empresa.
--    Pertenece a un tenant vía empresa_id.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categorias (
    id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id  UUID        NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    nombre      TEXT        NOT NULL,
    orden       INTEGER     NOT NULL DEFAULT 0,
    activa      BOOLEAN     NOT NULL DEFAULT TRUE
);

-- Índice compuesto: acelera las consultas que piden categorías activas de un
--   tenant ordenadas, y sienta las bases para la futura RLS por empresa_id.
CREATE INDEX idx_categorias_empresa ON categorias (empresa_id, activa, orden);

-- -----------------------------------------------------------------------------
-- 3. productos: Items concretos que se pueden pedir.
--    Pertenece a un tenant vía empresa_id y opcionalmente a una categoría.
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS productos (
    id          UUID            DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id  UUID            NOT NULL REFERENCES empresas(id) ON DELETE CASCADE,
    categoria_id UUID           REFERENCES categorias(id) ON DELETE SET NULL,
    nombre      TEXT            NOT NULL,
    descripcion TEXT            NOT NULL DEFAULT '',
    precio      NUMERIC(10,2)   NOT NULL CHECK (precio >= 0),
    imagen_url  TEXT            NOT NULL DEFAULT '',
    disponible  BOOLEAN         NOT NULL DEFAULT TRUE
);

-- Índice compuesto para filtrar productos disponibles por empresa y categoría
CREATE INDEX idx_productos_empresa ON productos (empresa_id, disponible, categoria_id);

-- -----------------------------------------------------------------------------
-- NOTAS DE DISEÑO MULTI-TENANT:
--   - empresa_id aparece en categorias y productos como FK a empresas.
--   - Todos los INSERT/UPDATE deben incluir empresa_id explícitamente.
--   - En producción se aplicará RLS: `CREATE POLICY tenant_isolation ON ...
--     USING (empresa_id = current_setting('app.empresa_id')::UUID)`.
--   - Las FK con ON DELETE CASCADE aseguran limpieza al eliminar un tenant.
-- -----------------------------------------------------------------------------
