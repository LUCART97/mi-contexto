# Demo · OpenClaw de IA Vertyx

**Video (8 min):** [pendiente — pega aquí el link una vez grabado]

## Guion (8 minutos)

### 1. El problema (2 min)
Soy Cesar Lucart, dueño de **IA Vertyx** — creamos bots de WhatsApp, páginas web autónomas y agentes de IA para negocios. Capto clientes por WhatsApp, referidos, Instagram, X y TikTok.

Mi mayor cuello de botella: **poder responder y tener todo al día** para que el negocio funcione sin inconvenientes. Cada lead nuevo que no respondo a tiempo es una venta que se enfría. Y cruzar información entre WhatsApp, mi calendario, mi correo y mi hoja de leads — a mano — es lo que más tiempo me quita cada semana.

### 2. Sistema en vivo, con datos reales (3 min)
Demuestro en vivo:
- **Escribo por WhatsApp** al bot de IA Vertyx (`supabase/functions/whatsapp-bot`) y muestro cómo responde en segundos, con mi tono y mi negocio, usando memoria real de Mem0.
- **Corro el orquestador** (`mis-agentes/agents/orchestrator.mjs`) y muestro los 3 subagentes (leads, redes, seguimiento) generando su briefing en paralelo en la terminal.
- **Muestro `memory/log.md`** con una corrida real y fechada del cron `openclaw.yml`, que leyó mis leads reales de Supabase y generó un resumen de prioridades del día.

### 3. Arquitectura (2 min)
Explico las 4 piezas de mi OpenClaw:
- **Memoria**: `CLAUDE.md` (reglas fijas de mi negocio) + Mem0 (hechos y decisiones que cambian, con extractor nocturno de git/Calendar/Gmail)
- **Herramientas**: MCP de Supabase (leads reales), MCP de GitHub, edge functions (`whatsapp-bot`, `mi-herramienta`)
- **Automatización**: 4 workflows en GitHub Actions corriendo solos (`briefing-diario`, `mem0-nightly`, `orquesta`, `openclaw`) + Stop hook que guarda checkpoints en Mem0 cada vez que cierro una sesión
- **Canal de salida**: bot de WhatsApp real vía Twilio, respondiendo a clientes 24/7

### 4. Qué sigue (1 min)
- Cerrar el ciclo de handoff con Chatwoot real (hoy solo queda registrado en logs)
- Resolver el envío saliente de WhatsApp con una plantilla aprobada por Meta
- Automatizar la tarea manual que sigue pendiente: copiar información de Google a WhatsApp para compartir con un grupo (anotado en `CLAUDE.md`)
- Hábito: actualizar Mem0 cada semana, auditar los crons cada mes, construir un agente nuevo cada trimestre

---

## Guion de narración para HeyGen / ElevenLabs

Solo para las partes 1, 3 y 4 (narración/avatar). La parte 2 ("sistema en vivo") se graba real con Loom
y se edita en medio de estas dos — no se genera con IA, porque ahí es donde se prueba que el sistema
funciona con datos reales.

**Voz/avatar:** español neutro, tono cálido y formal, directo, casual — el mismo tono de todo IA Vertyx.

### Bloque 1 — El problema (≈2 min, narrar antes de la pantalla en vivo)

```
Hola, soy Cesar Lucart, dueño y director de IA Vertyx.

En IA Vertyx creamos bots de WhatsApp, páginas web autónomas y agentes de inteligencia
artificial para negocios. Ayudamos a cualquier persona o empresa que vea el potencial de
aumentar sus ventas gracias a este trabajo.

Hoy capto clientes por WhatsApp, referidos, Instagram, X y TikTok. Y mi mayor cuello de
botella, el que más tiempo me quita cada semana, es poder responder a tiempo y tener todo
al día para que el negocio funcione sin inconvenientes.

Cada lead nuevo que no respondo rápido es una venta que se enfría. Y cruzar información
entre WhatsApp, mi calendario, mi correo y mi hoja de leads, a mano, es exactamente el
trabajo repetitivo que quiero que mi propia IA haga por mí.

Por eso construí mi OpenClaw: un sistema que junta memoria, herramientas, automatización
y un canal de salida real, para que nada se me escape. Se los muestro funcionando en vivo.
```

### Bloque 2 — [AQUÍ VA LA GRABACIÓN REAL DE PANTALLA, 3 min, no generada por IA]

### Bloque 3 — Arquitectura (≈2 min, narrar después de la pantalla en vivo)

```
Lo que acaban de ver corre sobre cuatro piezas.

La primera es la memoria: un archivo CLAUDE.md con las reglas fijas de mi negocio, y Mem0,
que guarda los hechos y decisiones que van cambiando — con un extractor que corre cada
noche y lee mis commits, mi calendario y mi correo.

La segunda son las herramientas: un MCP conectado a Supabase que lee mis leads reales, un
MCP de GitHub, y edge functions como el bot de WhatsApp y mi función de prueba.

La tercera es la automatización: cuatro workflows de GitHub Actions que corren solos —
el briefing diario, el extractor nocturno de Mem0, el orquestador de subagentes, y
OpenClaw — más un hook que guarda un checkpoint en Mem0 cada vez que cierro una sesión
de trabajo.

Y la cuarta es el canal de salida: el bot de WhatsApp real, conectado vía Twilio, que
responde a mis clientes las 24 horas.

Ninguna pieza depende de que yo esté despierto para que el negocio siga funcionando.
```

### Bloque 4 — Qué sigue (≈1 min, cierre)

```
¿Qué sigue para IA Vertyx? Primero, cerrar el ciclo de handoff con Chatwoot de verdad —
hoy la etiqueta de "hablar con un humano" solo queda registrada en los logs. Segundo,
resolver el envío saliente de WhatsApp con una plantilla aprobada por Meta. Tercero,
automatizar una tarea que todavía hago a mano: copiar información desde Google y pegarla
en un grupo de WhatsApp.

Y como hábito: actualizar Mem0 cada semana, auditar mis crons cada mes, y construir un
agente nuevo cada trimestre.

Esto es mi OpenClaw. Gracias por verlo.
```

### Cómo armarlo
1. Genera el audio/avatar de los bloques 1, 3 y 4 en HeyGen o ElevenLabs (uno por uno, o los tres juntos si el guion cabe en un solo clip).
2. Graba con Loom solo el bloque 2 (pantalla real: WhatsApp, terminal del orquestador, `memory/log.md`).
3. Edita los tres clips en orden: Bloque 1 → Bloque 2 (real) → Bloque 3 → Bloque 4, con cualquier editor simple (CapCut, Clipchamp, o el propio editor de Loom).
4. Sube el video final y pega el link arriba en "Video (8 min)".
