#!/usr/bin/env bash
# Manipula o rollout.json no branch gh-pages.
#
# Uso:
#   rollout.sh canario <sha> <percentual>   abre canário
#   rollout.sh promover                     canário -> estável (100%)
#   rollout.sh rollback                     estável <- anterior, canário zerado
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

# cria ou inicializa rollout.json
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
    jq --arg sha "$sha" '.estavel = $sha | .canario = null | .percentual = 0' \
       rollout.json > tmp.json && mv tmp.json rollout.json
    ;;
  rollback)
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