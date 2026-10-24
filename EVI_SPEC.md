# EVI_SPEC.md — EVI

> **Documento de arquitectura y especificación técnica del MVP**
> Versión 1.2.2 · 23 de octubre de 2026
> Proyecto académico — Licenciatura en Informática e Inteligencia de Negocios, UMES
> Equipo: 3 integrantes · Plazo: 8 semanas · Inversión de infraestructura: ≈ Q300

---

## 0. FICHA DEL PROYECTO

| Campo | Definición |
|---|---|
| **Nombre** | EVI |
| **Modelo de negocio** | SaaS B2C con modelo *freemium*, más un plan superior orientado a organizadores independientes (B2C profesional, no B2B corporativo) |
| **Nicho de mercado** | Personas de 18 a 30 años en Guatemala — inicialmente Quetzaltenango y occidente. Estudiantes y jóvenes profesionales que organizan eventos pequeños (cumpleaños, actividades universitarias, celebraciones familiares) y que viven con presupuesto ajustado. Usuario tipo: *Andrea, 22 años.* |
| **Problema crítico** | El organizador lleva el evento y sus finanzas personales en dos mundos separados: notas del celular, grupos de WhatsApp y hojas de cálculo que nadie actualiza. Se pasa del presupuesto y lo descubre cuando ya gastó, y no sabe cuánto de su dinero personal se le fue en el evento. |
| **Propuesta de valor única (UVP)** | La única app en español y en quetzales que une la organización de eventos con el control de finanzas personales. **Al cerrar un evento, sus gastos se transfieren automáticamente a las finanzas personales del usuario**, eliminando el doble registro. |
| **Funcionalidad principal del MVP** | Dos acciones jerarquizadas: (1) **acción diaria** — registrar un movimiento de dinero en menos de 3 toques; (2) **acción diferenciadora** — cerrar un evento y transferir sus gastos al registro personal del mes. |

### Alcance congelado

Este documento describe **únicamente** lo que entra en el MVP. Nada fuera de esta tabla se implementa antes de la semana 8.

| ✅ SÍ va en el MVP | ❌ NO va (todavía) |
|---|---|
| Registrar ingresos y egresos con categorías | App nativa en Play Store (sale como PWA) |
| Reporte mensual visual de gastos | Pagos automáticos dentro de la app |
| Crear evento con checklist y presupuesto | Directorio de proveedores |
| Alerta al 80% del presupuesto del evento | Notificaciones push y modo sin internet |
| Cierre de evento con transferencia de gastos | Exportar a Excel y reportes por cliente |
| Cuenta de usuario con correo y contraseña | Colaboración multiusuario en un evento |
| Funciona desde el navegador del celular (PWA) | Multi-moneda y multi-país |
| Metas de ahorro (crear y registrar avance) | Gestión de invitados de un evento |
| Pantalla de planes con pago manual | Cobro automático de suscripciones |

---

## 1. VISIÓN DEL PRODUCTO Y STACK TECNOLÓGICO

### 1.1 Visión

EVI es una aplicación web instalable (PWA) que reúne en una sola superficie dos preocupaciones que el usuario hoy resuelve por separado. La visión no es "una app de finanzas más": es **eliminar el doble trabajo** entre organizar y pagar.

La decisión arquitectónica que define el proyecto es la **PWA sobre app nativa**. Elimina el costo de la cuenta de Google Play, elimina los ciclos de revisión de tienda, permite desplegar correcciones el mismo día y hace que una sola base de código sirva para móvil y escritorio. En un proyecto de 8 semanas no es una preferencia: es la condición de viabilidad.

### 1.2 Stack confirmado

| Capa | Tecnología | Costo | Justificación |
|---|---|---|---|
| **Frontend** | Next.js 14+ (App Router) + React | $0 | Renderizado híbrido: la landing estática para SEO, el dashboard como cliente autenticado |
| **Estilos** | Tailwind CSS | $0 | Sistema de diseño por tokens; evita CSS suelto y archivos huérfanos |
| **Iconografía** | Lucide Icons | $0 | Set consistente, ligero, de línea simple, acorde a la identidad |
| **Base de datos** | Supabase (PostgreSQL 15) | $0 hasta ~500 MB | Postgres real. Crítico: Looker Studio se conecta por Postgres nativo |
| **Autenticación** | Supabase Auth | $0 | Correo/contraseña incluido, sin construir gestión de sesiones |
| **Despliegue** | Vercel (Hobby) | $0 | Integración directa con Next.js y despliegues automáticos desde GitHub |
| **IA / APIs** | Google AI Studio / Gemini API | $0 en capa gratuita | Alcance restringido, ver 1.4 |

**Región de la base de datos:** `us-west-2` (Oregón), instancia `t3.nano`.

### 1.3 Tecnologías adicionales — todas $0

**Prioridad ALTA (implementar en el MVP):**

| Librería | Para qué | Por qué importa aquí |
|---|---|---|
| **Zod** | Validación de esquemas | Valida formulario y respuesta de API con el mismo esquema; no se duplican reglas |
| **Recharts** | Gráficas del reporte mensual | Nativa de React. La gráfica de dona del reporte es pantalla central |
| **date-fns** | Manejo de fechas con locale `es` | Todo el producto gira alrededor de "el mes actual"; hacerlo a mano genera errores de zona horaria |
| **Serwist** (o `next-pwa`) | PWA instalable | Sin esto no hay "instalar en el celular" y la decisión de no ir a Play Store se cae |
| **Zustand** | Estado global ligero | Solo sesión y preferencias. No para datos del servidor |
| **ESLint + Prettier** | Formato y reglas | Con 3 personas escribiendo código, evita conflictos de merge inútiles |

**Prioridad MEDIA (si el cronograma lo permite):** TanStack Query (caché de datos del servidor), react-hook-form (formularios con menos re-renders, se integra con Zod), Sentry capa gratuita (errores en producción), GitHub Actions (lint y build en cada pull request).

**Prioridad BAJA — recomendación explícita de NO implementar en 8 semanas:** Vitest, Playwright, Storybook y cualquier suite de pruebas automatizadas. Son la práctica correcta en un proyecto real, pero con 288 horas totales el costo de oportunidad es demasiado alto. La estrategia de calidad del MVP es **pruebas manuales estructuradas** en la semana 6 y la beta de la semana 7. Esto se documenta como deuda técnica consciente, no como descuido.

### 1.4 Alcance del uso de IA (Gemini)

La IA es un accesorio, no el producto. En el MVP se limita a **una sola función**:

> **Categorización sugerida de gastos.** Al escribir la nota de un movimiento ("almuerzo con Sofía"), Gemini sugiere la categoría. El usuario siempre puede cambiarla.

Reglas obligatorias de implementación:

