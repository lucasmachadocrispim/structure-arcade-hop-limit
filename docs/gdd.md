# HOP LIMIT · Game Design Document

**Squad:** Structure
**Integrantes:** Ana Lívia dos Santos Lopes (26180945) · Jacquys Barbosa da Silva (26179857) · Lucas Machado Crispim (26179871) · Luis Gustavo Cesar Consoli de Almeida (26180137)
**Versão:** 1.0.0 · **Data:** 07/10/2026
**Repositório:** https://github.com/lucasmachadocrispim/structure-arcade-hop-limit

---

## 1. Premissa e problema endereçado

O ensino de redes de computadores é, com frequência, abstrato: o estudante decora listas de regras de ACL, máscaras de sub-rede e nomes de protocolos sem entender **por que** um pacote é aceito ou bloqueado em uma configuração real.

**HOP LIMIT** transforma essa abstração em uma decisão visual e concreta. O jogador encarna um pacote de dados e precisa escolher, em cada bifurcação de uma rede, qual dispositivo permite a passagem — lendo a configuração de cada um (ACL, NAT, VLAN, tabela de rotas, política de TLS…). Cada acerto avança o pacote; cada erro custa uma vida e mostra, em vermelho, exatamente qual regra bloqueou.

**Público-alvo:** estudantes iniciantes de redes, cursos técnicos e de graduação em TI, e autodidatas que estão estudando para certificações introdutórias (CCNA, CompTIA Network+).

**Por que gamificação?** Errar em um simulador real é caro e confuso; errar em um jogo é seguro, imediato e feedback-driven. A mecânica de "leia a config, decida, veja o motivo do bloqueio" treina exatamente a habilidade avaliada em provas e no trabalho: **interpretar regras de rede**.

---

## 2. High Concept

**HOP LIMIT** é um jogo 2D de raciocínio rápido em que você controla um pacote de dados atravessando dispositivos de rede. Em cada ramificação, dois ou mais dispositivos mostram sua configuração real (ACL, rota, VLAN, NAT, política de TLS, DSCP…) e você precisa decidir por qual passar. A etiqueta do pacote (IP de origem, MAC, porta, TTL, VLAN) fica visível o tempo todo; o dispositivo cuja configuração **permite** esse pacote específico é o caminho certo. Cada zona do jogo introduz de 4 a 9 conceitos novos, misturando combinados nas fases finais. A dificuldade vem da leitura atenta, não da destreza manual: é um jogo que ensina redes ensinando a **ler redes**.

---

## 3. Gênero e plataforma

- **Gênero:** puzzle / educacional, com elementos de raciocínio em tempo limitado.
- **Plataforma:** web (desktop e mobile), navegável pelo navegador sem instalação.
- **Stack:** HTML5 + JavaScript (ES Modules) + Phaser 3.80 (via CDN).
- **Testes:** Vitest (unidade, integração) + Playwright (E2E).
- **Build:** estático, publicado em GitHub Pages.

---

## 4. Mecânicas-core

### Loop principal

1. O jogo sorteia um pacote com atributos (IP, MAC, porta, VLAN, TTL, etc.).
2. A ramificação apresenta **2 a 7 dispositivos**, cada um com uma configuração de rede.
3. **Exatamente um** dispositivo aceita esse pacote específico.
4. O jogador lê a config e escolhe o caminho.
5. Acerto → o pacote atravessa e avança. Erro → o jogo mostra, em vermelho, a linha que bloqueia; o jogador perde uma vida.
6. A cada 5 ramificações (uma "zona"), novos conceitos são introduzidos.

### Progressão

- **5 zonas**, cada uma com 5 ramificações.
- Zona 1: IP, porta, TCP, UDP.
- Zona 2: máscara, CIDR, gateway, broadcast.
- Zona 3: ACL, NAT, PAT, DNS.
- Zona 4: MAC, VLAN, trunk, DHCP.
- Zona 5: OSPF, rotas, BGP, AS, VPN, TLS, QoS, TTL, ICMP.

A partir da zona 3, dois ou mais conceitos podem ser cobrados no mesmo dispositivo.

### Vitória e derrota

- **Vitória:** chegar ao destino final após atravessar as 5 zonas.
- **Derrota:** perder todas as 5 vidas. O pacote explode e a partida termina.

### Modo Infinito

Liberado após a primeira vitória. O jogo segue indefinidamente, aumentando o número de dispositivos por ramificação e reduzindo o tempo. Guarda o recorde de distância.

### Recompensas

- **Byto-Coins:** moeda ganha a cada acerto (bônus por combo, por tempo curto, por zona perfeita).
- **Relíquias:** itens compráveis entre zonas que alteram a partida (vida extra, tempo maior, desconto na loja, etc.).
- **Codex:** enciclopédia de 25 conceitos que se desbloqueia conforme aparecem no jogo.

### Sistema de pontuação

- Cada acerto = 1 a 2 moedas (dependendo do tempo e da sequência).
- Sequências de 3+ acertos = bônus.
- Zona completa sem perder vida = +1 vida ou bônus em moedas.

---

## 5. Enredo e personagens

### Contexto

Você é um pacote de dados em trânsito. Precisa sair da máquina de origem e chegar a um servidor na internet, atravessando uma rede corporativa e depois a internet pública. No caminho, cada dispositivo é um porteiro com uma lista de regras.

### Personagens

- **O Pacote (jogador):** caixa de papelão com fita adesiva e etiqueta. A cor pode ser escolhida. Sofre rachaduras conforme perde vidas.
- **Byto:** mascote-guia, um pequeno robô feito de código binário. Aparece no tutorial, nas lojas entre zonas e ao final, dando dicas e reagindo ao desempenho do jogador.
- **Os Dispositivos:** firewalls, roteadores, switches, servidores DNS, NATs e gateways. Não falam — mostram sua configuração.

