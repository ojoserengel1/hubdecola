# 🚀 Guia de Setup - DecolaWeb Hub

## Setup Inicial do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie uma nova organização (se ainda não tiver)
3. Crie um novo projeto
   - Nome: `DecolaWeb Hub` (ou qualquer nome)
   - Database Password: guarde essa senha
   - Region: escolha a mais próxima (ex: South America)
4. Aguarde a criação do projeto (leva alguns minutos)

### 2. Executar Migration

1. No dashboard do Supabase, vá em **SQL Editor**
2. Clique em **New Query**
3. Copie todo o conteúdo do arquivo `supabase/migrations/001_initial_schema.sql`
4. Cole no editor e clique em **Run**
5. Aguarde a execução (deve completar sem erros)

### 3. Configurar Autenticação

1. Vá em **Authentication** > **Providers**
2. Habilite **Email**
3. Configurações recomendadas:
   - Enable email confirmations: `false` (para desenvolvimento)
   - Enable email change confirmations: `false` (para desenvolvimento)
   - Enable phone confirmations: `false`

### 4. Obter Chaves de API

1. Vá em **Settings** > **API**
2. Copie as seguintes chaves:
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public**: chave pública para o frontend
   - **service_role**: chave privada para o backend (⚠️ NUNCA exponha no frontend!)

### 5. Configurar Variáveis de Ambiente

#### Backend (`apps/api/.env`)
Crie o arquivo a partir do `.env.example`:

```bash
cd apps/api
cp env.example.txt .env
```

Edite o arquivo `.env` e preencha:
```env
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_KEY=sua-service-role-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`apps/web/.env`)
Crie o arquivo a partir do `.env.example`:

```bash
cd apps/web
cp .env.example .env
```

Edite o arquivo `.env` e preencha:
```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
VITE_API_URL=http://localhost:3001/api
```

## Criar Usuários de Teste

### Opção 1: Via Dashboard do Supabase

#### Criar Admin:

1. **Criar usuário na Auth**:
   - Vá em **Authentication** > **Users**
   - Clique em **Add user** > **Create new user**
   - Email: `admin@decolaweb.com`
   - Password: `admin123` (ou qualquer senha)
   - Clique em **Create user**
   - Copie o **User UID** (importante!)

2. **Criar perfil**:
   - Vá em **Table Editor** > **profiles**
   - Clique em **Insert** > **Insert row**
   - Preencha:
     ```
     id: [Cole o User UID copiado]
     role: admin
     name: Admin DecolaWeb
     company_name: DecolaWeb
     whatsapp: 11999999999
     ```
   - Clique em **Save**

#### Criar Cliente:

1. **Criar usuário na Auth**:
   - Email: `cliente@teste.com`
   - Password: `cliente123`
   - Copie o **User UID**

2. **Pegar ID do plano**:
   - Vá em **Table Editor** > **plans**
   - Copie o `id` do plano "Site Profissional DecolaWeb"

3. **Criar perfil**:
   - Tabela: **profiles**
   - Preencha:
     ```
     id: [User UID do cliente]
     role: client
     name: João Silva
     company_name: Empresa Teste
     whatsapp: 11888888888
     plan_id: [ID do plano copiado]
     ```

4. **Criar assinatura**:
   - Tabela: **subscriptions**
   - Clique em **Insert row**
   - Preencha:
     ```
     user_id: [User UID do cliente]
     plan_id: [ID do plano]
     status: ativa
     started_at: [Data atual]
     renews_at: [Data atual + 30 dias]
     payment_method: stripe
     ```

5. **Criar status do site**:
   - Tabela: **site_status**
   - Preencha:
     ```
     user_id: [User UID do cliente]
     status: aguardando_briefing
     ```

6. **(Opcional) Criar contrato**:
   - Tabela: **contracts**
   - Preencha:
     ```
     user_id: [User UID do cliente]
     status: pendente
     ```

### Opção 2: Via SQL

Execute no **SQL Editor** do Supabase:

```sql
-- 1. Crie os usuários primeiro via Authentication > Add User no dashboard
-- Anote os IDs gerados

