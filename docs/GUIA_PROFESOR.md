# 🎛️ Guía del Profesor — Panel de Orquestación MKT SLIM GAME

> Esta guía cubre el flujo operativo semanal completo: desde recibir las decisiones de los equipos hasta publicar los resultados y el nuevo Evento de Mercado.

---

## 1. Acceso al Panel del Profesor

Ingresa a la URL del simulador y selecciona **"Soy Profesor"**. Usa tus credenciales de administrador.

En el panel verás:
- **Estado del turno actual:** cuántos equipos han enviado sus decisiones vs. cuántos están pendientes.
- **Tabla de Posiciones por Mercado:** ranking global de ARR y Cuota para Económico, Medio y Lujo.
- **Eventos Programados:** los eventos de mercado activos y próximos por segmento.

---

## 2. Flujo Operativo Semanal

```
LUNES              VIERNES 18:00h        SÁBADO               LUNES SIGUIENTE
  │                     │                    │                     │
  ├── Abrir turno   ├── Cerrar        ├── Correr el Motor   ├── Publicar
  │   en el Panel   │   recepción     │   Python (batch)    │   resultados
  │                  │   de decisiones │                     │   a los equipos
  └── Notificar     └── Revisar       └── Revisar y         └── Abrir turno
      a equipos         equipos           aprobar              siguiente
                        pendientes        veredictos
```

---

## 3. Cómo Abrir un Nuevo Turno

1. En el Panel, ve a la sección **"Control de Turno"**.
2. Haz clic en **"Iniciar Turno Q[N]"**.
3. El sistema habilitará el formulario de Decisiones para todos los equipos.
4. Notifica a los estudiantes por el canal de comunicación de tu clase (correo, WhatsApp, etc.) que el turno está abierto.

---

## 4. Seguimiento de Entregas

La tabla **"Estado de Equipos"** en tiempo real muestra:

| Estado | Que significa |
|---|---|
| ✅ Enviado | El equipo completó y envió sus decisiones |
| ⏳ En Progreso | El equipo ha abierto el formulario pero no ha enviado |
| ❌ Pendiente | El equipo no ha ingresado aún |

**Al cierre del plazo**, los equipos marcados como ❌ o ⏳ usarán automáticamente las decisiones del turno anterior. Anota cuáles son para el registro.

---

## 5. Configurar Eventos de Mercado

Los **Eventos de Mercado** son las disrupciones externas que inyectan dinamismo a la simulación. Debes programar al menos uno por turno (puede ser el sugerido por el Árbitro de IA o uno propio).

Para configurar un evento:

1. Ve a **"Eventos"** en el menú lateral del profesor.
2. Haz clic en **"+ Nuevo Evento"**.
3. Completa el formulario:
   - **Nombre:** Título breve (ej: "Alza en Materiales Premium").
   - **Segmento afectado:** Económico / Medio / Lujo / Todos.
   - **Descripción:** 2-3 líneas describiendo el problema. **No insinúes la solución.**
   - **Coeficiente técnico:** El impacto numérico que este evento tiene en el motor de cálculo (ej: `design_cost_multiplier: +0.20`).
   - **Turno de activación:** En qué turno entra en vigor.
4. Guarda. El evento aparecerá automáticamente en el Dashboard de los alumnos del segmento afectado.

### Banco de Eventos Recomendados (B2B Realistas)

| Nombre | Segmento | Coeficiente sugerido |
|---|---|---|
| Alza en Materiales Premium | Lujo | `unit_cost * 1.20` |
| Entrada de Rival Asiático | Económico | `+1 competidor ficticio, share redistribuido` |
| Nueva Regulación de Privacidad (GDPR) | Todos | `ad_spend_efficiency * 0.85` |
| Quiebra de Proveedor Clave | Económico / Medio | `unit_cost * 1.30` |
| Competidor lanza feature de IA | Medio / Lujo | `competitor_mfs_score + 0.10` |
| Recesión leve (desaceleración) | Todos | `market_size * 0.92` |
| Feria Internacional del sector | Medio / Lujo | `ad_spend_efficiency * 1.15` |

---

## 6. Procesar el Turno con el Motor Python

> ⚙️ **Esta sección aplica cuando el motor Python esté integrado.** Por ahora, el simulador funciona con datos mock que debes actualizar manualmente en `js/mock-data.js`.

