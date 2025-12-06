-- ============================================================================
-- Migration: Auto-criar registros ao criar novo cliente
-- Data: 2024-12-05
-- Descrição: Trigger que cria automaticamente todos os registros relacionados
--            quando um novo perfil de cliente é criado
-- ============================================================================

-- Função que cria todos os registros do cliente
CREATE OR REPLACE FUNCTION auto_create_client_records()
RETURNS TRIGGER AS $$
DECLARE
    v_plan_id UUID;
BEGIN
    -- Só executa se for um cliente novo
    IF NEW.role = 'client' THEN
        
        -- Pegar o ID do primeiro plano ativo
        SELECT id INTO v_plan_id 
        FROM plans 
        WHERE is_active = true 
        LIMIT 1;
        
        -- Se não encontrou plano, usar NULL (pode ser configurado depois)
        IF v_plan_id IS NULL THEN
            RAISE NOTICE 'Aviso: Nenhum plano ativo encontrado. Cliente criado sem plano.';
        END IF;
        
        -- 1. CRIAR ASSINATURA
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
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Assinatura criada para cliente %', NEW.id;
        
        -- 2. CRIAR STATUS DO SITE
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
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Status do site criado para cliente %', NEW.id;
        
        -- 3. CRIAR PIPELINE DE PRODUÇÃO
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
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Pipeline criado para cliente %', NEW.id;
        
        -- 4. CRIAR CONTRATO PENDENTE
        INSERT INTO contracts (
            user_id, 
            status,
            created_at
        )
        VALUES (
            NEW.id,
            'pendente',
            NOW()
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Contrato criado para cliente %', NEW.id;
        
        -- 5. CRIAR BRIEFING INICIAL (vazio, aguardando preenchimento)
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
        )
        ON CONFLICT (user_id) DO NOTHING;
        
        RAISE NOTICE '✅ Briefing inicial criado para cliente %', NEW.id;
        
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        RAISE NOTICE '🎉 TODOS OS REGISTROS CRIADOS COM SUCESSO!';
        RAISE NOTICE '   Cliente ID: %', NEW.id;
        RAISE NOTICE '   Nome: %', NEW.name;
        RAISE NOTICE '   Empresa: %', NEW.company_name;
        RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
        
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o trigger que executa a função
DROP TRIGGER IF EXISTS trigger_auto_create_client_records ON profiles;

CREATE TRIGGER trigger_auto_create_client_records
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_client_records();

-- Comentário para documentação
COMMENT ON FUNCTION auto_create_client_records() IS 
'Função automática que cria todos os registros relacionados (subscription, site_status, pipeline, contract, briefing) quando um novo perfil de cliente é inserido.';

-- ============================================================================
-- FIM DA MIGRATION
-- ============================================================================

