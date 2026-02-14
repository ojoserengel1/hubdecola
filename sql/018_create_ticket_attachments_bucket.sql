-- Criar bucket para anexos de tickets no Supabase Storage
-- Execute este script no SQL Editor do Supabase

-- Criar o bucket (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true)
ON CONFLICT (id) DO NOTHING;

-- Política para permitir upload de arquivos pelos clientes
CREATE POLICY "Clients can upload ticket attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ticket-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir leitura de arquivos pelos clientes (seus próprios arquivos)
CREATE POLICY "Clients can view own ticket attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-attachments' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Política para permitir leitura de arquivos pelos admins (todos os arquivos)
CREATE POLICY "Admins can view all ticket attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'ticket-attachments' AND
  EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid() AND role = 'admin'
  )
);


