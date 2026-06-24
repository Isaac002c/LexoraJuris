# Checklist de Go-Live — Lexora

> Lista objetiva para levar o Lexora a produção. Cada item tem um **status real**:
> ✅ validado · 🟢 pronto (validado em ambiente local) · 🟧 pendente de infraestrutura · 🟦 pendente de decisão do escritório.
>
> **Situação atual:** o sistema está **pronto para homologação local** e **pronto para implantação,
> condicionado** à configuração de infraestrutura e credenciais de produção. **Go-live em produção
> ainda NÃO pode ser declarado concluído** (ver seções 🟧).

---

## 1. Qualidade do código (validado nesta auditoria)

| Item | Status |
| --- | --- |
| `pnpm typecheck` (6/6 projetos) | ✅ |
| `pnpm lint` (6/6, schema Prisma válido) | ✅ |
| `pnpm test` (24/24, inclui isolamento RLS real) | ✅ |
| `pnpm build` (web 37 rotas + API) | ✅ |

## 2. Banco de dados

| Item | Status |
| --- | --- |
| Migrations aplicam em banco limpo (`pnpm db:deploy`) | ✅ |
| Seed inicial executa sob RLS sem superusuário (`pnpm db:seed`) | ✅ |
| RLS forçado (isolamento por tenant comprovado) | ✅ |
| Role de aplicação **sem** `BYPASSRLS` em produção | 🟧 confirmar no provisionamento |
| PostgreSQL de produção provisionado | 🟧 pendente de infraestrutura |
| Dados iniciais **reais** (17 usuários, 4 filiais, 7 áreas) carregados | 🟧 executar no ambiente real (substituir dados de demonstração) |

## 3. Segurança e configuração

| Item | Status |
| --- | --- |
| Senhas em argon2; tokens em SHA-256; CPF cifrado | ✅ |
| Permissões validadas no backend (403/401) | ✅ |
| `SESSION_SECRET` e `FIELD_ENCRYPTION_KEY` **reais** (não os de exemplo) | 🟧 gerar na implantação |
| `COOKIE_SECURE=true` em produção (HTTPS) | 🟧 definir no `.env` de produção |
| TLS/HTTPS no domínio de produção | 🟧 pendente de infraestrutura |
| `.env`/segredos fora do Git | ✅ (confirmado) |
| `FIELD_ENCRYPTION_KEY` guardada separada do backup | 🟧 procedimento de produção |

## 4. Fluxos do MVP (validados — local)

| Fluxo | Status |
| --- | --- |
| Login + troca de senha no 1º acesso | ✅ |
| Admin: painel, filiais, áreas, usuários, auditoria | 🟢 |
| Secretaria: cadastrar cliente, atendimento, anexar documento | 🟢 (cliente validado ponta a ponta; demais por API/UI) |
| Advogado: processo, prazo, cores/"Vencido" | 🟢 |
| Gestor: filtros por filial/área/responsável, relatórios (escopo de filial) | ✅ |
| Financeiro: contrato, parcelas, pagamento, inadimplência, cobrança | ✅ |
| Cores de prazo e financeiras conforme regra | ✅ |

## 5. Backup e continuidade

| Item | Status |
| --- | --- |
| Procedimento backup/restore testado (`pg_dump`/`pg_restore`) | ✅ |
| Runbook `docs/RUNBOOK_BACKUP_E_RECUPERACAO.md` | ✅ |
| Script `scripts/backup-db.ps1` | ✅ |
| Backup **automatizado** de produção (agendamento + retenção + storage seguro) | 🟧 pendente de infraestrutura |
| Teste de restauração periódico em produção | 🟧 pendente de infraestrutura |

## 6. Deploy

| Item | Status |
| --- | --- |
| Build de produção reproduzível | ✅ |
| `compose.yaml` (PostgreSQL) + Dockerfile da API | ✅ (presentes) |
| Frontend (Vercel ou equivalente) | 🟧 pendente de infraestrutura |
| Variáveis de ambiente de produção | 🟧 pendente |
| Monitoramento/alertas | 🟧 pendente de infraestrutura |
| Envio dos commits ao GitHub (`git push`) | 🟧 **pendente de acesso de escrita** (ver seção 7) |

## 7. Pendências externas (decisão/credencial humana)

| Item | Responsável | Status |
| --- | --- | --- |
| Acesso de escrita ao repositório `Isaac002c/LexoraJuris` | Dono do repositório | 🟧 push bloqueado (403) — commits locais prontos |
| Endereço/domínio de produção | Escritório/TI | 🟦 a definir |
| Canal de suporte interno | Escritório | 🟦 a definir |
| Senhas reais dos 17 usuários | Administradores | 🟦 a definir |

## 8. Treinamento

| Item | Status |
| --- | --- |
| Guia rápido por perfil (`docs/GUIA_RAPIDO_LEXORA.md`) | ✅ material pronto |
| Checklist de treinamento por usuário | ✅ modelo pronto |
| Treinamento humano executado | 🟦 **não realizado** (a conduzir com os usuários) |

## 9. Critério de "pronto para produção"

Marcar **somente** quando todos os 🟧 de infraestrutura/segurança estiverem resolvidos:
provisionamento do PostgreSQL, segredos reais, `COOKIE_SECURE=true`, TLS, backup automatizado,
deploy publicado e smoke test dos fluxos no ambiente real. Até lá, o status correto é
**"pronto para implantação, condicionado a infraestrutura e credenciais"**.