-- 2. Depois execute este SQL (substitua os IDs):

-- Pegar ID do plano
SELECT id FROM plans WHERE name = 'Site Profissional DecolaWeb';
-- Anote este ID

-- Criar perfil admin
INSERT INTO profiles (id, role, name, company_name, whatsapp)
VALUES ('COLE-ID-DO-USUARIO-ADMIN', 'admin', 'Admin DecolaWeb', 'DecolaWeb', '11999999999');

-- Criar perfil cliente
INSERT INTO profiles (id, role, name, company_name, whatsapp, plan_id)
VALUES (
  'COLE-ID-DO-USUARIO-CLIENTE',
  'client',
  'João Silva',
  'Empresa Teste',
  '11888888888',
  'COLE-ID-DO-PLANO'
);

-- Criar assinatura
INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
VALUES (
  'COLE-ID-DO-USUARIO-CLIENTE',
  'COLE-ID-DO-PLANO',
  'ativa',
  CURRENT_DATE,
  CURRENT_DATE + INTERVAL '30 days',
  'stripe'
);

-- Criar status do site
INSERT INTO site_status (user_id, status)
VALUES ('COLE-ID-DO-USUARIO-CLIENTE', 'aguardando_briefing');

-- Criar contrato
INSERT INTO contracts (user_id, status)
VALUES ('COLE-ID-DO-USUARIO-CLIENTE', 'pendente');

-- Criar pipeline
INSERT INTO production_pipeline (user_id, stage)
VALUES ('COLE-ID-DO-USUARIO-CLIENTE', 'aguardando_briefing');
```

## Testar o Sistema

### 1. Instalar Dependências

```bash
npm install
```

### 2. Iniciar Servidores

```bash
npm run dev
```

Isso iniciará:
- Frontend em http://localhost:5173
- Backend em http://localhost:3001

### 3. Fazer Login

#### Como Admin:
- Email: `admin@decolaweb.com`
- Senha: `admin123`
- Será redirecionado para `/admin/clientes`

#### Como Cliente:
- Email: `cliente@teste.com`
- Senha: `cliente123`
- Será redirecionado para `/app/dashboard`

## Verificar se está funcionando

### Backend
Acesse: http://localhost:3001/health

Deve retornar:
```json
{
  "success": true,
  "message": "DecolaWeb API está funcionando! 🚀",
  "timestamp": "...",
  "environment": "development"
}
```

### Frontend
Acesse: http://localhost:5173

Deve aparecer a tela de login.

## Troubleshooting

### Erro: "Não foi possível conectar ao banco"
- Verifique se as variáveis `SUPABASE_URL` e `SUPABASE_SERVICE_KEY` estão corretas
- Verifique se o projeto do Supabase está rodando

### Erro: "Token inválido"
- Verifique se a `SUPABASE_ANON_KEY` está correta no frontend
- Verifique se o usuário foi criado corretamente na tabela `profiles`

### Erro: "Perfil não encontrado"
- Certifique-se de que criou o perfil na tabela `profiles` com o mesmo ID do usuário auth

### Página em branco após login
- Abra o Console do navegador (F12) e veja se há erros
- Verifique se a API está rodando em http://localhost:3001

## Próximos Passos

Após configurar o ambiente:

1. Explore todas as funcionalidades do cliente
2. Explore o painel administrativo
3. Teste o sistema de tickets
4. Personalize conforme necessário
5. Configure integrações (Stripe, n8n, etc.)

## Suporte

Se tiver problemas durante o setup:
1. Revise cada passo deste guia
2. Verifique os logs do terminal (backend e frontend)
3. Verifique os logs do navegador (F12 > Console)
4. Entre em contato com o time de desenvolvimento

---

**Bom desenvolvimento! 🚀**

