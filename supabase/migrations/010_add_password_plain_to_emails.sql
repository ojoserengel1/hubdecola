-- ============================================================================
-- Migration: Adicionar campo password_plain aos e-mails profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo password_plain para armazenar a senha em texto plano (visível para o cliente)
-- ============================================================================

-- Adiciona coluna de senha em texto plano (para exibição ao cliente)
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS password_plain TEXT;

-- Comentário
COMMENT ON COLUMN emails_profissionais.password_plain IS 'Senha do e-mail em texto plano (para exibição ao cliente após configuração pelo admin)';


