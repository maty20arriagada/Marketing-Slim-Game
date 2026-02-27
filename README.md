# 🚀 MKT SLIM GAME B2B Simulator

> Motor de Simulación de Estrategia de Marketing B2B para ayudantías universitarias. Diseñado para alojar hasta **20 equipos de trabajo** compitiendo en **3 mercados simultáneos**, con evaluación por Inteligencia Artificial semana a semana.

---

## 🎯 ¿Qué es esto?

Una plataforma web donde equipos de estudiantes toman decisiones semanales de marketing B2B (pricing, ad spend, canales, I+D) y reciben retroalimentación de un **Árbitro de IA** basado en métricas reales del mundo corporativo: ARR, CAC, Cuota de Mercado y Market Fit Score.

---

## ⚡ Inicio Rápido

### Opción 1 — 1 Clic (Windows)
Abre `start.bat` con doble clic. El script detecta automáticamente si tienes Node.js o Python y levanta el servidor.

### Opción 2 — Node.js
```bash
npm install
npm start
# → http://localhost:3000
```

### Opción 3 — Python (ya instalado)
```bash
python -m http.server 8765
# → http://localhost:8765
```

---

## 🗂️ Estructura del Proyecto

```
Proyecto MKT Mix/
│
├── index.html                  ← Página de inicio (selección de rol)
├── student-dashboard.html      ← Dashboard del alumno
├── student-decisions.html      ← Formulario de decisiones semanales
├── student-results.html        ← Resultados y tabla de posiciones
├── professor-panel.html        ← Panel de control del profesor
│
├── css/design-system.css       ← Sistema de diseño completo
├── js/
│   ├── mock-data.js           ← Base de datos (actualizar por turno)
│   └── calculator.js          ← Calculador financiero en tiempo real
│
├── docs/
│   ├── GUIA_ALUMNO.md         ← Manual para estudiantes
│   ├── GUIA_PROFESOR.md       ← Manual de orquestación + parámetros
│   ├── GUIA_TECNICA.md        ← Arquitectura y extensión del código
│   └── DESPLIEGUE_SERVIDOR.md ← Cómo hostear en la nube
│
├── server.js                   ← Servidor Express (producción)
├── package.json
├── .env.example                ← Variables de entorno requeridas
├── Procfile                    ← Para Railway / Render
└── start.bat                   ← Lanzador Windows de 1 clic
```

---

## 🏪 Los 3 Mercados

| Segmento | Descripción | Color |
|---|---|---|
| 🏷️ **Económico** | Clientes sensibles al precio, márgenes ajustados | Gris |
| ⚡ **Medio** | Equilibrio precio-valor, ciclo de ventas estándar | Azul |
| 💎 **Lujo** | Premium, diferenciación por diseño y calidad, ciclo largo | Ámbar |

---

## 📊 Métricas del Simulador

| Métrica | Descripción |
|---|---|
| **ARR** | Annual Recurring Revenue — Ingreso anual recurrente |
| **CAC** | Customer Acquisition Cost — Costo de adquirir un cliente |
| **Market Share** | Cuota de mercado dentro del segmento |
| **MFS** | Market Fit Score — Ajuste del producto al segmento (0–1) |

---

## 📚 Documentación

| Guía | Para quién |
|---|---|
| [GUIA_ALUMNO.md](docs/GUIA_ALUMNO.md) | Estudiantes: flujo semanal, métricas, cómo llenar decisiones |
| [GUIA_PROFESOR.md](docs/GUIA_PROFESOR.md) | Profesor: orquestación, eventos, **parámetros internos** |
| [GUIA_TECNICA.md](docs/GUIA_TECNICA.md) | Desarrollador: arquitectura, design system, cómo extender |
| [DESPLIEGUE_SERVIDOR.md](docs/DESPLIEGUE_SERVIDOR.md) | Hosting: local, Railway, Render, Vercel, Nginx |

---

## 🔧 Requisitos

- **Node.js** >= 18 *(recomendado)* o **Python** >= 3.8
- Navegador moderno (Chrome, Firefox, Edge)
- Conexión a internet (para fuentes Google Fonts)

---

## 🌐 Deployment en la Nube

Ver guía completa en [docs/DESPLIEGUE_SERVIDOR.md](docs/DESPLIEGUE_SERVIDOR.md).

**Plataformas soportadas:**
- Railway ⭐ (recomendada)
- Render
- Vercel *(solo frontend estático)*
- VPS propio con Nginx

---

## 🗓️ Roadmap

- [x] Frontend completo (5 páginas, design system, calculador)
- [x] Datos mock con 3 mercados y múltiples equipos
- [x] Servidor Express listo para producción
- [x] Guías de uso para alumno y profesor
- [ ] Motor Python de procesamiento batch (20 equipos)
- [ ] Integración LLM (Árbitro de IA en vivo)
- [ ] Autenticación de equipos (login por ID)
- [ ] Base de datos persistente (PostgreSQL / SQLite)

---

*Ayudantía Marketing Estratégico B2B · Universidad · 2025*
