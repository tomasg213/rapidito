-- =============================================================
-- Rapidito – Esquema completo de base de datos
-- =============================================================

-- 1. EXTENSIONES -------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TABLAS ------------------------------------------------------

-- 2a. Perfiles de usuario (1:1 con auth.users)
CREATE TABLE IF NOT EXISTS public.usuarios (
    id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL,
    telefono    TEXT,
    rol         TEXT NOT NULL DEFAULT 'cliente'
                CHECK (rol IN ('cliente', 'comercio', 'repartidor')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2b. Comercios
CREATE TABLE IF NOT EXISTS public.comercios (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    propietario_id  UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre          TEXT NOT NULL,
    descripcion     TEXT,
    categoria       TEXT,
    activo          BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2c. Productos
CREATE TABLE IF NOT EXISTS public.productos (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    comercio_id UUID NOT NULL REFERENCES public.comercios(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL,
    descripcion TEXT,
    precio      DECIMAL(10,2) NOT NULL,
    disponible  BOOLEAN DEFAULT true,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- 2d. Pedidos (refuerza claves foráneas)
CREATE TABLE IF NOT EXISTS public.pedidos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id      UUID NOT NULL REFERENCES public.usuarios(id),
    comercio_id     UUID NOT NULL REFERENCES public.comercios(id),
    repartidor_id   UUID REFERENCES public.usuarios(id),
    monto_total     DECIMAL(10,2) NOT NULL,
    direccion_texto TEXT NOT NULL,
    referencia      TEXT,
    estado          TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_preparacion', 'en_camino', 'entregado')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2e. Líneas de pedido
CREATE TABLE IF NOT EXISTS public.pedido_productos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pedido_id       UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    producto_id     UUID NOT NULL REFERENCES public.productos(id),
    cantidad        INTEGER NOT NULL DEFAULT 1,
    precio_unitario DECIMAL(10,2) NOT NULL,
    subtotal        DECIMAL(10,2) NOT NULL
);

-- 3. TRIGGER: crear perfil al registrarse ------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
    INSERT INTO public.usuarios (id, nombre, rol)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data ->> 'nombre', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data ->> 'rol', 'cliente')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. ROW LEVEL SECURITY ------------------------------------------

ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comercios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedido_productos ENABLE ROW LEVEL SECURITY;

-- 4a. usuarios
CREATE POLICY "usuarios_select_own"
    ON public.usuarios FOR SELECT
    USING (id = auth.uid());

CREATE POLICY "usuarios_insert_own"
    ON public.usuarios FOR INSERT
    WITH CHECK (id = auth.uid());

CREATE POLICY "usuarios_update_own"
    ON public.usuarios FOR UPDATE
    USING (id = auth.uid())
    WITH CHECK (id = auth.uid());

-- 4b. comercios
CREATE POLICY "comercios_select_all"
    ON public.comercios FOR SELECT
    USING (true);

CREATE POLICY "comercios_insert_propietario"
    ON public.comercios FOR INSERT
    WITH CHECK (
        auth.uid() = propietario_id
        AND EXISTS (
            SELECT 1 FROM public.usuarios
            WHERE id = auth.uid() AND rol = 'comercio'
        )
    );

CREATE POLICY "comercios_update_propietario"
    ON public.comercios FOR UPDATE
    USING (auth.uid() = propietario_id)
    WITH CHECK (auth.uid() = propietario_id);

CREATE POLICY "comercios_delete_propietario"
    ON public.comercios FOR DELETE
    USING (auth.uid() = propietario_id);

-- 4c. productos
CREATE POLICY "productos_select_all"
    ON public.productos FOR SELECT
    USING (true);

CREATE POLICY "productos_insert_propietario"
    ON public.productos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
    );

CREATE POLICY "productos_update_propietario"
    ON public.productos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
    );

CREATE POLICY "productos_delete_propietario"
    ON public.productos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
    );

-- 4d. pedidos
CREATE POLICY "pedidos_select_own"
    ON public.pedidos FOR SELECT
    USING (
        auth.uid() = cliente_id
        OR auth.uid() = repartidor_id
        OR EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
    );

CREATE POLICY "pedidos_insert_cliente"
    ON public.pedidos FOR INSERT
    WITH CHECK (auth.uid() = cliente_id);

CREATE POLICY "pedidos_update_comercio_estado"
    ON public.pedidos FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
        OR auth.uid() = repartidor_id
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.comercios
            WHERE id = comercio_id AND propietario_id = auth.uid()
        )
        OR auth.uid() = repartidor_id
    );

-- 4e. pedido_productos
CREATE POLICY "pedido_productos_select_own"
    ON public.pedido_productos FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE id = pedido_id
            AND (
                cliente_id = auth.uid()
                OR repartidor_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM public.comercios
                    WHERE id = comercio_id AND propietario_id = auth.uid()
                )
            )
        )
    );

CREATE POLICY "pedido_productos_insert_cliente"
    ON public.pedido_productos FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.pedidos
            WHERE id = pedido_id AND cliente_id = auth.uid()
        )
    );

-- 5. REPLICA IDENTITY + REALTIME ---------------------------------

ALTER TABLE public.pedidos REPLICA IDENTITY FULL;
ALTER TABLE public.pedido_productos REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.pedidos;
ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.pedido_productos;
