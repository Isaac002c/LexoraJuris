# SPEC — Lexora · MVP e Sprints

> **Produto:** Lexora — Sistema de Gestão Jurídica Inteligente · **Fornecedor:** Chronostek
> No código o namespace é `@chronostek/*` e o tenant de demonstração é `demo-chronostek`.
> "Lexora" é o nome comercial; "Chronostek" é a empresa fornecedora.
>
> **Natureza deste documento:** este SPEC descreve a **regra de negócio planejada** do MVP e o
> roadmap. O que está **comprovadamente implementado e validado** é registrado separadamente em
> [`docs/STATUS_ATUAL_LEXORA.md`](STATUS_ATUAL_LEXORA.md). Não confunda escopo planejado com escopo entregue.
>
> **Versão:** 1.0 · **Data:** 2026-06-23 · **Responsável técnico:** equipe Chronostek

---

## 1. Visão geral do projeto

O Lexora unifica a operação de um escritório de advocacia com **quatro filiais**, centralizando
clientes, atendimentos, processos, prazos, audiências, documentos e checklists em uma única
plataforma, com **controle de acesso por perfil, filial, área jurídica e responsável**.

A arquitetura é um **monorepo TypeScript** (pnpm workspaces) com separação clara entre interface,
API e pacotes compartilhados:

| Camada | Tecnologia | Pacote |
| --- | --- | --- |
| Frontend | Next.js (App Router) | `@chronostek/web` (porta 3000) |
| Backend | Express + Zod | `@chronostek/api` (porta 3333) |
| Banco | PostgreSQL 17 + Prisma ORM | `@chronostek/database` |
| Autorização | Papéis/permissões tipados | `@chronostek/auth` |
| Contratos | Schemas Zod compartilhados | `@chronostek/contracts` |
| Config | Configuração centralizada | `@chronostek/config` |

Embora o produto seja entregue para **uma operação jurídica**, a base é **multi-tenant** com
**Row-Level Security (RLS)** forçado no PostgreSQL: cada registro operacional carrega `tenant_id`
e toda transação define `app.tenant_id`, garantindo isolamento em profundidade no banco.

## 2. Objetivo operacional até 30 de junho de 2026

Entregar um **MVP operacional** que permita ao escritório iniciar o uso real com:

- 4 filiais unificadas;
- 17 usuários iniciais (2 administradores gerais);
- Plano Profissional;
- Fluxos essenciais de cliente, atendimento, processo, prazo/agenda, documento e checklist
  funcionando ponta a ponta, com permissões aplicadas no backend.

A definição objetiva de "MVP operacional" está na **seção 20**.

## 3. Escopo do MVP

| # | Módulo | Inclui no MVP |
| --- | --- | --- |
| 1 | Acesso e usuários | Login individual, senhas individuais, perfis, cadastro de usuários, vínculo a filial e área, permissões iniciais, troca de senha obrigatória no 1º acesso, rastreabilidade mínima |
| 2 | Filiais e áreas jurídicas | Cadastro das 4 filiais e das áreas; vínculo de usuários por filial/área; filtros por filial, área e responsável |
| 3 | Clientes e atendimento | Cadastro de cliente; registro/histórico/status de atendimento; triagem; encaminhamento interno; conversão em processo |
| 4 | Processos | Cadastro vinculado a cliente; área/filial/responsável/número/status/andamento/observações; histórico; filtros |
| 5 | Prazos e agenda jurídica | Cadastro de prazo; agenda (mês/semana/lista); audiências e eventos; prazos críticos; cores por vencimento; filtros |
| 6 | Documentos e checklists | Upload privado vinculado a cliente/processo; quem anexou + data; checklists; status de pendência por processo |

## 4. Escopo posterior ao MVP

Existe **código** para vários destes itens (notadamente o módulo Financeiro), porém **não fazem
parte do critério de liberação do MVP** e não devem atrasar a entrega de 30/06:

- **Financeiro completo:** contratos de honorários, parcelas, vencimentos, inadimplência,
  comprovantes, registros de cobrança (já existe em `finance.routes.ts`, mas é pós-MVP).
- **Relatórios executivos avançados** e exportações além do básico.
- **Auditoria avançada** (a auditoria básica via `AuditLog` já existe).
- **Integrações:** gateway de pagamento, Pix/boleto automáticos, WhatsApp/e-mail automáticos,
  assinatura digital, consulta automática a tribunais, portal externo do cliente, recursos de IA.

## 5. Perfis e permissões

### 5.1. Perfis (papéis de sistema)

