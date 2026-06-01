-- Habilitar extensión pgcrypto por si se requiere, aunque gen_random_uuid() es nativo en PG13+
-- CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabla Administradores
CREATE TABLE public.administradores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    ci TEXT UNIQUE NOT NULL,
    login TEXT UNIQUE NOT NULL,
    contrasena TEXT NOT NULL,
    palabra_clave TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Personal (Las personas a las que se les registra asistencia)
CREATE TABLE public.personal (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombres TEXT NOT NULL,
    apellido_paterno TEXT NOT NULL,
    apellido_materno TEXT NOT NULL,
    ci TEXT UNIQUE NOT NULL,
    codigo_qr_token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tabla Asistencias
CREATE TABLE public.asistencias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    personal_id UUID REFERENCES public.personal(id) ON DELETE CASCADE NOT NULL,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    hora_entrada TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    hora_salida TIMESTAMP WITH TIME ZONE,
    estado TEXT CHECK (estado IN ('PRESENTE', 'ATRASO', 'FALTA', 'CON PERMISO')) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Políticas de Seguridad RLS (Row Level Security) - Deshabilitadas para desarrollo rápido (o puedes configurarlas según necesidad)
-- ALTER TABLE public.administradores ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.personal ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE public.asistencias ENABLE ROW LEVEL SECURITY;
