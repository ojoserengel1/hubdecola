-- =====================================================
-- CRIAR SUBSCRIPTION PARA CLIENTE 2
-- =====================================================

DO $$
DECLARE
    v_client_id UUID := 'e89215a1-6b2f-4dc8-a7e6-808104cfe24b';
    v_plan_id UUID;
BEGIN
    -- Pegar ID do plano ativo
    SELECT id INTO v_plan_id 
    FROM plans 
    WHERE is_active = true 
    LIMIT 1;

    IF v_plan_id IS NULL THEN
        RAISE EXCEPTION 'Nenhum plano ativo encontrado!';
    END IF;

    RAISE NOTICE '🔧 Criando subscription para Cliente 2...';
    RAISE NOTICE 'Plano: %', v_plan_id;

    -- Criar subscription se não existir
    IF NOT EXISTS (SELECT 1 FROM subscriptions WHERE user_id = v_client_id) THEN
        INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
        VALUES (
            v_client_id,
            v_plan_id,
            'ativa',
            CURRENT_DATE,
            CURRENT_DATE + INTERVAL '30 days',
            'pendente'
        );
        
        RAISE NOTICE '✅ Subscription criada com sucesso!';
    ELSE
        RAISE NOTICE '⚠️  Subscription já existe para este cliente';
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 CLIENTE 2 AGORA TEM SUBSCRIPTION!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END;
$$;

