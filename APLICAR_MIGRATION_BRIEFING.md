# 🔧 Como Aplicar a Migration do Briefing

## ⚠️ IMPORTANTE

A tabela `briefings` ainda não tem os novos campos. Para o formulário funcionar perfeitamente, você precisa aplicar a migration.

---

## 📋 Passo a Passo

### 1. **Acesse o SQL Editor do Supabase**

```
https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
```

### 2. **Cole o SQL abaixo e execute**

```sql
-- ============================================================================
-- Migration: Adicionar campos detalhados ao briefing
-- Data: 2024-12-04
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
```

### 3. **Clique em "Run"**

Aguarde a execução (deve levar alguns segundos).

### 4. **Verificar se funcionou**

Execute este SQL para confirmar:

```sql
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'briefings'
ORDER BY ordinal_position;
```

Você deve ver todos os novos campos listados!

---

## ✅ Status Atual

**POR ENQUANTO:** O formulário está funcionando salvando os dados no campo `answers` (JSON) para compatibilidade.

**APÓS A MIGRATION:** Os dados serão salvos em colunas estruturadas, melhorando:
- Performance de queries
- Validação no banco
- Facilidade de análise
- Relatórios

---

## 🧪 Testar Agora

Mesmo sem a migration, você JÁ PODE TESTAR o formulário:

1. Acesse: `http://localhost:5177/app/briefing`
2. Preencha o formulário
3. Salve
4. Os dados serão salvos no campo `answers` em formato JSON

---

**Aplicação da migration é recomendada mas não obrigatória para o formulário funcionar!**

