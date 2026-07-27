// OpenClaw de IA Vertyx: ensambla 3 de las 4 piezas en un solo cron.
// Memoria (Mem0) + Herramienta (Supabase leads reales) + Automatización (este workflow).
// El canal de salida (WhatsApp) es el bot de S06 (supabase/functions/whatsapp-bot) —
// Twilio ya no permite mensajes salientes sin plantilla aprobada por Meta, así que este
// cron deja el resumen listo en memory/log.md en vez de forzar un envío saliente.
import { appendFileSync } from "node:fs";

const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = "wqigkibvmzuuoxrhmjhj";
const MEM0_API_KEY = process.env.MEM0_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

async function queryLeads() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query:
        "select nombre, empresa, estado, prioridad, proximo_seguimiento from public.leads where estado <> 'Cerrado ganado' order by proximo_seguimiento nulls first limit 5;",
    }),
  });
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

async function recallMemory(query) {
  try {
    const res = await fetch("https://api.mem0.ai/v3/memories/search/", {
      method: "POST",
      headers: { Authorization: `Token ${MEM0_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, filters: { AND: [{ user_id: "cesar-lucart" }] }, top_k: 3 }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    return (data.results ?? []).map((m) => m.memory).join("\n- ");
  } catch {
    return "";
  }
}

async function summarize(leads, memory) {
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${MISTRAL_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "mistral-small-latest",
      max_tokens: 300,
      messages: [
        {
          role: "system",
          content:
            "Eres el asistente de IA Vertyx. Resume en 3-4 líneas, tono cálido y directo, cuáles leads priorizar hoy. No inventes datos que no estén en la lista.",
        },
        {
          role: "user",
          content: `Leads activos:\n${JSON.stringify(leads)}\n\nContexto de memoria:\n${memory || "(sin contexto adicional)"}`,
        },
      ],
    }),
  });
  if (!res.ok) throw new Error(`Mistral error: ${res.status}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "(sin resumen)";
}

async function main() {
  console.log("== OpenClaw IA Vertyx ==");

  const leads = await queryLeads();
  console.log(`Leads encontrados: ${leads.length}`);

  const memory = await recallMemory("prioridades de leads de IA Vertyx");
  const summary = await summarize(leads, memory);
  console.log("Resumen:\n" + summary);

  const timestamp = new Date().toISOString();
  appendFileSync(
    "memory/log.md",
    `- ${timestamp}: ${leads.length} leads revisados. Resumen: ${summary.replace(/\n/g, " ")}\n`
  );
  console.log("Log actualizado en memory/log.md");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