O código define **6 papéis** em `packages/auth/src/index.ts` (`RoleCode`). A spec de negócio cita 5;
o 6º (`VISUALIZADOR`) é um perfil somente-leitura adicional.

| Código (`RoleCode`) | Nome | Resumo |
| --- | --- | --- |
| `ADMIN_GERAL` | Administrador geral | Acesso total; gestão de usuários, filiais, áreas, perfis, segurança e configurações |
| `GESTOR_FILIAL` | Gestor de filial | Operação ampla + leitura financeira e auditoria; sem administração de usuários/segurança |
| `SECRETARIA` | Secretaria | Clientes, atendimentos, triagem, encaminhamento, criação de processo, upload de documentos |
| `ADVOGADO` | Advogado | Processos atribuídos, prazos, documentos, checklists; visão restrita aos próprios casos |
| `FINANCEIRO` | Financeiro | Leitura operacional + leitura/edição financeira e relatórios |
| `VISUALIZADOR` | Visualizador | Somente leitura nos módulos operacionais |

### 5.2. Catálogo de permissões (25 — `PermissionCode`)

`dashboard.read` · `client.read` · `client.create` · `client.update` · `attendance.read` ·
`attendance.create` · `attendance.update` · `attendance.convert` · `case.read` · `case.create` ·
`case.update` · `case.update_assigned` · `deadline.read` · `deadline.manage` · `document.read` ·
`document.upload` · `checklist.manage` · `finance.read` · `finance.update` · `report.read` ·
`user.manage` · `branch.manage` · `legal_area.manage` · `tenant.configure` · `audit.read`

### 5.3. Matriz papel × permissão (conforme `seed.ts`)

| Permissão | ADMIN | GESTOR | SECRET. | ADVOG. | FINANC. | VISUAL. |
| --- | :-: | :-: | :-: | :-: | :-: | :-: |
| dashboard.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| client.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| client.create | ✅ | ✅ | ✅ | — | — | — |
| client.update | ✅ | ✅ | ✅ | — | — | — |
| attendance.read | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| attendance.create | ✅ | ✅ | ✅ | — | — | — |
| attendance.update | ✅ | ✅ | ✅ | — | — | — |
| attendance.convert | ✅ | ✅ | ✅ | — | — | — |
| case.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| case.create | ✅ | ✅ | ✅ | — | — | — |
| case.update | ✅ | ✅ | — | — | — | — |
| case.update_assigned | ✅ | — | — | ✅ | — | — |
| deadline.read | ✅ | ✅ | ✅ | ✅ | — | ✅ |
| deadline.manage | ✅ | ✅ | — | ✅ | — | — |
| document.read | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| document.upload | ✅ | ✅ | ✅ | ✅ | ✅ | — |
| checklist.manage | ✅ | ✅ | — | ✅ | — | — |
| finance.read | ✅ | ✅ | — | — | ✅ | ✅ |
| finance.update | ✅ | — | — | — | ✅ | — |
| report.read | ✅ | ✅ | — | — | ✅ | ✅ |
| user.manage | ✅ | — | — | — | — | — |
| branch.manage | ✅ | — | — | — | — | — |
| legal_area.manage | ✅ | — | — | — | — | — |
| tenant.configure | ✅ | — | — | — | — | — |
| audit.read | ✅ | ✅ | — | — | — | — |

> `ADMIN_GERAL` recebe `[...permissions]` (todas). Demais perfis conforme listas em `seed.ts`.

### 5.4. Princípios de autorização

1. **Tenant nunca vem do corpo da requisição** — é resolvido da sessão.
2. **Permissão validada no backend** (`requirePermission`) — a UI apenas reflete; não é mecanismo de segurança.
3. **Escopo de filial** (`assertBranchAccess`) — usuário só acessa filiais vinculadas, salvo `hasAllBranches`.
4. **Escopo de responsável** — advogado sem papel de gestão só enxerga casos/prazos/documentos onde está designado (filtros em `lib/tenant.ts`).
5. **RLS no banco** como defesa final.

## 6. Módulos (mapa funcional × código)

