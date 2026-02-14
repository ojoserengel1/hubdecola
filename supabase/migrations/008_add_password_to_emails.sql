-- ============================================================================
-- Migration: Adicionar campo de senha aos e-mails profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo password_hash para armazenar senha do e-mail solicitado
-- ============================================================================

-- Adiciona coluna de senha (hash) aos e-mails profissionais
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Adiciona coluna de observações/notas para o admin
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Comentários
COMMENT ON COLUMN emails_profissionais.password_hash IS 'Hash da senha do e-mail (armazenado de forma segura)';
COMMENT ON COLUMN emails_profissionais.notes IS 'Observações do admin sobre o e-mail';


