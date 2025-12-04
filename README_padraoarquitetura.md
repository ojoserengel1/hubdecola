# NOME_DO_PROJETO

> Base de arquitetura pensada para projetos grandes, escaláveis e fáceis de manter.

Este README documenta as principais **decisões de arquitetura**, **padrões** e **boas práticas** adotados neste projeto.  
A ideia é que qualquer pessoa que entre no time consiga entender rapidamente **como o código é organizado** e **como contribuir sem quebrar nada**.

---

## ✨ Princípios de Arquitetura

1. **Componentização Extrema**
   - Quebre tudo em peças pequenas e reutilizáveis.
   - Um componente/módulo = **uma responsabilidade clara**.
   - Evite “componentes Deus” (aqueles arquivos com centenas de linhas e várias funções misturadas).

2. **DRY – Don’t Repeat Yourself**
   - Regra de ouro: se você copiou e colou algo **3 vezes**, isso provavelmente deveria virar:
     - um componente reutilizável,
     - um hook,
     - uma função utility,
     - um serviço compartilhado.
   - Centralize lógicas comuns em módulos `shared`.

3. **SOC – Separation of Concerns**
   - Separe bem:
     - **Camada de apresentação (UI):** componentes visuais.
     - **Camada de lógica de negócio:** serviços, casos de uso.
     - **Camada de acesso a dados:** chamadas HTTP, repositórios, SDKs.
   - Cada camada sabe o mínimo possível sobre as outras.

4. **SOLID (adaptado para o projeto)**
   - **S – Single Responsibility:** arquivos pequenos, foco em uma responsabilidade.
   - **O – Open/Closed:** fácil de estender, difícil de precisar alterar o que já funciona.
   - **D – Dependency Inversion:** módulos de alto nível não dependem de detalhes de implementação.

5. **KISS – Keep It Simple, Stupid**
   - Não complique o que pode ser simples.
   - Prefira soluções diretas a over-engineering.
   - Código simples é mais barato de manter do que código “genial”.

6. **YAGNI – You Aren’t Gonna Need It**
   - Não implemente coisas “porque um dia talvez…”.
   - Foque no que é necessário **agora**, mas de forma que seja fácil evoluir depois.

7. **Clean Code & Clean Architecture (na prática)**
   - Nome de arquivos e funções **autoexplicativos**.
   - Evitar “lógica mágica” escondida, com ifs complexos sem explicação.
   - Preferir composição a herança.

---

## 📂 Estrutura de Pastas (sugestão)

Ajuste conforme a stack (React, Node, etc.), mas a ideia geral é:

