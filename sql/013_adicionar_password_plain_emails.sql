-- ============================================================================
-- Script: Adicionar Campo password_plain aos E-mails Profissionais
-- Data: 2024-12-06
-- Descrição: Adiciona campo password_plain para armazenar a senha em texto plano (visível para o cliente)
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================================================

-- Adiciona coluna de senha em texto plano (para exibição ao cliente)
ALTER TABLE public.emails_profissionais
ADD COLUMN IF NOT EXISTS password_plain TEXT;

-- Comentário
COMMENT ON COLUMN emails_profissionais.password_plain IS 'Senha do e-mail em texto plano (para exibição ao cliente após configuração pelo admin)';

-- Verificar se foi adicionado corretamente
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'emails_profissionais'
AND column_name = 'password_plain';

SELECT '✅ Campo password_plain adicionado com sucesso!' as status;

