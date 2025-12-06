# 🔧 Corrigir Cliente 2 + Automatizar Novos Clientes

## 📋 O QUE VAMOS FAZER

1. ✅ **Corrigir o Cliente 2** (criar todos os registros faltantes)
2. ✅ **Criar trigger automático** (para futuros clientes)

---

## 🚨 PARTE 1: CORRIGIR CLIENTE 2

### Passo 1: Acesse o SQL Editor

```
https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
```

### Passo 2: Cole e execute este SQL

```sql
-- =====================================================
-- CORRIGIR CLIENTE 2 - CRIAR TODOS OS REGISTROS
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
```

### Passo 3: Verificar se funcionou

Recarregue a página do dashboard do Cliente 2:
```
http://localhost:5177/app/dashboard
```

Deve aparecer:
- ✅ Assinatura ativa
- ✅ Status do site: "Aguardando briefing"
- ✅ Contrato pendente
- ✅ Briefing disponível para preencher

---

## 🤖 PARTE 2: AUTOMATIZAR PARA FUTUROS CLIENTES

### Passo 1: Ainda no SQL Editor

Agora vamos criar um **TRIGGER** que fará isso automaticamente para TODOS os novos clientes.

### Passo 2: Cole e execute este SQL

```sql
-- ============================================================================
-- TRIGGER: Auto-criar registros ao criar novo cliente
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
```

---

## ✅ PRONTO!

### O que foi feito:

1. ✅ **Cliente 2 corrigido** - todos os registros criados
2. ✅ **Trigger instalado** - futuros clientes terão tudo automaticamente

### Como testar:

1. Recarregue o dashboard do Cliente 2
2. Tudo deve aparecer agora!

### Para novos clientes:

**BASTA CRIAR O USUÁRIO E O PERFIL** - o resto é automático! 🎉

```sql
-- Exemplo: criar novo cliente (apenas isso!)
-- O resto é AUTOMÁTICO via trigger

INSERT INTO profiles (id, role, name, company_name, whatsapp)
VALUES (
    'cole-o-user-id-aqui',
    'client',  -- ⚡ O trigger detecta isso!
    'Cliente 3',
    'Empresa Cliente 3',
    '11999999999'
);

-- ✨ PRONTO! subscription, site_status, pipeline, contract e briefing
--    serão criados AUTOMATICAMENTE! ✨
```

---

## 🎯 RESUMO

| Antes | Depois |
|-------|--------|
| ❌ Criar usuário manualmente | ✅ Criar usuário |
| ❌ Criar perfil manualmente | ✅ Criar perfil |
| ❌ Criar subscription | ✅ **AUTOMÁTICO** |
| ❌ Criar site_status | ✅ **AUTOMÁTICO** |
| ❌ Criar pipeline | ✅ **AUTOMÁTICO** |
| ❌ Criar contract | ✅ **AUTOMÁTICO** |
| ❌ Criar briefing | ✅ **AUTOMÁTICO** |

**🚀 Agora é só criar o usuário e perfil - o resto é mágica! ✨**

