-- ============================================================================
-- Script: Remover Constraint de Stage do Pipeline
-- Data: 2024-12-05
-- Descrição: Remove a constraint CHECK que limita os valores de stage,
--            permitindo stages dinâmicos da tabela pipeline_stages
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================================================

-- Remover a constraint CHECK do campo stage
ALTER TABLE public.production_pipeline
DROP CONSTRAINT IF EXISTS production_pipeline_stage_check;

-- Verificar se foi removida
SELECT 
    '✅ Constraint production_pipeline_stage_check removida com sucesso!' as status,
    'Agora o campo stage aceita qualquer valor de texto' as observacao;

