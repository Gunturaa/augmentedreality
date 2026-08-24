-- Jalankan kode SQL ini di menu "SQL Editor" pada dashboard Supabase Anda

CREATE TABLE public.models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    filename TEXT NOT NULL,
    url TEXT NOT NULL,
    "qrCode" TEXT NOT NULL,
    "arUrl" TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Mengizinkan akses publik untuk membaca data (agar siswa bisa melihat AR)
ALTER TABLE public.models ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
ON public.models FOR SELECT
USING ( true );

-- (Opsional) Mengizinkan siapa saja mengupload untuk keperluan prototype ini
-- Di production, Anda harus membatasi ini hanya untuk user yang login (Admin)
CREATE POLICY "Anyone can insert models"
ON public.models FOR INSERT
WITH CHECK ( true );