Cuando el motor esté listo, el flujo será:

1. Descarga las decisiones desde el panel → se generan en la carpeta `Inputs_Turno/`.
2. Actualiza el clima del mercado en `DB_Master_Simulacion.xlsx`.
3. Ejecuta `Correr_Semana.bat` (o `python engine.py` desde la terminal).
4. El motor procesa los 20 equipos, llama al LLM y genera los reportes en `Outputs_Turno/`.
5. Sube los resultados al panel → los equipos los ven automáticamente en su Dashboard.

---

## 7. Actualización Manual de Datos (Modo Actual — Sin Motor Python)

Hasta que el motor Python esté conectado, los resultados se actualizan manualmente en `js/mock-data.js`.

Para actualizar los datos de un turno:

1. Abre el archivo `js/mock-data.js` en cualquier editor de texto (VSCode recomendado).
2. Actualiza los campos del turno correspondiente:
   - `currentTurn` → número del nuevo turno (ej: 5)
   - `currentTurnLabel` → etiqueta (ej: `"Q5 2026"`)
   - `brandMetrics` → ARR actual, CAC, Cuota y Margen para el equipo de vista
   - `history` → Agrega una entrada al array con los datos del turno recién completado
   - `leaderboard` → Actualiza ARR y Cuota de todos los equipos del segmento
   - `professor.segments` → Actualiza todos los segmentos
3. Guarda el archivo. Los cambios se reflejan al recargar el navegador.

---

## 8. Notas Pedagógicas

### Sobre el Árbitro de IA
- El Árbitro está diseñado para ser **directo y crítico**, no diplomático. Esto es intencional: reproduce la cultura de feedback del mundo corporativo B2B.
- Si un equipo cuestiona el veredicto, invítalo a argumentarlo públicamente. Es una instancia de aprendizaje.

### Sobre la Tabla de Posiciones
- Los rivales se muestran **anónimos** (ej: "Rival — #2") para los alumnos. Tú, como profesor, ves los nombres reales.
- Esto incentiva el análisis de mercado sin generar conflictos personales entre grupos.

### Sobre Equipos que No Entregan
- El sistema usa las decisiones del turno anterior. Esto tiene consecuencias: no adaptarse al evento de mercado actual penaliza las métricas. El mercado no espera.

---

## 9. Glosario Rápido B2B

| Término | Definición |
|---|---|
| **ARR** | Annual Recurring Revenue. Ingresos anuales recurrentes proyectados. |
| **CAC** | Customer Acquisition Cost. Costo promedio de conseguir un cliente nuevo. |
| **LTV** | Lifetime Value. Valor total que un cliente genera durante su relación con la empresa. |
| **ABM** | Account-Based Marketing. Estrategia de marketing dirigida a cuentas/empresas específicas. |
| **MFS** | Market Fit Score. Índice de ajuste del producto al segmento de mercado (0–1). |
| **ACV** | Annual Contract Value. Valor anual de un contrato firmado. |
| **Ciclo de Ventas B2B** | Tiempo promedio desde el primer contacto hasta el cierre. Suele ser de 3 a 12 meses. |

---

## 10. Modificar Parámetros Internos del Programa

Esta sección es clave: permite calibrar el motor de simulación sin reescribir el código. Los parámetros están concentrados en dos archivos fáciles de editar.

---

### 10.1 Parámetros Financieros y de Cálculo (`js/calculator.js`)

Abre `js/calculator.js` y busca la sección `// ── PARÁMETROS CONFIGURABLES`. Aquí encontrarás todas las constantes que definen la economía del juego:

```js
// ═══════════════════════════════════════════════
// PARÁMETROS CONFIGURABLES — editar con confianza
// ═══════════════════════════════════════════════

// Costo unitario: cuánto pesa cada punto de Quality y Design
const QUALITY_COST_PER_LEVEL = 200;   // USD por nivel de calidad (1–10)
const DESIGN_COST_PER_LEVEL  = 150;   // USD por nivel de diseño  (1–10)

// Costo de canales de distribución por canal activo
const CHANNEL_COST_PER_UNIT  = 2_000_000; // USD por canal

// Ley de rendimientos decrecientes para el "reach" de canales
// Más alto = la cobertura crece más rápido con menos canales
const CHANNEL_REACH_BASE = 0.55;

// Umbrales de Market Fit Score por segmento
// Define qué calidad/precio mínimo esperan los compradores de cada mercado
const MFS_THRESHOLDS = {
    economico: { minQuality: 3, maxPrice: 4000, penaltyDesign: false },
    medio:     { minQuality: 5, maxPrice: 8000, penaltyDesign: false },
    lujo:      { minQuality: 7, maxPrice: 99999, penaltyDesign: true }, // Design penaliza si < 6
};
```