| Módulo | Rotas API (`apps/api/src/modules/*`) | Páginas Web (`apps/web/src/app/(protected)/*`) | Modelos Prisma |
| --- | --- | --- | --- |
| Acesso/usuários | `auth/*`, `admin/*` | `administracao/usuarios`, `administracao/perfis`, `administracao/seguranca` | User, Role, Permission, UserRole, RolePermission, Session |
| Filiais/áreas | `admin/*`, `lookups/*` | `administracao/filiais`, `administracao/areas` | Branch, LegalArea, UserBranchAccess |
| Clientes/atendimento | `clients/*`, `attendances/*` | `clientes/*`, `atendimentos/*` | Client, Attendance |
| Processos | `cases/*` | `processos/*` | LegalCase, CaseParty, CaseAssignment |
| Prazos/agenda | `deadlines/*` | `prazos`, `calendario` | Deadline (+ `LegalCase.hearingAt`) |
| Documentos/checklists | `documents/*`, `checklists/*` | `documentos`, `checklists/*` | StoredFile, Document, ChecklistTemplate, CaseChecklist, ChecklistItem |
| Painel | `dashboard/*` | `dashboard` | (agregações reais) |
| Auditoria | `audit/*` | `administracao/auditoria` | AuditLog |
| Relatórios | `reports/*` | `relatorios` | (agregações) |
| Financeiro (pós-MVP) | `finance/*` | `financeiro/*` | FeeContract, PaymentInstallment |

## 7. Fluxos operacionais

### Fluxo Administrador
Login → painel geral → gestão de usuários → filiais → áreas → perfis/permissões → segurança/auditoria.

### Fluxo Secretaria
Criar cliente → registrar atendimento → triagem (`NOVO → EM_TRIAGEM → AGUARDANDO_DOCUMENTOS →
DIRECIONADO`) → encaminhamento interno → conversão em processo → anexar documento → registrar
pendência/checklist.

### Fluxo Advogado
Consultar processos atribuídos → criar/atualizar processo → criar prazo → validar cor do prazo →
criar/consultar audiência (`DeadlineType.AUDIENCIA` / `LegalCase.hearingAt`) → consultar documentos →
atualizar pendências.

### Fluxo Gestor
Filtrar por filial → por área → por responsável → consultar prazos críticos → consultar pendências.

### Fluxo Financeiro (apenas validação estrutural no MVP)
Leitura de indicadores e estrutura de contratos/parcelas; sem implementação adicional no MVP.

## 8. Regras de prazo

Conforme `apps/api/src/lib/deadline.ts` (`deadlineColor`), com base em dias inteiros até o vencimento
(`Math.ceil`), respeitando o fuso **America/Sao_Paulo**:

| Situação | Dias até vencer | Cor | Constante |
| --- | --- | --- | --- |
| Folga | > 7 dias | 🟢 Verde | `GREEN` |
| Atenção | 6 a 7 dias | 🟡 Amarelo | `YELLOW` |
| Crítico | 0 a 5 dias | 🔴 Vermelho | `RED` |
| **Vencido** | < 0 (data passada) | 🟥 Vermelho-escuro / "Vencido" | `DARK_RED` |
| Concluído/Cancelado | — | ⬜ Cinza | `GRAY` |

> Observação: a faixa de 5–6 dias é coberta por `RED` (≤5) e a de 6–7 por `YELLOW`, conforme a
> regra "vermelho 5 dias ou menos; amarelo 6 a 7; verde acima de 7".

## 9. Regras de filial, área e responsável

- **Filial:** todo cliente, atendimento, processo, prazo e documento pertence a uma filial. O acesso
  é limitado às filiais vinculadas ao usuário (`UserBranchAccess`), exceto `hasAllBranches`.
- **Área jurídica:** atendimentos, processos, prazos e checklists referenciam uma `LegalArea`. Áreas
  iniciais: **Trabalhista, Criminal, Cível, Juizado Cível, Vara Cível, Federal, Administrativo**.
- **Responsável:** processos têm designações (`CaseAssignment`: `INTERNAL_OWNER`, `ATTORNEY`,
  `COLLABORATOR`); prazos têm `responsibleUserId`. Advogado sem gestão só vê o que lhe é atribuído.

## 10. Requisitos funcionais (RF)

| ID | Requisito |
| --- | --- |
| RF-01 | Login individual por tenant (slug), e-mail e senha, com sessão segura |
| RF-02 | Troca obrigatória de senha no primeiro acesso (exceto administradores no seed) |
| RF-03 | CRUD de usuários com vínculo a filial(is) e papel |
| RF-04 | CRUD de filiais e áreas jurídicas |
| RF-05 | CRUD de clientes com nome, telefone, e-mail, filial, responsável, observações |
| RF-06 | Registro de atendimento com status, triagem e encaminhamento; conversão em processo |
| RF-07 | CRUD de processos vinculados a cliente, com área, filial, responsável, número, status, andamento |
| RF-08 | CRUD de prazos com tipo, descrição, vencimento, processo, cliente, responsável, filial, área |
| RF-09 | Agenda jurídica (mês/semana/lista), audiências e lista de prazos críticos |
| RF-10 | Cores de prazo conforme seção 8 e identificação de "Vencido" |
| RF-11 | Upload de documento vinculado a cliente/processo, com autor e data; download autorizado |
| RF-12 | Checklists por processo com status de item e visão de pendências |
| RF-13 | Filtros por cliente, área, filial, responsável e status nos módulos aplicáveis |
| RF-14 | Painel operacional com indicadores reais por tenant/filial/perfil |
| RF-15 | Registro de auditoria das ações relevantes (`AuditLog`) |

