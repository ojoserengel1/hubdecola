-- ============================================================================
-- Script: Aplicar Migration pipeline_stages
-- Data: 2024-12-05
-- Descrição: Cria a tabela pipeline_stages e insere os estágios padrão
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================================================

-- Criar tabela pipeline_stages
CREATE TABLE IF NOT EXISTS public.pipeline_stages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE, -- Nome exibido (ex: "Aguardando Briefing")
    slug TEXT NOT NULL UNIQUE, -- Identificador único (ex: "aguardando_briefing")
    display_order INTEGER NOT NULL DEFAULT 0, -- Ordem de exibição
    is_active BOOLEAN NOT NULL DEFAULT true, -- Se está ativo/visível
    color TEXT DEFAULT '#FF002E', -- Cor do badge (opcional)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Criar índice para ordenação
CREATE INDEX IF NOT EXISTS idx_pipeline_stages_order ON public.pipeline_stages(display_order);

-- Inserir estágios padrão
INSERT INTO public.pipeline_stages (name, slug, display_order, is_active) VALUES
    ('Aguardando Briefing', 'aguardando_briefing', 1, true),
    ('Copy', 'copy', 2, true),
    ('Design', 'design', 3, true),
    ('Web', 'web', 4, true),
    ('Infraestrutura', 'infraestrutura', 5, true),
    ('Domínio', 'dominio', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Adicionar comentários
COMMENT ON TABLE public.pipeline_stages IS 'Estágios customizáveis do pipeline de produção';
COMMENT ON COLUMN public.pipeline_stages.name IS 'Nome exibido do estágio';
COMMENT ON COLUMN public.pipeline_stages.slug IS 'Identificador único do estágio (usado no banco)';
COMMENT ON COLUMN public.pipeline_stages.display_order IS 'Ordem de exibição no kanban';
COMMENT ON COLUMN public.pipeline_stages.is_active IS 'Se o estágio está ativo e visível';

-- Verificar se foi criado corretamente
SELECT 
    '✅ Tabela pipeline_stages criada com sucesso!' as status,
    COUNT(*) as total_estagios
FROM public.pipeline_stages;

