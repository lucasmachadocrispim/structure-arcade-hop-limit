# HOP LIMIT · Squad Structure

Protótipo gamificado para facilitação do acesso à educação em tecnologia, desenvolvido para a avaliação somativa **SAP1-DEVOPS** (Faculdade SENAI · 2º ADS · Integração e Entrega Contínua) e para o **Desafio Framework Arcade**.

## O jogo

**HOP LIMIT** é um jogo educativo em que o jogador controla um pacote de rede que precisa atravessar dispositivos (firewalls, roteadores, switches, servidores DNS, NAT) escolhendo, em cada ramificação, o caminho cuja configuração **permite** a passagem. Cada erro custa uma vida; o pacote explode ao perder todas.

Cada rodada apresenta um pacote com atributos (IP de origem, MAC, porta de destino, VLAN, TTL, DSCP…) e 2–7 dispositivos, cada um com uma configuração de rede. O jogador lê a config e decide: passa ou não passa. Conceitos cobrados: IP, porta, TCP/UDP, MAC, máscara, CIDR, gateway, broadcast, DHCP, ACL, NAT, PAT, DNS, ICMP, VLAN, trunk, tabela de rotas, OSPF, BGP, AS, VPN, TLS, QoS, TTL.

## Stack

- **Jogo:** HTML5 + [Phaser 3.80](https://phaser.io/) (via CDN), JavaScript puro
- **Testes:** [Vitest](https://vitest.dev/) (unidade e integração) + [Playwright](https://playwright.dev/) (E2E)
- **Pipeline:** GitHub Actions
- **Hospedagem:** GitHub Pages (branch `gh-pages`)
- **Node:** ≥ 22

## Como rodar localmente

```bash
npm ci
npm run dev        # abre em http://localhost:5173
npm test           # roda unidade + integração
npm run test:e2e   # roda Playwright (precisa de navegador instalado)
npm run build      # gera dist/
```

Sem Node, abra `index.html` diretamente no navegador (o jogo funciona offline).

## Estratégia de branching

GitHub Flow enxuto:

- `main` protegida: só entra por Pull Request com 1 aprovação e CI verde.
- Branches curtas: `feature/<escopo>`, `fix/<escopo>`, `ci/<escopo>`, `docs/<escopo>`.
- Commits no padrão [Conventional Commits](https://www.conventionalcommits.org/pt-br/v1.0.0/).
- Tags SemVer anotadas: `v0.1.0` na prévia, `v1.0.0` na entrega.

## Ambientes

| Ambiente     | URL                                                                       | Origem                            |
|--------------|---------------------------------------------------------------------------|-----------------------------------|
| Homologação  | https://lucasmachadocrispim.github.io/structure-arcade-hop-limit/hml/     | último build da `main`            |
| Produção     | https://lucasmachadocrispim.github.io/structure-arcade-hop-limit/         | release aprovada, entrega canário |
| Painel       | https://lucasmachadocrispim.github.io/structure-arcade-hop-limit/status/  | sondas + métricas DORA            |

## Esteira CI/CD

Ver [`docs/relatorio.md`](docs/relatorio.md) para o relatório técnico completo.

```
commit → PR → CI (lint, testes, segredos, SBOM, build, GDD.pdf)
       → homologação no Pages + E2E
       → aprovação manual (environment "producao")
       → produção canário 10% → smoke → 100%
       → monitor.yml (schedule 15 min) → alertas como Issues
```

Rollback: workflow `rollback.yml` ou automático se o smoke falhar em produção.

## Equipe

Ver [`SQUAD.md`](SQUAD.md).

## Licença

MIT — ver [`LICENSE`](LICENSE). Ativos de terceiros em [`THIRD_PARTY.md`](THIRD_PARTY.md).