**Cuándo cambiar estos valores:**
- **Quieres que sea más difícil ser rentable en Lujo** → sube `QUALITY_COST_PER_LEVEL` y `DESIGN_COST_PER_LEVEL`.
- **Los márgenes son demasiado altos para todos** → sube el costo por canal (`CHANNEL_COST_PER_UNIT`).
- **El MFS sube demasiado fácil** → sube los `minQuality` en `MFS_THRESHOLDS`.

---

### 10.2 Parámetros de Mercado y Competencia (`js/mock-data.js`)

Abre `js/mock-data.js`. Aquí controlas el "tablero" completo de la simulación:

#### Tamaño Total del Mercado por Segmento
```js
// Busca esta sección al inicio del objeto MOCK:
marketConditions: {
    economico: { totalMarketSize: 11_250_000, growthRate: 0.04 },  // USD + crecimiento anual
    medio:     { totalMarketSize: 19_400_000, growthRate: 0.06 },
    lujo:      { totalMarketSize: 21_500_000, growthRate: 0.03 },
},
```
- **Reduce `totalMarketSize`** para hacer la competencia más feroz (la cuota de cada equipo vale menos ARR absoluto).
- **Sube `growthRate`** si quieres que el mercado sea más generoso (todos pueden crecer a la vez).

#### Número de Equipos Activos
```js
professor: {
    totalTeams: 18,  // ← cambia esto si hay más o menos grupos
```

#### Deadline de Entrega (Visual)
```js
// En el topnav de student-decisions.html hay un contador visual.
// Actualiza la fecha de cierre del turno en cada HTML:
const DEADLINE = new Date("2026-03-07T18:00:00"); // ← fecha del próximo viernes
```

---

### 10.3 Parámetros de Eventos de Mercado

Los coeficientes de los eventos afectan directamente al calculador. Para agregar o editar uno:

```js
events: [
    {
        turn: "Q5",
        segmento: "economico",
        name: "Entrada Rival Asiático",
        coef: "competitor_count + 1",  // ← el motor redistribuye cuota entre N+1 equipos
        status: "pending"
    },
    {
        turn: "Q5",
        segmento: "medio",
        name: "Nueva Regulación de Etiquetado",
        coef: "unit_cost + 50",         // ← suma $50 al costo unitario de todos en Medio
        status: "pending"
    },
],
```

**Coeficientes válidos actualmente:**
| Coeficiente | Efecto |
|---|---|
| `unit_cost * X` | Multiplica el costo unitario (ej: `unit_cost * 1.20` = sube 20%) |
| `unit_cost + N` | Suma un monto fijo al costo unitario |
| `ad_spend_efficiency * X` | Multiplica el rendimiento del Ad Spend |
| `design_cost_multiplier * X` | Multiplica solo el componente de costo de diseño |
| `market_size * X` | Contrae o expande el tamaño del mercado (ej: `0.92` = recesión leve) |
| `competitor_count + N` | Agrega N competidores ficticios, redistribuyendo cuota |

---

### 10.4 Rangos de los Sliders (Límites de Decisión)

Si quieres cambiar qué tan agresivos pueden ser los equipos (ej: limitar el presupuesto máximo de publicidad), edita los atributos `min`, `max` y `step` en `student-decisions.html`:

```html
<!-- Ejemplo: Slider de Ad Spend -->
<input type="range"
    id="adSpendA"
    min="0"
    max="20000000"   ← cambia este límite superior
    step="500000"    ← cambia la granularidad del slider
    value="8000000">
```

**Regla práctica:** El `max` del Ad Spend debería ser menor al ARR promedio esperado del turno para que los equipos deban priorizar. Si es demasiado fácil saturar el mercado con publicidad, bájalo.

---

*Simulador MKT SLIM GAME — Ayudantía Marketing Estratégico B2B · 2025*
