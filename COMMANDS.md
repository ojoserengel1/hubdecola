# 📝 Comandos Úteis - DecolaWeb Hub

## 🚀 Comandos de Desenvolvimento

### Iniciar Projeto
```bash
# Instalar todas as dependências
npm install

# Rodar frontend + backend simultaneamente
npm run dev

# Rodar apenas frontend (porta 5173)
npm run dev:web

# Rodar apenas backend (porta 3001)
npm run dev:api
```

### Build para Produção
```bash
# Build completo
npm run build

# Build apenas frontend
npm run build:web

# Build apenas backend
npm run build:api
```

### Limpeza
```bash
# Remover todas as node_modules
npm run clean

# Reinstalar tudo do zero
npm run clean && npm install
```

## 🔍 Verificações

### Verificar se o backend está funcionando
```bash
curl http://localhost:3001/health
```

Resposta esperada:
```json
{
  "success": true,
  "message": "DecolaWeb API está funcionando! 🚀"
}
```

### Verificar se o frontend está rodando
Abra no navegador:
```
http://localhost:5173
```

## 📦 Gerenciamento de Pacotes

### Adicionar dependência ao frontend
```bash
npm install <pacote> --workspace=@decolaweb/web
```

### Adicionar dependência ao backend
```bash
npm install <pacote> --workspace=@decolaweb/api
```

### Adicionar dependência ao shared
```bash
npm install <pacote> --workspace=@decolaweb/shared
```

### Adicionar dependência global (root)
```bash
npm install <pacote> -w
```

## 🗄️ Comandos Supabase

### Conectar ao projeto
```bash
npx supabase link --project-ref seu-project-ref
```

### Gerar tipos TypeScript
```bash
npx supabase gen types typescript --project-id seu-project-id > apps/web/src/types/supabase.ts
```

### Criar nova migration
```bash
npx supabase migration new nome_da_migration
```

### Aplicar migrations localmente (se usar Supabase CLI local)
```bash
npx supabase db reset
```

## 🧪 Testes

### Testar rotas da API com curl

#### Health Check
```bash
curl http://localhost:3001/health
```

#### Login (exemplo - precisa configurar primeiro)
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@decolaweb.com", "password": "admin123"}'
```

#### Dashboard (com token)
```bash
curl http://localhost:3001/api/dashboard \
  -H "Authorization: Bearer SEU_TOKEN_AQUI"
```

## 🔐 Gerar Chaves

### Gerar chave aleatória (para secrets)
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 📊 Logs

### Ver logs do backend
Os logs aparecem automaticamente no terminal onde você rodou `npm run dev:api`

### Ver logs do frontend
Abra o Console do navegador (F12 > Console)

### Ver logs do Supabase
Acesse o Dashboard > Logs no Supabase

## 🔄 Git

### Commits semânticos recomendados
```bash
git commit -m "feat: adiciona nova funcionalidade"
git commit -m "fix: corrige bug no login"
git commit -m "docs: atualiza README"
git commit -m "style: ajusta espaçamento"
git commit -m "refactor: melhora estrutura do código"
git commit -m "chore: atualiza dependências"
```

## 🐛 Debug

### Debug do backend (VS Code)
Adicione em `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug API",
  "skipFiles": ["<node_internals>/**"],
  "program": "${workspaceFolder}/apps/api/src/index.ts",
  "preLaunchTask": "tsc: build - apps/api/tsconfig.json",
  "outFiles": ["${workspaceFolder}/apps/api/dist/**/*.js"]
}
```

### Debug do frontend
Use as React DevTools no navegador

## 📱 Testes em Dispositivos Móveis

### Acessar de outro dispositivo na mesma rede
```bash
# Descubra seu IP local
# Mac/Linux:
ifconfig | grep "inet "

# Windows:
ipconfig
```

Depois acesse no dispositivo móvel:
```
http://SEU_IP:5173
```

## 🔧 Manutenção

### Atualizar dependências
```bash
# Ver dependências desatualizadas
npm outdated

# Atualizar todas (cuidado!)
npm update

# Atualizar uma específica
npm install <pacote>@latest
```

### Verificar vulnerabilidades
```bash
npm audit

# Corrigir automaticamente
npm audit fix
```

## 📈 Performance

### Analisar bundle do frontend
```bash
cd apps/web
npm run build
npx vite-bundle-visualizer
```

## 🎯 Atalhos Úteis

### Abrir todos no VS Code
```bash
code .
```

### Abrir apenas frontend
```bash
code apps/web
```

### Abrir apenas backend
```bash
code apps/api
```

---

**Dica**: Adicione estes comandos aos seus favoritos ou crie aliases no seu terminal! 🚀

