# 🔍 Diagnóstico: Erro 401 (Unauthorized)

## ❌ Problemas Identificados

### 1. Erro 500 do Supabase (Query Direta)
```
kwickmcktmgehyclgsha.supabase.co/rest/v1/profiles: 500 Internal Server Error
```

**Causa Provável:**
- A `service_role_key` configurada (`sb_publishable_yuuij6chB3wMIkAQ9u9Nvg_10T9GZHO`) é uma **publishable key**, NÃO uma service_role_key!
- Publishable keys têm permissões limitadas
- Service role key é diferente e tem formato diferente

### 2. Erro 401 da API (Unauthorized)
```
http://localhost:3001/api/auth/me: 401 Unauthorized
```

**Causa:**
- Backend não conseguiu validar o token
- Provavelmente porque a key está incorreta no backend também

---

## 🔑 Diferença entre as Chaves

### Publishable Key (o que está configurado ERRADO):
```
sb_publishable_yuuij6chB3wMIkAQ9u9Nvg_10T9GZHO
```
- Formato: `sb_publishable_*`
- Uso: Pode ser exposta no frontend
- Permissões: Limitadas, respeita RLS

### Service Role Key (o que DEVERIA estar):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmF...
```
- Formato: JWT longo (começa com `eyJ`)
- Uso: APENAS no backend (NUNCA expor)
- Permissões: FULL ACCESS, bypassa RLS

### Anon Key (correto no frontend):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmF...
```
- Formato: JWT longo
- Uso: Frontend
- Permissões: Básicas, respeita RLS

---

## ✅ Solução

### Passo 1: Obter a Service Role Key CORRETA

1. Acesse: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/settings/api

2. Na seção **Project API keys**, encontre:
   ```
   service_role
   Secret
   This key has the ability to bypass Row Level Security. Never share it publicly.
   ```

3. Clique em **Reveal** e copie a chave completa (deve ser um JWT longo começando com `eyJ`)

### Passo 2: Atualizar o Backend

#### Opção 1 - Usar o script:
```bash
./configure-service-key.sh
```

#### Opção 2 - Manualmente:

1. Abra: `apps/api/.env`

2. Substitua:
   ```env
   SUPABASE_SERVICE_KEY=sb_publishable_yuuij6chB3wMIkAQ9u9Nvg_10T9GZHO
   ```

   Por:
   ```env
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt3aWNrbWNrdG1nZWh5Y2xnc2hhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NDg1NTAyNSwiZXhwIjoyMDgwNDMxMDI1fQ.SUA_CHAVE_VERDADEIRA_AQUI
   ```

3. Salve o arquivo

### Passo 3: Atualizar o package.json (para não esquecer)

**Arquivo**: `apps/api/package.json`

Na linha do script `dev`, também substitua a key:
```json
"dev": "SUPABASE_URL=... SUPABASE_SERVICE_KEY=SUA_CHAVE_AQUI ..."
```

### Passo 4: Reiniciar o Backend

O `tsx watch` vai detectar a mudança e reiniciar automaticamente.

Se não, pare (`Ctrl+C`) e rode:
```bash
npm run dev
```

---

## 🧪 Como Verificar se Funcionou

### 1. Verificar os Logs do Backend

Deve aparecer:
```
✅ Variáveis de ambiente configuradas com sucesso!
🚀 DecolaWeb API iniciada!
```

Se aparecer erro tipo "SUPABASE_SERVICE_KEY faltando", a chave está errada.

### 2. Testar via CURL

```bash
# Primeiro, faça login no browser e copie o token
# Ou use um token de teste

curl -H "Authorization: Bearer SEU_TOKEN" \
     http://localhost:3001/api/auth/me
```

**Resposta esperada:**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "role": "admin",
    "name": "José Rengel",
    ...
  }
}
```

### 3. Fazer Login no Browser

1. Acesse: http://localhost:5176 (nova porta!)
2. Faça login
3. Observe o console

**Logs esperados (COM service_role_key correta):**
```
✅ Sessão encontrada, buscando perfil...
❌ Perfil não encontrado via query direta (normal)
✅ Perfil encontrado via API!
→ Redireciona para /admin/clientes
```

---

## 📊 Comparação das Chaves

| Tipo | Formato | Onde Usar | Permissões | RLS |
|------|---------|-----------|------------|-----|
| **anon** | JWT longo | Frontend | Básicas | ✅ Respeita |
| **publishable** | `sb_publishable_*` | Frontend/Backend limitado | Médias | ✅ Respeita |
| **service_role** | JWT longo | ⚠️ APENAS Backend | FULL | ❌ Bypassa |

---

## ⚠️ O Que Estava Errado

No arquivo `apps/api/package.json`, linha 6:

**ERRADO (atual):**
```json
"dev": "... SUPABASE_SERVICE_KEY=sb_publishable_yuuij6chB3wMIkAQ9u9Nvg_10T9GZHO ..."
```

**CORRETO (deve ser):**
```json
"dev": "... SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... ..."
```

A chave `sb_publishable_*` NÃO é a service_role_key! É uma publishable key com permissões limitadas.

---

## 🔐 Segurança

### ✅ Configuração Correta:

| Arquivo | Variável | Tipo de Chave |
|---------|----------|---------------|
| `apps/web/.env` | `VITE_SUPABASE_ANON_KEY` | ✅ anon (JWT) |
| `apps/api/.env` | `SUPABASE_SERVICE_KEY` | ❌ **publishable** (ERRADO) → Deve ser **service_role** (JWT) |

### ⚠️ NUNCA:
- Exponha a service_role_key no frontend
- Commite a service_role_key no Git
- Compartilhe a service_role_key publicamente

---

## 🎯 Checklist de Correção

- [ ] Acessar dashboard do Supabase
- [ ] Copiar a **service_role** key (JWT longo, não publishable)
- [ ] Atualizar `apps/api/.env`
- [ ] Atualizar `apps/api/package.json`
- [ ] Salvar os arquivos
- [ ] Aguardar backend reiniciar
- [ ] Testar login no navegador
- [ ] Confirmar que funciona

---

## 💡 Por Que Isso Aconteceu?

Provavelmente durante o setup inicial, foi copiada a **publishable key** em vez da **service_role key**.

No dashboard do Supabase, as duas ficam próximas, e é fácil confundir.

**Solução**: Sempre verificar que a service_role_key:
1. ✅ Começa com `eyJ` (JWT)
2. ✅ É bem longa (~200+ caracteres)
3. ✅ Tem aviso "Never share it publicly"
4. ❌ NÃO começa com `sb_publishable_`

---

## 🚀 Após Corrigir

Com a service_role_key correta:

1. ✅ Backend terá acesso total ao Supabase
2. ✅ Pode ler/escrever em qualquer tabela
3. ✅ Bypassa RLS automaticamente
4. ✅ Login via API funcionará perfeitamente
5. ✅ Não haverá mais erros 401 ou 500

---

**Data:** 04/12/2024 às 20:35  
**Problema:** Service role key incorreta (publishable em vez de service_role)  
**Solução:** Substituir pela service_role_key verdadeira do dashboard  
**Arquivos a corrigir:** `apps/api/.env` e `apps/api/package.json`

