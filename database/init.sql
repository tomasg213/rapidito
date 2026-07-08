CREATE TABLE IF NOT EXISTS public.pedidos (
    id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    cliente_id      UUID NOT NULL,
    comercio_id     UUID NOT NULL,
    monto_total     DECIMAL(10,2) NOT NULL,
    direccion_texto TEXT NOT NULL,
    referencia      TEXT,
    estado          TEXT NOT NULL DEFAULT 'pendiente'
                    CHECK (estado IN ('pendiente', 'en_preparacion', 'en_camino', 'entregado')),
    created_at      TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.pedidos REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.pedidos;
