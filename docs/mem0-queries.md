# Queries de Mem0 · IA Vertyx

Cinco búsquedas semánticas útiles para el día a día del negocio, sobre la memoria que alimenta el extractor (`scripts/mem0-extractor.sh`: commits, Calendar, Gmail).

## 1. Correos importantes recientes
**Para qué sirve:** saber qué llegó a la bandeja sin tener que abrir Gmail.
**Query:** `¿Qué correos importantes he recibido recientemente?`

## 2. Próximos eventos agendados
**Para qué sirve:** ver si tengo una reunión o demo próxima sin abrir el calendario.
**Query:** `¿Tengo alguna reunión o evento próximo agendado?`

## 3. Qué cambió últimamente en mi-contexto
**Para qué sirve:** recordar en qué quedó el setup técnico sin revisar `git log`.
**Query:** `¿Qué cambié últimamente en el repo mi-contexto?`

## 4. Decisiones y compromisos personales
**Para qué sirve:** reforzar la mentalidad y decisiones que ya tomé (ej. "luchar hasta el final").
**Query:** `¿Qué decisión tomé sobre mi negocio o mi mentalidad?`

## 5. Estado del agente de cron / briefing
**Para qué sirve:** saber si el briefing diario o el cron nocturno tuvieron algún fallo reciente.
**Query:** `¿Hubo algún fallo reciente en mis workflows o agentes de cron?`

---

## Pruebas en vivo

**Query 1 — "¿Qué correos importantes he recibido recientemente?"**
Resultado real (top hits): aprobación del quiz de S04, un correo sobre bots de WhatsApp que dejan de responder, bienvenida de Supabase, notificación de GitHub sobre una app OAuth de terceros, y un aviso de que el workflow "Briefing diario" falló en el commit `97ae19c` (antes de arreglar la autenticación de git).

**Query 5 — "¿Hubo algún fallo reciente en mis workflows o agentes de cron?"**
Resultado real: encontró el correo de GitHub "[LUCART97/mi-contexto] Run failed: Briefing diario - master (97ae19c)" — el mismo fallo de autenticación que corregimos en S03/S04.
