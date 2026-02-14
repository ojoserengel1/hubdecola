-- ============================================================================
-- Script: Adicionar Campo access_url aos E-mails Profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo access_url para armazenar o link de acesso à caixa de entrada do e-mail
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================================================

-- Adiciona coluna de URL de acesso aos e-mails profissionais
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS access_url TEXT;

-- Comentário
COMMENT ON COLUMN emails_profissionais.access_url IS 'URL de acesso à caixa de entrada do e-mail (webmail)';

-- Verificar se foi adicionado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'emails_profissionais'
AND column_name = 'access_url';

SELECT '✅ Campo access_url adicionado com sucesso!' as status;


