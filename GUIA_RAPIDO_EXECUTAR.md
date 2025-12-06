# ⚡ GUIA RÁPIDO - Executar Agora

## 🎯 OBJETIVO

Corrigir o Cliente 2 e automatizar para futuros clientes.

---

## 📍 PASSO 1: Abrir SQL Editor

**Clique aqui:**
```
https://supabase.com/dashboard/project/kwickmcktmgehyclgsha/sql/new
```

---

## 📍 PASSO 2: Corrigir Cliente 2

### Copie TODO o conteúdo deste arquivo:
```
sql/001_corrigir_cliente2.sql
```

### Cole no SQL Editor

### Clique em "RUN" ▶️

### ✅ Você deve ver:
```
✅ Assinatura criada
✅ Status do site criado
✅ Pipeline criado
✅ Contrato criado
✅ Briefing inicial criado
🎉 CLIENTE 2 CORRIGIDO COM SUCESSO!
```

---

## 📍 PASSO 3: Criar Trigger Automático

### Copie TODO o conteúdo deste arquivo:
```
sql/002_criar_trigger_automatico.sql
```

### Cole no SQL Editor (nova query)

### Clique em "RUN" ▶️

### ✅ Você deve ver:
```
✅ TRIGGER AUTOMÁTICO CRIADO COM SUCESSO!

A partir de agora, SEMPRE que você criar um novo
cliente (profile com role=client), os seguintes
registros serão criados AUTOMATICAMENTE:

  • Subscription (assinatura)
  • Site Status
  • Production Pipeline
  • Contract
  • Briefing
```

---

## 📍 PASSO 4: Testar Cliente 2

### Recarregue a página:
```
http://localhost:5177/app/dashboard
```

**Faça login com:**
```
Email: cliente2@gmail.com
Senha: Acesso123@
```

### ✅ Deve aparecer:
- ✅ **Assinatura:** "Plano ativo"
- ✅ **Status do Site:** "Aguardando briefing"
- ✅ **Contrato:** "Pendente"
- ✅ **Briefing:** Disponível para preencher

---

## 🚀 PRÓXIMOS CLIENTES

Agora é **AUTOMÁTICO**! Basta:

1. Criar usuário no Authentication
2. Criar perfil com `role = 'client'`
3. **PRONTO!** ✨

Todos os outros registros serão criados **AUTOMATICAMENTE** pelo trigger!

---

## 📂 LOCALIZAÇÃO DOS ARQUIVOS

```
hubdecola/
├── sql/
│   ├── 001_corrigir_cliente2.sql          ← Execute PRIMEIRO
│   └── 002_criar_trigger_automatico.sql   ← Execute SEGUNDO
│
├── CORRIGIR_CLIENTE2_E_AUTOMATIZAR.md     ← Guia completo
└── GUIA_RAPIDO_EXECUTAR.md                ← Este arquivo
```

---

## ❓ PROBLEMAS?

### Cliente 2 ainda zerado?
1. Verifique se executou o SQL 001
2. Veja os logs no SQL Editor
3. Recarregue a página com Ctrl+F5

### Trigger não funcionando?
1. Execute o SQL 002 novamente
2. Teste criando um Cliente 3

### Mais ajuda?
Veja o guia completo: `CORRIGIR_CLIENTE2_E_AUTOMATIZAR.md`

---

## ✅ CHECKLIST

- [ ] Abri o SQL Editor do Supabase
- [ ] Executei `001_corrigir_cliente2.sql`
- [ ] Vi mensagem de sucesso
- [ ] Executei `002_criar_trigger_automatico.sql`
- [ ] Vi mensagem de trigger criado
- [ ] Recarreguei dashboard do Cliente 2
- [ ] Tudo aparecendo corretamente! 🎉

---

**🎯 Tempo estimado: 3 minutos**

