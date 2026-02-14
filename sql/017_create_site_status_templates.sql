-- ============================================================================
-- SQL Manual: Criar tabela para templates de status do site
-- Data: 2024-12-08
-- Descrição: Permite criar e gerenciar status personalizados do site com headlines, subheadlines, botões, etc.
-- ============================================================================

-- Tabela para templates de status do site
CREATE TABLE IF NOT EXISTS site_status_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT NOT NULL UNIQUE, -- Ex: 'aguardando_preenchimento', 'briefing_enviado', etc.
    name TEXT NOT NULL, -- Nome do status (ex: "Aguardando Preenchimento do Briefing")
    headline TEXT NOT NULL, -- Título principal do banner
    subheadline TEXT, -- Subtítulo/descrição
    color_scheme TEXT DEFAULT 'gray', -- gray, blue, yellow, green, etc.
    display_order INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição
    is_active BOOLEAN DEFAULT true, -- Se o status está ativo
    buttons JSONB DEFAULT '[]'::jsonb, -- Array de botões: [{label, action, variant, icon, url}]
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_site_status_templates_slug ON site_status_templates(slug);
CREATE INDEX idx_site_status_templates_display_order ON site_status_templates(display_order);
CREATE INDEX idx_site_status_templates_is_active ON site_status_templates(is_active);

-- RLS
ALTER TABLE site_status_templates ENABLE ROW LEVEL SECURITY;

-- Policy: Apenas admins podem gerenciar templates
CREATE POLICY "Admins can manage site status templates" ON site_status_templates
    FOR ALL USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Policy: Clientes podem visualizar templates ativos
CREATE POLICY "Clients can view active site status templates" ON site_status_templates
    FOR SELECT USING (is_active = true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_site_status_templates_updated_at
    BEFORE UPDATE ON site_status_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Inserir status padrão
INSERT INTO site_status_templates (slug, name, headline, subheadline, color_scheme, display_order, buttons) VALUES
('aguardando_preenchimento', 'Aguardando Preenchimento do Briefing', 'Status do Seu Site', 'Aguardando Preenchimento do Briefing', 'gray', 1, 
 '[{"label": "Preencher Briefing", "action": "navigate", "variant": "primary", "icon": "FileText", "url": "/app/briefing"}]'::jsonb),
('briefing_enviado', 'Briefing Enviado', 'Status do Seu Site', 'Briefing Enviado', 'blue', 2, 
 '[]'::jsonb),
('em_producao', 'Site em Produção', 'Status do Seu Site', 'Site em Produção', 'blue', 3, 
 '[]'::jsonb),
('em_aprovacao', 'Site em Aprovação', 'Status do Seu Site', 'Site em Aprovação', 'yellow', 4, 
 '[{"label": "Aprovar Site", "action": "approve", "variant": "primary", "icon": "CheckCircle2"}, {"label": "Falar no Chat", "action": "navigate", "variant": "outline", "icon": "MessageSquare", "url": "/app/chat"}]'::jsonb),
('site_publicado', 'Site Publicado', 'Status do Seu Site', 'Site Publicado 🎉', 'green', 5, 
 '[]'::jsonb)
ON CONFLICT (slug) DO NOTHING;

-- ============================================================================
-- FIM DO SCRIPT
-- ============================================================================


