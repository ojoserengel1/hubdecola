-- ============================================================================
-- Migration: Adicionar campos detalhados ao briefing
-- Data: 2024-12-04
-- Descrição: Expansão da tabela briefings para campos estruturados
-- ============================================================================

-- Adicionar novas colunas à tabela briefings
ALTER TABLE briefings 
ADD COLUMN IF NOT EXISTS company_name TEXT,
ADD COLUMN IF NOT EXISTS segment TEXT,
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS commercial_email TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_commercial TEXT,
ADD COLUMN IF NOT EXISTS landline TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS has_website BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS current_website_url TEXT,
ADD COLUMN IF NOT EXISTS company_description TEXT,
ADD COLUMN IF NOT EXISTS target_audience TEXT,
ADD COLUMN IF NOT EXISTS service_region TEXT,
ADD COLUMN IF NOT EXISTS main_services TEXT,
ADD COLUMN IF NOT EXISTS differentials TEXT,
ADD COLUMN IF NOT EXISTS business_hours TEXT,
ADD COLUMN IF NOT EXISTS social_links TEXT,
ADD COLUMN IF NOT EXISTS has_brand_identity BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS brand_assets_links TEXT,
ADD COLUMN IF NOT EXISTS main_colors TEXT,
ADD COLUMN IF NOT EXISTS forbidden_colors TEXT,
ADD COLUMN IF NOT EXISTS general_notes TEXT;

-- Criar índices para melhor performance
CREATE INDEX IF NOT EXISTS idx_briefings_user_id ON briefings(user_id);
CREATE INDEX IF NOT EXISTS idx_briefings_status ON briefings(status);

-- Comentários para documentação
COMMENT ON COLUMN briefings.company_name IS 'Nome da empresa do cliente';
COMMENT ON COLUMN briefings.segment IS 'Segmento/nicho de atuação';
COMMENT ON COLUMN briefings.full_name IS 'Nome completo do responsável';
COMMENT ON COLUMN briefings.commercial_email IS 'E-mail comercial para exibir no site';
COMMENT ON COLUMN briefings.whatsapp_commercial IS 'WhatsApp comercial para leads';
COMMENT ON COLUMN briefings.has_website IS 'Se o cliente já possui site';
COMMENT ON COLUMN briefings.has_brand_identity IS 'Se possui identidade visual definida';

