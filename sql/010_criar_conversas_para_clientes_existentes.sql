-- ============================================================================
-- Script: Criar Conversas para Clientes Existentes
-- Data: 2024-12-06
-- Descrição: Cria conversas de chat para todos os clientes que ainda não têm
-- ============================================================================
-- 
-- INSTRUÇÕES:
-- 1. Acesse o Supabase Dashboard: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
-- 2. Vá em "SQL Editor" (no menu lateral)
-- 3. Cole este script completo
-- 4. Clique em "Run" para executar
-- ============================================================================

-- Criar conversas para todos os clientes que ainda não têm
INSERT INTO chat_conversations (user_id)
SELECT id 
FROM profiles 
WHERE role = 'client'
AND id NOT IN (SELECT user_id FROM chat_conversations)
ON CONFLICT (user_id) DO NOTHING;

-- Verificar quantas conversas foram criadas
SELECT 
    COUNT(*) as total_conversas,
    COUNT(DISTINCT user_id) as total_clientes_com_conversa
FROM chat_conversations;

-- Listar todas as conversas criadas
SELECT 
    cc.id,
    cc.user_id,
    p.name,
    p.company_name,
    cc.last_message_at,
    cc.admin_unread_count,
    cc.client_unread_count
FROM chat_conversations cc
LEFT JOIN profiles p ON p.id = cc.user_id
ORDER BY cc.last_message_at DESC NULLS LAST, cc.created_at DESC;

-- Mensagem de sucesso
SELECT '✅ Conversas criadas para todos os clientes existentes!' as status;

