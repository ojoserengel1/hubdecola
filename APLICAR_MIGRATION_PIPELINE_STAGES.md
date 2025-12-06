# 🚀 Aplicar Migration: pipeline_stages

## ⚠️ ERRO ATUAL

Você está recebendo o erro:
```
Could not find the table 'public.pipeline_stages' in the schema cache
```

Isso acontece porque a tabela `pipeline_stages` ainda não foi criada no banco de dados.

---

## ✅ SOLUÇÃO: Aplicar a Migration

### **Passo 1: Acessar o Supabase Dashboard**

1. Acesse: https://supabase.com/dashboard/project/kwickmcktmgehyclgsha
2. Faça login se necessário

### **Passo 2: Abrir o SQL Editor**

1. No menu lateral esquerdo, clique em **"SQL Editor"**
2. Clique em **"New query"** (Nova consulta)

### **Passo 3: Executar o Script**

1. Abra o arquivo: `sql/007_aplicar_pipeline_stages.sql`
2. **Copie TODO o conteúdo** do arquivo
3. **Cole** no SQL Editor do Supabase
4. Clique em **"Run"** (ou pressione `Ctrl+Enter` / `Cmd+Enter`)

### **Passo 4: Verificar**

Você deve ver uma mensagem de sucesso:
```
✅ Tabela pipeline_stages criada com sucesso!
total_estagios: 6
```

---

## 📋 O QUE O SCRIPT FAZ

1. ✅ Cria a tabela `pipeline_stages` com todos os campos necessários
2. ✅ Cria índice para otimizar ordenação
3. ✅ Insere os 6 estágios padrão:
   - Aguardando Briefing
   - Copy
   - Design
   - Web
   - Infraestrutura
   - Domínio
4. ✅ Adiciona comentários de documentação

---

## 🎯 APÓS APLICAR

Depois de executar o script:

1. ✅ A tabela estará criada
2. ✅ Os estágios padrão estarão disponíveis
3. ✅ Você poderá criar novos estágios
4. ✅ Você poderá editar e reordenar estágios
5. ✅ O filtro funcionará corretamente

---

## 🔄 ALTERNATIVA: Via Supabase CLI

Se você tiver o Supabase CLI instalado:

```bash
cd /Users/joserengel/Documents/decolaweb-hub/hubdecola
supabase db push
```

Ou execute diretamente:

```bash
supabase db execute -f supabase/migrations/005_create_pipeline_stages.sql
```

---

## ❓ PROBLEMAS?

Se encontrar algum erro:

1. **Verifique se já existe a tabela:**
   ```sql
   SELECT * FROM public.pipeline_stages;
   ```

2. **Se a tabela já existir, você pode pular a criação:**
   - O script usa `CREATE TABLE IF NOT EXISTS`, então é seguro executar novamente

3. **Se houver conflito nos estágios:**
   - O script usa `ON CONFLICT DO NOTHING`, então não duplicará estágios

---

**Execute o script e depois tente criar um novo status novamente!** 🚀