## 11. Requisitos não funcionais (RNF)

| ID | Requisito |
| --- | --- |
| RNF-01 | TypeScript estrito em todos os pacotes; `typecheck` e `lint` sem erros |
| RNF-02 | Validação de entrada com Zod (`@chronostek/contracts`) no backend |
| RNF-03 | Testes unitários e de integração (incl. teste real de isolamento RLS) |
| RNF-04 | Build de produção reproduzível (Next.js + tsup) |
| RNF-05 | Datas e regras de prazo no fuso America/Sao_Paulo |
| RNF-06 | Paginação em listagens; estados vazios e mensagens de erro claras |
| RNF-07 | Responsividade adequada ao uso operacional |

## 12. Requisitos de segurança (RSEG)

| ID | Requisito |
| --- | --- |
| RSEG-01 | Tenant resolvido da sessão, nunca do corpo da requisição |
| RSEG-02 | Senhas com hash argon2id; nunca armazenadas/expostas em claro |
| RSEG-03 | Sessão por token opaco, hash SHA-256, cookie HttpOnly, expiração absoluta (12h) e idle (2h) |
| RSEG-04 | Permissões validadas no backend (`requirePermission`); UI não é mecanismo de segurança |
| RSEG-05 | Isolamento por filial e por responsável aplicado no backend |
| RSEG-06 | RLS forçado no PostgreSQL em todas as tabelas operacionais |
| RSEG-07 | Documentos privados; download apenas por rota autorizada, com guarda contra path traversal |
| RSEG-08 | Campos sensíveis (CPF/identidade) cifrados (`tax_id_encrypted`, `identity_encrypted`) |
| RSEG-09 | Segredos fora do versionamento (`.env` ignorado); segredos reais antes de produção |

## 13. Regras de auditoria e rastreabilidade

- Toda ação relevante grava `AuditLog` (tenant, ator, tipo de entidade, id, ação, descrição, ip, user agent).
- Eventos cobertos hoje incluem: `AUTH_LOGIN`, `PASSWORD_CHANGED`, `DEADLINE_CREATED/UPDATED/STATUS_UPDATED`,
  e ações correspondentes em clientes, processos, documentos e checklists.
- A página `administracao/auditoria` expõe a leitura (`audit.read`) para Admin e Gestor.

## 14. Critérios de aceite por módulo

| Módulo | Critério de aceite (resumo) |
| --- | --- |
| Acesso/usuários | Admin cria usuário com papel e filial; usuário faz login; troca senha no 1º acesso; sem permissão → 403 |
| Filiais/áreas | Admin cria/edita 4 filiais e 7 áreas; filtros por filial/área retornam dados corretos |
| Clientes/atendimento | Secretaria cria cliente; registra atendimento; faz triagem; encaminha; converte em processo |
| Processos | Usuário autorizado cria processo vinculado a cliente; filtros e detalhe funcionam; histórico registrado |
| Prazos/agenda | Cria prazo; cor correta conforme vencimento; "Vencido" inequívoco; audiência aparece na agenda |
| Documentos/checklists | Anexa documento a cliente/processo (autor+data); atualiza checklist; vê pendências por processo |
| Painel/filtros (gestor) | Gestor filtra por filial/área/responsável; vê prazos críticos e pendências |

## 15. Itens fora do MVP

Reafirma a seção 4. O módulo **Financeiro** permanece visível porque já compila, mas **não é critério
de liberação** e defeitos nele são de prioridade baixa até a estabilização do MVP.

## 16. Premissas assumidas

1. A operação é de **um único escritório** (um tenant operacional: `demo-chronostek`).
2. **Audiência** é modelada como `DeadlineType.AUDIENCIA` + `LegalCase.hearingAt` (não há entidade
   "Audiência" separada). A confirmar com o cliente se atende à expectativa.
3. Os **17 usuários** e **2 administradores** seguem o seed; senhas reais serão definidas na implantação.
4. Ambiente de produção usa PostgreSQL dedicado com role de aplicação **sem** `BYPASSRLS`.
5. Armazenamento de documentos é **local** no MVP (`STORAGE_DRIVER=local`); S3 é evolução.