- La llamada se ejecuta **siempre en el servidor** (Route Handler de Next.js). La API key nunca llega al navegador.
- Debe degradarse con elegancia: si la API falla o se agota la cuota, el usuario elige la categoría manualmente y **la app no se rompe**.
- Se implementa en la semana 6. Si el cronograma se atrasa, es la primera función que se recorta.

---

## 2. ESTÁNDARES DE CALIDAD Y REGLAS DE DESARROLLO

### 2.1 Principio de Responsabilidad Única (SRP)

**Regla central: un componente visual no consulta la base de datos.**

La lógica de negocio vive en hooks y servicios. El componente recibe datos y funciones, y solo los muestra.

```
❌ INCORRECTO
components/EventCard.tsx
  → llama a supabase.from('events').select() directamente
  → calcula el porcentaje de presupuesto dentro del JSX
  → maneja la carga con tres useState sueltos

✅ CORRECTO
services/eventService.ts   → habla con Supabase. No sabe que React existe.
hooks/useEvents.ts         → orquesta el servicio, expone { data, isLoading, error }
lib/budget.ts              → función pura: calculateBudgetUsage(spent, planned)
components/EventCard.tsx   → recibe props y pinta. Cero lógica de negocio.
```

Prueba rápida: *¿puedo mover este componente a otro proyecto con otra base de datos sin tocarlo?* Si la respuesta es no, la separación está mal hecha.

### 2.2 Reglas Anti-Spaghetti (obligatorias)

| # | Regla | Verificación |
|---|---|---|
| 1 | **Prohibido hardcodear credenciales.** Todo secreto en variables de entorno (`.env.local`, nunca en el repositorio) | `.env.local` en `.gitignore` desde el primer commit |
| 2 | **Prohibidos los estilos inline.** Solo clases de Tailwind; los colores salen de los tokens (`src/styles/tokens.ts`, que lee `tailwind.config.ts`), nunca escritos como `#6C3BF4` en un componente. Anchos dinámicos (barras de avance) se dibujan con SVG, donde el ancho es un atributo | Regla de ESLint `react/forbid-dom-props` prohíbe `style` |
| 3 | **Ningún archivo de código (`.ts`/`.tsx`) pasa de 200 líneas.** Al llegar a 180, se divide. `schema.sql` queda exento: debe poder ejecutarse completo en un solo paso | Regla de ESLint `max-lines` en 200 |
| 4 | **Ninguna función pasa de 40 líneas** ni tiene más de 3 niveles de anidación | Revisión en el pull request |
| 5 | **Prohibidos los números mágicos.** El umbral de alerta es `BUDGET_ALERT_THRESHOLD = 0.8` en `lib/constants.ts` | Revisión en el pull request |
| 6 | **Prohibido `any` en TypeScript.** Si no se conoce el tipo, se usa `unknown` y se valida con Zod | `strict: true` en `tsconfig.json` |
| 7 | **Toda tabla con Row Level Security activada.** Un usuario jamás lee los datos de otro | ✅ Verificado el 17/09/2026 en las 8 tablas |
| 8 | **Toda función `SECURITY DEFINER` invocable por RPC rechaza explícitamente a quien no tiene sesión** y compara el dueño con `IS DISTINCT FROM`. Excepción: las funciones *trigger* (ej. `handle_new_user`, que corre durante el registro, sin sesión); no se pueden invocar por RPC y se les revoca `EXECUTE` | ✅ Verificado el 17/09/2026 (ver 5.3) |
| 9 | **Toda vista expuesta por la API se crea con `WITH (security_invoker = true)`.** Las vistas que agregan datos de todos los usuarios (BI) viven en el esquema `analytics`, que la API no expone | Consulta de verificación en §5.5 |
| 10 | **Las columnas que decide el servidor no se escriben desde la API.** `movements.status`, `movements.accounting_date`, `events.status`, `events.closed_at`, `profiles.plan` y todo `user_id` (que toma `DEFAULT auth.uid()`) quedan fuera de los `GRANT` por columna | Sección 5 de `schema.sql` |

### 2.3 Estructura de carpetas

```
/src
├── /app                      # Rutas de Next.js (App Router)
│   ├── /(marketing)
│   │   └── page.tsx          # Landing pública
│   ├── /(auth)
│   │   ├── /login
│   │   └── /registro
│   ├── /(dashboard)          # Rutas protegidas
│   │   ├── /inicio
│   │   ├── /dinero
│   │   ├── /eventos
│   │   │   └── /[id]
│   │   └── /reportes
│   ├── /demo                 # TEMPORAL: vitrina de componentes con datos simulados.
│   │                         #   Se borra antes de la beta (semana 7)
│   └── /api                  # Route Handlers (servidor)
│       └── /categorizar      # Único punto que habla con Gemini
│
├── /components
│   ├── /ui                   # Button, Card, Input, Badge, AppIcon
│   ├── /finance              # BalanceCard, MovementItem, MovementList, AddMovementButton,
│   │                         # MovementForm, TypeToggle, CategoryPicker, EventPicker,
│   │                         # NumericKeypad, MonthlyChart
│   ├── /events               # EventCard, ClosedEventCard, EventsEmptyState, BudgetBar,
│   │                         # BudgetAlert, Checklist, CloseEventModal, CloseEventSummary,
│   │                         # TransferAnimation
│   └── /layout               # BottomNav, Header (+ UserAvatar), PageContainer
│
├── /hooks                    # useAmountInput, useMovementDraft ✅ · useMovements, useEvents,
│                             # useMonthlyReport, useAuth (pendientes)
├── /services                 # telemetryService ✅ · movementService, eventService (pendientes)
├── /lib                      # supabase, constants, formatCurrency, budget, amountInput,
│                             # report, text, cn
├── /types                    # movement, event, category, telemetry
└── /styles                   # tokens.ts (colores, única fuente) · globals.css (mínimo)

/supabase
└── schema.sql                # Script completo de la base de datos (v1.2)
```

**Convenciones de nombres:**

- Componentes: `PascalCase.tsx` — `EventCard.tsx`
- Hooks: `camelCase` con prefijo `use` — `useEvents.ts`
- Servicios y utilidades: `camelCase.ts` — `eventService.ts`
- Tipos: `PascalCase` exportados desde `/types`
- Tablas y columnas en la base de datos: `snake_case` — `event_tasks`

### 2.4 Estándar de comentarios (didáctico)

Este proyecto es material de estudio además de ser un producto. El código se comenta para que otro integrante — o el catedrático — entienda **por qué** existe cada bloque, no solo qué hace.

**Cabecera obligatoria en todo archivo:**

