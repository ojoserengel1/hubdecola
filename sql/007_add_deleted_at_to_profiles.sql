-- ============================================================================
-- Migration: Adicionar coluna deleted_at à tabela profiles
-- Data: 2025-12-05
-- Descrição: Adiciona a coluna 'deleted_at' para implementar soft delete
-- ============================================================================

-- Adicionar a coluna deleted_at à tabela profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

-- Criar um índice na coluna deleted_at para otimizar consultas
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);

-- Adicionar comentário para documentação
COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp quando o perfil foi logicamente excluído (soft delete).';

-- ============================================================================
-- Verificar a alteração
-- ============================================================================
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
AND column_name = 'deleted_at';