## 17. Riscos e dependências

| # | Risco/Dependência | Impacto | Mitigação |
| --- | --- | --- | --- |
| R1 | Audiência sem entidade própria pode não atender expectativa | Médio | Validar fluxo na agenda; ajustar UI se necessário |
| R2 | Ambiente de execução depende de PostgreSQL (sem Docker em algumas máquinas) | Médio | Documentar provisionamento local; usar cluster isolado |
| R3 | Segredos de exemplo no `.env` de desenvolvimento | Médio (só dev) | Gerar segredos reais antes de produção |
| R4 | Verificação de aceite ponta a ponta pela interface ainda pendente | Médio | Executar os critérios da seção 14 com os usuários do seed |
| R5 | Entrada de datas em formulários precisa respeitar fuso | Baixo | Revisar componentes de data; já há base correta em `format.ts` |

## 18. Estratégia de implantação

1. **Ambiente:** PostgreSQL provisionado; `.env` com segredos reais (`SESSION_SECRET`, `FIELD_ENCRYPTION_KEY`).
2. **Banco:** `pnpm db:deploy` (migrations) + `pnpm db:seed` (dados iniciais reais, não fictícios).
3. **Build:** `pnpm build` (web + API).
4. **Execução:** API (porta 3333) + Web (porta 3000) atrás de TLS; documentos em volume privado.
5. **Verificação:** checklist de homologação (`docs/HOMOLOGACAO.md`) executado com usuários reais.
6. **Backup:** rotina de backup/restauração testada antes do uso real.

## 19. Roadmap de Sprints (0 a 8)

| Sprint | Objetivo | Entregáveis |
| --- | --- | --- |
| **S0 — Baseline e destravamento** | Repositório seguro e ambiente reprodutível | Baseline Git, seed operável sob RLS, migrations limpas, fuso corrigido |
| **S1 — Acesso e administração** | Login e gestão básica validados na UI | Login ponta a ponta, CRUD usuários/filiais/áreas, troca de senha |
| **S2 — Clientes e atendimento** | Fluxo de entrada do escritório | Cadastro de cliente, atendimento, triagem, encaminhamento, conversão |
| **S3 — Processos** | Gestão processual | Cadastro vinculado, filtros, detalhe, histórico, designações |
| **S4 — Prazos e agenda** | Controle de prazos e audiências | Cadastro de prazo, cores, agenda mês/semana/lista, prazos críticos |
| **S5 — Documentos e checklists** | Documentação por processo | Upload privado, vínculo, autor/data, checklists, pendências |
| **S6 — Painel e filtros do gestor** | Visão gerencial | Indicadores reais, filtros por filial/área/responsável |
| **S7 — Endurecimento e aceite** | Qualidade e segurança | Negações de permissão por perfil, estados vazios, mensagens, responsividade, homologação |
| **S8 — Implantação assistida** | Go-live | Segredos reais, deploy, backup/restore, uso assistido até 30/06 |

## 20. Backlog priorizado (P0 → P2)

**P0 — Bloqueios técnicos:** aplicação não inicia, banco não conecta, migration/seed falham, login
falha, build falha, falha crítica de auth/permissão, fuso incorreto.

**P1 — Verificação vertical do MVP:** os 5 fluxos da seção 7 validados ponta a ponta, com negações
de permissão por perfil e cores de prazo confirmadas na interface.

**P2 — Ajustes de aderência:** campos, filtros, permissões finas, validações, usabilidade, mensagens
de erro, estados vazios, paginação e responsabilidade quando necessário ao uso real.

## 21. Definição objetiva de "MVP operacional"

O MVP só pode ser declarado **operacional** quando houver **evidência executável** de que:

1. Os 17 usuários podem ser cadastrados e fazem login individual.
2. As permissões principais funcionam no **backend e** na interface.
3. As 4 filiais e as 7 áreas podem ser cadastradas e filtradas.
4. Clientes podem ser cadastrados; atendimentos registrados.
5. Processos podem ser cadastrados e vinculados a clientes.
6. Prazos podem ser cadastrados e exibem corretamente as cores e o estado "Vencido".
7. Audiências/eventos aparecem na agenda jurídica.
8. Documentos podem ser vinculados a clientes/processos; checklists e pendências visíveis.
9. Gestores conseguem visualizar pendências com os filtros permitidos.
10. Não há falhas críticas abertas nos fluxos principais; build e banco funcionais.
11. O status técnico está documentado e atualizado em `docs/STATUS_ATUAL_LEXORA.md`.
