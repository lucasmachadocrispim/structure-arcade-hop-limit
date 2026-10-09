#!/usr/bin/env bash
# Manipula o rollout.json no branch gh-pages. Nunca falha por arquivo vazio.
set -euo pipefail

ACAO="${1:?ação: canario|promover|rollback}"
SHA="${2:-}"
PCT="${3:-10}"

BRANCH="gh-pages"
REPO_DIR="${PWD}"
WORKTREE="$(mktemp -d)"

if ! git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "✗ branch $BRANCH não existe"; exit 1
fi

git fetch origin "$BRANCH" --quiet
git worktree add "$WORKTREE" "origin/$BRANCH" --detach >/dev/null
cd "$WORKTREE"

# Lê estado atual (defaults se arquivo estiver vazio ou inválido)
ESTAVEL="null"; ANTERIOR="null"; CANARIO="null"; PERCENTUAL="0"
if [ -s rollout.json ]; then
  ESTAVEL=$(jq -r '.estavel // "null"' rollout.json 2>/dev/null || echo "null")
  ANTERIOR=$(jq -r '.anterior // "null"' rollout.json 2>/dev/null || echo "null")
  CANARIO=$(jq -r '.canario // "null"' rollout.json 2>/dev/null || echo "null")
  PERCENTUAL=$(jq -r '.percentual // 0' rollout.json 2>/dev/null || echo "0")
fi

case "$ACAO" in
  canario)
    if [ "$ESTAVEL" != "null" ] && [ -n "$ESTAVEL" ]; then ANTERIOR="$ESTAVEL"; fi
    CANARIO="$SHA"; PERCENTUAL="$PCT"
    ;;
  promover)
    if [ "$CANARIO" = "null" ] || [ -z "$CANARIO" ]; then
      echo "⚠ sem canário — nada a promover"
      cd "$REPO_DIR" && git worktree remove "$WORKTREE" --force && exit 0
    fi
    ANTERIOR="$ESTAVEL"; ESTAVEL="$CANARIO"; CANARIO="null"; PERCENTUAL="0"
    ;;
  rollback)
    if [ "$ANTERIOR" = "null" ] || [ -z "$ANTERIOR" ]; then
      echo "⚠ sem versão anterior — nada a fazer"
      cd "$REPO_DIR" && git worktree remove "$WORKTREE" --force && exit 0
    fi
    ESTAVEL="$ANTERIOR"; CANARIO="null"; PERCENTUAL="0"
    ;;
  *) echo "✗ ação desconhecida: $ACAO"; exit 1;;
esac

# Escreve JSON SEMPRE válido
printf '{\n  "estavel": %s,\n  "anterior": %s,\n  "canario": %s,\n  "percentual": %s\n}\n' \
  "$([ "$ESTAVEL" = "null" ] && echo null || echo "\"$ESTAVEL\"")" \
  "$([ "$ANTERIOR" = "null" ] && echo null || echo "\"$ANTERIOR\"")" \
  "$([ "$CANARIO" = "null" ] && echo null || echo "\"$CANARIO\"")" \
  "$PERCENTUAL" > rollout.json

echo "→ rollout.json:"; cat rollout.json

git add rollout.json
git -c user.name="rollout-bot" -c user.email="rollout@users.noreply.github.com" \
    commit -qm "rollout: $ACAO ${SHA:-auto} por ${GITHUB_ACTOR:-local}" || echo "→ sem mudanças a commitar"
git push origin HEAD:"$BRANCH" --quiet

cd "$REPO_DIR"
git worktree remove "$WORKTREE" --force
echo "✓ rollout: $ACAO"