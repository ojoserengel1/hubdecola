# 🎯 Edição de Clientes + Integração Stripe

## ✅ IMPLEMENTADO

### 1. **Formulário de Cliente = Checkout Stripe** 💳

Os campos de criação e edição agora são **IDÊNTICOS** ao checkout da Stripe:

#### Campos:
- ✅ **Nome Completo** (obrigatório)
- ✅ **E-mail** (obrigatório)
- ✅ **Nome da Empresa** (obrigatório)
- ✅ **Telefone (WhatsApp)** (opcional)
- ✅ **Senha** (obrigatório apenas na criação)

---

### 2. **Funcionalidade de Edição** ✏️

#### **Onde:** Página de Detalhes do Cliente
- **URL:** `/admin/clientes/{id}`
- **Botão:** "Editar Cliente" (canto superior direito)

#### **O que pode editar:**
- Nome Completo
- Nome da Empresa
- E-mail (atualiza login também)
- Telefone (WhatsApp)

#### **Atualização:**
- ✅ Atualiza no banco de dados
- ✅ Atualiza em todas as áreas (Dashboard, Financeiro, Pipeline, etc.)
- ✅ Se alterar e-mail, atualiza também no Supabase Auth (login)
- ✅ Toast de sucesso após salvar

---

## 📋 ARQUIVOS MODIFICADOS

### **Backend:**
1. **`apps/api/src/routes/admin.routes.ts`**
   - ✅ Novo endpoint: `PUT /admin/clients/:id`
   - ✅ Atualiza dados do perfil
   - ✅ Atualiza e-mail no Supabase Auth

### **Frontend:**
2. **`apps/web/src/lib/api.ts`**
   - ✅ Nova interface: `UpdateClientRequest`
   - ✅ Nova função: `updateClient(clientId, data)`

3. **`apps/web/src/components/admin/EditClientModal.tsx`** (NOVO)
   - ✅ Modal de edição com os 4 campos da Stripe
   - ✅ Validação de campos obrigatórios
   - ✅ Loading state
   - ✅ Toast de sucesso/erro

4. **`apps/web/src/components/admin/CreateClientModal.tsx`**
   - ✅ Atualizado para destacar integração Stripe
   - ✅ Melhor descrição dos campos

5. **`apps/web/src/pages/admin/ClienteDetalhe.tsx`**
   - ✅ Botão "Editar Cliente"
   - ✅ Integração com `EditClientModal`

---

## 🧪 COMO TESTAR

### **Testar Edição:**

1. **Acesse:** `http://localhost:5177/admin/clientes`
2. **Clique** em um cliente para ver detalhes
3. **Clique** no botão **"Editar Cliente"** (canto superior direito)
4. **Altere** os campos:
   - Nome Completo
   - Nome da Empresa
   - E-mail
   - Telefone
5. **Clique** em **"Salvar Alterações"**
6. **Verifique:**
   - ✅ Toast de sucesso aparece
   - ✅ Dados atualizados no card principal
   - ✅ Voltando para `/admin/clientes`, dados estão atualizados
   - ✅ No Financeiro, nome do cliente atualizado
   - ✅ No Pipeline, nome do cliente atualizado

### **Testar Criação:**

1. **Acesse:** `http://localhost:5177/admin/clientes`
2. **Clique** em **"Novo Cliente"**
3. **Preencha** todos os campos:
   - Nome Completo: `Cliente Teste`
   - Nome da Empresa: `Empresa Teste Ltda`
   - E-mail: `teste@exemplo.com`
   - Senha: `Teste123@`
   - Telefone: `(11) 99999-9999`
4. **Clique** em **"Criar Cliente"**
5. **Verifique:**
   - ✅ Cliente aparece na lista
   - ✅ Todos os registros criados automaticamente
   - ✅ Aparece no Pipeline (Aguardando Briefing)
   - ✅ Aparece no Financeiro (3 clientes ativos)

---

## 🔗 PREPARAÇÃO PARA AUTOMAÇÃO STRIPE

### **Campos Mapeados:**

| Campo Stripe | Campo DecolaWeb | Obrigatório |
|--------------|-----------------|-------------|
| Nome Completo | `name` | ✅ |
| E-mail | `email` | ✅ |
| Nome da Empresa | `company_name` | ✅ |
| Telefone | `whatsapp` | ❌ |

### **Próximos Passos (Futuro):**

1. **Criar Webhook Stripe** (`/api/webhooks/stripe`)
2. **Escutar evento:** `checkout.session.completed`
3. **Extrair dados do cliente:**
   ```json
   {
     "name": "João Silva",
     "email": "joao@exemplo.com",
     "company_name": "Empresa Exemplo Ltda",
     "phone": "(11) 99999-9999"
   }
   ```
4. **Chamar:** `POST /api/admin/clients` com os dados
5. **Cliente criado automaticamente** após pagamento confirmado

---

## 📊 FLUXO COMPLETO

### **Criação Manual (Atual):**
```
Admin → Novo Cliente → Preenche Formulário → Criar
  ↓
Cliente criado com todos os registros
  ↓
Aparece em Clientes, Pipeline, Financeiro
```

### **Criação Automática (Futuro):**
```
Cliente paga na Stripe → Webhook recebe evento → Extrai dados
  ↓
POST /api/admin/clients (automático)
  ↓
Cliente criado com todos os registros
  ↓
Aparece em Clientes, Pipeline, Financeiro
  ↓
E-mail de boas-vindas com credenciais
```

### **Edição (Atual):**
```
Admin → Clientes → Detalhe → Editar Cliente → Altera dados
  ↓
PUT /api/admin/clients/:id
  ↓
Dados atualizados em todas as áreas
  ↓
Toast de sucesso
```

---

## 🎯 CHECKLIST

- [ ] Testei criar um novo cliente
- [ ] Testei editar um cliente existente
- [ ] Verifiquei que os dados aparecem no Financeiro
- [ ] Verifiquei que os dados aparecem no Pipeline
- [ ] Testei alterar o e-mail e fazer login com o novo e-mail
- [ ] Verifiquei que os campos são os mesmos do checkout Stripe

---

**Pronto para automação Stripe!** 🚀

