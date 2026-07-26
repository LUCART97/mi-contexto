#!/usr/bin/env bash
# Extrae hechos de fuentes reales de IA Vertyx y los guarda en Mem0.
# Fuente 1: commits recientes del repo mi-contexto (qué cambió en el negocio/setup).
# Fuente 2: próximos eventos de Google Calendar.
# Fuente 3: correos recientes de Gmail (asunto + remitente).
# Correr con MEM0_API_KEY en el entorno. GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN
# son opcionales — si faltan, se omiten las fuentes de Calendar/Gmail.
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

if [[ -n "${GOOGLE_REFRESH_TOKEN:-}" && -n "${GOOGLE_CLIENT_ID:-}" && -n "${GOOGLE_CLIENT_SECRET:-}" ]]; then
  ACCESS_TOKEN="$(curl -s -X POST https://oauth2.googleapis.com/token \
    -d client_id="${GOOGLE_CLIENT_ID}" \
    -d client_secret="${GOOGLE_CLIENT_SECRET}" \
    -d refresh_token="${GOOGLE_REFRESH_TOKEN}" \
    -d grant_type=refresh_token \
    | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);if(!j.access_token){console.error('token error: '+d);process.exit(1)};console.log(j.access_token)})")"

  echo "== Fuente: Google Calendar (próximos eventos) =="
  TIME_MIN="$(date -u +%Y-%m-%dT%H:%M:%S)Z"
  cal_json="$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    "https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&maxResults=10&timeMin=${TIME_MIN}")"
  while IFS= read -r line; do
    [ -z "$line" ] && continue
    save_fact "IA Vertyx / calendario: $line" "calendar"
  done < <(echo "$cal_json" | node -e "
    let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
      const j=JSON.parse(d);
      if(!j.items){ if(j.error) console.error('calendar error: '+JSON.stringify(j.error)); process.exit(0); }
      for(const ev of j.items){
        const when = (ev.start && (ev.start.dateTime||ev.start.date)) || 'sin fecha';
        console.log(\`\${when} — \${ev.summary||'(sin título)'}\`);
      }
    })")

  echo "== Fuente: Gmail (correos recientes) =="
  msg_ids="$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
    "https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=5&q=newer_than:2d" \
    | node -e "let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{const j=JSON.parse(d);if(!j.messages){if(j.error)console.error('gmail list error: '+JSON.stringify(j.error));process.exit(0)};for(const m of j.messages)console.log(m.id)})")"
  while IFS= read -r mid; do
    [ -z "$mid" ] && continue
    msg_json="$(curl -s -H "Authorization: Bearer ${ACCESS_TOKEN}" \
      "https://gmail.googleapis.com/gmail/v1/users/me/messages/${mid}?format=metadata&metadataHeaders=Subject&metadataHeaders=From")"
    fact="$(echo "$msg_json" | node -e "
      let d='';process.stdin.on('data',c=>d+=c);process.stdin.on('end',()=>{
        const j=JSON.parse(d);
        const headers=(j.payload&&j.payload.headers)||[];
        const subj=(headers.find(h=>h.name==='Subject')||{}).value||'(sin asunto)';
        const from=(headers.find(h=>h.name==='From')||{}).value||'desconocido';
        console.log(\`de \${from}: \${subj}\`);
      })")"
    save_fact "IA Vertyx / gmail: $fact" "gmail"
  done < <(echo "$msg_ids")
else
  echo "== Fuente: Google Calendar / Gmail =="
  echo "  omitida: faltan GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN"
fi

echo "== Resultado =="
echo "Facts guardados: $saved"
