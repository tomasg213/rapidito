CREATE TABLE IF NOT EXISTS public.direcciones (
    id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    usuario_id  UUID NOT NULL REFERENCES public.usuarios(id) ON DELETE CASCADE,
    nombre      TEXT NOT NULL,
    direccion   TEXT NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.direcciones ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'direcciones_select_own') THEN
        CREATE POLICY "direcciones_select_own" ON public.direcciones FOR SELECT USING (usuario_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'direcciones_insert_own') THEN
        CREATE POLICY "direcciones_insert_own" ON public.direcciones FOR INSERT WITH CHECK (usuario_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'direcciones_update_own') THEN
        CREATE POLICY "direcciones_update_own" ON public.direcciones FOR UPDATE USING (usuario_id = auth.uid()) WITH CHECK (usuario_id = auth.uid());
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'direcciones_delete_own') THEN
        CREATE POLICY "direcciones_delete_own" ON public.direcciones FOR DELETE USING (usuario_id = auth.uid());
    END IF;
END $$;
