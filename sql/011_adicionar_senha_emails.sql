-- ============================================================================
-- Script: Adicionar Campo de Senha aos E-mails Profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo password_hash e notes à tabela emails_profissionais
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
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

-- Verificar se foi adicionado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'emails_profissionais'
AND column_name IN ('password_hash', 'notes');

SELECT '✅ Campos adicionados com sucesso!' as status;

