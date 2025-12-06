-- ============================================================================
-- Migration: Adicionar soft delete para profiles
-- Data: 2024-12-05
-- Descrição: Adiciona campo deleted_at para soft delete (não excluir do banco)
-- ============================================================================

-- Adicionar coluna deleted_at
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Criar índice para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- Comentário
COMMENT ON COLUMN profiles.deleted_at IS 'Data de exclusão (soft delete). NULL = ativo, preenchido = excluído';

