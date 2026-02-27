# 🎓 Guía del Alumno — Simulador MKT SLIM GAME B2B

> **¿Qué es esto?** Una simulación de negocios donde tu equipo dirige una empresa en un mercado B2B real. Semana a semana tomarás decisiones de marketing estratégico y un árbitro de Inteligencia Artificial evaluará las consecuencias de esas decisiones con métricas reales del mundo corporativo.

---

## 1. Cómo Acceder

Tu profesor te entregará una **URL de acceso** al inicio del semestre. Puede ser:
- **Local (en tu campus/red):** `http://<IP del servidor>:3000`
- **En la nube:** `https://MKT SLIM GAME-mkt.up.railway.app` *(URL de ejemplo)*

Al ingresar, verás la pantalla de inicio. Haz clic en **"Soy Alumno"**.

> ⚠️ Tendrás un **ID de Equipo y contraseña** que el profesor te entregará. Guárdalos, los necesitarás cada semana.

---

## 2. El Dashboard — Tu Centro de Comando

Una vez dentro, verás tu **Dashboard de Marca**. Es tu "sala de situación":

| Sección | Qué muestra |
|---|---|
| **Métricas de Marca** | ARR, CAC, Cuota de Mercado y Margen Promedio actualizados al último turno |
| **Tabla de Posiciones** | Ranking de tu mercado — ves dónde estás vs. la competencia (anónima) |
| **Reporte del Árbitro** | El veredicto de IA del turno anterior: qué hiciste bien, qué fallaste |
| **Evento de Mercado** | La disrupción externa que afectará el turno actual |

---

## 3. Las Métricas — Lo que Importa en B2B

Olvida likes y clics. Estas son las métricas reales por las que serás evaluado:

### 📈 ARR (Annual Recurring Revenue)
El ingreso anual recurrente proyectado de tu empresa. **Quieres que suba.** Es el indicador principal de salud de tu negocio.

### 💸 CAC (Customer Acquisition Cost)
Cuánto te cuesta conseguir un cliente nuevo. **Quieres que baje.** Un CAC alto con ARR bajo = estás quemando dinero. La regla de oro B2B es que tu LTV (valor de vida del cliente) debe ser al menos **3x tu CAC**.

### 📊 Cuota de Mercado (%)
Qué porción del mercado total controla tu marca dentro de tu segmento (Económico, Medio o Lujo). Es un juego de **suma cero**: si ganas tú, alguien pierde.

### ⚡ Market Fit Score (MFS)
Un índice de 0 a 1 que mide qué tan bien encajan tus productos con las expectativas del segmento donde compites. Un MFS bajo (< 0.5) es una señal de alarma.

---

## 4. Flujo Semanal (Turno por Turno)

```
LUNES                    MIÉRCOLES                 VIERNES
  │                          │                         │
  ├── Leer el Árbitro     ├── Llenar Decisiones    ├── Enviar a tiempo
  │   del turno pasado    │   (Hoja de Decisiones) │   (deadline duro)
  │                        │                         │
  └── Leer el Evento      └── Revisar el            └── Esperar resultados
      de Mercado               calculador en vivo        del árbitro
```

### Paso a Paso:

**① Leer el Contexto (Lunes)**
- En tu Dashboard, revisa el **Reporte del Árbitro** del turno anterior.
- Lee con atención el **Evento de Mercado** activo: es una disrupción externa (ej: alza de costos, nuevo competidor, cambio regulatorio) que afecta tus decisiones de esta semana.

**② Deliberar en Equipo (Lunes a Miércoles)**
- Discutan como equipo la estrategia. El Evento no tiene solución obvia: parte del aprendizaje es debatir las opciones.
- Cada decisión tiene consecuencias en las métricas:
  - ¿Subiste el precio? → Potencial de más margen, pero riesgo de perder cuota si la competencia no lo hace.
  - ¿Invertiste más en ABM? → Potencial de bajar el CAC, pero solo si el ciclo de ventas lo justifica.
  - ¿Recortaste I+D? → Ahorras hoy, pero el MFS caerá el próximo turno.

**③ Llenar la Hoja de Decisiones (Miércoles a Viernes)**
- Ve a **"Decisiones"** en el menú lateral.
- Encontrarás la tabla de decisiones para los **2 productos de tu marca** (Producto A y Producto B). Debes completar todas las filas.

**④ Enviar antes del Deadline**
- El profesor cerrará la ventana de entrega el **viernes a las 18:00h** (o la hora que indique).
- Las decisiones enviadas después del deadline se usan las del turno anterior automáticamente (sin adaptación al nuevo evento). ⚠️

---

## 5. La Hoja de Decisiones — Campo a Campo

Para **cada producto** de tu marca deberás ingresar:

| Campo | Descripción | Rango |
|---|---|---|
| **Quality Level** | Nivel de calidad del producto (afecta costo y margen) | 1 – 10 |
| **Design Level** | Nivel de diseño/diferenciación (afecta atractivo en Lujo) | 1 – 10 |
| **Retail Price** | Precio de venta al cliente B2B | $1,000 – $20,000 |
| **Discount %** | Descuento sobre precio de lista | 0% – 30% |
| **Ad Spend** | Presupuesto de publicidad y ABM (en USD) | $0 – $20,000,000 |
| **Channels** | Número de canales de distribución/venta activos | 1 – 5 |

**El calculador de la derecha se actualiza en tiempo real** mostrando los resultados proyectados (Costo Unitario, Precio Final con Descuento, Margen por Unidad) para que veas las consecuencias antes de confirmar.

---

## 6. Cómo Interpretar el Veredicto del Árbitro

El Árbitro es un Agente de IA que evalúa la **coherencia estratégica** de tus decisiones frente a los datos del mercado. No premia solo los números, sino la lógica B2B detrás de ellos.

Preguntas que el Árbitro analiza:
- ¿Tu inversión en marketing es coherente con la longitud de tu ciclo de ventas?
- ¿Tu precio resiste la comparación con la competencia de tu segmento?
- ¿Tu CAC está en una proporción razonable con el LTV estimado?

**El Árbitro no da soluciones, solo retroalimentación.** La próxima decisión es tuya.

---

## 7. Preguntas Frecuentes

**¿Puedo cambiar de segmento de mercado?**
No. Al inicio del juego tu equipo es asignado a un segmento (Económico, Medio o Lujo) y compite allí toda la simulación.

**¿Puedo ver las decisiones de la competencia?**
No en detalle. Solo ves sus resultados (ARR, Cuota) en la Tabla de Posiciones. El simulador protege la confidencialidad estratégica.

**¿Qué pasa si enviamos los dos sliders en 0?**
El motor B2B lo interpreta como inacción estratégica. Tu CAC se disparará (nadie te conoce) y tu cuota caerá. El Árbitro lo señalará en su reporte con dureza.

**¿El Árbitro puede equivocarse?**
El Árbitro funciona dentro de las reglas del modelo. Si crees que su veredicto es injusto, puedes presentar una apelación escrita al profesor con el razonamiento estratégico. El profesor tiene la última palabra.

---

*Simulador MKT SLIM GAME — Ayudantía Marketing Estratégico B2B · 2025*
