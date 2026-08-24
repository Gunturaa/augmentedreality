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

-- Mengizinkan update nama model
CREATE POLICY "Anyone can update models"
ON public.models FOR UPDATE
USING ( true )
WITH CHECK ( true );

-- Mengizinkan hapus data model
CREATE POLICY "Anyone can delete models"
ON public.models FOR DELETE
USING ( true );

-- Mengizinkan siapa saja (publik) menghapus file dari bucket 'ar-models'
CREATE POLICY "Allow public deletes for ar-models"
ON storage.objects FOR DELETE
TO public
USING ( bucket_id = 'ar-models' );

-- ==========================================
-- MIGRATION: ADD HOTSPOTS CODE COLUMN
-- ==========================================
-- Jalankan perintah di bawah ini di SQL Editor Supabase Anda
-- untuk menambahkan kolom baru penyimpan kode hotspot.
ALTER TABLE public.models ADD COLUMN IF NOT EXISTS hotspots_code TEXT;
