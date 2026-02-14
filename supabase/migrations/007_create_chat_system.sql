-- ============================================================================
-- Migration: Criar sistema de chat entre Cliente e Admin
-- Data: 2024-12-06
-- Descrição: Sistema completo de comunicação entre clientes e administradores
-- ============================================================================

-- Tabela de conversas (uma por cliente)
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    admin_unread_count INTEGER DEFAULT 0,
    client_unread_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Tabela de mensagens
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    sender_type TEXT NOT NULL CHECK (sender_type IN ('client', 'admin')),
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user ON chat_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_last_message ON chat_conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created ON chat_messages(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_read ON chat_messages(is_read) WHERE is_read = false;

-- Função para atualizar last_message_at e contadores de não lidas
CREATE OR REPLACE FUNCTION update_chat_conversation_on_message()
RETURNS TRIGGER AS $$
BEGIN
    -- Atualiza last_message_at e contadores
    UPDATE chat_conversations
    SET 
        last_message_at = NEW.created_at,
        updated_at = NOW(),
        admin_unread_count = CASE 
            WHEN NEW.sender_type = 'client' THEN admin_unread_count + 1
            ELSE admin_unread_count
        END,
        client_unread_count = CASE 
            WHEN NEW.sender_type = 'admin' THEN client_unread_count + 1
            ELSE client_unread_count
        END
    WHERE id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar conversa quando nova mensagem é criada
CREATE TRIGGER trigger_update_conversation_on_message
    AFTER INSERT ON chat_messages
    FOR EACH ROW
    EXECUTE FUNCTION update_chat_conversation_on_message();

-- Função para criar conversa automaticamente quando cliente é criado
CREATE OR REPLACE FUNCTION create_chat_conversation_for_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Cria conversa apenas para clientes
    IF NEW.role = 'client' THEN
        INSERT INTO chat_conversations (user_id)
        VALUES (NEW.id)
        ON CONFLICT (user_id) DO NOTHING;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para criar conversa quando cliente é criado
CREATE TRIGGER trigger_create_chat_conversation
    AFTER INSERT ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION create_chat_conversation_for_client();

-- RLS Policies
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Clientes podem ver apenas sua própria conversa
CREATE POLICY "Clients can view own conversation" ON chat_conversations
    FOR SELECT USING (user_id = auth.uid());

-- Admins podem ver todas as conversas
CREATE POLICY "Admins can view all conversations" ON chat_conversations
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Clientes podem ver apenas mensagens de sua conversa
CREATE POLICY "Clients can view own messages" ON chat_messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE user_id = auth.uid()
        )
    );

-- Admins podem ver todas as mensagens
CREATE POLICY "Admins can view all messages" ON chat_messages
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Clientes podem inserir mensagens em sua própria conversa
CREATE POLICY "Clients can insert own messages" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        sender_type = 'client' AND
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE user_id = auth.uid()
        )
    );

-- Admins podem inserir mensagens em qualquer conversa
CREATE POLICY "Admins can insert messages" ON chat_messages
    FOR INSERT WITH CHECK (
        sender_type = 'admin' AND
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Clientes podem atualizar apenas suas próprias mensagens (marcar como lida)
CREATE POLICY "Clients can update own messages" ON chat_messages
    FOR UPDATE USING (
        sender_id = auth.uid() OR
        conversation_id IN (
            SELECT id FROM chat_conversations WHERE user_id = auth.uid()
        )
    );

-- Admins podem atualizar qualquer mensagem
CREATE POLICY "Admins can update all messages" ON chat_messages
    FOR UPDATE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Comentários
COMMENT ON TABLE chat_conversations IS 'Conversas de chat entre clientes e administradores';
COMMENT ON TABLE chat_messages IS 'Mensagens individuais do chat';
COMMENT ON COLUMN chat_conversations.admin_unread_count IS 'Contador de mensagens não lidas pelo admin';
COMMENT ON COLUMN chat_conversations.client_unread_count IS 'Contador de mensagens não lidas pelo cliente';


