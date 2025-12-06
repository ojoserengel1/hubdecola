# 🔄 Reiniciar Servidor

## Backend parou! Precisa reiniciar:

### **No terminal do projeto, rode:**

```bash
cd /Users/joserengel/Documents/decolaweb-hub/hubdecola
npm run dev
```

### **Ou se já estiver no diretório:**

```bash
npm run dev
```

---

## ✅ Quando o servidor reiniciar:

1. **Aguarde ver no terminal:**
   ```
   [0] API rodando na porta 3001
   [1] VITE v... ready in ...ms
   ```

2. **Recarregue a página de login:**
   - URL: `http://localhost:5177/login`
   - Limpe o cache: Cmd+Shift+R (Mac) ou Ctrl+Shift+R (Windows)

3. **Faça login com:**
   - E-mail: `admin@gmail.com`
   - Senha: (sua senha de admin)

4. **Abra o DevTools (F12) e verifique o Console**
   - Procure por logs que começam com `🔐 [AUTH]`
   - Procure por `✅ [AUTH] Usuário autenticado com sucesso`

---

## 📋 O que foi feito:

✅ Coluna `deleted_at` criada no banco  
✅ Logs detalhados adicionados no middleware  
✅ Backend configurado para mostrar cada passo da autenticação  

Agora os logs vão mostrar exatamente onde está falhando! 🚀

