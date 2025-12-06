# 👤 Criar Usuário Cliente

## Credenciais do Novo Cliente

```
Email: cliente@gmail.com
Senha: Acesso123@
Role: client
```

---

## 📋 Passo a Passo Completo

### Passo 1: Criar Usuário no Authentication

1. **Acesse o Dashboard do Supabase:**
   ```
   https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/auth/users
   ```

2. **Clique em "Add user"** no canto superior direito

3. **Selecione "Create new user"**

4. **Preencha o formulário:**
   ```
   Email: cliente@gmail.com
   Password: Acesso123@
   ✅ Auto Confirm User: MARQUE ESTA OPÇÃO
   ```

5. **Clique em "Create user"**

6. **COPIE o User ID** (UUID) que aparece na lista
   - Algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - **IMPORTANTE**: Você vai precisar desse ID no próximo passo!

---

### Passo 2: Criar Perfil e Dados do Cliente (SQL)

1. **Vá para o SQL Editor:**
   ```
   https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
   ```

2. **Cole o SQL abaixo** (substitua `SEU_USER_ID_AQUI` pelo ID copiado):

```sql
-- =====================================================
-- CRIAR CLIENTE COMPLETO NO SISTEMA
-- Email: cliente@gmail.com
-- =====================================================

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID do usuário
-- que você copiou no passo anterior!

DO $$
DECLARE
    v_user_id UUID := 'SEU_USER_ID_AQUI'; -- ⚠️ SUBSTITUA AQUI!
    v_plan_id UUID;
BEGIN
    -- Pegar o ID do plano ativo
    SELECT id INTO v_plan_id 
    FROM plans 
    WHERE is_active = true 
    LIMIT 1;

    -- 1. Criar perfil do cliente
    INSERT INTO profiles (id, role, name, company_name, whatsapp, plan_id)
    VALUES (
        v_user_id,
        'client',
        'Cliente Teste',
        'Empresa Teste Ltda',
        '11987654321',
        v_plan_id
    );
    
    RAISE NOTICE '✅ Perfil criado';

    -- 2. Criar assinatura ativa
    INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
    VALUES (
        v_user_id,
        v_plan_id,
        'ativa',
        CURRENT_DATE,
        CURRENT_DATE + INTERVAL '30 days',
        'stripe'
    );
    
    RAISE NOTICE '✅ Assinatura criada';

    -- 3. Criar status do site
    INSERT INTO site_status (user_id, status, notes)
    VALUES (
        v_user_id,
        'aguardando_briefing',
        'Cliente recém cadastrado. Aguardando envio do briefing inicial.'
    );
    
    RAISE NOTICE '✅ Status do site criado';

    -- 4. Criar pipeline de produção
    INSERT INTO production_pipeline (user_id, stage, notes)
    VALUES (
        v_user_id,
        'aguardando_briefing',
        'Cliente novo. Aguardando primeiro contato e briefing.'
    );
    
    RAISE NOTICE '✅ Pipeline criado';

    -- 5. Criar contrato pendente
    INSERT INTO contracts (user_id, status)
    VALUES (
        v_user_id,
        'pendente'
    );
    
    RAISE NOTICE '✅ Contrato criado';

    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE '🎉 CLIENTE CRIADO COM SUCESSO!';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
    RAISE NOTICE 'Email: cliente@gmail.com';
    RAISE NOTICE 'Senha: Acesso123@';
    RAISE NOTICE 'Role: client';
    RAISE NOTICE 'Status: ativa';
    RAISE NOTICE '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━';
END $$;

-- Verificar se foi criado corretamente
SELECT 
    p.id,
    p.name,
    p.company_name,
    p.role,
    s.status as subscription_status,
    ss.status as site_status
FROM profiles p
LEFT JOIN subscriptions s ON s.user_id = p.id
LEFT JOIN site_status ss ON ss.user_id = p.id
WHERE p.id = 'SEU_USER_ID_AQUI'; -- ⚠️ SUBSTITUA AQUI TAMBÉM!
```

3. **Execute o SQL** clicando em "Run"

4. **Verifique os resultados** no painel inferior

---

### Passo 3: Testar o Login

1. **Acesse a aplicação:**
   ```
   http://localhost:5177/login
   ```

2. **Faça login com:**
   ```
   Email: cliente@gmail.com
   Senha: Acesso123@
   ```

3. **Você deve ser redirecionado para:**
   ```
   http://localhost:5177/app/dashboard
   ```

