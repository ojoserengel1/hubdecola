# 🚀 Guia de Deploy - DecolaWeb Hub

## ✅ Checklist Pré-Deploy

### Configuração do Ambiente

- [ ] Conta Supabase criada
- [ ] Projeto Supabase criado e configurado
- [ ] Migrations executadas no banco
- [ ] Variáveis de ambiente configuradas
- [ ] Plano padrão criado no banco
- [ ] Usuários de teste criados

### Build e Testes

- [ ] `npm install` executado sem erros
- [ ] `npm run build` executado com sucesso
- [ ] Frontend testado localmente
- [ ] Backend testado localmente
- [ ] Autenticação funcionando
- [ ] Todas as rotas testadas

## 🌐 Deploy do Frontend (Vercel/Netlify)

### Opção 1: Vercel (Recomendado)

1. **Criar conta** em [vercel.com](https://vercel.com)

2. **Importar repositório**
   - Connect to Git
   - Selecione seu repositório

3. **Configurar build**
   ```
   Framework Preset: Vite
   Root Directory: apps/web
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **Adicionar variáveis de ambiente**
   ```
   VITE_SUPABASE_URL=https://xxx.supabase.co
   VITE_SUPABASE_ANON_KEY=xxx
   VITE_API_URL=https://sua-api.com/api
   ```

5. **Deploy**
   - Clique em Deploy
   - Aguarde o build

6. **Configurar domínio personalizado** (opcional)
   - Settings > Domains
   - Adicione seu domínio

### Opção 2: Netlify

1. **Criar conta** em [netlify.com](https://netlify.com)

2. **Importar repositório**
   - New site from Git
   - Conecte seu repositório

3. **Configurar build**
   ```
   Base directory: apps/web
   Build command: npm run build
   Publish directory: apps/web/dist
   ```

4. **Adicionar variáveis de ambiente**
   - Site settings > Environment variables
   - Adicione as mesmas variáveis da Vercel

5. **Deploy**

## 🖥️ Deploy do Backend

### Opção 1: Railway (Recomendado)

1. **Criar conta** em [railway.app](https://railway.app)

2. **Criar novo projeto**
   - New Project > Deploy from GitHub

3. **Configurar variáveis de ambiente**
   ```
   SUPABASE_URL=https://xxx.supabase.co
   SUPABASE_SERVICE_KEY=xxx
   PORT=3001
   NODE_ENV=production
   FRONTEND_URL=https://seu-frontend.vercel.app
   ```

4. **Configurar build**
   - Root Directory: `apps/api`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`

5. **Deploy**

### Opção 2: Render

1. **Criar conta** em [render.com](https://render.com)

2. **Novo Web Service**
   - New > Web Service
   - Conecte seu repositório

3. **Configurar**
   ```
   Name: decolaweb-api
   Environment: Node
   Root Directory: apps/api
   Build Command: npm install && npm run build
   Start Command: npm start
   ```

4. **Adicionar variáveis de ambiente**

5. **Deploy**

### Opção 3: Heroku

1. **Criar conta** em [heroku.com](https://heroku.com)

2. **Instalar Heroku CLI**
   ```bash
   npm install -g heroku
   ```

3. **Login**
   ```bash
   heroku login
   ```

4. **Criar app**
   ```bash
   heroku create decolaweb-api
   ```

5. **Configurar buildpack**
   ```bash
   heroku buildpacks:set heroku/nodejs
   ```

6. **Adicionar variáveis**
   ```bash
   heroku config:set SUPABASE_URL=xxx
   heroku config:set SUPABASE_SERVICE_KEY=xxx
   heroku config:set NODE_ENV=production
   heroku config:set FRONTEND_URL=xxx
   ```

7. **Deploy**
   ```bash
   git push heroku main
   ```

## 🗄️ Configuração do Supabase (Produção)

### 1. Verificar RLS

- Vá em Database > Policies
- Certifique-se de que todas as tabelas têm RLS habilitado
- Verifique se as policies estão corretas

### 2. Configurar Auth

- Authentication > Providers
- Configure email confirmations (recomendado para produção)
- Configure redirect URLs:
  - `https://seu-dominio.com/auth/callback`

### 3. Configurar CORS

- Settings > API
- Allowed CORS origins:
  - Adicione: `https://seu-frontend.vercel.app`
  - Adicione: `https://seu-dominio.com`

### 4. Configurar Webhooks (Futuro)

Para Stripe:
- Settings > Webhooks
- Adicione: `https://sua-api.com/api/webhooks/stripe`

## 🔐 Segurança

### Variáveis de Ambiente

⚠️ **NUNCA exponha**:
- `SUPABASE_SERVICE_KEY`
- `STRIPE_SECRET_KEY`

✅ **Pode ser exposta** (frontend):
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_API_URL`

### Configurações Adicionais

1. **Rate Limiting**
   - Configure rate limiting no backend
   - Use serviços como Cloudflare

2. **HTTPS**
   - Certifique-se de que tudo está em HTTPS
   - Redirecione HTTP para HTTPS

3. **CORS**
   - Configure CORS no backend apenas para domínios permitidos

## 📊 Monitoramento

### Logs

**Frontend (Vercel/Netlify)**:
- Acesse o dashboard
- Vá em Deployments > Logs

**Backend (Railway/Render)**:
- Acesse o dashboard
- Vá em Logs

**Supabase**:
- Dashboard > Logs

### Alertas

Configure alertas para:
- Erros 500
- Uso de recursos
- Downtime

## 🔄 CI/CD

### GitHub Actions (Opcional)

Crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Run tests
        run: npm test
        
      - name: Build
        run: npm run build
        
      # Deploy steps aqui
```

## 📈 Performance

### Frontend

1. **Otimizar imagens**
   - Use formatos modernos (WebP)
   - Lazy loading

2. **Code splitting**
   - Já configurado com Vite

3. **Caching**
   - Configure headers de cache

### Backend

1. **Caching**
   - Use Redis para cache de sessões
   - Cache de queries frequentes

2. **Database**
   - Indexes já configurados nas migrations
   - Monitore queries lentas

## 🧪 Testes em Produção

1. **Smoke tests**
   - [ ] Login funciona
   - [ ] Dashboard carrega
   - [ ] API responde
   - [ ] Banco conectado

2. **Criar usuário de teste**
   - Crie um cliente de teste
   - Teste todo o fluxo

3. **Monitorar erros**
   - Use Sentry ou similar
   - Configure alertas

## 📞 Pós-Deploy

### Checklist Final

- [ ] Frontend acessível
- [ ] Backend respondendo
- [ ] Login funcionando
- [ ] Todas as páginas carregam
- [ ] Dados salvando corretamente
- [ ] E-mails sendo enviados (se configurado)
- [ ] Webhooks configurados (se necessário)
- [ ] Monitoramento ativo
- [ ] Backup automático configurado
- [ ] Documentação atualizada

### Configurações Opcionais

1. **Analytics**
   - Google Analytics
   - Posthog
   - Mixpanel

2. **Error Tracking**
   - Sentry
   - Bugsnag
   - Rollbar

3. **Uptime Monitoring**
   - UptimeRobot
   - Pingdom
   - StatusCake

## 🆘 Troubleshooting

### Frontend não carrega
- Verifique build logs
- Verifique variáveis de ambiente
- Verifique CORS

### Backend não responde
- Verifique logs do servidor
- Verifique variáveis de ambiente
- Verifique conexão com Supabase

### Erro de autenticação
- Verifique chaves do Supabase
- Verifique redirect URLs
- Verifique RLS policies

### Queries lentas
- Verifique indexes
- Otimize queries
- Use explain analyze no Supabase

## 📚 Recursos Úteis

- [Documentação Supabase](https://supabase.com/docs)
- [Documentação Vercel](https://vercel.com/docs)
- [Documentação Railway](https://docs.railway.app)
- [Documentação Vite](https://vitejs.dev)

---

**Boa sorte com o deploy! 🚀**

