-- Script para verificar e criar perfil do admin se necessário
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos verificar se existe um usuário admin no auth.users
-- e se ele tem um perfil na tabela profiles

-- 1. Verificar usuários no auth.users
SELECT 
    id,
    email,
    created_at
FROM auth.users
WHERE email = 'admin@gmail.com';

-- 2. Verificar se existe perfil para o admin
SELECT 
    p.id,
    p.name,
    p.role,
    p.company_name,
    p.created_at
FROM profiles p
INNER JOIN auth.users u ON p.id = u.id
WHERE u.email = 'admin@gmail.com';

-- 3. Se não existir perfil, criar um (substitua o ID pelo ID real do usuário do auth.users)
-- Descomente e ajuste o ID abaixo:
/*
INSERT INTO profiles (id, role, name, company_name, created_at)
SELECT 
    u.id,
    'admin',
    'Admin',
    'DecolaWeb',
    NOW()
FROM auth.users u
WHERE u.email = 'admin@gmail.com'
AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.id = u.id
);
*/