```typescript
/**
 * useEvents.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Hook que expone los eventos del usuario autenticado y
 *            las operaciones para crearlos, actualizarlos y cerrarlos.
 *
 * POR QUÉ EXISTE: Los componentes visuales no deben saber que existe
 *            Supabase. Este hook es la frontera entre la interfaz y
 *            la capa de datos (Responsabilidad Única).
 *
 * DEPENDE DE: services/eventService.ts, hooks/useAuth.ts
 * USADO EN:   app/(dashboard)/eventos/page.tsx, components/events/EventCard.tsx
 * ---------------------------------------------------------------
 */
```

**Comentarios de bloque — explican la decisión, no la sintaxis:**

```typescript
// Calculamos el porcentaje ANTES de renderizar y no dentro del JSX.
// Razón: en el JSX se recalcularía en cada render y además mezclaría
// lógica de negocio con presentación (rompe SRP).
const usage = calculateBudgetUsage(event.spentAmount, event.plannedAmount);

// El umbral vive en constants.ts y no como 0.8 aquí.
// Razón: si el negocio decide alertar al 75%, se cambia en UN solo lugar.
const isNearLimit = usage >= BUDGET_ALERT_THRESHOLD;
```

**Qué NO comentar:** `// incrementa el contador` sobre `count++`. Ese comentario suma ruido y resta legibilidad.

### 2.5 Flujo de trabajo del equipo

- Rama `main` siempre desplegable. Nadie hace commit directo a `main`.
- Una rama por funcionalidad: `feat/registro-movimiento`, `fix/barra-presupuesto`.
- Todo pull request lo revisa otro integrante. Revisión mínima: ¿cumple las 10 reglas anti-spaghetti?
- Commits en español con prefijo: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`.
- **Herramientas que lo hacen cumplir** (desde v1.2):
  - `CONTRIBUTING.md`: los comandos exactos del flujo, paso a paso.
  - `.github/pull_request_template.md`: cada PR trae la lista de las 10 reglas y la Definición de Terminado.
  - `.github/workflows/ci.yml`: GitHub Actions corre lint, tipos y build en cada PR; si falla, no se une.
  - Protección de `main` en GitHub: exige PR, 1 aprobación y la verificación en verde.
  - `.gitattributes`: saltos de línea LF para todos, sin cambios fantasma entre Windows y Mac.

---

## 3. MAPA DE PANTALLAS Y WIREFRAMES TEXTUALES

### Sistema visual (aplica a todas las pantallas)

| Token | Valor | Uso |
|---|---|---|
| `primary` | `#6C3BF4` | Acciones principales, elementos de marca |
| `mint` | `#2EE6A8` | Dinero, confirmaciones, estados positivos |
| `gold` | `#FFD166` | Alertas suaves (nunca rojo agresivo) |
| `dark` | `#1A1035` | Fondos de énfasis, pantalla de planes |
| `light` | `#F5F2FF` | Fondos de tarjetas y secciones |

Radio de borde: 16–20 px. Tipografía sans-serif redondeada. Moneda siempre `Q1,250.00`. Todo texto en español de Guatemala.

---

### PANTALLA 1 — Landing Page / Smoke Test

**Ruta:** `/` · **Acceso:** pública · **Objetivo:** validar demanda antes de terminar el producto

