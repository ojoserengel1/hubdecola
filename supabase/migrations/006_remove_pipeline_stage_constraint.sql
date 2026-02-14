-- ============================================================================
-- Migration: Remover constraint de stage do production_pipeline
-- Data: 2024-12-05
-- Descrição: Remove a constraint CHECK que limita os valores de stage,
--            permitindo stages dinâmicos da tabela pipeline_stages
-- ============================================================================

-- Remover a constraint CHECK do campo stage
ALTER TABLE public.production_pipeline
DROP CONSTRAINT IF EXISTS production_pipeline_stage_check;

-- Adicionar comentário explicativo
COMMENT ON COLUMN public.production_pipeline.stage IS 'Estágio do pipeline (pode ser qualquer valor, validado pela tabela pipeline_stages)';

