// Bot de WhatsApp de IA Vertyx: Twilio -> esta función -> Claude (+ contexto de Mem0) -> TwiML.
import "@supabase/functions-js/edge-runtime.d.ts";

const MISTRAL_API_KEY = Deno.env.get("MISTRAL_API_KEY")!;
const MEM0_API_KEY = Deno.env.get("MEM0_API_KEY")!;

const SYSTEM_PROMPT = `Eres el asistente de WhatsApp de IA Vertyx, la empresa de Cesar Lucart
(bots de WhatsApp, páginas web autónomas y agentes de IA para negocios).
Si te presentas, di exactamente "Soy IA Vertyx 🤖" — nunca uses un nombre propio de persona
ni placeholders como "[Tu Nombre]".
Tono: cálido y formal, directo, casual. Español neutro.
Objetivo: responder rápido a quien escribe, entender su negocio, y avanzar hacia agendar una
demo. Nunca des un precio exacto por escrito — redirige a entender el negocio primero y ofrece
una llamada corta. Cierra siempre con una acción concreta.`;

function twimlResponse(message: string): Response {
  const escaped = message
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const xml = `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${escaped}</Message></Response>`;
  return new Response(xml, { headers: { "Content-Type": "text/xml" } });
}

async function getUserMemories(userId: string, query: string): Promise<string> {
  try {
    const res = await fetch("https://api.mem0.ai/v3/memories/search/", {
      method: "POST",
      headers: {
        "Authorization": `Token ${MEM0_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query,
        filters: { AND: [{ user_id: userId }] },
        top_k: 5,
      }),
    });
    if (!res.ok) return "";
    const data = await res.json();
    const memories = (data.results ?? []).map((m: { memory: string }) => m.memory);
    return memories.length ? `Contexto relevante de conversaciones/memoria previa:\n- ${memories.join("\n- ")}` : "";
  } catch {
    return "";
  }
}

async function askClaude(userMessage: string, memoryContext: string): Promise<string> {
  const system = memoryContext ? `${SYSTEM_PROMPT}\n\n${memoryContext}` : SYSTEM_PROMPT;
  const res = await fetch("https://api.mistral.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${MISTRAL_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "mistral-small-latest",
      max_tokens: 500,
      messages: [
        { role: "system", content: system },
        { role: "user", content: userMessage },
      ],
    }),
  });
  if (!res.ok) {
    return "Disculpa, tuve un problema técnico respondiendo. Intenta de nuevo en un momento.";
  }
  const data = await res.json();
  return data.choices?.[0]?.message?.content ?? "Disculpa, no pude generar una respuesta. Intenta de nuevo.";
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const form = await req.formData();
  const body = String(form.get("Body") ?? "").trim();
  const from = String(form.get("From") ?? "desconocido");

  if (!body) {
    return twimlResponse("Hola, soy el asistente de IA Vertyx. Cuéntame en qué te puedo ayudar.");
  }

  const memoryContext = await getUserMemories(from, body);
  const reply = await askClaude(body, memoryContext);

  return twimlResponse(reply);
});
