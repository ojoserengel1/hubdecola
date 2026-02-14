-- Permitir que a coluna domain seja NULL (para solicitações de novo domínio)
ALTER TABLE domains 
  ALTER COLUMN domain DROP NOT NULL;

-- Adicionar status 'pendente' ao CHECK constraint
ALTER TABLE domains 
  DROP CONSTRAINT IF EXISTS domains_status_check;

ALTER TABLE domains 
  ADD CONSTRAINT domains_status_check 
  CHECK (status IN ('pendente', 'aguardando_dns', 'configurando', 'ativo'));


