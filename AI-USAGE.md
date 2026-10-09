# Registro de uso de IA generativa

Em conformidade com os itens 14.1 e 14.2 do Regulamento Framework Arcade e com a seção 11 do GDD da UC.

| Data       | Ferramenta | Integrante | Finalidade                              | Prompt (resumo)                                                                  | Resultado aceito                                    | Revisão humana                                                       | Commit/PR |
|------------|------------|------------|------------------------------------------|----------------------------------------------------------------------------------|-----------------------------------------------------|----------------------------------------------------------------------|-----------|
| 2026-09-21 | Claude     | Lucas      | Geração inicial do protótipo do jogo     | "Jogo educativo em Phaser sobre roteamento de pacotes, com 25 conceitos de rede." | Base do `Hop_Limit.html` (motor, cenas, dados, áudio) | Revisão de conteúdo técnico de redes por toda a equipe; ajustes de UX | —         |
| 2026-10-03 | Claude     | Lucas      | Extração de lógica pura para `src/core/` | "Separe as funções puras do jogo em módulos ES testáveis, sem alterar comportamento." | `src/core/*.js`                                     | Verificação de que o jogo continua idêntico                           | —         |
| 2026-10-04 | Claude     | Jacquys    | Redação dos testes de unidade            | "Escreva testes Vitest cobrindo utils, constants, packet e generator."           | `tests/unit/*.test.js`                              | Revisão caso a caso; remoção de asserções redundantes                 | —         |
| 2026-10-05 | Claude     | Ana        | Estruturação do GDD                      | "Organize o GDD conforme o item 6.3.a do regulamento."                           | `docs/gdd.md` v1                                    | Preenchimento dos campos autorais (premissa, público-alvo)            | —         |
| 2026-10-06 | DeepSeek   | Lucas      | Organização da entrega DevOps            | "Liste os arquivos, workflows e passos para entregar os 10 integráveis em 09/10." | Checklist de entrega e ordem de execução            | Validação de cada item contra a rubrica                               | —         |
| 2026-10-07 | Claude     | Luis       | Workflows do GitHub Actions              | "Gere esteira CI/CD no GitHub Pages com canário, rollback e monitor."            | `.github/workflows/*.yml`                           | Teste real de cada workflow na esteira                                | —         |

## Declaração

Confirmamos que:

1. Temos direito de uso das ferramentas de IA listadas acima (contas próprias, planos gratuitos e/ou pagos pelos integrantes).
2. Todo conteúdo gerado por IA foi **revisado por um humano** antes do merge.
3. Nenhum texto, imagem, áudio ou trecho de código gerado imita personagens, marcas ou obras de terceiros.
4. Nenhuma obra protegida foi reproduzida — todo ativo do jogo é original ou gerado proceduralmente.
5. Este arquivo é mantido atualizado a cada novo uso relevante de IA.