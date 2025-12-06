-- =====================================================
-- CORRIGIR CLIENTE 2 - VERSÃO SIMPLIFICADA
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

-- IDs fixos
\set user_id 'e89215a1-6b2f-4dc8-a7e6-808104cfe24b'
\set plan_id 'f038fdd8-ff94-4e93-9a26-f2b331964f37'

-- 1. ASSINATURA
INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
SELECT 
    :'user_id'::uuid,
    :'plan_id'::uuid,
    'ativa',
    CURRENT_DATE,
    CURRENT_DATE + INTERVAL '30 days',
    'pendente'
WHERE NOT EXISTS (
    SELECT 1 FROM subscriptions WHERE user_id = :'user_id'::uuid
);

-- 2. STATUS DO SITE
INSERT INTO site_status (user_id, status, notes, last_updated)
SELECT 
    :'user_id'::uuid,
    'aguardando_briefing',
    'Cliente recém cadastrado. Aguardando envio do briefing inicial.',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM site_status WHERE user_id = :'user_id'::uuid
);

-- 3. PIPELINE
INSERT INTO production_pipeline (user_id, stage, notes, updated_at)
SELECT 
    :'user_id'::uuid,
    'aguardando_briefing',
    'Cliente novo. Aguardando preenchimento do briefing.',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM production_pipeline WHERE user_id = :'user_id'::uuid
);

-- 4. CONTRATO
INSERT INTO contracts (user_id, status, created_at)
SELECT 
    :'user_id'::uuid,
    'pendente',
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM contracts WHERE user_id = :'user_id'::uuid
);

-- 5. BRIEFING
INSERT INTO briefings (user_id, status, answers, created_at, updated_at)
SELECT 
    :'user_id'::uuid,
    'nao_enviado',
    '{}'::jsonb,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM briefings WHERE user_id = :'user_id'::uuid
);

-- Verificar resultado
SELECT 
    'subscriptions' as tabela, COUNT(*) as total FROM subscriptions WHERE user_id = :'user_id'::uuid
UNION ALL
SELECT 'site_status', COUNT(*) FROM site_status WHERE user_id = :'user_id'::uuid
UNION ALL
SELECT 'production_pipeline', COUNT(*) FROM production_pipeline WHERE user_id = :'user_id'::uuid
UNION ALL
SELECT 'contracts', COUNT(*) FROM contracts WHERE user_id = :'user_id'::uuid
UNION ALL
SELECT 'briefings', COUNT(*) FROM briefings WHERE user_id = :'user_id'::uuid;

