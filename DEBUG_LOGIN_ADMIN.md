# 🔍 Debug do Login Admin

## ✅ CORREÇÕES APLICADAS

### 1. **Middleware Melhorado**
- ✅ Busca apenas campos essenciais primeiro (`id, role, name, company_name, created_at`)
- ✅ Fallback para buscar tudo se falhar
- ✅ Verificação de `deleted_at` mais segura (não quebra se coluna não existir)
- ✅ Logs detalhados em cada etapa

---

## 🧪 COMO TESTAR

### **Passo 1: Verificar Backend**

1. **Certifique-se de que o backend está rodando:**
   ```bash
   cd apps/api
   npm run dev
   ```

2. **Você deve ver:**
   ```
   🚀 DecolaWeb API iniciada!
   📍 Servidor rodando em: http://localhost:3001
   ```

### **Passo 2: Fazer Login**

1. **Abra o navegador:** `http://localhost:5177/login`
2. **Abra o DevTools** (F12) → Aba **Console**
3. **Faça login com:**
   - Email: `admin@gmail.com`
   - Senha: (sua senha)

### **Passo 3: Verificar Logs**

#### **No Console do Navegador, você deve ver:**
```
🔐 Iniciando login para: admin@gmail.com
✅ Login bem-sucedido: {...}
🔄 Verificando autenticação...
🔍 Session: {...}
✅ Sessão encontrada, buscando perfil...
🌐 Tentando buscar perfil via API: http://localhost:3001/api/auth/me
📡 Resposta da API: { status: 200, ok: true }
✅ Perfil encontrado via API: { success: true, data: {...} }
👤 Perfil encontrado no estado: {...}
✅ Perfil encontrado, redirecionando...
```

#### **No Terminal do Backend, você deve ver:**
```
✅ Token válido, user ID: 567573e0-f15e-487a-abb1-562327bb0093 Email: admin@gmail.com
✅ Usuário autenticado: { id: '567573e0...', email: 'admin@gmail.com', role: 'admin' }
GET /api/auth/me 200
```

---

## 🐛 SE AINDA DER ERRO

### **Cenário 1: "Token inválido ou expirado"**

**Sintoma:** Backend retorna 401
**Solução:**
1. Limpe o localStorage do navegador
2. Recarregue a página
3. Faça login novamente

### **Cenário 2: "Perfil não encontrado" no Backend**

**Sintoma:** Backend retorna 401 com "Perfil do usuário não encontrado"
**Logs esperados:**
```
❌ Erro ao buscar perfil no middleware: {...}
⚠️ Tentando buscar perfil completo como fallback...
```

**Solução:**
1. Verifique se o backend está usando a `SUPABASE_SERVICE_KEY` correta
2. Verifique o arquivo `apps/api/.env`
3. Reinicie o backend

### **Cenário 3: "Perfil não encontrado" no Frontend**

**Sintoma:** Frontend mostra erro mas backend retorna 200
**Solução:**
1. Verifique os logs do console
2. Verifique se `VITE_API_URL` está correto no `.env` do frontend
3. Verifique se há erro de CORS

---

## 📋 CHECKLIST DE DEBUG

- [ ] Backend está rodando na porta 3001
- [ ] Frontend está rodando na porta 5177
- [ ] `apps/api/.env` tem `SUPABASE_SERVICE_KEY` correto
- [ ] `apps/web/.env` tem `VITE_API_URL=http://localhost:3001/api`
- [ ] Console do navegador mostra logs
- [ ] Terminal do backend mostra logs
- [ ] Perfil admin existe no Supabase (ID: 567573e0-f15e-487a-abb1-562327bb0093)

---

## 🔧 ARQUIVOS MODIFICADOS

1. **`apps/api/src/middleware/auth.ts`**
   - Busca apenas campos essenciais primeiro
   - Fallback para buscar tudo se falhar
   - Verificação de `deleted_at` mais segura
   - Logs detalhados

---

## 🎯 PRÓXIMOS PASSOS

1. **Faça login** com `admin@gmail.com`
2. **Copie TODOS os logs** do console do navegador
3. **Copie TODOS os logs** do terminal do backend
4. **Me envie os logs** para eu analisar

---

**Teste agora e me envie os logs se ainda der erro!** 🔍

