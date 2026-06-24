# Backlog pós-go-live — Lexora

> Itens **fora do MVP** ou melhorias identificadas durante a execução das sprints (auditoria 2026-06-23).
> Não bloqueiam a entrega do MVP. Priorização sugerida: **P1** (curto prazo) · **P2** (médio) · **P3** (evolução).

---

## 1. Integrações (pós-MVP — já previstas como fora do escopo)

| Item | Prioridade | Observação |
| --- | --- | --- |
| Gateway de pagamento / Pix / boleto automáticos | P2 | Hoje o pagamento é registrado manualmente (baixa + comprovante) |
| WhatsApp / e-mail automáticos (lembretes de prazo/cobrança) | P2 | Notificações são internas (modelo `Notification` existe) |
| Assinatura digital de contratos | P3 | — |
| Consulta automática a tribunais (andamentos) | P3 | Andamento hoje é manual (`lastProgress`) |
| Portal externo do cliente | P3 | — |
| Recursos de IA (triagem, resumo, sugestões) | P3 | Arquitetura separada permite adicionar sem afetar o isolamento |

## 2. Modelagem e produto

| Item | Prioridade | Observação |
| --- | --- | --- |
| Entidade **Audiência** própria (vs. `DeadlineType.AUDIENCIA` + `hearingAt`) | P2 | Confirmar expectativa do escritório; hoje audiência é tipo de prazo / data no processo |
| Armazenamento de documentos em **S3** (hoje `local`) | P2 | `STORAGE_DRIVER` já suporta `s3`; adaptar para produção em escala |
| Relatórios executivos avançados / mais exportações | P3 | Básico (CSV + breakdowns) já existe |

## 3. Robustez técnica (melhorias observadas)

| Item | Prioridade | Observação |
| --- | --- | --- |
| Tolerar filtro de enum vazio no backend (`view=""`) de forma geral | P1 | Corrigido no frontend de finanças (commit do Sprint 3); `deadlineQuerySchema` tem o mesmo padrão latente (evitado hoje pelo filtro do `/prazos`) — fortalecer no backend para qualquer chamador |
| Migrar config do Prisma para `prisma.config.ts` | P2 | Remove avisos de depreciação; o CLI passa a carregar `.env` corretamente fora da raiz |
| Compilar `sharp` (otimização de imagem do Next) | P3 | Build ignora `sharp`; otimização de imagem fica degradada (não quebra) |
| Localização de enums de status restantes (se houver telas novas) | P3 | `StatusBadge` já cobre os principais (PT-BR) |
| Avaliar upgrade Prisma 6 → 7 | P3 | Major; planejar com testes |

## 4. Operação e segurança (produção)

| Item | Prioridade | Observação |
| --- | --- | --- |
| Backup automatizado + retenção + storage seguro | P1 | Procedimento testado; falta agendar em produção (ver runbook) |
| PITR (WAL archiving) para RPO menor | P2 | Conforme volume real |
| Monitoramento, alertas e métricas de uso | P1 | Definir stack em produção |
| Rotação de segredos e política de senhas | P2 | — |
| Teste de restauração periódico documentado | P1 | Mensal, ambiente isolado |

## 4.1 Segurança — backlog da auditoria (Sprint 10)

| Item | Prioridade | Observação |
| --- | --- | --- |
| CSP estrita no web (`script-src`/`style-src` com nonce) | P2 | Hoje só `frame-ancestors`; nonce exige integração no Next |
| Validação de conteúdo de upload (magic bytes) + antivírus | P2 | Hoje allowlist por MIME declarado + `attachment` + `nosniff` |
| Lockout temporário por conta após N falhas | P2 | Complementa o rate limit por IP já existente |
| Validação de sessão no edge (middleware) | P3 | UX; boundary real já é a API |

## 5. Qualidade contínua

| Item | Prioridade | Observação |
| --- | --- | --- |
| Cobertura de testes E2E dos 5 fluxos (Playwright/Cypress) | P2 | Hoje há testes unitários + integração RLS + validação manual/preview |
| Testes de permissão automatizados por perfil | P2 | Negações 403/401 validadas manualmente nesta auditoria |
| CI (lint/typecheck/test/build) no GitHub Actions | P1 | Após liberar o acesso ao repositório |
