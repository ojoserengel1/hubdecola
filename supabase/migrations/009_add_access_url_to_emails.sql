-- ============================================================================
-- Migration: Adicionar campo access_url aos e-mails profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo access_url para armazenar o link de acesso à caixa de entrada do e-mail
-- ============================================================================

-- Adiciona coluna de URL de acesso aos e-mails profissionais
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS access_url TEXT;

-- Comentário
COMMENT ON COLUMN emails_profissionais.access_url IS 'URL de acesso à caixa de entrada do e-mail (webmail)';