### Cenário

Parallax em camadas com silhuetas de racks, torres de servidor, cabos e antenas, mudando de paleta a cada zona.

---

## 6. Fluxo do jogo

```
Menu principal
  ├── Iniciar → Tutorial (Byto) → Modo Tempo? → Guia de cores?
  │                                          ↓
  │                                     Zona 1 (5 ramos)
  │                                          ↓
  │                                     Loja entre zonas
  │                                          ↓
  │                                     Zona 2 … Zona 5
  │                                          ↓
  │                                     Chegada ao destino → Vitória
  │                                          ↓
  │                                     Menu final (Modo Infinito / Reiniciar / Menu)
  ├── Codex (25 conceitos, abas laterais, desbloqueio progressivo)
  ├── Configurações (som, música, modo tempo, tutorial, guia de cores, debug, apagar progresso)
  └── Cor do pacote (10 opções)
```

Estados adicionais durante a partida: pausa pelo Codex, "toque para pular" em animações, pop-up de relíquia ao comprar na loja.

---

## 7. Level design

O jogo não tem mapa fixo: cada ramificação é **gerada proceduralmente** a partir de um pacote aleatório e de um conjunto de conceitos da zona atual.

- **Número de dispositivos por ramificação:** `[3, 3, 4, 4, 5]` para as zonas 1–5, com até +1 aleatório.
- **Tipos de dispositivo:** `acl`, `rota`, `vlan`, `dns`, `nat`, `srv`, `gw`, sorteados.
- **Config por dispositivo:** uma ou mais linhas, geradas com **uma linha deliberadamente bloqueante** (falha) ou **sem bloqueio** (o caminho certo).
- **Dificuldade crescente:**
  - Zona 1: 1 conceito por dispositivo.
  - Zonas 2–4: até 2 conceitos por dispositivo.
  - Zona 5: até 3 conceitos por dispositivo.
- **Modo Infinito:** até 7 dispositivos por ramificação, conceitos sorteados de todas as zonas.

---

## 8. Interface (UI/UX)

### Elementos fixos na tela

- **Topo:** mapa de zonas e número do ramo atual.
- **Barra de tempo:** abaixo do mapa, quando o modo tempo está ativo.
- **Rodapé (mobile) / canto (desktop):** corações de vida, contador de moedas, três slots de relíquia.
- **Etiqueta do pacote:** painel com os atributos do pacote atual (ID, src, dport, tcp/udp, etc.).
- **Bloco de config:** ao lado do dispositivo sob o cursor, com a configuração formatada e a linha bloqueante em vermelho.
- **Byto:** mascote com balão de fala, canto inferior.

### Acessibilidade

- **Guia de cores:** cada conceito tem uma cor própria, e a cor aparece tanto na etiqueta do pacote quanto nas linhas da config que casam com ele (pode ser desligada nas Configurações).
- **Modo texto primeiro:** toda decisão pode ser tomada lendo, sem depender de reflexo.
- **Fontes grandes e alto contraste** no HUD.
- **"Toque para pular"** nas animações de tutorial.
- **Legendas no vídeo pitch.**
- **Sem coleta de dados pessoais** — todo progresso é local (`localStorage`).

---

## 9. Áudio e música

Todo o áudio é **sintetizado em tempo real** pela Web Audio API. Nenhum arquivo de áudio é incorporado.

- **Trilha procedural:** tema de 8 notas tocado em 5 variações (menu, calma, tensa, épica, vitória) com andamento, timbre e efeitos diferentes. O andamento acompanha a fase; o "ducking" abaixa a música quando um efeito grande toca.
- **Efeitos sonoros:** clique, hover, acerto, erro, explosão, fanfarra de vitória, moedas, "whoosh" de movimento.
- **Ambiente da loja:** reverberação e drones leves para diferenciar a atmosfera.

Ver `THIRD_PARTY.md` para licenças (nenhum ativo de terceiros).

---

## 10. Arte e referências visuais

- **Todo o visual é procedural:** retângulos, triângulos, textos formatados com `Phaser.Graphics` e `Phaser.Text`. Não há sprites externos.
- **Paleta do pacote:** 10 cores, com sombreamento calculado em runtime.
- **Cenários:** silhuetas de racks, servidores, torres e cabos, desenhadas por código.

### Referências do protótipo

- **Mini Metro** (Dinosaur Polo Club) — leitura visual de linhas e decisão rápida.
- **Human Resource Machine** (Tomorrow Corporation) — quebra-cabeça com linguagem técnica.
- **Shenzhen I/O** (Zachtronics) — satisfação de interpretar uma configuração técnica.
- **Networking All-in-One For Dummies** — referência didática de conteúdo.
- **Cisco Networking Academy** — terminologia de ACL, VLAN e comandos Cisco.

---

## 11. Esteira

```
commit → PR → CI (lint · testes · segredos · SBOM · build · GDD.pdf)
       → deploy homologação (Pages /hml/ + E2E)
       → aprovação manual (environment "producao")
       → deploy produção canário 10% → smoke → 100%
       → monitor.yml (agenda 15 min) → alertas como Issues
```

Rollback: workflow `rollback.yml` acionável ou automático se o smoke falhar.

Ver `docs/relatorio.md` para o relatório técnico completo.

---

## 12. Uso de IA e licenças

Ver `AI-USAGE.md` e `THIRD_PARTY.md`. Todo conteúdo gerado por IA foi revisado por humano. Nenhum ativo de terceiros é usado sem licença compatível.