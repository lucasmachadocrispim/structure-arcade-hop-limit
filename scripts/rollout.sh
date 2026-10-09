#!/usr/bin/env bash
# Manipula o rollout.json no branch gh-pages.
#
# Uso:
#   rollout.sh canario <sha> <percentual>   abre canário
#   rollout.sh promover                     canário -> estável (100%)
#   rollout.sh rollback                     estável <- anterior (se existir), canário zerado
#
set -euo pipefail

ACAO="${1:?ação obrigatória: canario|promover|rollback}"
SHA="${2:-}"
PCT="${3:-10}"

BRANCH="gh-pages"
REPO_DIR="${PWD}"
WORKTREE="$(mktemp -d)"

git fetch origin "$BRANCH" --quiet
git worktree add "$WORKTREE" "origin/$BRANCH" --detach >/dev/null
cd "$WORKTREE"

[ -f rollout.json ] || echo '{"estavel":null,"anterior":null,"canario":null,"percentual":0}' > rollout.json

case "$ACAO" in
  canario)
    anterior=$(jq -r '.estavel' rollout.json)
    jq --arg sha "$SHA" --arg ant "$anterior" --argjson pct "$PCT" \
       '.anterior = $ant | .canario = $sha | .percentual = $pct' \
       rollout.json > tmp.json && mv tmp.json rollout.json
    ;;
  promover)
    sha=$(jq -r '.canario' rollout.json)
    # se não havia canário, mantém o estável atual (evita null)
    if [ -z "$sha" ] || [ "$sha" = "null" ]; then
      echo "⚠ sem canário aberto — nada a promover"
      cd "$REPO_DIR" && git worktree remove "$WORKTREE" --force && exit 0
    fi
    jq --arg sha "$sha" '.estavel = $sha | .canario = null | .percentual = 0' \
       rollout.json > tmp.json && mv tmp.json rollout.json
    ;;
  rollback)
    atual=$(jq -r '.estavel' rollout.json)
    anterior=$(jq -r '.anterior' rollout.json)
    # se anterior for null/vazio e estavel também, não faz nada (primeiro deploy)
    if [ -z "$anterior" ] || [ "$anterior" = "null" ]; then
      if [ -z "$atual" ] || [ "$atual" = "null" ]; then
        echo "⚠ primeiro deploy — sem versão anterior para rollback; mantendo"
        cd "$REPO_DIR" && git worktree remove "$WORKTREE" --force && exit 0
      fi
      echo "⚠ sem versão anterior — mantendo estável atual ($atual)"
      cd "$REPO_DIR" && git worktree remove "$WORKTREE" --force && exit 0
    fi
    jq '.estavel = .anterior | .canario = null | .percentual = 0' \
       rollout.json > tmp.json && mv tmp.json rollout.json
    ;;
  *) echo "✗ ação desconhecida: $ACAO"; exit 1;;
esac

MSG="rollout: $ACAO ${SHA:-(auto)} por ${GITHUB_ACTOR:-local} em $(date -u +%FT%TZ)"
git add rollout.json
git -c user.name="rollout-bot" -c user.email="rollout@users.noreply.github.com" commit -qm "$MSG"
git push origin HEAD:"$BRANCH" --quiet

cd "$REPO_DIR"
git worktree remove "$WORKTREE" --force
echo "✓ rollout: $MSG"