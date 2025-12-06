# 🔍 Diagnóstico: Erro de Login Admin

## ⚠️ PROBLEMA

Erro: "Perfil não encontrado. Entre em contato com o suporte."

---

## 🔧 VERIFICAÇÕES

### 1. **Backend está rodando?**

Abra o terminal e verifique se o backend está rodando:

```bash
# Deve estar rodando em http://localhost:3001
curl http://localhost:3001/health
```

**Deve retornar:**
```json
{
  "success": true,
  "message": "DecolaWeb API está funcionando! 🚀"
}
```

**Se não retornar:** O backend não está rodando. Execute:
```bash
cd /Users/joserengel/Documents/decolaweb-hub/hubdecola
npm run dev
```

---

### 2. **Verificar Console do Navegador**

1. Abra o navegador
2. Pressione **F12** (ou Cmd+Option+I no Mac)
3. Vá na aba **Console**
4. Tente fazer login novamente
5. Veja os logs que aparecem

**Procure por:**
- `🔍 Session:` - Deve mostrar a sessão
- `🌐 Tentando buscar perfil via API:` - Deve mostrar a URL
- `📡 Resposta da API:` - Deve mostrar status 200
- `✅ Perfil encontrado via API:` - Deve mostrar os dados

**Se aparecer erro:**
- `❌ API retornou erro:` - Veja qual é o erro
- `❌ Erro ao buscar via API:` - Veja qual é o erro

---

### 3. **Verificar Console do Backend**

No terminal onde o backend está rodando, procure por:

**Se aparecer:**
- `❌ Erro ao buscar perfil no middleware:` - Veja os detalhes
- `❌ Perfil não encontrado:` - Veja o userId e email

---

### 4. **Verificar Variável de Ambiente**

Verifique se `VITE_API_URL` está configurada:

```bash
# No arquivo apps/web/.env deve ter:
VITE_API_URL=http://localhost:3001/api
```

---

## 🛠️ SOLUÇÕES COMUNS

### **Solução 1: Backend não está rodando**

```bash
cd /Users/joserengel/Documents/decolaweb-hub/hubdecola
npm run dev
```

Aguarde ver:
```
🚀 DecolaWeb API iniciada!
📍 Servidor rodando em: http://localhost:3001
```

---

### **Solução 2: CORS bloqueando**

Se aparecer erro de CORS no console, verifique se o backend permite `localhost:5177`:

Arquivo: `apps/api/src/index.ts`

Deve ter:
```typescript
origin: (origin, callback) => {
  if (origin && origin.match(/^http:\/\/localhost:\d+$/)) {
    return callback(null, true);
  }
  // ...
}
```

---

### **Solução 3: Token inválido**

Se o token estiver inválido, tente:

1. Fazer logout (se conseguir)
2. Limpar cookies/localStorage
3. Fazer login novamente

---

### **Solução 4: Perfil realmente não existe**

Execute no SQL Editor do Supabase:

```sql
-- Verificar se perfil admin existe
SELECT id, role, name, company_name
FROM profiles
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'admin@gmail.com'
);
```

**Se não retornar nada:** O perfil não existe. Crie:

```sql
-- Criar perfil admin (substitua o ID pelo ID do usuário auth)
INSERT INTO profiles (id, role, name, company_name)
SELECT 
  id,
  'admin',
  'Admin',
  'DecolaWeb'
FROM auth.users
WHERE email = 'admin@gmail.com'
ON CONFLICT (id) DO NOTHING;
```

---

## 📋 CHECKLIST

- [ ] Backend rodando em `http://localhost:3001`
- [ ] Health check retorna sucesso
- [ ] Console do navegador mostra logs
- [ ] Console do backend mostra logs
- [ ] `VITE_API_URL` configurada corretamente
- [ ] Perfil admin existe no banco
- [ ] Token de autenticação válido

---

## 🆘 AINDA COM PROBLEMA?

**Envie:**
1. Screenshot do console do navegador (F12)
2. Logs do terminal do backend
3. Resultado do `curl http://localhost:3001/health`

---

**Tempo estimado: 5 minutos** ⚡

