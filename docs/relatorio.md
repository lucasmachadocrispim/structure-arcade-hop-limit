# Relatório técnico · HOP LIMIT · Squad Structure

**Avaliação:** SAP1-DEVOPS · 09/10/2026
**Squad:** Structure
**Repositório:** https://github.com/lucasmachadocrispim/structure-arcade-hop-limit

---

## 1. Visão geral

O **HOP LIMIT** é um jogo educacional de redes de computadores. O jogador controla um pacote de dados que precisa atravessar dispositivos de rede escolhendo, em cada ramificação, o caminho cuja configuração permite a passagem. O jogo cobre 25 conceitos, distribuídos em 5 zonas, com modo infinito após a primeira vitória.

Este relatório descreve a esteira DevOps que leva o jogo do commit à produção, com testes, releases versionadas, ambientes, entrega canário e rollback.

## 2. Arquitetura da esteira

```
desenvolvimento local (Git + Node.js)
        ↓
   branch feature/* → PR → main (protegida)
        ↓
   GitHub Actions · job "ci"
        lint · testes unit+integração · gitleaks · npm audit · SBOM · build · GDD.pdf
        ↓
   artefato build-<sha> (build.zip + GDD.pdf + reports/)
        ↓
   job "deploy-hml" · publica em gh-pages/hml/ + E2E Playwright
        ↓
   environment "producao" (revisor obrigatório)
        ↓
   job "deploy-prd" · publica em gh-pages/releases/<sha>/ + canário 10% + smoke
        ↓
   job "release" (só em tag v*.*.*) · GitHub Release com artefatos
        ↓
   monitor.yml (agenda 15 min) · sonda + alertas como Issues
```

### Decisões e alternativas descartadas

| Decisão | Alternativa descartada | Por quê |
|---|---|---|
| Phaser via CDN | npm + bundler (Vite/Rollup) | Simplifica o build, sem etapa de empacotamento no CI. |
| `build.zip` estático | Container Docker | O Pages só serve site estático. Docker seria mais complexo para um jogo web puro. |
| Branch `gh-pages` com pastas por release | Vercel/Netlify | Sem custo e sem conta externa, dentro do GitHub. |
| Workflow `monitor.yml` agendado | Prometheus/Grafana | Sem servidor. Sondas do Actions bastam para o escopo. |
| Rollback por `rollout.json` | Rollback recompilando | Rollback é trocar um ponteiro — instantâneo. |
| Canário por percentual no `localStorage` | Canário por borda (CDN) | O Pages não tem split de tráfego; o ponteiro no cliente é a forma viável. |

## 3. Estrutura do repositório

Ver `README.md` para a árvore completa. Destaques:

- `src/main.js` — código do jogo (Phaser).
- `src/core/` — funções puras testáveis (`utils`, `constants`, `packet`, `generator`).
- `src/content/concepts.json` — manifesto dos 25 conceitos.
- `tests/unit/`, `tests/integration/`, `tests/e2e/` — pirâmide de testes.
- `.github/workflows/` — esteira, rollback e monitor.
- `scripts/` — `publicar.sh`, `rollout.sh`, `dora.mjs`, `triagem.sh`, `build.js`, `gdd-pdf.js`.
- `pages/` — `index.html` (carregador), `rollout.json`, `status/index.html`.

## 4. Como reproduzir

```bash
git clone https://github.com/lucasmachadocrispim/structure-arcade-hop-limit
cd structure-arcade-hop-limit
npm ci
npm test           # unidade + integração
npm run test:e2e   # E2E
npm run build      # gera dist/
```

## 5. Evidências dos integráveis

### INT-01 · Repositório e fluxo Git

- Repositório público, 4 colaboradores + professor com leitura.
- `main` protegida: 1 aprovação + status check `ci` obrigatórios.
- Conventional Commits, tags anotadas `v0.1.0` e `v1.0.0`.

**Prints:**
- `[ ]` Histórico de PRs revisados
- `[ ]` Configuração da proteção de branch
- `[ ]` Saída de `git log --oneline v0.1.0..v1.0.0`

### INT-02 · GDD como código

- `docs/gdd.md` versionado, atualizado por PR.
- Pipeline gera `docs/GDD.pdf` a cada push.

**Prints:**
- `[ ]` `docs/gdd.md` no repositório
- `[ ]` Estágio `gdd:pdf` verde no CI
- `[ ]` `GDD.pdf` como artefato do build

### INT-03 · Pipeline CI/CD

