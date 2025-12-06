# 🚀 DecolaWeb Hub - Área do Cliente

Sistema completo de gestão de clientes para a DecolaWeb, incluindo área do cliente e painel administrativo.

## 📋 Sobre o Projeto

Hub centralizado onde os clientes da DecolaWeb podem:
- Acompanhar o desenvolvimento do site
- Gerenciar pagamentos e faturas
- Enviar briefing do projeto
- Solicitar suporte
- Gerenciar e-mails profissionais e domínio
- Visualizar e assinar contrato

E onde os administradores podem:
- Gerenciar todos os clientes
- Acompanhar pipeline de produção (kanban)
- Responder tickets de suporte
- Visualizar métricas financeiras

## 🏗️ Arquitetura

Este é um monorepo com a seguinte estrutura:

```
hubdecola/
├── apps/
│   ├── web/          # Frontend (React + TypeScript + Vite + Tailwind)
│   └── api/          # Backend (Node + Express + TypeScript)
├── packages/
│   └── shared/       # Tipos TypeScript compartilhados
└── supabase/
    └── migrations/   # Migrations do banco de dados
```

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** - Framework UI
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **React Router** - Roteamento
- **React Query** - Data fetching e cache
- **Zustand** - State management
- **Lucide React** - Ícones

### Backend
- **Node.js** - Runtime
- **Express** - Framework web
- **TypeScript** - Tipagem estática
- **Supabase** - Database (PostgreSQL) + Auth

### Banco de Dados
- **PostgreSQL** (via Supabase)
- **Row Level Security (RLS)** para segurança
- 11 tabelas principais

## 🚦 Como Rodar o Projeto

### Pré-requisitos

- Node.js 18+ 
- npm 9+
- Conta no Supabase

### 1. Instalar Dependências

```bash
npm install
```

### 2. Configurar Variáveis de Ambiente

#### Backend (`apps/api/.env`)
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

