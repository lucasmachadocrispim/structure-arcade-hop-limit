```markdown
# Componentes de terceiros e licenças

Todos os componentes abaixo são usados sob suas respectivas licenças, compatíveis com uso público e redistribuição no contexto deste protótipo.

## Bibliotecas de runtime (rodam no jogo)

| Componente | Versão | Uso | Licença | Autor / Origem |
|---|---|---|---|---|
| Phaser | 3.80.1 | Engine de jogos HTML5 (Canvas/WebGL) | MIT | Photon Storm Ltd · https://phaser.io/ |

## Bibliotecas de desenvolvimento (não vão para o build final)

| Componente | Versão | Uso | Licença | Autor / Origem |
|---|---|---|---|---|
| Vitest | ^2.1.0 | Testes de unidade e integração | MIT | Vitest Team · https://vitest.dev |
| @vitest/coverage-v8 | ^2.1.0 | Relatório de cobertura | MIT | Vitest Team |
| Playwright | ^1.48.0 | Testes E2E | Apache-2.0 | Microsoft · https://playwright.dev |
| serve | ^14.2.0 | Servidor estático para dev/E2E | MIT | Vercel |
| jsdom | ^25.0.0 | Ambiente DOM para Vitest | MIT | jsdom team |

## Fontes tipográficas

| Fonte | Uso | Licença | Origem |
|---|---|---|---|
| Arial, Arial Black | Texto do jogo (família do sistema) | Fornecida pelo SO, não redistribuída | — |
| Courier New | HUD e blocos de código | Fornecida pelo SO, não redistribuída | — |
| Newsreader, Inter, IBM Plex Mono | Somente no `avaliacao.html` (documento da UC, fora do jogo) | SIL OFL 1.1 | Google Fonts |

## Áudio

Todo o áudio é **sintetizado em tempo real** pela Web Audio API do navegador (osciladores, ruído branco, filtros). **Nenhum arquivo de som de terceiros é incorporado.** A trilha é procedural, gerada por código, sem samples externos.

## Imagens e sprites

Todo o visual do jogo é **desenhado proceduralmente** com `Phaser.Graphics` e `Phaser.Text` (retângulos, triângulos, textos). **Nenhum sprite, spritesheet ou imagem de terceiros é incorporado.**

## Ferramentas de IA

Ver [`AI-USAGE.md`](AI-USAGE.md). Nenhuma obra protegida de terceiros foi gerada ou reproduzida por IA.

## Declaração

Declaramos que o Squad Structure detém os direitos de uso sobre todos os materiais listados e que este protótipo não configura plágio nem violação de direitos autorais, marcários ou de propriedade intelectual de terceiros.