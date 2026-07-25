#!/usr/bin/env bash
# Extrae hechos de fuentes reales de IA Vertyx y los guarda en Mem0.
# Fuente 1: commits recientes del repo mi-contexto (qué cambió en el negocio/setup).
# Correr con MEM0_API_KEY en el entorno.
set -euo pipefail

MEM0_API_KEY="${MEM0_API_KEY:?Falta MEM0_API_KEY en el entorno}"
USER_ID="${MEM0_USER_ID:-cesar-lucart}"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SINCE="${MEM0_EXTRACTOR_SINCE:-1 day ago}"

saved=0
TMP_BODY="$(mktemp)"
trap 'rm -f "$TMP_BODY"' EXIT

save_fact() {
  local text="$1"
  local source="$2"
  local status
  # Escribir el JSON a un archivo evita que curl.exe (nativo de Windows) corrompa
  # acentos/rayas al recibir el body como argumento desde Git Bash.
  node -e "console.log(JSON.stringify({messages:[{role:'user',content:process.argv[1]}],user_id:process.argv[2],source:process.argv[3]}))" "$text" "$USER_ID" "$source" > "$TMP_BODY"
  status="$(curl -s -o /dev/null -w '%{http_code}' -X POST "https://api.mem0.ai/v3/memories/add/" \
    -H "Authorization: Token ${MEM0_API_KEY}" \
    -H "Content-Type: application/json" \
    --data-binary "@${TMP_BODY}" || true)"
  if [[ "$status" == 2* ]]; then
    saved=$((saved + 1))
    echo "  guardado: $text"
  else
    echo "  [aviso] fallo al guardar (HTTP ${status:-desconocido}): $text" >&2
  fi
}

echo "== Fuente: git (commits desde '${SINCE}') =="
while IFS= read -r line; do
  [ -z "$line" ] && continue
  save_fact "IA Vertyx / mi-contexto: $line" "git"
done < <(git -C "$REPO_DIR" log --since="$SINCE" --pretty=format:"%ad — %s" --date=short)

echo "== Resultado =="
echo "Facts guardados: $saved"
