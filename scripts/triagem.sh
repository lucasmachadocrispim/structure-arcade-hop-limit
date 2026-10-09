#!/usr/bin/env bash
# Reproduz a triagem técnica do item 7.1 do regulamento antes da entrega.
set -euo pipefail
PASTA=${1:-submissao}
PRAZO=${PRAZO:-"2026-10-09T19:00:00-03:00"}
falhas=0
ok(){ echo "  [OK]    $1"; }
nok(){ echo "  [FALHA] $1"; falhas=$((falhas+1)); }

echo "1. Prazo"
[ "$(date +%s)" -le "$(date -d "$PRAZO" +%s)" ] && ok "dentro do prazo" || nok "prazo vencido"

echo "2. Squad completo"
n=$(grep -cE '^\| *[^|]' SQUAD.md || true)
[ "$n" -eq 6 ] && ok "4 integrantes + cabeçalho + separador" || nok "SQUAD.md com $n linhas de tabela (esperado 6)"

echo "3. GDD"
pdfinfo "$PASTA/GDD.pdf" >/dev/null 2>&1 && ok "GDD.pdf abre" || nok "GDD.pdf ausente ou corrompido"

echo "4. Build pública"
if [ -f "$PASTA/LINK_DO_JOGO.txt" ]; then
  URL=$(tr -d '[:space:]' < "$PASTA/LINK_DO_JOGO.txt")
  code=$(curl -s -o /dev/null -w '%{http_code}' -L --max-time 15 "$URL")
  [ "$code" = "200" ] && ok "$URL responde 200" || nok "$URL responde $code"
else
  nok "LINK_DO_JOGO.txt ausente"
fi

echo "5. Build offline"
unzip -l "$PASTA/build.zip" 2>/dev/null | grep -q 'index.html' && ok "build.zip com index.html" || nok "build.zip inválido"

echo "6. Vídeo"
if [ -f "$PASTA/pitch.mp4" ]; then
  d=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$PASTA/pitch.mp4" | cut -d. -f1)
  [ "${d:-999}" -le 90 ] && ok "pitch.mp4 com ${d}s" || nok "pitch.mp4 com ${d}s (máx. 90)"
else
  nok "pitch.mp4 ausente"
fi

echo "7. Manifesto"
(cd "$PASTA" && sha256sum GDD.pdf LINK_DO_JOGO.txt build.zip pitch.mp4 > MANIFESTO.sha256) 2>/dev/null \
  && ok "MANIFESTO.sha256 gerado" || nok "não foi possível gerar o manifesto"

echo
[ "$falhas" -eq 0 ] && echo "TRIAGEM APROVADA" || { echo "TRIAGEM REPROVADA: $falhas falha(s)"; exit 1; }