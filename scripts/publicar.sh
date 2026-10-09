#!/usr/bin/env bash
# Publica um build.zip no branch gh-pages.
#
# Uso:
#   publicar.sh hml <build.zip>                -> gh-pages/hml/
#   publicar.sh release <build.zip> <sha>      -> gh-pages/releases/<sha>/
#
set -euo pipefail

MODO="${1:?modo obrigatório: hml|release}"
ZIP="${2:?caminho do build.zip obrigatório}"
SHA="${3:-}"

BRANCH="gh-pages"
REPO_DIR="${PWD}"
WORKTREE="$(mktemp -d)"

if [ "$MODO" = "release" ] && [ -z "$SHA" ]; then
  echo "✗ modo release exige <sha>"
  exit 1
fi

# garante que o branch gh-pages existe
if ! git ls-remote --exit-code --heads origin "$BRANCH" >/dev/null 2>&1; then
  echo "→ criando branch $BRANCH"
  git worktree add -B "$BRANCH" "$WORKTREE" >/dev/null
  (cd "$WORKTREE" && git -c user.name="esteira-bot" -c user.email="esteira@users.noreply.github.com" commit --allow-empty -qm "ci: inicia $BRANCH" && git push -u origin "$BRANCH")
  git worktree remove "$WORKTREE" --force
fi

git fetch origin "$BRANCH" --quiet
git worktree add "$WORKTREE" "origin/$BRANCH" --detach >/dev/null
cd "$WORKTREE"

case "$MODO" in
  hml)
    rm -rf hml && mkdir -p hml
    unzip -q "$REPO_DIR/$ZIP" -d hml/
    echo "→ publicado em hml/"
    ;;
  release)
    mkdir -p "releases/$SHA"
    rm -rf "releases/$SHA"/*
    unzip -q "$REPO_DIR/$ZIP" -d "releases/$SHA/"
    echo "→ publicado em releases/$SHA/"
    ;;
  *)
    echo "✗ modo desconhecido: $MODO"; exit 1;;
esac

git add -A
git -c user.name="esteira-bot" -c user.email="esteira@users.noreply.github.com" \
    commit -qm "deploy($MODO): $SHA [skip ci]"
git push origin HEAD:"$BRANCH" --quiet

cd "$REPO_DIR"
git worktree remove "$WORKTREE" --force
echo "✓ $MODO publicado no branch $BRANCH"