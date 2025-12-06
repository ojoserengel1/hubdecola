# 🚨 RESOLVER LOGIN DO ADMIN - PASSO A PASSO

## ❌ Problema
O backend travou e precisa ser reiniciado para aplicar as correções.

---

## ✅ SOLUÇÃO COMPLETA

### **PASSO 1: Parar todos os processos**

Abra um terminal e cole:

```bash
cd /Users/joserengel/Documents/decolaweb-hub/hubdecola
pkill -9 -f "node|tsx|vite"
sleep 2
```

### **PASSO 2: Reiniciar o servidor**

No mesmo terminal:

```bash
npm run dev
```

### **PASSO 3: Aguardar o servidor iniciar**

Espere ver estas mensagens no terminal:

```
[0] API rodando na porta 3001
[1] VITE v... ready in ...ms
[1] ➜  Local:   http://localhost:5177/
```

### **PASSO 4: Testar o login**

1. **Abra o navegador:** `http://localhost:5177/login`
2. **Limpe o cache:** Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)
3. **Faça login:**
   - E-mail: `admin@gmail.com`
   - Senha: (sua senha de admin, provavelmente `admin123` ou `Acesso123@`)

### **PASSO 5: Verificar logs (se ainda der erro)**

1. **Abra o DevTools (F12)**
2. **Aba Console** - Procure por:
   - `🔐 [AUTH] Iniciando autenticação`
   - `✅ [AUTH] Token válido`
   - `🔍 [AUTH] Buscando perfil`
   - `✅ [AUTH] Usuário autenticado com sucesso`

3. **Aba Network** - Verifique:
   - Request para `/api/auth/me`
   - Status: deve ser `200 OK`

4. **Se houver erro, me envie:**
   - Print dos logs do Console
   - Print da resposta de `/api/auth/me` (clique na request → aba Response)

---

## 🎯 O QUE FOI CORRIGIDO

✅ **Coluna `deleted_at` criada** na tabela `profiles`  
✅ **Logs detalhados adicionados** no middleware de autenticação  
✅ **Middleware atualizado** para incluir `deleted_at` na query  

Agora o sistema vai mostrar exatamente onde está o problema!

---

## 📋 SE PRECISAR DE SENHAS

### **Admin:**
- E-mail: `admin@gmail.com`
- Senhas possíveis: `admin123`, `Acesso123@`, `Admin123@`
- Role: `admin`

### **Clientes (para testar):**
- E-mail: `cliente@gmail.com`
- Senha: `Acesso123@`
- Role: `client`

---

**Reinicie o servidor e tente novamente!** 🚀

Se ainda der erro, me envie os logs do console (F12).

