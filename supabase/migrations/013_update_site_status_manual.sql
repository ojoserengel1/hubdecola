-- ============================================================================
-- Migration: Atualizar site_status para suportar status manual
-- Data: 2024-12-08
-- Descrição: Adiciona novos status e campos para controle manual do status
-- ============================================================================

-- Remover constraint antiga
ALTER TABLE site_status 
  DROP CONSTRAINT IF EXISTS site_status_status_check;

-- Adicionar novos status ao CHECK constraint
ALTER TABLE site_status 
  ADD CONSTRAINT site_status_status_check 
  CHECK (status IN (
    'aguardando_preenchimento',
    'briefing_enviado',
    'em_producao',
    'em_aprovacao',
    'site_publicado',
    'aguardando_briefing' -- Mantém compatibilidade com valores antigos
  ));

-- Adicionar campos para URLs (preview e live)
ALTER TABLE site_status 
  ADD COLUMN IF NOT EXISTS preview_url TEXT,
  ADD COLUMN IF NOT EXISTS live_url TEXT;

-- Comentário para documentação
COMMENT ON COLUMN site_status.preview_url IS 'URL do site para aprovação do cliente';
COMMENT ON COLUMN site_status.live_url IS 'URL do site publicado e no ar';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================


