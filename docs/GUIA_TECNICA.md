# 🔧 Guía Técnica — Arquitectura del Simulador MKT SLIM GAME B2B

> Esta guía es para quien administre o extienda el código del proyecto. Cubre la estructura de archivos, el design system, cómo funciona `mock-data.js` y cómo agregar nuevos equipos o mercados.

---

## 1. Stack Tecnológico

| Capa | Tecnología | Notas |
|---|---|---|
| **Frontend** | HTML5 + Vanilla CSS + Vanilla JS | Sin frameworks. Máxima portabilidad. |
| **Design System** | CSS Custom Properties (Variables) | Archivo: `css/design-system.css` |
| **Data Layer (actual)** | `js/mock-data.js` | JSON en memoria. No requiere DB. |
| **Servidor Local** | Python `http.server` o Node.js/Express | Ver `server.js` y `start.bat` |
| **Servidor Producción** | Node.js/Express + plataforma cloud | Railway, Render o Vercel |
| **Motor IA (futuro)** | Python + LLM API (Gemini / OpenAI) | Ver `/docs/DESPLIEGUE_SERVIDOR.md` |

---

## 2. Estructura de Archivos

```
Proyecto MKT Mix/
│
├── index.html                    ← Landing page (selección de rol)
├── student-dashboard.html        ← Dashboard del alumno (métricas + árbitro)
├── student-decisions.html        ← Hoja de decisiones (formulario del turno)
├── student-results.html          ← Resultados y tabla de posiciones
├── professor-panel.html          ← Panel de control del profesor
│
├── css/
│   └── design-system.css         ← Tokens, componentes y utilidades CSS
│
├── js/
│   ├── mock-data.js              ← Base de datos mock (JSON). Actualizar por turno.
│   └── calculator.js             ← Lógica de cálculo en tiempo real del formulario
│
├── docs/
│   ├── GUIA_ALUMNO.md            ← Manual de uso para estudiantes
│   ├── GUIA_PROFESOR.md          ← Manual operativo para el profesor
│   ├── GUIA_TECNICA.md           ← Este archivo
│   └── DESPLIEGUE_SERVIDOR.md    ← Guía de hosting
│
├── server.js                     ← Servidor Node.js/Express (producción)
├── package.json                  ← Dependencias Node.js y scripts
├── .env.example                  ← Variables de entorno requeridas
├── Procfile                      ← Config para Railway/Render
├── start.bat                     ← Lanzador de 1 clic para Windows
├── README.md                     ← Documentación raíz del proyecto
└── Plan_de_Accion_Simulador_B2B.md
```

---

## 3. Design System (`css/design-system.css`)

El archivo define un sistema de diseño completo estilo "Bloomberg Terminal meets Notion". Nunca escribas estilos inline en los HTML; siempre usa las clases del design system.

### Tokens de Color (Variables CSS)

```css
/* Backgrounds */
--bg-primary:   #0A0C14;   /* Fondo principal de página */
--bg-surface:   #131720;   /* Cards y paneles */
--bg-elevated:  #1C2233;   /* Elementos sobre surface (hover, etc.) */

/* Acents */
--accent-blue:    #3B82F6;  /* Acciones primarias, alumno */
--accent-amber:   #F59E0B;  /* Profesor, eventos, alertas */
--accent-emerald: #10B981;  /* Valores positivos (▲ ARR) */
--accent-rose:    #F43F5E;  /* Valores negativos (▼ CAC alto) */

/* Segmentos de Mercado */
--seg-economico: #64748B;
--seg-medio:     #3B82F6;
--seg-lujo:      #F59E0B;
```

### Componentes Principales

| Clase | Descripción |
|---|---|
| `.metric-tile` | Tarjeta de KPI (ARR, CAC, etc.) con acento de color y delta |
| `.card` | Contenedor genérico de sección |
| `.badge--lujo/.badge--medio/.badge--economico` | Etiquetas de segmento |
| `.btn--primary / .btn--amber / .btn--ghost` | Botones de acción |
| `.decision-sheet` | Grid de la hoja de decisiones (3 columnas) |
| `.table` | Tabla de leaderboard/posiciones |
| `.event-card` | Tarjeta de evento de mercado (activo=amber, entrante=rose) |
| `.arbiter-card` | Contenedor del reporte del Árbitro |
| `.sidebar__link.active` | Link de navegación activo |

---

## 4. Cómo Funciona `mock-data.js`

Este archivo es la "base de datos" actual del sistema. Es un objeto JavaScript global `window.MOCK` que todos los HTML leen para renderizar su contenido.

### Para actualizar un turno manualmente:

