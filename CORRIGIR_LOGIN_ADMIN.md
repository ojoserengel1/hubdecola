# 🔧 Correção do Login Admin

## 🎯 PROBLEMA

Erro ao fazer login com `admin@gmail.com`:
```
Perfil não encontrado. Entre em contato com o suporte.
```

## ✅ CORREÇÕES APLICADAS

### 1. **Middleware de Autenticação Melhorado**
- ✅ Logs detalhados adicionados
- ✅ Fallback melhorado para buscar perfil
- ✅ Tratamento de erro mais robusto

### 2. **Frontend (authStore) Melhorado**
- ✅ Melhor tratamento de erro na busca do perfil
- ✅ Fallback mais inteligente

---

## 🔍 COMO TESTAR

### **Passo 1: Verificar Backend**

1. **Abra o terminal do backend** e verifique se está rodando:
   ```bash
   # Deve mostrar logs do servidor
   ```

2. **Faça login** com:
   - Email: `admin@gmail.com`
   - Senha: (sua senha)

3. **Observe os logs no terminal do backend:**
   ```
   ✅ Token válido, user ID: 567573e0-f15e-487a-abb1-562327bb0093 Email: admin@gmail.com
   ✅ Usuário autenticado: { id: '...', email: '...', role: 'admin' }
   ```

4. **Se aparecer erro, copie os logs completos** e me envie.

---

### **Passo 2: Verificar Console do Navegador**

1. **Abra o DevTools** (F12)
2. **Vá para a aba Console**
3. **Faça login** novamente
4. **Procure por logs:**
   ```
   🔍 Session: {...}
   ✅ Sessão encontrada, buscando perfil...
   🌐 Tentando buscar perfil via API: http://localhost:3001/api/auth/me
   📡 Resposta da API: { status: 200, ok: true }
   ✅ Perfil encontrado via API: {...}
   ```

5. **Se aparecer erro, copie os logs completos** e me envie.

---

## 🐛 POSSÍVEIS PROBLEMAS

### **Problema 1: Backend não está rodando**
**Sintoma:** Erro de conexão no console
**Solução:**
```bash
cd apps/api
npm run dev
```

### **Problema 2: Token inválido**
**Sintoma:** "Token inválido ou expirado" nos logs
**Solução:** 
- Limpe o localStorage do navegador
- Faça login novamente

### **Problema 3: Perfil não encontrado no banco**
**Sintoma:** "Perfil do usuário não encontrado" nos logs
**Solução:** Verificar se o perfil existe no Supabase

### **Problema 4: RLS bloqueando**
**Sintoma:** Erro ao buscar perfil direto do Supabase
**Solução:** O backend usa `service_role`, então não deve ter problema de RLS

---

## 📋 CHECKLIST DE DEBUG

- [ ] Backend está rodando na porta 3001
- [ ] Frontend está rodando na porta 5177
- [ ] Console do navegador mostra logs
- [ ] Terminal do backend mostra logs
- [ ] Token está sendo enviado corretamente
- [ ] Perfil existe no banco de dados

---

## 🔧 PRÓXIMOS PASSOS

1. **Faça login** com `admin@gmail.com`
2. **Copie TODOS os logs** do console do navegador
3. **Copie TODOS os logs** do terminal do backend
4. **Me envie os logs** para eu analisar

---

## 📊 LOGS ESPERADOS (SUCESSO)

### **Backend:**
```
✅ Token válido, user ID: 567573e0-f15e-487a-abb1-562327bb0093 Email: admin@gmail.com
✅ Usuário autenticado: { id: '567573e0...', email: 'admin@gmail.com', role: 'admin' }
GET /api/auth/me 200
```

### **Frontend (Console):**
```
🔍 Session: { access_token: '...', user: {...} }
✅ Sessão encontrada, buscando perfil...
🌐 Tentando buscar perfil via API: http://localhost:3001/api/auth/me
📡 Resposta da API: { status: 200, ok: true }
✅ Perfil encontrado via API: { success: true, data: {...} }
```

---

**Se os logs não corresponderem, me envie os logs reais!** 🔍