```bash
src/
  app/
    routes/           # Definição de rotas / páginas
    providers/        # Providers globais (tema, auth, query client, etc.)
    hooks/            # Hooks globais da aplicação
    config/           # Configurações globais (rotas, temas, etc.)

  modules/
    auth/
      components/
      pages/
      hooks/
      services/
      types/
    users/
      components/
      pages/
      hooks/
      services/
      types/
    # cada módulo de domínio segue um padrão similar

  shared/
    components/       # Componentes genéricos (Button, Input, Modal, etc.)
    layouts/          # Layouts reutilizáveis
    hooks/            # Hooks que podem ser usados por qualquer módulo
    utils/            # Funções helper (formatadores, parsers, etc.)
    services/         # Serviços genéricos (http client, storage, etc.)
    constants/        # Constantes globais
    styles/           # Estilos globais / tokens de design
    types/            # Tipos globais (DTOs comuns, etc.)

  infra/
    http/             # Configuração de clientes HTTP (axios/fetch)
    logger/           # Logger centralizado
    env/              # Leitura e validação de variáveis de ambiente
Regras gerais:

Nada de “pasta misc”: se algo não tem lugar, o problema é a arquitetura.

Módulos de domínio ficam em modules/ (ex.: users, billing, auth).

Coisas genéricas e reusáveis vão para shared/.

Infraestrutura (comunicação externa, env, log) fica isolada em infra/.

🧩 Componentização Extrema (UI)
Componentes atômicos

shared/components deve conter:

Botões,

Inputs,

Badges,

Cards,

etc.

São componentes 100% visuais e reaproveitáveis.

Componentes por módulo (domínio)

Dentro de modules/<modulo>/components, crie componentes específicos do domínio.

Ex.: UserTable, UserForm, UserFilters.

Containers x Presentational

Presentational components: só se preocupam com UI.

Containers / pages: lidam com dados, chamadas de serviço, estado.

🌐 Camada de Serviços & API
Toda a comunicação externa (API, auth, storage, etc.) deve passar por services.

Exemplo de organização:

bash
Copiar código
shared/services/http/
  client.ts      # instancia de axios/fetch configurada
  interceptors.ts
  types.ts

modules/users/services/
  users.api.ts   # funções de acesso à API (getUsers, createUser, etc.)
  users.mappers.ts
  users.adapters.ts
Boas práticas:

services não retornam diretamente respostas cruas da API; sempre mapeiam para tipos da aplicação.

Nunca faça fetch/axios direto dentro de componente; use sempre a camada de serviço.

🧠 Estado, Hooks & Lógica de Negócio
Centralize lógicas complexas em hooks e casos de uso, por exemplo:

modules/users/hooks/useUserList.ts

modules/users/hooks/useCreateUser.ts

Estado global (se existir) deve ser bem pensado:

Evite globalizar tudo.

Use estado global apenas para:

usuário logado,

tema,

preferências,

dados realmente globais.

🧪 Testes
Para projetos grandes, testes deixam de ser “nice to have” e viram obrigatórios:

Unitários: funções puras, hooks, services.

Integrados: componentes que envolvem múltiplas partes.

E2E: principais fluxos críticos de negócio.

Sugestão:

bash
Copiar código
__tests__/
  unit/
  integration/
  e2e/
Regras:

Cada bug encontrado deve, idealmente, gerar um teste que o evite no futuro.

Não é sobre atingir 100% de cobertura, e sim sobre proteger o que é crítico.

🔐 Configurações & Variáveis de Ambiente
Nunca commitar .env.

Variáveis devem ser documentadas em um arquivo como:

bash
Copiar código
docs/env.example.md
Toda leitura de process.env deve passar por um módulo responsável em infra/env, que:

valida a existência,

faz parse de tipos,

evita undefined espalhado pelo código.

🧾 Padrões de Código & Lint
Use ESLint + Prettier (ou equivalentes da linguagem) para padronizar o código.

Crie scripts no package.json (ou equivalente):

json
Copiar código
{
  "scripts": {
    "lint": "eslint src --ext .ts,.tsx",
    "lint:fix": "eslint src --ext .ts,.tsx --fix",
    "format": "prettier \"src/**/*.{ts,tsx,js,jsx,json,md}\" --write"
  }
}
O objetivo é:

evitar discussão sobre estilo,

reduzir ruído em PR,

padronizar a base de código.

🌲 Git, Commits e Branches
Branches:

main: sempre estável.

develop: ambiente de integração (se fizer sentido).

feature/nome-da-feature

fix/descricao-do-bug

Commits pequenos e descritivos, exemplo:

feat(users): adiciona listagem paginada

fix(auth): corrige expiração de token

refactor(ui): extrai componente Button primário

Evite commits genéricos do tipo ajustes, update, mudanças.

📚 Documentação & Comentários
README deve explicar:

como rodar,

como testar,

como buildar,

princípios de arquitetura (esse arquivo).

Comentários:

Explique o porquê, não o como.

Se o código é complexo ao ponto de exigir comentário para entender o “como”, talvez precise ser refatorado.

🚀 Checklist Rápido Antes de Abrir PR
 Não quebrei o princípio de DRY (copiei/coleis algo mais de 2 vezes?).

 Minha alteração está no módulo correto (modules vs shared vs infra).

 Componentes novos são pequenos, focados e reutilizáveis.

 Não fiz chamada de API direto no componente (usei serviço).

 Adicionei/ajustei testes, se mexi em algo crítico.

 Rodei lint e format.

 Nome e descrição do PR estão claros.

📌 Resumo das Boas Práticas
Componentização extrema, mas com bom senso.

DRY sempre, sem gambiarras duplicadas.

Separação de responsabilidades entre UI, negócio e infra.

Services, hooks e utils bem organizados.

Arquitetura pensada para crescer sem virar um caos.

Padrões de código, testes e documentação como parte do fluxo, não como “extra”.

Este README é um documento vivo. Sempre que a arquitetura evoluir, atualize aqui para manter o time e o projeto alinhados.