```js
const MOCK = {
    currentTurn: 5,              // ← cambiar al número del turno nuevo
    currentTurnLabel: "Q1 2026", // ← etiqueta del turno

    team: { /* no cambiar, es el POV para la demo */ },

    brandMetrics: {
        arr:         { value: 5_200_000, delta: +7.8, deltaDir: "up" },
        marketShare: { value: 24.1,     delta: +1.7, deltaDir: "up" },
        avgMargin:   { value: 1_310,    delta: +5.6, deltaDir: "up" },
        cac:         { value: 8_100,    delta: -8.0, deltaDir: "down" },
    },

    // Agrega una nueva entrada al historial cada turno:
    history: [
        { turn: "Q1", arr: 2_100_000, marketShare: 14.2, cac: 12_400, avgMargin: 1_820 },
        // ...turnos anteriores...
        { turn: "Q5", arr: 5_200_000, marketShare: 24.1, cac: 8_100, avgMargin: 1_310 }, // ← NUEVO
    ],

    leaderboard: [
        // Actualizar ARR y share de todos los equipos del segmento
        { rank: 1, isSelf: true, name: "Nexus Corp",  arr: 5_200_000, share: 24.1 },
        { rank: 2, isSelf: false, name: "Rival — #2", arr: 4_800_000, share: 22.3 },
        // ...
    ],

    activeEvent: {
        title: "Nombre del evento de este turno",
        description: "Descripción de 2 líneas del impacto.",
        segmento: "lujo",
        coeficiente: "unit_cost_multiplier",
        delta: "+15%",
        turnActivated: 5,
    },

    arbiterReport: {
        turn: "Q4 2025", // ← turno cuyo veredicto se muestra (el anterior)
        metrics: { /* métricas del turno anterior */ },
        verdict: `Texto del veredicto del árbitro...`,
        incomingEvent: { /* el evento que viene */ },
    },

    professor: {
        segments: {
            economico: { teams: [ /* actualizar */ ] },
            medio:     { teams: [ /* actualizar */ ] },
            lujo:      { teams: [ /* actualizar */ ] },
        },
        events: [ /* historial de eventos */ ],
    },
};
```

---

## 5. `js/calculator.js` — Cálculos en Tiempo Real

Este módulo contiene toda la lógica financiera del formulario de decisiones. Se ejecuta en el navegador, sin backend.

### Fórmulas Principales

```js
// Costo Unitario base (función de Quality y Design)
unitCost = (quality * 200) + (design * 150);

// Precio con descuento
discountedPrice = retailPrice * (1 - discountPct / 100);

// Margen por unidad
margin = discountedPrice - unitCost;

// Costo de canales
channelCost = channels * 2_000_000;

// Cobertura de mercado (reach)
reach = 1 - Math.pow(0.55, channels); // ley de rendimientos decrecientes

// Market Fit Score (0 a 1)
// Penaliza si precio o calidad no encajan con el segmento esperado
mfsScore = calcMFS(segmento, quality, design, retailPrice, discountPct);
```

### Para agregar una nueva variable de decisión:
1. Agrega el input HTML en `student-decisions.html` dentro de la `.decision-sheet`.
2. Registra el campo en el EventListener del calculador en `calculator.js`.
3. Actualiza la fórmula relevante.
4. Agrega el campo a `mock-data.js` dentro de `products.a` y `products.b`.

---

## 6. Agregar un Nuevo Equipo

1. Abre `js/mock-data.js`.
2. Agrega el equipo al array del segmento correspondiente en `professor.segments`:
   ```js
   lujo: {
       teams: [
           // ...existentes...
           { rank: 7, name: "Nuevo Equipo", arr: 0, share: 0 },
       ]
   }
   ```
3. Actualiza `professor.totalTeams` con el nuevo total.
4. *(Cuando el motor Python esté listo)* Agrega el equipo a la hoja `Equipos` en `DB_Master_Simulacion.xlsx`.

## 7. Agregar un Nuevo Mercado/Segmento

1. En `css/design-system.css`, agrega los tokens de color del nuevo segmento:
   ```css
   --seg-enterprise: #A855F7;  /* ejemplo: segmento Enterprise */
   ```
2. Agrega las clases `.badge--enterprise` y `.card--glow-enterprise`.
3. En `js/mock-data.js`, agrega el nuevo segmento en `professor.segments`.
4. En `js/calculator.js`, agrega la lógica de MFS para el nuevo segmento.
5. En `student-dashboard.html`, actualiza el selector de segmento.

---

*Simulador MKT SLIM GAME — Guía Técnica v1.0 · 2025*
