# 🔧 Corrigir Login do Admin

## 🎯 PROBLEMA

❌ **Erro ao logar:** `admin@gmail.com`  
❌ **Mensagem:** "Perfil não encontrado. Entre em contato com o supabase."

---

## 🔍 DIAGNÓSTICO

### **Admin existe:**
- ✅ Usuário no `auth.users`: ID `567573e0-f15e-487a-abb1-562327bb0093`
- ✅ Perfil na tabela `profiles`: role `admin`
- ✅ Backend está rodando (porta 3001)

### **Problema identificado:**
❌ **Coluna `deleted_at` não existe** na tabela `profiles`  
❌ O middleware está tentando buscar essa coluna  
❌ Mas a migration `004_add_soft_delete_profiles.sql` não foi aplicada

---

## ✅ SOLUÇÃO

### **PASSO 1: Aplicar Migration SQL**

1. **Abra o Supabase:**
   ```
   https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
   ```

2. **Cole este SQL:**
   ```sql
   -- Adicionar coluna deleted_at à tabela profiles
   ALTER TABLE public.profiles
   ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ DEFAULT NULL;

   -- Criar índice para otimizar consultas
   CREATE INDEX IF NOT EXISTS idx_profiles_deleted_at ON public.profiles(deleted_at);

   -- Adicionar comentário
   COMMENT ON COLUMN public.profiles.deleted_at IS 'Timestamp quando o perfil foi logicamente excluído (soft delete).';
   ```

3. **Clique em "Run"**

4. **Verifique o resultado:**
   ```sql
   SELECT 
     column_name, 
     data_type, 
     is_nullable,
     column_default
   FROM information_schema.columns 
   WHERE table_name = 'profiles' 
   AND table_schema = 'public'
   AND column_name = 'deleted_at';
   ```

   ✅ Deve retornar:
   ```
   column_name: deleted_at
   data_type: timestamp with time zone
   is_nullable: YES
   column_default: NULL
   ```

---

### **PASSO 2: Recarregar a Página de Login**

1. **Abra:** `http://localhost:5177/login`
2. **Limpe o cache** (Cmd+Shift+R ou Ctrl+Shift+R)
3. **Faça login:**
   - E-mail: `admin@gmail.com`
   - Senha: `admin123` (ou a senha que você configurou)

---

## 📋 CHECKLIST

- [ ] Apliquei a migration SQL no Supabase
- [ ] Verifiquei que a coluna `deleted_at` foi criada
- [ ] Recarreguei a página de login
- [ ] Consegui fazer login com `admin@gmail.com`
- [ ] Fui redirecionado para `/admin/clientes`

---

## 🔍 SE AINDA DER ERRO

### **Abra o DevTools (F12) e veja os logs:**

1. **Console:**
   - Procure por: `✅ Token válido`
   - Procure por: `✅ Perfil encontrado via API`

2. **Network:**
   - Verifique se `/api/auth/me` retorna 200 OK

3. **Me envie:**
   - Print dos logs do Console
   - Print da resposta de `/api/auth/me` na aba Network

---

## 📂 ARQUIVO CRIADO

- `sql/007_add_deleted_at_to_profiles.sql` - Script SQL para aplicar

---

**Aplique a migration e tente logar novamente!** 🚀

