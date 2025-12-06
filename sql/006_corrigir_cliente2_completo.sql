-- =====================================================
-- CORRIGIR CLIENTE 2 - TODOS OS REGISTROS
-- =====================================================

DO $$
DECLARE
    v_client_id UUID := 'e89215a1-6b2f-4dc8-a7e6-808104cfe24b';
    v_plan_id UUID;
    v_client_name TEXT := 'Cliente 2';
    v_company_name TEXT := 'Empresa Cliente 2';
BEGIN
    -- Pegar ID do plano ativo
    SELECT id INTO v_plan_id 
    FROM plans 
    WHERE is_active = true 
    LIMIT 1;

    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum plano ativo encontrado!';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🔧 CORRIGINDO CLIENTE 2 COMPLETO';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Cliente: % (ID: %)', v_client_name, v_client_id;
    RAISE NOTICE 'Plano: %', v_plan_id;
    RAISE NOTICE '';

    -- 1. Criar/Atualizar Subscription
    RAISE NOTICE '1️⃣ Criando/Atualizando Subscription...';
    IF EXISTS (SELECT 1 FROM subscriptions WHERE user_id = v_client_id) THEN
        UPDATE subscriptions
        SET 
            plan_id = v_plan_id,
            status = 'ativa',
            started_at = CURRENT_DATE,
            renews_at = CURRENT_DATE + INTERVAL '30 days',
            payment_method = 'pendente'
        WHERE user_id = v_client_id;
        RAISE NOTICE '   ✅ Subscription atualizada';
    ELSE
        INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
        VALUES (
            v_client_id,
            v_plan_id,
            'ativa',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            'pendente'
        );
        RAISE NOTICE '   ✅ Subscription criada';
    END IF;

    -- 2. Criar/Atualizar Site Status
    RAISE NOTICE '2️⃣ Criando/Atualizando Site Status...';
    IF EXISTS (SELECT 1 FROM site_status WHERE user_id = v_client_id) THEN
        UPDATE site_status
        SET 
            status = 'aguardando_briefing',
            notes = 'Cliente recém cadastrado. Aguardando envio do briefing inicial.'
        WHERE user_id = v_client_id;
        RAISE NOTICE '   ✅ Site Status atualizado';
    ELSE
        INSERT INTO site_status (user_id, status, notes)
        VALUES (
            v_client_id,
            'aguardando_briefing',
            'Cliente recém cadastrado. Aguardando envio do briefing inicial.'
        );
        RAISE NOTICE '   ✅ Site Status criado';
    END IF;

    -- 3. Criar/Atualizar Production Pipeline
    RAISE NOTICE '3️⃣ Criando/Atualizando Production Pipeline...';
    IF EXISTS (SELECT 1 FROM production_pipeline WHERE user_id = v_client_id) THEN
        UPDATE production_pipeline
        SET 
            stage = 'aguardando_briefing',
            notes = 'Cliente novo. Aguardando primeiro contato e briefing.',
            updated_at = NOW()
        WHERE user_id = v_client_id;
        RAISE NOTICE '   ✅ Production Pipeline atualizado';
    ELSE
        INSERT INTO production_pipeline (user_id, stage, notes)
        VALUES (
            v_client_id,
            'aguardando_briefing',
            'Cliente novo. Aguardando primeiro contato e briefing.'
        );
        RAISE NOTICE '   ✅ Production Pipeline criado';
    END IF;

    -- 4. Criar/Atualizar Contract
    RAISE NOTICE '4️⃣ Criando/Atualizando Contract...';
    IF EXISTS (SELECT 1 FROM contracts WHERE user_id = v_client_id) THEN
        UPDATE contracts
        SET status = 'pendente'
        WHERE user_id = v_client_id;
        RAISE NOTICE '   ✅ Contract atualizado';
    ELSE
        INSERT INTO contracts (user_id, status)
        VALUES (
            v_client_id,
            'pendente'
        );
        RAISE NOTICE '   ✅ Contract criado';
    END IF;

    -- 5. Criar/Atualizar Briefing
    RAISE NOTICE '5️⃣ Criando/Atualizando Briefing...';
    IF EXISTS (SELECT 1 FROM briefings WHERE user_id = v_client_id) THEN
        UPDATE briefings
        SET 
            status = 'nao_enviado',
            answers = jsonb_build_object(
                'company_name', v_company_name,
                'full_name', v_client_name
            ),
            updated_at = NOW()
        WHERE user_id = v_client_id;
        RAISE NOTICE '   ✅ Briefing atualizado';
    ELSE
        INSERT INTO briefings (user_id, status, answers)
        VALUES (
            v_client_id,
            'nao_enviado',
            jsonb_build_object(
                'company_name', v_company_name,
                'full_name', v_client_name
            )
        );
        RAISE NOTICE '   ✅ Briefing criado';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 CLIENTE 2 TOTALMENTE CORRIGIDO!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '';
    RAISE NOTICE '✅ Subscription: Criada';
    RAISE NOTICE '✅ Site Status: Criado';
    RAISE NOTICE '✅ Production Pipeline: Criado';
    RAISE NOTICE '✅ Contract: Criado';
    RAISE NOTICE '✅ Briefing: Criado';
    RAISE NOTICE '';
    RAISE NOTICE 'Agora o Cliente 2 deve aparecer em:';
    RAISE NOTICE '  • Pipeline de Produção';
    RAISE NOTICE '  • Financeiro (como cliente ativo)';
    RAISE NOTICE '  • Lista de Clientes';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';

END;
$$;