```
┌────────────────────────────────────────────────────────────┐
│  [Logo EVI]                          [Iniciar sesión]      │
├────────────────────────────────────────────────────────────┤
│   HERO                                                     │
│   ┌──────────────────────────┐  ┌──────────────────────┐   │
│   │ Tus eventos y tu dinero, │  │                      │   │
│   │ en un solo lugar.        │  │   [Mockup celular    │   │
│   │                          │  │    con el dashboard] │   │
│   │ Organizá tus eventos sin │  │                      │   │
│   │ caos y controlá lo que   │  │                      │   │
│   │ entra y sale — en        │  │                      │   │
│   │ quetzales y en español.  │  │                      │   │
│   │                          │  │                      │   │
│   │ [ Empezar gratis ] ←primary                        │   │
│   │ Gratis para siempre.     │  │                      │   │
│   │ Sin tarjeta.             │  │                      │   │
│   └──────────────────────────┘  └──────────────────────┘   │
├────────────────────────────────────────────────────────────┤
│   PROBLEMA vs SOLUCIÓN  (dos columnas contrastadas)        │
│   ┌───────────────────────┐ ┌────────────────────────────┐ │
│   │ SIN EVI      (dark)   │ │ CON EVI          (mint)    │ │
│   │ • Notas del celular   │ │ • Un registro en 3 toques  │ │
│   │   que se pierden      │ │ • Presupuesto en vivo      │ │
│   │ • Te pasás de gasto   │ │ • Aviso antes de pasarte   │ │
│   │   y lo ves al final   │ │ • Los gastos del evento    │ │
│   │ • Doble trabajo:      │ │   pasan solos a tus        │ │
│   │   evento + cuentas    │ │   finanzas del mes         │ │
│   └───────────────────────┘ └────────────────────────────┘ │
├────────────────────────────────────────────────────────────┤
│   TRES BENEFICIOS  (iconos: Zap · CalendarCheck ·          │
│   ArrowLeftRight)                                          │
├────────────────────────────────────────────────────────────┤
│   PRECIOS  → 3 tarjetas: Q0 · Q50 (destacada) · Q150       │
├────────────────────────────────────────────────────────────┤
│   FORMULARIO DE CONVERSIÓN  (el corazón del smoke test)    │
│   ┌────────────────────────────────────────────────────┐   │
│   │  Sé de los primeros en usarla                      │   │
│   │  [ tu@correo.com          ] [ Quiero probarla ]    │   │
│   │  Te avisamos cuando esté lista. Sin spam.          │   │
│   └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

**Notas técnicas:** renderizado estático para velocidad y SEO. El correo se inserta en la tabla `waitlist`. Cada sección visible dispara un evento de telemetría de scroll (§4).

**Métrica del smoke test:** correos capturados ÷ visitantes únicos. Si es menor al 8%, el mensaje de la UVP no funciona y hay que reescribir el hero antes de seguir construyendo.

---

### PANTALLA 2 — Autenticación / Registro

**Ruta:** `/registro` y `/login` · **Acceso:** pública

```
┌──────────────────────────────┐
│         [Logo EVI]           │
│                              │
│   Creá tu cuenta             │
│   Tus eventos y tu dinero,   │
│   en un solo lugar.          │
│                              │
│   Nombre                     │
│   [__________________]       │
│                              │
│   Correo electrónico         │
│   [__________________]       │
│                              │
│   Contraseña                 │
│   [_______________] [ojo]    │
│   Mínimo 8 caracteres        │
│                              │
│   [  Crear mi cuenta  ]      │
│         ← primary, ancho     │
│                              │
│   ¿Ya tenés cuenta?          │
│   Iniciar sesión             │
│                              │
│   Gratis para siempre.       │
│   Sin tarjeta de crédito.    │
└──────────────────────────────┘
```

**Notas técnicas:** un solo paso, sin scroll, sin verificación de correo obligatoria en el MVP (agrega fricción y una pantalla más que construir). Validación en tiempo real con Zod. Errores bajo cada campo, en `gold`, nunca en rojo. **El perfil en `profiles` se crea solo**, mediante el trigger `handle_new_user` (verificado funcionando, §5.2).

---

### PANTALLA 3 — Dashboard Principal

**Ruta:** `/inicio` · **Acceso:** protegida · **Es la pantalla que el usuario ve todos los días**

```
┌────────────────────────────────────────┐
│  Hola, Andrea              [avatar]    │
│  Septiembre 2026                       │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │  BALANCE DEL MES        (dark)   │  │
│  │                                  │  │
│  │      Q 1,340.00                  │  │
│  │      ← número enorme, mint       │  │
│  │                                  │  │
│  │  Ingresos      Egresos           │  │
│  │  Q3,200.00     Q1,860.00         │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  ┌────────────┐  ┌──────────────────┐  │
│  │ META       │  │ EVENTO ACTIVO    │  │
│  │ Viaje      │  │ Cumple de Sofía  │  │
│  │ ████░░ 32% │  │ ███████░ 85% ⚠   │  │
│  │ Q650/2,000 │  │ Q1,700 de Q2,000 │  │
│  └────────────┘  └──────────────────┘  │
│                    ↑ barra en gold     │
├────────────────────────────────────────┤
│  ÚLTIMOS MOVIMIENTOS         Ver todos │
│  Almuerzo             -Q45.00  hoy     │
│  Decoración          -Q320.00  ayer    │
│     └ Cumple de Sofía  ← etiqueta      │
│  Pago freelance    +Q1,500.00  2 sept  │
├────────────────────────────────────────┤
│                              ┌─────┐   │
│                              │  +  │   │ ← FAB, primary
│                              └─────┘   │
├────────────────────────────────────────┤
│  [Inicio] [Dinero] [Eventos] [Reportes]│
└────────────────────────────────────────┘
```

> **v1.2:** la cuarta pestaña es **Reportes** y no Perfil, para coincidir con las rutas de §2.3; el reporte mensual sí está en el alcance congelado y el perfil no tiene pantalla definida. Al perfil se llega tocando el avatar.

**Acción central — el botón flotante `+`** abre el registro de movimiento. Debe completarse en **menos de 5 segundos y 3 toques**: monto en teclado numérico grande → categoría con un toque → guardar. Si esta interacción no se siente instantánea, la app no se usa a diario, y sin uso diario no hay datos que analizar ni suscripciones que vender.

**Notas técnicas:** los agregados del mes (balance, ingresos, egresos) se calculan en la vista `vw_monthly_summary` (con `security_invoker`, regla 9), no sumando en el cliente. El movimiento que pertenece a un evento muestra su etiqueta de origen y, si el evento sigue abierto, la marca **Pendiente** (ver la regla contable en 4d).

---

### PANTALLA 4 — Vista Operativa: Eventos

**Ruta:** `/eventos` y `/eventos/[id]` · **Acceso:** protegida

**4a. Listado**

```
┌────────────────────────────────────────┐
│  Mis eventos                    [ + ]  │
├────────────────────────────────────────┤
│  ACTIVOS                               │
│  ┌──────────────────────────────────┐  │
│  │ Cumpleaños de Sofía      [Activo]│  │
│  │ 14 de septiembre · faltan 9 días │  │
│  │ ████████████████░░░  85%   (gold)│  │
│  │ Q1,700 de Q2,000                 │  │
│  │ ⚠ Vas al 85% de tu presupuesto   │  │
│  │ 5 de 8 tareas                    │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  CERRADOS                              │
│  ┌──────────────────────────────────┐  │
│  │ Cena de generación      [Cerrado]│  │
│  │ 22 de agosto                     │  │
│  │ Gastaste Q1,240 de Q1,500        │  │
│  │ Gastos pasados a tus finanzas    │  │
│  └──────────────────────────────────┘  │
└────────────────────────────────────────┘
```

**4b. Detalle del evento** — dos secciones en pestañas (v1.2: la pestaña *Invitados* sale del MVP; no había tabla ni flujo definidos para ella):

```
┌────────────────────────────────────────┐
│  ← Cumpleaños de Sofía          [···]  │
│  14 de septiembre · faltan 9 días      │
├────────────────────────────────────────┤
│  ┌──────────────────────────────────┐  │
│  │ PRESUPUESTO                      │  │
│  │  Q1,700.00  de  Q2,000.00        │  │
│  │  ████████████████░░░   85%       │  │
│  │  ⚠ Te quedan Q300.00             │  │
│  └──────────────────────────────────┘  │
├────────────────────────────────────────┤
│  [ Tareas ] [ Gastos ]                 │
│                                        │
│  ☑ Reservar el salón      (tachado)    │
│  ☑ Confirmar el pastel    (tachado)    │
│  ☐ Comprar decoración                  │
│  ☐ Enviar invitaciones                 │
│  ☐ Contratar la música                 │
│                     5 de 8 completadas │
├────────────────────────────────────────┤
│      [  Cerrar evento  ]  ← secundario │
└────────────────────────────────────────┘
```

**4c. Modal de cierre — la pantalla del diferenciador**

```
┌────────────────────────────────────┐
│  Cerrar Cumpleaños de Sofía        │
│                                    │
│  Planificado        Q2,000.00      │
│  Gasto real         Q1,700.00      │
│  ─────────────────────────────     │
│  Te sobró           Q300.00 (mint) │
│                                    │
│   [ evento ] ────────→ [ dinero ]  │
│      animación de transferencia    │
│                                    │
│  Los 2 gastos de este evento       │
│  (Q1,700.00) pasarán a tus         │
│  finanzas personales de septiembre.│
│                                    │
│  [ Cerrar evento y pasar gastos ]  │
│              ← mint, ancho         │
│  [ Todavía no ]                    │
└────────────────────────────────────┘
```

**Nota técnica crítica:** la transferencia se ejecuta como **una transacción atómica de PostgreSQL** (`close_event_and_transfer`, ya implementada y probada, §5.3), nunca como una serie de llamadas desde el cliente. Si el proceso fallara a la mitad, el usuario quedaría con gastos duplicados o perdidos — y este es precisamente el flujo que define el producto.

**4d. Regla contable: qué significa "transferir" (v1.2)**

Antes de la v1.2 no estaba definido si un gasto de un evento abierto contaba ya en el balance del mes. Queda así:

| Estado del movimiento | Cuándo | ¿Suma al balance personal? |
|---|---|---|
| `pendiente` | Está asignado a un evento **activo** | **No.** Se ve en el evento y en la lista con la marca "Pendiente" |
| `confirmado` | No tiene evento, o su evento ya se cerró | **Sí**, en el mes de `accounting_date` |

- Un movimiento sin evento nace `confirmado` con `accounting_date = occurred_on`.
- Al cerrar el evento, `close_event_and_transfer` pasa todos sus movimientos a `confirmado` con `accounting_date` = **día del cierre**. Por eso el modal dice "pasarán a tus finanzas de *[mes del cierre]*".
- Si se **elimina** un evento, sus gastos pendientes pasan a confirmados con su fecha original (siguen siendo dinero real que el usuario gastó).
- A un evento cerrado ya no se le pueden agregar gastos.
- Solo los **egresos** se asignan a eventos; el presupuesto del evento mide gasto.
- `status` y `accounting_date` los decide **siempre el servidor** (trigger `movements_accounting` y la RPC), nunca el cliente (regla 10).

---

### Pantallas complementarias del MVP

Fuera de las cuatro obligatorias, el alcance congelado exige: **registro de movimiento** (modal desde el FAB), **reporte mensual** (gráfica de dona con desglose por categoría), **metas de ahorro** y **planes y precios**. Se especifican en el documento de diseño (`EVI app Guatemala design/`). Desde la v1.2 las metas y los planes figuran explícitamente en la tabla de alcance congelado (§0).

---

## 4. TELEMETRÍA Y EVENTOS DE BUSINESS INTELLIGENCE

### 4.1 Por qué esto no es opcional

La metodología del proyecto es Lean Startup: crear, **medir**, aprender. Sin telemetría, la fase de medición no existe y las decisiones de la semana 4 se toman por intuición. Además, el análisis en Looker Studio es un entregable del curso de Inteligencia de Negocios. **La tabla ya está creada desde el día uno**, no al final.

### 4.2 Esquema de la tabla

```sql
-- ---------------------------------------------------------------
-- TABLA: analytics_events
-- PROPÓSITO: Registro append-only de todo lo que ocurre en la app.
--            Fuente de verdad para el análisis en Looker Studio.
-- REGLA: Nunca se actualiza ni se borra una fila. Solo se insertan.
-- ---------------------------------------------------------------
CREATE TABLE public.analytics_events (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID DEFAULT auth.uid()
               REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id   TEXT NOT NULL,
  event_name   TEXT NOT NULL CHECK (event_name ~ '^[a-z]+(_[a-z]+)+$'),
  device_type  TEXT CHECK (device_type IN ('mobile','desktop','tablet')),
  properties   JSONB NOT NULL DEFAULT '{}'::jsonb,
  metadata     JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Solo INSERT, y firmado por la sesión actual (NULL para visitantes).
CREATE POLICY analytics_insert_self ON public.analytics_events
  FOR INSERT TO anon, authenticated
  WITH CHECK (user_id IS NOT DISTINCT FROM auth.uid());
```

`ON DELETE SET NULL` en `user_id`: si un usuario borra su cuenta, el evento sigue contando para las métricas agregadas pero deja de ser identificable.

**Cambios v1.2:**
- **Se elimina `updated_at`.** Contradecía la regla de *append-only*: una fila que nunca se actualiza no necesita fecha de actualización.
- **`user_id DEFAULT auth.uid()`.** El `track()` de la v1.1 no enviaba `user_id`, así que todos los eventos habrían quedado anónimos y las métricas por usuario (retención, funnel) serían imposibles. Ahora la base lo llena sola y la política impide firmar eventos a nombre de otro usuario.
- El `CHECK` sobre `event_name` hace cumplir la convención `snake_case` también en la base.

**Convención de nombres:** `snake_case`, siempre `sustantivo_verbo_en_pasado`. Ejemplo: `movement_created`, no `createMovement` ni `CLICK_SAVE`.

### 4.3 Catálogo de eventos

**Adquisición (landing / smoke test)**

| `event_name` | Cuándo se dispara | `properties` |
|---|---|---|
| `landing_viewed` | Carga la landing | `{ referrer, utm_source }` |
| `landing_section_viewed` | Una sección entra en pantalla | `{ section: 'hero' \| 'problema' \| 'precios' \| 'formulario' }` |
| `waitlist_submitted` | Se envía el formulario de correo | `{ plan_interest }` |
| `pricing_plan_viewed` | El usuario mira una tarjeta de plan | `{ plan: 'gratis' \| 'personal' \| 'organizador' }` |

**Activación (registro y primer uso)**

| `event_name` | Cuándo se dispara | `properties` |
|---|---|---|
| `signup_started` | Se abre `/registro` | `{ source }` |
| `signup_completed` | La cuenta se crea con éxito | `{ signup_duration_seconds }` |
| `signup_failed` | Falla la validación o el servidor | `{ reason }` |
| `onboarding_completed` | Se registra el **primer** movimiento | `{ minutes_since_signup }` |
| `login_succeeded` | Inicio de sesión correcto | `{}` |

**Uso central — finanzas**

| `event_name` | Cuándo se dispara | `properties` |
|---|---|---|
| `movement_created` | Se guarda un ingreso o egreso | `{ type, category, amount, has_note, linked_to_event, seconds_to_complete }` |
| `movement_deleted` | Se elimina un movimiento | `{ type, category }` |
| `category_suggested` | Gemini propone una categoría | `{ suggested_category, latency_ms }` |
| `category_suggestion_accepted` | El usuario conserva la sugerencia | `{ category }` |
| `category_suggestion_rejected` | El usuario la cambia | `{ suggested, chosen }` |
| `monthly_report_viewed` | Se abre el reporte | `{ month, total_spent, categories_count }` |
| `savings_goal_created` | Se crea una meta | `{ target_amount }` |

> `seconds_to_complete` en `movement_created` es la métrica más importante del producto: mide directamente la promesa de "3 toques". Si la mediana sube de 8 segundos, hay que rediseñar la pantalla.

> El par `suggestion_accepted` / `suggestion_rejected` justifica —o descarta— mantener la IA. Si el rechazo supera el 40%, la función resta más de lo que suma.

**Uso central — eventos**

| `event_name` | Cuándo se dispara | `properties` |
|---|---|---|
| `event_created` | Se crea un evento | `{ planned_budget, days_until_event, has_checklist }` |
| `event_task_completed` | Se marca una tarea | `{ event_id, tasks_done, tasks_total }` |
| `event_expense_added` | Se agrega un gasto al evento | `{ amount, budget_usage_pct }` |
| `budget_alert_shown` | Se cruza el umbral del 80% | `{ event_id, usage_pct }` |
| `budget_exceeded` | El gasto supera el 100% | `{ overspend_amount }` |
| `event_closed` | Se confirma el cierre | `{ planned, actual, variance, expenses_count }` |
| `expenses_transferred` | Termina la transferencia atómica | `{ expenses_count, total_amount, target_month }` |

> `expenses_transferred` **mide el diferenciador del negocio**. Si los usuarios crean eventos pero nunca los cierran, la propuesta de valor única no se está cumpliendo, y eso obliga a replantear el producto, no a ajustar la interfaz.

**Retención y monetización**

| `event_name` | Cuándo se dispara | `properties` |
|---|---|---|
| `session_started` | Apertura de la app | `{ days_since_signup, device_type }` |
| `pwa_installed` | Se instala en la pantalla de inicio | `{ platform }` |
| `upgrade_clicked` | Se pulsa un plan de pago | `{ plan, trigger_screen }` |
| `payment_confirmed` | Se registra el pago manual | `{ plan, amount, method }` |
| `limit_reached` | Un usuario gratis topa un límite | `{ limit_type: 'eventos' \| 'metas' \| 'reportes' }` |

> `limit_reached` seguido de `upgrade_clicked` revela **cuál límite del plan gratuito genera conversión**. Permite ajustar el freemium con datos en vez de con opiniones.

### 4.4 Implementación

```typescript
/**
 * services/telemetryService.ts
 * ---------------------------------------------------------------
 * PROPÓSITO: Punto ÚNICO de registro de eventos analíticos.
 *
 * POR QUÉ EXISTE: Si cada componente insertara en analytics_events
 *            por su cuenta, tendríamos nombres inconsistentes
 *            ('movement_created' vs 'movementCreated') y el tablero
 *            de Looker Studio sería inservible.
 *
 * REGLA: Ningún componente llama a Supabase para telemetría.
 *        Todo pasa por track().
 * ---------------------------------------------------------------
 */

export async function track(
  eventName: AnalyticsEvent,        // tipo unión: solo nombres del catálogo
  properties: Record<string, unknown> = {}
): Promise<void> {
  try {
    // user_id NO se envía: lo pone la base con DEFAULT auth.uid() (v1.2).
    const { error } = await supabase.from('analytics_events').insert({
      event_name: eventName,
      properties,
      session_id: getSessionId(),
      device_type: getDeviceType(),
    });
    // supabase-js no lanza excepciones: devuelve { error }. Sin esta
    // línea, un insert rechazado por RLS pasaría en silencio.
    if (error) throw error;
  } catch (error) {
    // La telemetría NUNCA rompe la experiencia del usuario.
    // Si falla el registro, se pierde el dato pero la app sigue.
    console.error('[telemetry] fallo al registrar:', eventName, error);
  }
}
```

**Regla de tipado:** `AnalyticsEvent` es un tipo unión en `/types/telemetry.ts` con los nombres exactos del catálogo. Así, un nombre mal escrito es un error de compilación y no un dato corrupto descubierto tres semanas después.

### 4.5 Conexión con Looker Studio

Supabase expone PostgreSQL directamente, así que Looker Studio se conecta con su conector nativo de Postgres usando credenciales **de solo lectura**.

**Corrección v1.2 — las vistas de BI salen de `public`.** En PostgreSQL una vista se ejecuta, por defecto, con los permisos de quien la **creó** (el dueño, `postgres`), así que **se salta el RLS**. Supabase expone por la API todo lo que está en `public`. Resultado: con los permisos que Supabase concede por defecto en `public`, en la v1.1 cualquiera con la clave anónima (pública por diseño) podía consultar `vw_category_distribution` y las demás vistas por REST. Las vistas de BI agregan datos de todos los usuarios a propósito, así que no se pueden "arreglar" con `security_invoker`: se mueven a un esquema propio que la API no expone.

```sql
CREATE SCHEMA analytics;                                  -- NO agregar a "Exposed schemas"
REVOKE ALL ON SCHEMA analytics FROM public, anon, authenticated;

CREATE ROLE looker_readonly LOGIN;                        -- contraseña: ALTER ROLE a mano,
GRANT USAGE ON SCHEMA analytics TO looker_readonly;       -- nunca en el repositorio
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO looker_readonly;
```

Las vistas que **sí** consume la app (`vw_monthly_summary`, `vw_event_budget`) se quedan en `public`, pero con `WITH (security_invoker = true)`: así corren con los permisos del usuario que consulta y el RLS filtra sus filas (regla 9).

**Vistas construidas** (definición completa en `supabase/schema.sql`):

| Vista | Esquema | Responde a | Estado |
|---|---|---|---|
| `vw_monthly_summary` | `public` (invoker) | Balance, ingresos y egresos del mes del usuario | ✅ en schema.sql v1.2 |
| `vw_event_budget` | `public` (invoker) | Gasto, presupuesto y tareas por evento | ✅ en schema.sql v1.2 |
| `vw_daily_activity` | `analytics` | Usuarios activos diarios y semanales | ✅ en `analytics` (aplicado 23/10/2026) |
| `vw_event_lifecycle` | `analytics` | Eventos creados vs. cerrados — mide el diferenciador | ✅ en `analytics` (aplicado 23/10/2026) |
| `vw_category_distribution` | `analytics` | En qué gastan los usuarios | ✅ en `analytics` (aplicado 23/10/2026) |
| `vw_funnel_conversion` | `analytics` | Visita → registro → primer movimiento → pago | Pendiente |
| `vw_retention_cohort` | `analytics` | Retención a 7, 14 y 30 días por cohorte | Pendiente |
| `vw_speed_to_log` | `analytics` | Mediana de `seconds_to_complete` por semana | Pendiente |

---

## 5. ESTADO ACTUAL DE LA IMPLEMENTACIÓN

### 5.1 Base de datos — completada y verificada

Proyecto en Supabase: **"Evi charger"** · instancia `t3.nano` en `us-west-2` · plan gratuito.

| Tabla | Rol | RLS |
|---|---|---|
| `profiles` | Extiende `auth.users` con plan y nombre | ✅ |
| `categories` | Catálogo; `user_id` NULL = categoría del sistema | ✅ |
| `events` | Eventos del usuario (transaccional, con `status`) | ✅ |
| `event_tasks` | Checklist; pertenencia heredada del evento vía `EXISTS` | ✅ |
| `movements` | Ingresos y egresos (transaccional, con `status` y, desde v1.2, `accounting_date`) | ✅ |
| `savings_goals` | Metas de ahorro | ✅ |
| `waitlist` | Captura pública: solo INSERT, sin SELECT | ✅ |
| `analytics_events` | Telemetría: solo INSERT, sin SELECT | ✅ |

**Reglas de borrado verificadas** (9 llaves foráneas, consultadas el 17/09/2026):

| Columna | Regla | Razón |
|---|---|---|
| `movements.category_id` | `SET NULL` | Borrar una categoría no debe borrar el historial financiero |
| `movements.event_id` | `SET NULL` | Si se elimina un evento, sus gastos siguen siendo dinero real que el usuario gastó |
| `analytics_events.user_id` | `SET NULL` | El dato agregado sobrevive; deja de ser identificable |
| Las otras seis | `CASCADE` | Datos que no tienen sentido sin su padre |

**Datos semilla cargados:** 8 categorías del sistema, 5 correos en `waitlist`, 2 eventos, 5 tareas, 7 movimientos, 1 meta de ahorro, 5 registros de telemetría y 1 perfil.

### 5.2 Trigger de creación de perfil — verificado

`handle_new_user` crea la fila en `profiles` automáticamente al registrarse un usuario en `auth.users`. Confirmado con el usuario de prueba `andrea@evi.test`: el perfil apareció sin intervención manual. El frontend **no** debe crear perfiles.

### 5.3 Hallazgo de seguridad y corrección

Durante las pruebas del 17/09/2026 se detectó que `close_event_and_transfer` **se ejecutaba sin sesión iniciada**, saltándose la validación de propietario.

**Causa.** La función es `SECURITY DEFINER`, por lo que omite las políticas de RLS y debe validar al dueño por sí misma. Sin sesión, `auth.uid()` devuelve `NULL`. En PostgreSQL, comparar cualquier valor contra `NULL` con `<>` no da verdadero ni falso: da `NULL`. Y un `IF NULL THEN` simplemente no entra. La validación se saltaba **en silencio**, sin error visible.

**Impacto potencial.** Cualquier persona con la clave anónima — que es pública por diseño — podría haber cerrado el evento de otro usuario llamando la función por RPC.

**Corrección aplicada.**

```sql
v_caller := auth.uid();

-- 1. Rechazo explícito de quien no tiene sesión.
IF v_caller IS NULL THEN
  RAISE EXCEPTION 'Sesión requerida';
END IF;

-- 2. IS DISTINCT FROM en lugar de <>: seguro ante NULL.
IF v_user_id IS DISTINCT FROM v_caller THEN
  RAISE EXCEPTION 'No autorizado';
END IF;
```

**Verificación.** Al invocar la función desde el SQL Editor (sin sesión), devuelve `ERROR: P0001: Sesión requerida`. Comportamiento correcto.

**Regla derivada, ahora obligatoria (§2.2, regla 8):** toda función `SECURITY DEFINER` debe rechazar explícitamente a quien no tiene sesión y comparar identidades con `IS DISTINCT FROM`.

### 5.4 Lo que falta

| Paso | Estado |
|---|---|
| `/supabase/schema.sql` versionado | ✅ v1.2 aplicado y verificado en "Evi charger" el 23/10/2026 (ver 5.5) |
| Repositorio en GitHub | Pendiente |
| Proyecto Next.js: configuración, tokens, ESLint con las reglas 2, 3, 4 y 6 | ✅ Escrito · falta `npm install` y primer build |
| Componentes visuales de las pantallas 3 y 4, registro y reporte | ✅ Escritos (§2.3) · revisables en `/demo` |
| Hooks y servicios de datos | ✅ Dashboard: `movementService`, `eventService` (activos), `useMonthlySummary`, `useMovements`, `useActiveEvents` · pendientes: eventos completos, reporte, metas |
| Autenticación y rutas protegidas | ✅ Registro, login, middleware y cierre de sesión (PR #2) |
| Dashboard real (§3, pantalla 3) | ✅ Balance del mes, últimos movimientos y registro en 3 toques · Dinero, Eventos y Reportes muestran "Próximamente" |
| Landing, registro/login, metas y planes | Pendiente |
| Servicio de telemetría | ✅ Conectado: `signup_*`, `login_succeeded`, `movement_created` (con `seconds_to_complete`) · pendientes: `onboarding_completed` y eventos de las pantallas por construir |
| Configuración de PWA y despliegue en Vercel | Pendiente |

### 5.5 Correcciones de seguridad v1.2 — cómo aplicarlas

Revisión del 03/10/2026, ajustada el 23/10/2026 tras inventariar la base real. **Aplicadas y verificadas en "Evi charger" el 23/10/2026** (ver el resultado al final de esta sección).

| # | Hallazgo | Corrección en `schema.sql` |
|---|---|---|
| 1 | Las vistas de BI en `public` se saltan el RLS y quedan expuestas por la API | Esquema `analytics` no expuesto + `REVOKE` (sección 8) |
| 2 | La vista del balance del Dashboard heredaría el mismo problema | `vw_monthly_summary` y `vw_event_budget` con `security_invoker = true` (sección 7) |
| 3 | `track()` no enviaba `user_id`: toda la telemetría quedaba anónima | `DEFAULT auth.uid()` + política `IS NOT DISTINCT FROM` |
| 4 | Un cliente podía escribir `status` de movimientos o eventos directamente, saltándose la RPC de cierre | `REVOKE` general + `GRANT` por columna (sección 5) |
| 5 | Indefinición contable de los gastos de eventos abiertos | Regla 4d: columna `accounting_date` + trigger `movements_accounting` |

**Inventario de la base real (23/10/2026).** Antes de aplicar, se comparó "Evi charger" contra `schema.sql` columna por columna. Se confirmaron los hallazgos 1, 4 y 5 en producción (`authenticated` podía hacer `UPDATE` de `movements.status`; vistas de BI en `public` sin `security_invoker`; sin `accounting_date`). La base original tenía decisiones de diseño que este spec no documentaba; se decidió:

| En la base v1.1 | Decisión en `schema.sql` |
|---|---|
| `updated_at` + trigger `set_updated_at` en las 8 tablas | Se conserva en 7; se quita de `analytics_events` (append-only) |
| `metadata jsonb` en todas las tablas | Se conserva |
| `categories.color`, `event_tasks.completed_at`, `profiles.onboarded_at` | Se conservan; `completed_at` lo llena un trigger y `onboarded_at` solo el servidor |
| `savings_goals.status`, `waitlist.source`, `waitlist.status` | Se conservan, con valores en español |
| `events.transferred_at` | Se reemplaza por `closed_at`: cierre y transferencia son la misma transacción |
| `movements.kind`, `savings_goals.target_date` | Se reemplazan por `type` y `deadline`, que ya usa el código |
| Función `rls_auto_enable` (event trigger) | Se conserva: activa RLS en cada tabla nueva |

Además, al revisar los privilegios se cerró un hueco: el `INSERT` de `events` era completo y permitía crear un evento ya `cerrado`. Ahora todas las tablas usan `GRANT` por columna.

**Prueba antes de aplicar.** El script se ejecutó en PostgreSQL real (PGlite) con una simulación mínima de Supabase: 31 verificaciones en verde, entre ellas la regla contable, los privilegios por columna, el aislamiento entre dos usuarios, el cierre atómico, el acceso anónimo y las tres consultas de abajo. También se probó correrlo dos veces con el reset activo.

**Cómo aplicarlas.** La base solo tiene cuentas de prueba, así que lo más simple y seguro es recrearla: en el SQL Editor, descomentar la sección 0 de `schema.sql` y ejecutar el archivo completo. **Las cuentas de `auth.users` se conservan:** la sección 10 les recrea el perfil con su nombre, así que no hace falta registrarse de nuevo. Se pierden los eventos, movimientos y metas de prueba.

**Verificación posterior** (las tres deben cumplirse):

```sql
-- 1. Ninguna vista de public corre sin security_invoker (debe dar 0 filas).
SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relkind = 'v'
  AND NOT coalesce(c.reloptions::text[] @> ARRAY['security_invoker=true'], false);

-- 2. anon no puede leer nada de analytics (debe dar false).
SELECT has_schema_privilege('anon', 'analytics', 'USAGE');

-- 3. authenticated no puede escribir movements.status (debe dar false).
SELECT has_column_privilege('authenticated', 'public.movements', 'status', 'UPDATE');
```

Y la prueba con dos usuarios de la Definición de Terminado (§7): el usuario B no ve el balance ni los eventos del usuario A desde la app.

**Resultado de la aplicación (23/10/2026).** El script (`schema.sql` de `main`, commit `8b97363`, con la sección 0 activa) se ejecutó en "Evi charger" sin errores. Verificación posterior:

| Chequeo | Esperado | Resultado |
|---|---|---|
| Estado de la base (`movements.accounting_date` existe) | v1.2 | ✅ v1.2 aplicada |
| Vistas de `public` sin `security_invoker` | 0 | ✅ 0 |
| `anon` puede usar el esquema `analytics` | false | ✅ false |
| `authenticated` puede hacer `UPDATE` de `movements.status` | false | ✅ false |
| Categorías del sistema | 8 | ✅ 8 |
| Cuentas sin perfil | 0 | ✅ 0 |

En la app, cada cuenta inició sesión y vio solo su propio perfil. Los perfiles se recrearon desde `raw_user_meta_data`: las cuentas creadas desde el panel de Supabase (sin nombre) quedaron con `full_name` vacío y la app las saluda con "Hola, de nuevo".

---

## 6. RIESGOS TÉCNICOS RECONOCIDOS

| Riesgo | Impacto | Mitigación | Estado |
|---|---|---|---|
| La transacción de cierre falla a la mitad | **Alto.** Corrompe datos financieros y rompe el diferenciador | Función `rpc` atómica en Postgres | ✅ Implementada y probada |
| Validación de propietario omitida por `NULL` | **Alto.** Un usuario podría cerrar el evento de otro | Rechazo explícito de sesión nula | ✅ Corregido 17/09/2026 |
| Vistas que se saltan el RLS expuestas por la API | **Alto.** Datos financieros agregados legibles con la clave pública | `security_invoker` + esquema `analytics` (regla 9) | ✅ Corregido y aplicado 23/10/2026 |
| Cliente escribe columnas de estado directamente | **Alto.** Un gasto podría "confirmarse" sin cerrar el evento | Privilegios por columna (regla 10) | ✅ Corregido y aplicado 23/10/2026 |
| Sin pruebas automatizadas, una regresión llega a la beta | Medio | Checklist de pruebas manuales por despliegue + Sentry | Pendiente |
| Cuota gratuita de Gemini agotada | Bajo | La categorización es opcional por diseño | Cubierto por diseño |
| Capa gratuita de Supabase superada (~500 MB) | Bajo en el MVP | Ocurre cerca de los 500 usuarios activos; para entonces debería haber ingresos | Monitorear |
| **Sin respaldos automáticos en el plan gratuito** | Medio | `schema.sql` versionado en GitHub reconstruye la base completa | `schema.sql` escrito · falta subirlo a GitHub |
| 3 personas a 12 h/semana durante 8 semanas | **Alto.** Cuello de botella real | Alcance congelado, roles con dueño único, revisión los viernes | En curso |

---

## 7. DEFINICIÓN DE "TERMINADO"

Una funcionalidad está lista cuando cumple **todo** lo siguiente:

- [ ] Funciona en un celular real, no solo en el emulador del navegador
- [ ] Tiene estado de carga, estado vacío y estado de error diseñados
- [ ] No supera las 200 líneas por archivo
- [ ] Sus componentes visuales no consultan la base de datos
- [ ] Dispara los eventos de telemetría que le corresponden
- [ ] Tiene comentarios de cabecera y de decisión
- [ ] **Probada con dos usuarios distintos:** el segundo no ve los datos del primero
- [ ] La revisó otro integrante del equipo
- [ ] Los textos están en español y los montos en formato `Q1,250.00`

---

## 8. BITÁCORA DE CAMBIOS

| Fecha | Versión | Cambio |
|---|---|---|
| 2026-09-05 | 1.0 | Documento inicial: visión, stack, estándares, pantallas y telemetría |
| 2026-09-17 | 1.1 | Base de datos construida y verificada; hallazgo y corrección de la validación de propietario; regla anti-spaghetti #8; sección de estado de implementación; riesgo de falta de respaldos |
| 2026-10-03 | 1.2 | Revisión de seguridad: vistas con `security_invoker` y esquema `analytics` (regla 9), privilegios por columna (regla 10), `user_id` por defecto en telemetría y eliminación de `updated_at`; regla contable de eventos (4d); metas y planes entran al alcance congelado e *Invitados* sale; pestaña Reportes en la navegación; `schema.sql` completo; proyecto Next.js y componentes visuales |
| 2026-10-23 | 1.2.1 | Inventario de la base real: `schema.sql` conserva `updated_at`, `metadata` y otras columnas del diseño original; `GRANT` por columna en todas las tablas (cierra INSERT de eventos ya cerrados); sección 10 de respaldo de perfiles; script probado en PostgreSQL (31 verificaciones). Flujo de trabajo: `CONTRIBUTING.md`, plantilla de PR, GitHub Actions y protección de `main` |
| 2026-10-23 | 1.2.2 | `schema.sql` v1.2 aplicado y verificado en "Evi charger" (6 de 6 chequeos); hallazgos 1, 4 y 5 de §5.5 y riesgos de vistas y columnas de estado cerrados en producción |

---

*Documento vivo. Toda modificación al alcance congelado requiere acuerdo de los tres integrantes y queda registrada en la bitácora.*
