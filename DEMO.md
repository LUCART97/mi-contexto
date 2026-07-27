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
