# 🔧 Aplicar Migration: Soft Delete

## 📋 O QUE FAZER

Aplicar a migration que adiciona o campo `deleted_at` na tabela `profiles` para permitir soft delete.

---

## 🚀 PASSO A PASSO

### **Passo 1: Acesse o SQL Editor**

```
https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
```

### **Passo 2: Execute a Migration**

Copie e cole o conteúdo do arquivo:
```
supabase/migrations/004_add_soft_delete_profiles.sql
```

Ou cole diretamente:

```sql
-- Adicionar coluna deleted_at
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Criar índice para melhor performance nas queries
CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON profiles(deleted_at) WHERE deleted_at IS NULL;

-- Comentário
COMMENT ON COLUMN profiles.deleted_at IS 'Data de exclusão (soft delete). NULL = ativo, preenchido = excluído';
```

### **Passo 3: Clique em "RUN"** ▶️

### **Passo 4: Verificar**

Execute para confirmar:

```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND column_name = 'deleted_at';
```

Deve retornar a coluna `deleted_at` do tipo `timestamp with time zone`.

---

## ✅ PRONTO!

Após aplicar a migration, a funcionalidade de exclusão estará disponível!

---

## 🧪 TESTAR

1. Acesse: `http://localhost:5177/admin/clientes`
2. Clique no ícone de lixeira (🗑️) em qualquer cliente
3. Confirme a exclusão no modal
4. O cliente deve desaparecer da lista
5. O cliente não conseguirá mais fazer login

---

**Tempo estimado: 1 minuto** ⚡

