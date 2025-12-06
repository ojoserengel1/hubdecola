-- =====================================================
-- CORRIGIR CLIENTE 2 - CRIAR TODOS OS REGISTROS
-- Execute este SQL no Supabase SQL Editor
-- =====================================================

DO $$
DECLARE
    v_user_id UUID := 'e89215a1-6b2f-4dc8-a7e6-808104cfe24b';
    v_plan_id UUID := 'f038fdd8-ff94-4e93-9a26-f2b331964f37';
    v_exists BOOLEAN;
BEGIN
    RAISE NOTICE '🔧 Iniciando correção do Cliente 2...';
    RAISE NOTICE '';
    
    -- 1. CRIAR ASSINATURA
    SELECT EXISTS(SELECT 1 FROM subscriptions WHERE user_id = v_user_id) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
        VALUES (
            v_user_id,
            v_plan_id,
            'ativa',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            'pendente'
        );
        RAISE NOTICE '✅ Assinatura criada';
    ELSE
        RAISE NOTICE '⚠️  Assinatura já existe - pulando';
    END IF;

    -- 2. CRIAR STATUS DO SITE
    SELECT EXISTS(SELECT 1 FROM site_status WHERE user_id = v_user_id) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO site_status (user_id, status, notes, last_updated)
        VALUES (
            v_user_id,
            'aguardando_briefing',
            'Cliente recém cadastrado. Aguardando envio do briefing inicial.',
            NOW()
        );
        RAISE NOTICE '✅ Status do site criado';
    ELSE
        RAISE NOTICE '⚠️  Status do site já existe - pulando';
    END IF;

    -- 3. CRIAR PIPELINE DE PRODUÇÃO
    SELECT EXISTS(SELECT 1 FROM production_pipeline WHERE user_id = v_user_id) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO production_pipeline (user_id, stage, notes, updated_at)
        VALUES (
            v_user_id,
            'aguardando_briefing',
            'Cliente novo. Aguardando preenchimento do briefing.',
            NOW()
        );
        RAISE NOTICE '✅ Pipeline criado';
    ELSE
        RAISE NOTICE '⚠️  Pipeline já existe - pulando';
    END IF;

    -- 4. CRIAR CONTRATO PENDENTE
    SELECT EXISTS(SELECT 1 FROM contracts WHERE user_id = v_user_id) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO contracts (user_id, status, created_at)
        VALUES (
            v_user_id,
            'pendente',
            NOW()
        );
        RAISE NOTICE '✅ Contrato criado';
    ELSE
        RAISE NOTICE '⚠️  Contrato já existe - pulando';
    END IF;

    -- 5. CRIAR BRIEFING INICIAL
    SELECT EXISTS(SELECT 1 FROM briefings WHERE user_id = v_user_id) INTO v_exists;
    
    IF NOT v_exists THEN
        INSERT INTO briefings (user_id, status, answers, created_at, updated_at)
        VALUES (
            v_user_id,
            'nao_enviado',
            '{}'::jsonb,
            NOW(),
            NOW()
        );
        RAISE NOTICE '✅ Briefing inicial criado';
    ELSE
        RAISE NOTICE '⚠️  Briefing já existe - pulando';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 CLIENTE 2 CORRIGIDO COM SUCESSO!';
    RAISE NOTICE '   Cliente: Cliente 2';
    RAISE NOTICE '   Empresa: Empresa Cliente 2';
    RAISE NOTICE '   Email: cliente2@gmail.com';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END;
$$;

