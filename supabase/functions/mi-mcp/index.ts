// Servidor MCP público de IA Vertyx. Protocolo JSON-RPC 2.0 (MCP "Streamable HTTP").
// Expone 3 herramientas propias:
//   - consultar_leads: lee la tabla public.leads en Supabase (vía Management API, no depende de RLS)
//   - buscar_memoria: búsqueda semántica sobre la memoria persistente en Mem0
//   - guardar_nota: guarda una nueva nota/decisión en Mem0
import "@supabase/functions-js/edge-runtime.d.ts";

const SB_ACCESS_TOKEN = Deno.env.get("SB_ACCESS_TOKEN")!;
const MEM0_API_KEY = Deno.env.get("MEM0_API_KEY")!;
const PROJECT_REF = "wqigkibvmzuuoxrhmjhj";
const MEM0_USER_ID = "cesar-lucart";

const TOOLS = [
  {
    name: "consultar_leads",
    description:
      "Consulta los leads reales de IA Vertyx (nombre, empresa, estado, prioridad, próximo seguimiento). Opcionalmente filtra por estado exacto.",
    inputSchema: {
      type: "object",
      properties: {
        estado: {
          type: "string",
          description:
            "Filtra por estado exacto del lead (ej. Nuevo, Contactado, Reunión agendada, Cerrado ganado). Si se omite, devuelve todos.",
        },
      },
    },
  },
  {
    name: "buscar_memoria",
    description:
      "Busca en la memoria persistente de IA Vertyx (Mem0) por significado, no por palabra exacta. Útil para recordar decisiones, contexto de negocio o eventos pasados.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "Qué quieres recordar o buscar (lenguaje natural).",
        },
      },
      required: ["query"],
    },
  },
  {
    name: "guardar_nota",
    description:
      "Guarda una nueva nota, decisión o hecho en la memoria persistente de IA Vertyx (Mem0), para recordarlo en el futuro.",
    inputSchema: {
      type: "object",
      properties: {
        texto: {
          type: "string",
          description: "El hecho, decisión o nota a guardar en memoria.",
        },
      },
      required: ["texto"],
    },
  },
];

async function consultarLeads(estado?: string) {
  const where = estado ? `where estado = '${estado.replace(/'/g, "''")}'` : "";
  const query = `select id, nombre, empresa, estado, prioridad, proximo_seguimiento from public.leads ${where} order by proximo_seguimiento nulls first limit 20;`;
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SB_ACCESS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  return res.json();
}

async function buscarMemoria(query: string) {
  const res = await fetch("https://api.mem0.ai/v3/memories/search/", {
    method: "POST",
    headers: {
      Authorization: `Token ${MEM0_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, filters: { AND: [{ user_id: MEM0_USER_ID }] }, top_k: 5 }),
  });
  const data = await res.json();
  return (data.results ?? []).map((m: { memory: string }) => m.memory);
}

async function guardarNota(texto: string) {
  const res = await fetch("https://api.mem0.ai/v3/memories/add/", {
    method: "POST",
    headers: {
      Authorization: `Token ${MEM0_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: texto }],
      user_id: MEM0_USER_ID,
      source: "mi-mcp",
    }),
  });
  return res.json();
}

function jsonRpcResult(id: unknown, result: unknown) {
  return { jsonrpc: "2.0", id, result };
}
function jsonRpcError(id: unknown, code: number, message: string) {
  return { jsonrpc: "2.0", id, error: { code, message } };
}
function toolResult(id: unknown, text: string, isError = false) {
  return jsonRpcResult(id, { content: [{ type: "text", text }], isError });
}

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("MCP de IA Vertyx — usa POST con un mensaje JSON-RPC 2.0.", { status: 200 });
  }

  let msg: { id?: unknown; method?: string; params?: Record<string, unknown> };
  try {
    msg = await req.json();
  } catch {
    return Response.json(jsonRpcError(null, -32700, "Parse error"), { status: 400 });
  }

  const { id, method, params } = msg;

  // Notificaciones (sin id, ej. notifications/initialized) no llevan respuesta con contenido.
  if (id === undefined) {
    return new Response(null, { status: 202 });
  }

  if (method === "initialize") {
    return Response.json(
      jsonRpcResult(id, {
        protocolVersion: "2025-03-26",
        capabilities: { tools: {} },
        serverInfo: { name: "ia-vertyx-mcp", version: "1.1.0" },
      })
    );
  }

  if (method === "tools/list") {
    return Response.json(jsonRpcResult(id, { tools: TOOLS }));
  }

  if (method === "tools/call") {
    const name = params?.name as string | undefined;
    const args = (params?.arguments as Record<string, string> | undefined) ?? {};

    try {
      if (name === "consultar_leads") {
        const leads = await consultarLeads(args.estado);
        return Response.json(toolResult(id, JSON.stringify(leads, null, 2)));
      }

      if (name === "buscar_memoria") {
        if (!args.query) return Response.json(toolResult(id, "Falta el parámetro 'query'.", true));
        const memorias = await buscarMemoria(args.query);
        return Response.json(
          toolResult(id, memorias.length ? memorias.join("\n- ") : "No se encontraron memorias relevantes.")
        );
      }

      if (name === "guardar_nota") {
        if (!args.texto) return Response.json(toolResult(id, "Falta el parámetro 'texto'.", true));
        const result = await guardarNota(args.texto);
        return Response.json(toolResult(id, `Nota guardada en memoria: "${args.texto}" (evento: ${result.event_id ?? "n/a"})`));
      }

      return Response.json(jsonRpcError(id, -32602, `Herramienta desconocida: ${name}`));
    } catch (err) {
      return Response.json(toolResult(id, `Error ejecutando ${name}: ${err}`, true));
    }
  }

  if (method === "ping") {
    return Response.json(jsonRpcResult(id, {}));
  }

  return Response.json(jsonRpcError(id, -32601, `Método no soportado: ${method}`));
});
