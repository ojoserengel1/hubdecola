# 🔑 Como Obter a Service Role Key do Supabase

## Passo a Passo

1. **Acesse o Dashboard do Supabase**
   - URL: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/settings/api

2. **Faça Login** (se necessário)
   - Use suas credenciais do Supabase

3. **Localize a Seção "Project API keys"**
   - Role a página até encontrar as chaves de API

4. **Copie a `service_role` key**
   - ⚠️ **ATENÇÃO**: Esta é uma chave **SECRETA**!
   - Nunca compartilhe ou exponha no frontend
   - Use APENAS no backend

5. **Cole a Chave no Arquivo `.env` do Backend**
   - Abra o arquivo: `apps/api/.env`
   - Substitua `SUBSTITUA_PELA_SERVICE_ROLE_KEY_DO_DASHBOARD` pela chave copiada
   - Salve o arquivo

## Exemplo

Seu arquivo `apps/api/.env` deve ficar assim:

```env
SUPABASE_URL=https://kwickmcktmgehyclgsha.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3aWNrbWNrdG1nZWh5Y2xnc2hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcwMDAwMDAwMCwiZXhwIjoyMDAwMDAwMDAwfQ.EXEMPLO_SUBSTITUA_PELA_CHAVE_REAL
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

## ✅ Após Configurar

Execute o comando para testar:

```bash
npm run dev
```

Se tudo estiver correto, você verá:
- ✅ Backend rodando em http://localhost:3001
- ✅ Frontend rodando em http://localhost:5173
- ✅ Conexão com Supabase estabelecida

## 🔒 Segurança

- ✅ Os arquivos `.env` estão no `.gitignore`
- ✅ Nunca faça commit das chaves
- ✅ A `service_role_key` só deve ser usada no backend

---

**Status da Conexão:**
- ✅ GitHub: Conectado
- ✅ Supabase URL: Configurada
- ✅ Anon Key (frontend): Configurada
- ⚠️ Service Key (backend): Precisa ser obtida manualmente