#### Frontend (`apps/web/.env`)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=http://localhost:3001/api
```

### 3. Configurar Supabase

1. Crie um projeto no [Supabase](https://supabase.com)
2. Execute a migration SQL em `supabase/migrations/001_initial_schema.sql` no SQL Editor do Supabase
3. Copie as chaves de API (URL, anon key, service key) para os arquivos `.env`

### 4. Rodar o Projeto

#### Desenvolvimento (ambos servidores)
```bash
npm run dev
```

#### Ou separadamente:

Frontend:
```bash
npm run dev:web
```

Backend:
```bash
npm run dev:api
```

### 5. Acessar o Sistema

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 👤 Criando Usuários de Teste

### Criar Admin:
1. Crie um usuário via Supabase Auth (Dashboard > Authentication > Add User)
2. Insira um registro na tabela `profiles`:
```sql
INSERT INTO profiles (id, role, name, company_name, whatsapp)
VALUES 
('id-do-usuario-auth', 'admin', 'Admin DecolaWeb', 'DecolaWeb', '11999999999');
```

### Criar Cliente:
1. Crie um usuário via Supabase Auth
2. Insira um registro na tabela `profiles`:
```sql
INSERT INTO profiles (id, role, name, company_name, whatsapp, plan_id)
VALUES 
('id-do-usuario-auth', 'client', 'João Silva', 'Empresa X', '11888888888', 'id-do-plano');
```

3. Crie uma assinatura para o cliente:
```sql
INSERT INTO subscriptions (user_id, plan_id, status, started_at, renews_at, payment_method)
VALUES 
('id-do-usuario', 'id-do-plano', 'ativa', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', 'stripe');
```

## 📁 Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários (client/admin)
2. **plans** - Planos de assinatura
3. **subscriptions** - Assinaturas dos clientes
4. **invoices** - Faturas e pagamentos
5. **briefings** - Briefings dos projetos
6. **site_status** - Status do desenvolvimento
7. **emails_profissionais** - E-mails corporativos
8. **domains** - Domínios dos clientes
9. **contracts** - Contratos
10. **support_tickets** - Tickets de suporte
11. **support_messages** - Mensagens dos tickets
12. **production_pipeline** - Pipeline de produção (kanban)

## 🎨 Design System

### Cores
- **Primária**: `#FF002E` (vermelho DecolaWeb)
- **Fundo**: `#F9F9F9` (cinza claro)
- **Escuro**: `#03041A` (sidebar e textos)

### Tipografia
- **Fonte**: Inter (Google Fonts)
- **Títulos**: Inter Black (900)
- **Subtítulos**: Inter SemiBold (600)
- **Corpo**: Inter Regular (400)

## 📦 Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev              # Roda frontend + backend
npm run dev:web         # Roda apenas frontend
npm run dev:api         # Roda apenas backend

# Build
npm run build           # Build de todos os workspaces
npm run build:web       # Build apenas frontend
npm run build:api       # Build apenas backend

# Limpeza
npm run clean           # Remove node_modules de todos os workspaces
```

## 🔐 Segurança

- **Row Level Security (RLS)** habilitado em todas as tabelas
- Autenticação via Supabase Auth com JWT
- Clientes só acessam seus próprios dados
- Admins têm acesso total
- Backend valida tokens em todas as rotas protegidas

## 🔄 Integrações Futuras

O projeto está preparado para receber integrações com:

### Stripe
- Webhook para eventos de pagamento (`/api/webhooks/stripe`)
- Atualização automática de assinaturas
- Geração de faturas

### n8n
- Webhook para automações (`/api/webhooks/n8n`)
- Notificações no WhatsApp
- E-mails automáticos
- Integrações com outras ferramentas

## 📝 Rotas da API

### Públicas
- `GET /health` - Health check

### Autenticadas
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/dashboard` - Dados do dashboard
- `GET /api/briefing` - Buscar briefing
- `POST /api/briefing` - Enviar/atualizar briefing
- `GET /api/invoices` - Listar faturas
- `GET /api/site-status` - Status do site
- `GET /api/tickets` - Listar tickets
- `POST /api/tickets` - Criar ticket
- `GET /api/tickets/:id/messages` - Mensagens do ticket
- `POST /api/tickets/:id/messages` - Enviar mensagem

### Admin
- `GET /api/admin/clients` - Listar clientes
- `GET /api/admin/clients/:id` - Detalhes do cliente
- `PUT /api/admin/clients/:id/site-status` - Atualizar status
- `GET /api/admin/pipeline` - Pipeline de produção
- `PUT /api/admin/pipeline/:userId` - Atualizar pipeline
- `GET /api/admin/tickets` - Todos os tickets
- `POST /api/admin/tickets/:id/messages` - Responder ticket
- `GET /api/admin/financeiro` - Dados financeiros

## 🎯 Funcionalidades por Papel

### Cliente
- ✅ Dashboard com visão geral
- ✅ Envio de briefing do projeto
- ✅ Visualização de pagamentos e faturas
- ✅ Acompanhamento do status do site (timeline)
- ✅ Gestão de e-mails profissionais
- ✅ Informações sobre domínio
- ✅ Sistema de suporte (FAQ + tickets)
- ✅ Visualização e assinatura de contrato

### Admin
- ✅ Lista completa de clientes
- ✅ Detalhes de cada cliente (abas)
- ✅ Pipeline de produção (kanban)
- ✅ Gestão de tickets de suporte
- ✅ Dashboard financeiro
- ✅ Métricas e estatísticas

## 🤝 Contribuindo

Este projeto segue as melhores práticas de desenvolvimento:

1. Código limpo e bem documentado
2. Componentes reutilizáveis
3. Tipagem forte com TypeScript
4. Separação clara entre frontend e backend
5. API RESTful bem estruturada

## 📄 Licença

Este projeto é propriedade da DecolaWeb.

## 🆘 Suporte

Para dúvidas ou problemas:
- E-mail: dev@decolaweb.com.br
- WhatsApp: (11) 99999-9999

---

**Desenvolvido com ❤️ pela equipe DecolaWeb**
