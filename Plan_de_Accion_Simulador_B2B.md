# 🚀 Plan de Acción: Simulador MKT SLIM GAME B2B (Multimercado y Multiequipo)

## 🎯 Objetivo General
Desarrollar un motor de simulación local interactivo para estudiantes de Estrategia de Marketing B2B, diseñado para alojar hasta **20 grupos de trabajo compitiendo en 3 mercados diferentes**. 
El sistema gestionará la persistencia de datos **semana tras semana** usando Excel como base de datos en local. Generará retroalimentación no solo individual, sino competitiva, permitiendo a los grupos ver cómo se posicionan frente a sus rivales directos en su mismo mercado.

---

## 🏗️ Fase 1: Arquitectura de la Base de Datos Local (Excel) y Carpetas

Dado que manejaremos múltiples equipos, semanas y mercados, el diseño evoluciona de "un solo archivo" a un ecosistema centralizado:

**Hito 1.1: Estructura de Directorios**
*   [ ] Crear estructura base:
    *   📁 `DB/`: Contendrá la base de datos maestra.
    *   📁 `Inputs_Turno/`: Carpeta donde se soltarán los Excels de los 20 grupos cada semana.
    *   📁 `Outputs_Turno/`: Carpeta donde se generarán los Excels actualizados con retroalimentación.
*   [ ] Configurar entorno virtual (`venv`) con dependencias (`pandas`, `openpyxl`, `python-dotenv`).

**Hito 1.2: Base de Datos Maestra (`DB_Master_Simulacion.xlsx`)**
*   [ ] Archivo para uso exclusivo del **Profesor**. Funcionará como base de datos relacional sencilla.
*   [ ] **Hoja 1 (`Mercados`)**: Configuración macroeconómica y eventos globales para Mercado A, Mercado B y Mercado C.
*   [ ] **Hoja 2 (`Equipos`)**: Registro (ID Equipo, Nombre, Asignación de Mercado).
*   [ ] **Hoja 3 (`Historial_Transaccional`)**: Tabla maestra con registros semana a semana: `Semana | ID Equipo | Mercado | Presupuesto ABM | I+D | Pricing | FTEs | CAC Resultante | ARR Resultante | Cuota de Mercado (%)`.

**Hito 1.3: Plantilla del Alumno (`Plantilla_Equipo.xlsx`)**
*   [ ] **Hoja 1 (`Decisiones`)**: Formulario para la semana actual (Presupuesto, etc.).
*   [ ] **Hoja 2 (`Dashboard y Árbitro`)**: Dashboard que mostrará semana a semana la evolución (ARR, CAC), el veredicto del Agente de IA, y la posición de la competencia en el mismo mercado.

---

## ⚙️ Fase 2: Desarrollo del Motor de Orquestación (Python)

**Hito 2.1: Ingesta Masiva y Agrupación por Mercados**
*   [ ] Desarrollar `ingestion_engine.py`: Un script que barra la carpeta `Inputs_Turno/`, levante los 20 Excels a la vez y los asocie a su mercado correspondiente usando la base de datos maestra.
*   [ ] Validación de integridad: Alertar al profesor si faltan envíos (ej. "Falta archivo del Grupo 7").

**Hito 2.2: Lógica Competitiva Multimercado (Juego de Suma Cero)**
*   [ ] Implementar `market_engine.py`: Lógica para procesar cada mercado de forma asilada (Mercado A, luego B, luego C).
*   [ ] Si en el Mercado A hay 7 equipos, la Cuota de Mercado de cada uno debe ajustarse en base al desempeño relativo entre ellos. (Ej: Si todos bajan el precio, nadie gana ventaja; si uno sube I+D drásticamente, le roba cuota al resto).

**Hito 2.3: Invocación LLM (El Árbitro) con Contexto Competitivo**
*   [ ] Modificar el Prompt del LLM para incluir no solo el desempeño del equipo, sino "lo que hizo la competencia": *"<competencia_market_A> El Equipo 2 bajó precios un 10%, y el Equipo 5 aumentó inversión en ABM un 20% </competencia_market_A>"*.
*   [ ] Gestionar peticiones concurrentes o en bucle seguro al LLM para evaluar los 20 equipos por cada semana.

---

## 📈 Fase 3: Generación de Reportes y Historial

**Hito 3.1: Actualización del Dashboard del Grupo**
*   [ ] Desarrollar `report_generator.py`: Script que sobrescribe o crea una nueva versión del Excel de cada equipo en la carpeta `Outputs_Turno/`.
*   [ ] Anexar una fila al historial del equipo para que puedan crear gráficos de la evolución de su ARR y CAC vs el tiempo.
*   [ ] Incorporar una **Tabla de Posiciones del Mercado**: Mostrar a los estudiantes cómo va su ARR y Cuota vs el resto de los equipos de su mercado (Anonimizando detalles estratégicos, mostrando solo resultados).

**Hito 3.2: Consolidación de la Base de Datos Maestra**
*   [ ] Actualizar la hoja `Historial_Transaccional` del `DB_Master` con las métricas devueltas por el LLM.
*   [ ] El motor avanza el "reloj de simulación" (Turno/Semana + 1).

---

## � Fase 4: Flujo de Trabajo y Pruebas Iniciales (Playtesting)

**Hito 4.1: Flujo Operativo del Profesor (1 Clic)**
*   [ ] Crear el ejecutable `Correr_Semana.bat`.
*   [ ] Flujo real documentado:
    1. Profesor recibe 20 Excels y los guarda en `Inputs_Turno/`.
    2. Modifica el clima de los Mercados en el Excel Master si lo desea.
    3. Doble clic en `Correr_Semana.bat`.
    4. El script procesa competencia, consulta al LLM, actualiza DB y genera los 20 nuevos archivos en `Outputs_Turno/`.
    5. Profesor envía los nuevos Excels de vuelta a los estudiantes.

**Hito 4.2: Simulación de Prueba (Mockup Data)**
*   [ ] Crear script en Python para auto-generar los primeros 20 Excels del Turno 0 para iniciar una prueba simulada.
*   [ ] Ejecutar Turno 1 y 2 con estos equipos ficticios para asegurar que la "Tabla de Posiciones" y la persistencia temporal en Excel funcionan sin corromper los archivos.
