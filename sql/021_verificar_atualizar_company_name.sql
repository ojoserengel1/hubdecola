-- Script para verificar e atualizar o company_name do cliente
-- Execute este script no SQL Editor do Supabase

-- Verificar o perfil do cliente pelo user_id do ticket
SELECT 
    id,
    name,
    company_name,
    email,
    created_at
FROM profiles
WHERE id = 'ac857376-8336-4cb1-8acb-69d576996831';

-- Se o company_name estiver NULL ou vazio, atualizar para "Rengel Advocacia"
UPDATE profiles
SET company_name = 'Rengel Advocacia'
WHERE id = 'ac857376-8336-4cb1-8acb-69d576996831'
  AND (company_name IS NULL OR company_name = '');

-- Verificar novamente após a atualização
SELECT 
    id,
    name,
    company_name,
    email
FROM profiles
WHERE id = 'ac857376-8336-4cb1-8acb-69d576996831';