4. **Você verá o Dashboard do Cliente** com:
   - Status do site
   - Próximo pagamento
   - Acesso rápido ao briefing
   - Acesso ao suporte

---

## ✅ O Que Foi Criado

| Item | Descrição | Status |
|------|-----------|--------|
| **Usuário Auth** | cliente@gmail.com | ✅ Confirmado |
| **Perfil** | Cliente Teste / Empresa Teste Ltda | ✅ Role: client |
| **Assinatura** | Site Profissional DecolaWeb (R$ 99,90) | ✅ Ativa (30 dias) |
| **Status do Site** | aguardando_briefing | ✅ Criado |
| **Pipeline** | aguardando_briefing | ✅ Criado |
| **Contrato** | Pendente de assinatura | ✅ Criado |

---

## 🔍 Verificações

### Verificar no Dashboard do Supabase

**Authentication > Users:**
```
✅ cliente@gmail.com deve aparecer na lista
✅ Status: Confirmed
```

**Table Editor > profiles:**
```
✅ Registro com role = 'client'
✅ Nome: Cliente Teste
✅ Empresa: Empresa Teste Ltda
```

**Table Editor > subscriptions:**
```
✅ Status: ativa
✅ Plano: Site Profissional DecolaWeb
✅ Renova em: (data atual + 30 dias)
```

---

## 🧪 Funcionalidades Disponíveis para o Cliente

Após fazer login, o cliente poderá:

### Dashboard
- ✅ Ver status do site
- ✅ Ver próximo pagamento
- ✅ Acesso rápido às funcionalidades

### Briefing
- ✅ Preencher briefing do projeto
- ✅ Salvar rascunho
- ✅ Enviar para análise

### Pagamentos
- ✅ Ver histórico de faturas
- ✅ Ver próximos vencimentos
- ✅ Baixar comprovantes

### Status do Site
- ✅ Acompanhar timeline de desenvolvimento
- ✅ Ver etapa atual
- ✅ Receber notificações de mudanças

### E-mails
- ✅ Ver e-mails profissionais configurados
- ✅ Ver status de cada e-mail

### Domínio
- ✅ Ver informações do domínio
- ✅ Ver status de configuração DNS

### Suporte
- ✅ Ver FAQ
- ✅ Abrir tickets de suporte
- ✅ Conversar com a equipe

### Contrato
- ✅ Ver contrato
- ✅ Assinar digitalmente

---

## 🎯 Exemplo de SQL já Preenchido

Para facilitar, aqui está um exemplo com um UUID de teste:

```sql
DO $$
DECLARE
    v_user_id UUID := 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'; -- ⚠️ Substitua pelo seu!
    v_plan_id UUID;
BEGIN
    SELECT id INTO v_plan_id FROM plans WHERE is_active = true LIMIT 1;

    INSERT INTO profiles (id, role, name, company_name, whatsapp, plan_id)
    VALUES (v_user_id, 'client', 'Cliente Teste', 'Empresa Teste Ltda', '11987654321', v_plan_id);

    INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
    VALUES (v_user_id, v_plan_id, 'ativa', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'stripe');

    INSERT INTO site_status (user_id, status, notes)
    VALUES (v_user_id, 'aguardando_briefing', 'Cliente recém cadastrado.');

    INSERT INTO production_pipeline (user_id, stage, notes)
    VALUES (v_user_id, 'aguardando_briefing', 'Cliente novo.');

    INSERT INTO contracts (user_id, status)
    VALUES (v_user_id, 'pendente');

    RAISE NOTICE '🎉 Cliente criado com sucesso!';
END $$;
```

---

## 💡 Dicas

1. **Sempre use "Auto Confirm User"** ao criar no dashboard
2. **Copie o User ID imediatamente** após criar
3. **Teste o login** logo após criar
4. **Verifique no painel admin** se o cliente aparece na lista

---

## 🆘 Troubleshooting

### Erro: "Perfil não encontrado"
- Verifique se o UUID no SQL está correto
- Confirme que o perfil foi criado na tabela `profiles`

### Erro: "Email já existe"
- O email já foi usado, escolha outro
- Ou delete o usuário existente primeiro

### Cliente não aparece no painel admin
- Verifique se a role é 'client' (não 'admin')
- Recarregue a página do admin

---

**Data:** 04/12/2024  
**Versão:** 1.0  
**Sistema:** Hub Decola - DecolaWeb

