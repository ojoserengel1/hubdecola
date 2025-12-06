-- ============================================================================
-- TRIGGER: Auto-criar registros ao criar novo cliente
-- Execute este SQL no Supabase SQL Editor
-- ============================================================================

-- Função que cria todos os registros do cliente
CREATE OR REPLACE FUNCTION auto_create_client_records()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id UUID;
    v_exists BOOLEAN;
BEGIN
    -- Só executa se for um cliente novo
    IF NEW.role = 'client' THEN
        
        RAISE NOTICE '🆕 Novo cliente detectado: %', NEW.id;
        
        -- Pegar o ID do primeiro plano ativo
        SELECT id INTO v_plan_id 
        FROM plans 
        WHERE is_active = true 
        LIMIT 1;
        
        -- Se não encontrou plano, usar NULL
        IF v_plan_id IS NULL THEN
            RAISE WARNING 'Nenhum plano ativo encontrado. Cliente criado sem plano.';
        END IF;
        
        -- 1. CRIAR ASSINATURA
        SELECT EXISTS(SELECT 1 FROM subscriptions WHERE user_id = NEW.id) INTO v_exists;
        
        IF NOT v_exists THEN
            INSERT INTO subscriptions (
                user_id, 
                plan_id, 
                status, 
                started_at, 
                renews_at, 
                payment_method
            )
            VALUES (
                NEW.id,
                v_plan_id,
                'ativa',
                CURRENT_DATE,
                CURRENT_DATE + INTERVAL '30 days',
                'pendente'
            );
            
            RAISE NOTICE '  ✅ Assinatura criada';
        END IF;
        
        -- 2. CRIAR STATUS DO SITE
        SELECT EXISTS(SELECT 1 FROM site_status WHERE user_id = NEW.id) INTO v_exists;
        
        IF NOT v_exists THEN
            INSERT INTO site_status (
                user_id, 
                status, 
                notes,
                last_updated
            )
            VALUES (
                NEW.id,
                'aguardando_briefing',
                'Cliente recém cadastrado. Aguardando envio do briefing inicial.',
                NOW()
            );
            
            RAISE NOTICE '  ✅ Status do site criado';
        END IF;
        
        -- 3. CRIAR PIPELINE DE PRODUÇÃO
        SELECT EXISTS(SELECT 1 FROM production_pipeline WHERE user_id = NEW.id) INTO v_exists;
        
        IF NOT v_exists THEN
            INSERT INTO production_pipeline (
                user_id, 
                stage, 
                notes,
                updated_at
            )
            VALUES (
                NEW.id,
                'aguardando_briefing',
                'Cliente novo. Aguardando preenchimento do briefing.',
                NOW()
            );
            
            RAISE NOTICE '  ✅ Pipeline criado';
        END IF;
        
        -- 4. CRIAR CONTRATO PENDENTE
        SELECT EXISTS(SELECT 1 FROM contracts WHERE user_id = NEW.id) INTO v_exists;
        
        IF NOT v_exists THEN
            INSERT INTO contracts (
                user_id, 
                status,
                created_at
            )
            VALUES (
                NEW.id,
                'pendente',
                NOW()
            );
            
            RAISE NOTICE '  ✅ Contrato criado';
        END IF;
        
        -- 5. CRIAR BRIEFING INICIAL
        SELECT EXISTS(SELECT 1 FROM briefings WHERE user_id = NEW.id) INTO v_exists;
        
        IF NOT v_exists THEN
            INSERT INTO briefings (
                user_id,
                status,
                answers,
                created_at,
                updated_at
            )
            VALUES (
                NEW.id,
                'nao_enviado',
                '{}'::jsonb,
                NOW(),
                NOW()
            );
            
            RAISE NOTICE '  ✅ Briefing inicial criado';
        END IF;
        
        RAISE NOTICE '🎉 Todos os registros criados automaticamente para %', NEW.name;
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger
DROP TRIGGER IF EXISTS trigger_auto_create_client_records ON profiles;

CREATE TRIGGER trigger_auto_create_client_records
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_client_records();

-- Comentário
COMMENT ON FUNCTION auto_create_client_records() IS 
'Trigger automático que cria todos os registros relacionados quando um novo perfil de cliente é criado.';

-- Mensagem de sucesso
DO $$
BEGIN
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '✅ TRIGGER AUTOMÁTICO CRIADO COM SUCESSO!';
    RAISE NOTICE '';
    RAISE NOTICE 'A partir de agora, SEMPRE que você criar um novo';
    RAISE NOTICE 'cliente (profile com role=client), os seguintes';
    RAISE NOTICE 'registros serão criados AUTOMATICAMENTE:';
    RAISE NOTICE '';
    RAISE NOTICE '  • Subscription (assinatura)';
    RAISE NOTICE '  • Site Status';
    RAISE NOTICE '  • Production Pipeline';
    RAISE NOTICE '  • Contract';
    RAISE NOTICE '  • Briefing';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END;
$$;

