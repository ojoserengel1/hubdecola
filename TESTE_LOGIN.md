# 🧪 Como Testar o Login

## 🔧 Correção Aplicada

Foi implementado um **sistema de fallback robusto** no processo de autenticação:

### O que mudou:

1. **Logs detalhados** adicionados ao console
2. **Fallback automático** para a API se a query direta falhar
3. **Melhor diagnóstico** de erros

---

## 🚀 Como Testar Agora

### 1. Recarregue a Página

No navegador, pressione:
- **Windows/Linux**: `Ctrl + Shift + R` (hard refresh)
- **Mac**: `Cmd + Shift + R` (hard refresh)

Ou faça:
1. Abra DevTools (`F12` ou `Cmd + Option + I`)
2. Clique com botão direito no botão de reload
3. Escolha "Esvaziar Cache e Recarregar por Completo"

### 2. Abra o Console do Navegador

- Pressione `F12` (Windows/Linux) ou `Cmd + Option + I` (Mac)
- Vá para a aba **Console**
- Deixe aberto para ver os logs

### 3. Tente Fazer Login

Use as credenciais:

```
Email: businessrengeldigital@gmail.com
Senha: Acesso123@
```

### 4. Observe os Logs

Você deve ver algo como:

```
🔍 Session: { ... }
✅ Sessão encontrada, buscando perfil...
🔎 Buscando perfil para user ID: 6260bf99-52f9-4136-8cdf-f85bec94883b
📊 Perfil: { id: '...', role: 'admin', name: 'José Rengel' }
✅ Perfil encontrado, setando usuário
```

**OU** (se houver fallback):

```
🔍 Session: { ... }
✅ Sessão encontrada, buscando perfil...
🔎 Buscando perfil para user ID: 6260bf99-52f9-4136-8cdf-f85bec94883b
❌ Erro: { ... }
❌ Perfil não encontrado via query direta, tentando via API...
✅ Perfil encontrado via API: { success: true, data: { ... } }
```

---

## ✅ Resultados Esperados

### Cenário 1: Sucesso ✅

- Login bem-sucedido
- Redirecionamento para `/admin/clientes`
- Página do painel administrativo carrega
- Nome "José Rengel" aparece no header

### Cenário 2: Erro Persistente ❌

Se ainda mostrar "Perfil não encontrado":

1. **Copie todos os logs** do console
2. **Cole aqui no chat** para análise
3. Vamos investigar mais a fundo

---

## 🔍 Verificações Adicionais

### Confirmar que o backend está rodando:

```bash
curl http://localhost:3001/health
```

**Resposta esperada:**
```json
{
  "success": true,
  "message": "DecolaWeb API está funcionando! 🚀"
}
```

### Confirmar que o frontend está rodando:

Acesse: http://localhost:5175/login

Deve mostrar a tela de login.

---

## 📊 Diagnóstico por Logs

### ✅ Log Bom (Funcionando):

```
🔍 Session: { user: { id: '...', email: '...' } }
✅ Sessão encontrada, buscando perfil...
🔎 Buscando perfil para user ID: 6260bf99-52f9-4136-8cdf-f85bec94883b
📊 Perfil: { id: '...', role: 'admin', name: 'José Rengel', ... }
✅ Perfil encontrado, setando usuário
```

### ⚠️ Log com Fallback (Funcionando com ajuda da API):

```
❌ Erro: { message: 'PGRST116', code: '...', details: '...', hint: '...' }
❌ Perfil não encontrado via query direta, tentando via API...
✅ Perfil encontrado via API: { success: true, data: { id: '...' } }
```

### ❌ Log Ruim (Não Funcionando):

```
❌ Erro: { message: '...', code: '...' }
❌ Perfil não encontrado via query direta, tentando via API...
❌ Erro ao buscar via API: Network Error / 401 / 404
```

---

## 🛠️ Troubleshooting

### Erro: "Failed to fetch" ou "Network Error"

**Causa**: Backend não está rodando ou na porta errada

**Solução**:
```bash
# Verificar se está rodando
lsof -ti:3001

# Se não estiver, inicie:
npm run dev
```

### Erro: "401 Unauthorized" na API

**Causa**: Token JWT inválido

**Solução**:
1. Faça logout
2. Limpe o cache do navegador
3. Tente login novamente

### Erro: "PGRST116" (Row Level Security)

**Causa**: Políticas RLS muito restritivas

**Solução**: O fallback via API deve resolver automaticamente (API usa service_role_key)

### Página em branco após login

**Causa**: JavaScript com erro

**Solução**:
1. Veja erros no Console (F12)
2. Recarregue a página
3. Tente em modo anônimo/privado

---

## 📱 Outras Contas para Testar

Se quiser criar novos usuários para teste, consulte o arquivo `SETUP.md`.

Contas atuais no sistema:
- `businessrengeldigital@gmail.com` - Admin (José Rengel)
- `admin@decolaweb.com` - Admin (se criado)

---

## 🎯 Checklist de Teste

- [ ] Backend rodando (porta 3001)
- [ ] Frontend rodando (porta 5175)
- [ ] Página de login abre
- [ ] DevTools/Console aberto
- [ ] Cache limpo
- [ ] Tentativa de login feita
- [ ] Logs observados no console
- [ ] Login bem-sucedido OU logs copiados para análise

---

## 💡 Dicas

1. **Sempre deixe o console aberto** durante o desenvolvimento
2. **Use modo anônimo** para testar sem cache
3. **Recarregue com Shift** para forçar reload completo
4. **Copie os logs** se houver erro

---

## 🆘 Precisa de Ajuda?

Se o login não funcionar:

1. **Tire um print** da tela de login com o erro
2. **Copie os logs** do console (F12)
3. **Cole aqui no chat** para análise detalhada

---

**Última atualização:** 04/12/2024 às 20:10  
**Correção aplicada em:** `apps/web/src/store/authStore.ts`  
**Status:** ✅ Pronto para teste

