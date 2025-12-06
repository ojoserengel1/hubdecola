-- ============================================================================
-- DecolaWeb Hub - Database Schema
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- profiles: Perfis de usuários (extensão da auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('client', 'admin')),
    name TEXT NOT NULL,
    company_name TEXT,
    whatsapp TEXT,
    stripe_customer_id TEXT,
    plan_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- plans: Planos de assinatura
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    price_monthly NUMERIC(10, 2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- subscriptions: Assinaturas dos clientes
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES plans(id),
    status TEXT NOT NULL CHECK (status IN ('ativa', 'pendente', 'cancelada')),
    started_at DATE NOT NULL,
    renews_at DATE NOT NULL,
    payment_method TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- invoices: Faturas/pagamentos
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subscription_id UUID NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
    amount NUMERIC(10, 2) NOT NULL,
    due_date DATE NOT NULL,
    paid_at TIMESTAMPTZ,
    status TEXT NOT NULL CHECK (status IN ('pago', 'pendente', 'atrasado', 'cancelado')),
    payment_link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- briefings: Briefings dos clientes
CREATE TABLE briefings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('nao_enviado', 'enviado', 'em_analise', 'aprovado')),
    answers JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- site_status: Status do desenvolvimento do site
CREATE TABLE site_status (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('aguardando_briefing', 'em_producao', 'em_aprovacao', 'site_publicado')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- emails_profissionais: E-mails profissionais dos clientes
CREATE TABLE emails_profissionais (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('ativo', 'pendente', 'cancelado')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- domains: Domínios dos clientes
CREATE TABLE domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    domain TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('aguardando_dns', 'configurando', 'ativo')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- contracts: Contratos dos clientes
CREATE TABLE contracts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    status TEXT NOT NULL CHECK (status IN ('pendente', 'assinado')),
    sent_at TIMESTAMPTZ,
    signed_at TIMESTAMPTZ,
    contract_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- support_tickets: Tickets de suporte
CREATE TABLE support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('aberto', 'em_andamento', 'respondido', 'fechado')),
    priority TEXT NOT NULL CHECK (priority IN ('baixa', 'media', 'alta')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- support_messages: Mensagens dos tickets
CREATE TABLE support_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- production_pipeline: Pipeline de produção (kanban)
CREATE TABLE production_pipeline (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    stage TEXT NOT NULL CHECK (stage IN ('aguardando_briefing', 'copy', 'design', 'web', 'infraestrutura', 'dominio')),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_invoices_subscription ON invoices(subscription_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_briefings_user ON briefings(user_id);
CREATE INDEX idx_site_status_user ON site_status(user_id);
CREATE INDEX idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX idx_support_tickets_status ON support_tickets(status);
CREATE INDEX idx_support_messages_ticket ON support_messages(ticket_id);
CREATE INDEX idx_production_pipeline_user ON production_pipeline(user_id);
CREATE INDEX idx_production_pipeline_stage ON production_pipeline(stage);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE briefings ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE emails_profissionais ENABLE ROW LEVEL SECURITY;
ALTER TABLE domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_pipeline ENABLE ROW LEVEL SECURITY;

-- Policies para profiles
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON profiles FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can view all subscriptions" ON subscriptions FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para invoices
CREATE POLICY "Users can view own invoices" ON invoices FOR SELECT USING (
    subscription_id IN (SELECT id FROM subscriptions WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can view all invoices" ON invoices FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para briefings
CREATE POLICY "Users can view own briefings" ON briefings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert own briefings" ON briefings FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own briefings" ON briefings FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all briefings" ON briefings FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para site_status
CREATE POLICY "Users can view own site status" ON site_status FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage site status" ON site_status FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para emails_profissionais
CREATE POLICY "Users can view own emails" ON emails_profissionais FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage emails" ON emails_profissionais FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para domains
CREATE POLICY "Users can view own domains" ON domains FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage domains" ON domains FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para contracts
CREATE POLICY "Users can view own contracts" ON contracts FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Admins can manage contracts" ON contracts FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para support_tickets
CREATE POLICY "Users can view own tickets" ON support_tickets FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can create tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can update own tickets" ON support_tickets FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "Admins can view all tickets" ON support_tickets FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para support_messages
CREATE POLICY "Users can view messages of own tickets" ON support_messages FOR SELECT USING (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
);
CREATE POLICY "Users can create messages" ON support_messages FOR INSERT WITH CHECK (
    ticket_id IN (SELECT id FROM support_tickets WHERE user_id = auth.uid())
);
CREATE POLICY "Admins can manage all messages" ON support_messages FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Policies para production_pipeline
CREATE POLICY "Admins can manage pipeline" ON production_pipeline FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Plans table não tem RLS (dados públicos)
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active plans" ON plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage plans" ON plans FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_briefings_updated_at BEFORE UPDATE ON briefings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_site_status_updated_at BEFORE UPDATE ON site_status FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON support_tickets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_production_pipeline_updated_at BEFORE UPDATE ON production_pipeline FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA (desenvolvimento/teste)
-- ============================================================================

-- Plano padrão
INSERT INTO plans (id, name, price_monthly, description, is_active) VALUES
(uuid_generate_v4(), 'Site Profissional DecolaWeb', 99.90, 'Site completo + hospedagem + domínio + e-mails + suporte', true);

-- Nota: Para criar usuários de teste, use o Supabase Auth UI ou API
-- Os perfis serão criados automaticamente via trigger ou manualmente após signup

