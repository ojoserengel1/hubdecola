-- Script para verificar se o ticket existe no banco de dados
-- Execute este script no SQL Editor do Supabase

-- Verificar se o ticket existe
SELECT 
    id,
    user_id,
    subject,
    description,
    status,
    priority,
    created_at,
    updated_at,
    attachment_url
FROM support_tickets
WHERE id = '75815f93-6a51-4ed7-a58c-1160f09e8f5c';

-- Verificar se há tickets no total
SELECT COUNT(*) as total_tickets FROM support_tickets;

-- Listar todos os tickets (últimos 10)
SELECT 
    id,
    user_id,
    subject,
    status,
    priority,
    created_at
FROM support_tickets
ORDER BY created_at DESC
LIMIT 10;