- `.github/workflows/esteira.yml` com jobs `ci`, `deploy-hml`, `deploy-prd`, `release`.
- Disparo por `push` e `pull_request`; permissões mínimas; credenciais em secrets.

**Prints:**
- `[ ]` Execução verde completa
- `[ ]` Tempo total ≤ 15 min
- `[ ]` Detalhes do job `ci`

### INT-04 · Testes automatizados

- 20+ testes de unidade em `src/core/`.
- 8 testes de integração em `concepts.json`.
- 2 cenários E2E (smoke + regressão) em Playwright.
- Cobertura mínima de 70% em `src/core/`.

**Prints:**
- `[ ]` Relatório JUnit
- `[ ]` Relatório de cobertura
- `[ ]` Playwright HTML report

**Bug real encontrado por teste:**
> `[ ]` descrever o bug, o teste que capturou e o PR de correção.

### INT-05 · Segurança, licenças e IA

- `gitleaks` na pipeline.
- `npm audit --omit=dev --audit-level=critical`.
- SBOM CycloneDX como artefato.
- `THIRD_PARTY.md`, `AI-USAGE.md`, `LICENSE`.

**Prints:**
- `[ ]` Estágio `gitleaks` verde
- `[ ]` Estágio `npm audit` verde
- `[ ]` Artefato `sbom.json`

### INT-06 · Release versionada

- Build reprodutível: `npm ci && npm run build`.
- `dist/version.json` com SemVer + SHA + data.
- `build.zip` + SHA-256 como artefato.
- GitHub Release com anexos.

**Prints:**
- `[ ]` Página da release `v1.0.0`
- `[ ]` `version.json` do build
- `[ ]` Comparação de dois builds do mesmo commit (mesmo conteúdo)

### INT-07 · Ambientes e rollback

- `gh-pages` com `/hml/`, `/releases/<sha>/`, `/rollout.json`.
- Canário 10% → promoção a 100%.
- `rollback.yml` acionável; rollback automático se o smoke falhar.

**Prints:**
- `[ ]` Estrutura de pastas do `gh-pages`
- `[ ]` `rollout.json` antes e depois do canário
- `[ ]` Timeline do `rollout.json` (commits)
- `[ ]` Vídeo/print do rollback cronometrado (< 5 min)

### INT-08 · Monitoramento

- `monitor.yml` agendado.
- 2 alertas como Issues (`JogoForaDoAr`, `LatenciaAlta`) com auto-fechamento.
- Painel `/status/`.
- Relatório DORA em `reports/dora.json`.

**Prints:**
- `[ ]` Issue de alerta aberta e fechada
- `[ ]` Painel `/status/` com dados
- `[ ]` `reports/dora.json`

### INT-09 · Build pública e pacote

- `triagem.sh` verde.
- Pacote em `submissao/` com manifesto SHA-256.

**Prints:**
- `[ ]` Saída de `triagem.sh` com TRIAGEM APROVADA
- `[ ]` Pasta `submissao/` completa

### INT-10 · Vídeo e relatório

- `pitch.mp4` ≤ 90 s com legendas.
- Este relatório.

**Prints:**
- `[ ]` `pitch.mp4` no pacote
- `[ ]` Saída de `ffprobe` mostrando ≤ 90 s

## 6. Métricas DORA

Após a tag `v1.0.0`:

```json
{
  "frequenciaDeployPorSemana": "—",
  "leadTimeDias": "—",
  "taxaFalha": "—",
  "mttrHoras": "—"
}
```

**Comparação com a linha de base da Carparts (lead time de 11 dias):**
> `[ ]` o squad preenche após rodar `scripts/dora.mjs`.

## 7. Retrospectiva

**O que funcionou bem:**
- `[ ]`
- `[ ]`

**O que não funcionou:**
- `[ ]`
- `[ ]`

**O que faríamos diferente:**
- `[ ]`
- `[ ]`

**Uma decisão orientada por métrica (INT-08):**
> `[ ]` descrever a decisão e o efeito medido.

## 8. Contribuição individual

| Integrante | Integráveis principais | PRs |
|---|---|---|
| Ana Lívia dos Santos Lopes | INT-02, INT-10 | `[ ]` links |
| Jacquys Barbosa da Silva | INT-04 | `[ ]` links |
| Lucas Machado Crispim | INT-03, INT-06, INT-07 | `[ ]` links |
| Luis Gustavo Cesar Consoli de Almeida | INT-05, INT-08, INT-09 | `[ ]` links |

---

**Squad Structure · Faculdade SENAI · 2026**