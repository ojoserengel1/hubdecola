-- =====================================================
-- CORRIGIR CLIENTES INCOMPLETOS
-- Cria registros faltantes para clientes que não têm tudo
-- =====================================================

DO $$
DECLARE
    v_plan_id UUID;
    v_client_id UUID;
BEGIN
    -- Pegar ID do plano ativo
    SELECT id INTO v_plan_id 
    FROM plans 
    WHERE is_active = true 
    LIMIT 1;

    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum plano ativo encontrado!';
    END IF;

    RAISE NOTICE 'Plano ativo encontrado: %', v_plan_id;
    RAISE NOTICE '';

    -- =====================================================
    -- CLIENTE 2: e89215a1-6b2f-4dc8-a7e6-808104cfe24b
    -- =====================================================
    v_client_id := 'e89215a1-6b2f-4dc8-a7e6-808104cfe24b';
    RAISE NOTICE '🔧 Corrigindo Cliente 2...';

    -- Subscription
    IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = v_client_id) THEN
        INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
        VALUES (v_client_id, v_plan_id, 'ativa', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'pendente');
        RAISE NOTICE '  ✅ Subscription criada';
    END IF;

    -- Site Status
    IF NOT EXISTS (SELECT 1 FROM site_status WHERE user_id = v_client_id) THEN
        INSERT INTO site_status (user_id, status, notes, last_updated)
        VALUES (v_client_id, 'aguardando_briefing', 'Cliente recém cadastrado. Aguardando envio do briefing inicial.', NOW());
        RAISE NOTICE '  ✅ Site Status criado';
    END IF;

    -- Pipeline
    IF NOT EXISTS (SELECT 1 FROM production_pipeline WHERE user_id = v_client_id) THEN
        INSERT INTO production_pipeline (user_id, stage, notes, updated_at)
        VALUES (v_client_id, 'aguardando_briefing', 'Cliente novo. Aguardando preenchimento do briefing.', NOW());
        RAISE NOTICE '  ✅ Pipeline criado';
    END IF;

    -- Contract
    IF NOT EXISTS (SELECT 1 FROM contracts WHERE user_id = v_client_id) THEN
        INSERT INTO contracts (user_id, status, created_at)
        VALUES (v_client_id, 'pendente', NOW());
        RAISE NOTICE '  ✅ Contract criado';
    END IF;

    -- Briefing
    IF NOT EXISTS (SELECT 1 FROM briefings WHERE user_id = v_client_id) THEN
        INSERT INTO briefings (user_id, status, answers, created_at, updated_at)
        VALUES (v_client_id, 'nao_enviado', '{}'::jsonb, NOW(), NOW());
        RAISE NOTICE '  ✅ Briefing criado';
    END IF;

    RAISE NOTICE '✅ Cliente 2 corrigido!';
    RAISE NOTICE '';

    -- =====================================================
    -- CLIENTE 3: bf2469d6-bd80-45f4-a478-fa1c7da6e01d
    -- =====================================================
    v_client_id := 'bf2469d6-bd80-45f4-a478-fa1c7da6e01d';
    RAISE NOTICE '🔧 Corrigindo Cliente 3...';

    -- Site Status (único que falta)
    IF NOT EXISTS (SELECT 1 FROM site_status WHERE user_id = v_client_id) THEN
        INSERT INTO site_status (user_id, status, notes, last_updated)
        VALUES (v_client_id, 'aguardando_briefing', 'Cliente recém cadastrado. Aguardando envio do briefing inicial.', NOW());
        RAISE NOTICE '  ✅ Site Status criado';
    END IF;

    RAISE NOTICE '✅ Cliente 3 corrigido!';
    RAISE NOTICE '';

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 TODOS OS CLIENTES CORRIGIDOS!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END;
$$;

