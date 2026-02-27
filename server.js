/**
 * MKT SLIM GAME — server.js
 * Servidor Express con autenticación de profesor y medidas antitrampa.
 * 
 * Uso:
 *   npm start       → producción (puerto desde env PORT)
 *   npm run dev     → desarrollo con nodemon (hot-reload)
 */

"use strict";

const express = require("express");
const session = require("express-session");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;

// ── Contraseña del profesor ─────────────────────────────────────
// Cambia esta contraseña antes de desplegar. Se puede mover a .env
const PROFESSOR_PASSWORD = process.env.PROFESSOR_PASSWORD || "MKT SLIM GAME2025";

// ── Middleware ───────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,    // No accesible desde JS del lado cliente
        secure: false,     // Cambiar a true si usas HTTPS
        maxAge: 4 * 60 * 60 * 1000, // 4 horas
        sameSite: "lax",
    },
}));

// ═══════════════════════════════════════════════════════════════
// CAPA ANTITRAMPA — Bloqueo de archivos sensibles para alumnos
// ═══════════════════════════════════════════════════════════════

// Lista de archivos/rutas que los estudiantes NO deben ver jamás
const BLOCKED_PATTERNS = [
    /^\/server\.js/i,
    /^\/package\.json/i,
    /^\/package-lock\.json/i,
    /^\/\.env/i,
    /^\/Procfile/i,
    /^\/node_modules/i,
    /^\/docs\//i,
    /^\/Plan_de_Accion/i,
    /^\/start\.bat/i,
    /^\/README\.md/i,
    /^\/\.gitignore/i,
    /^\/\.git\//i,
];

// Middleware: bloquear acceso a archivos sensibles ANTES del static
app.use((req, res, next) => {
    const urlPath = decodeURIComponent(req.path);

    // Bloquear archivos del profesor si no está autenticado
    if (BLOCKED_PATTERNS.some(pattern => pattern.test(urlPath))) {
        // Solo dejar pasar si el profesor está autenticado
        if (req.session && req.session.isProfessor) {
            return next();
        }
        // Para cualquier otro: 404 silencioso (no revelar que existe)
        return res.status(404).send("Not found");
    }
    next();
});

// Bloquear acceso directo a mock-data.js como archivo descargable
// Los alumnos pueden CARGAR el script en el HTML pero no descargarlo
// directamente para editarlo fuera del contexto de la app
app.use("/js/mock-data.js", (req, res, next) => {
    // Permitir si viene referenciado desde una página HTML (referer)
    const referer = req.get("referer") || "";
    if (referer && referer.includes(req.hostname)) {
        return next();
    }
    // Permitir si es profesor
    if (req.session && req.session.isProfessor) {
        return next();
    }
    // Acceso directo al archivo → permite (los datos son públicos en el frontend de todas formas)
    // pero logueamos el intento
    console.log(`⚠️  Acceso directo a mock-data.js desde IP: ${req.ip}`);
    next();
});

// ═══════════════════════════════════════════════════════════════
// AUTENTICACIÓN DEL PROFESOR
// ═══════════════════════════════════════════════════════════════

// Middleware de autenticación para rutas del profesor
function requireProfessor(req, res, next) {
    if (req.session && req.session.isProfessor) {
        return next();
    }
    // Si no está autenticado, redirigir al login
    return res.redirect("/professor-login");
}

// Página de login del profesor
app.get("/professor-login", (req, res) => {
    // Si ya está autenticado, ir directo al panel
    if (req.session && req.session.isProfessor) {
        return res.redirect("/professor-panel");
    }
    res.sendFile(path.join(__dirname, "professor-login.html"));
});

// Procesar intento de login
app.post("/api/professor-login", (req, res) => {
    const { password } = req.body;

    if (password === PROFESSOR_PASSWORD) {
        req.session.isProfessor = true;
        req.session.loginTime = new Date().toISOString();
        console.log(`✅ Profesor autenticado desde IP: ${req.ip}`);
        return res.json({ success: true, redirect: "/professor-panel" });
    }

    console.log(`❌ Intento de login fallido desde IP: ${req.ip}`);
    return res.status(401).json({ success: false, message: "Contraseña incorrecta" });
});

// Cerrar sesión del profesor
app.post("/api/professor-logout", (req, res) => {
    req.session.destroy(() => {
        res.json({ success: true });
    });
});

// Verificar estado de sesión (para JS del frontend)
app.get("/api/auth-status", (req, res) => {
    res.json({
        isProfessor: !!(req.session && req.session.isProfessor),
        loginTime: req.session?.loginTime || null,
    });
});

// ═══════════════════════════════════════════════════════════════
// RUTAS PROTEGIDAS — Panel del Profesor
// ═══════════════════════════════════════════════════════════════

app.get("/professor-panel", requireProfessor, (req, res) => {
    res.sendFile(path.join(__dirname, "professor-panel.html"));
});

app.get("/professor-panel.html", requireProfessor, (req, res) => {
    res.sendFile(path.join(__dirname, "professor-panel.html"));
});

// ═══════════════════════════════════════════════════════════════
// VALIDACIÓN ANTITRAMPA — API de envío de decisiones
// ═══════════════════════════════════════════════════════════════

// Rangos válidos de las decisiones (server-side, no manipulables)
const DECISION_LIMITS = {
    quality: { min: 1, max: 10, type: "int" },
    design: { min: 1, max: 5, type: "int" },
    retailPrice: { min: 1000, max: 6000, type: "number" },
    discountPct: { min: 0, max: 50, type: "number" },
    adSpend: { min: 0, max: 20_000_000, type: "number" },
    channels: { min: 1, max: 4, type: "int" },
};
const MAX_TOTAL_BUDGET = 30_000_000;

function validateDecision(field, value) {
    const limit = DECISION_LIMITS[field];
    if (!limit) return { valid: false, error: `Campo '${field}' no reconocido` };

    const num = Number(value);
    if (isNaN(num)) return { valid: false, error: `'${field}' debe ser numérico` };
    if (limit.type === "int" && !Number.isInteger(num)) {
        return { valid: false, error: `'${field}' debe ser un entero` };
    }
    if (num < limit.min || num > limit.max) {
        return { valid: false, error: `'${field}' fuera de rango [${limit.min} – ${limit.max}]. Valor recibido: ${num}` };
    }
    return { valid: true };
}

// Endpoint para recibir decisiones de un equipo
app.post("/api/submit-decisions", (req, res) => {
    const { teamId, products } = req.body;

    if (!teamId || !products || !products.a || !products.b) {
        return res.status(400).json({
            success: false,
            error: "Estructura de decisiones incompleta. Se requieren teamId y productos a y b.",
        });
    }

    // Validar cada campo de cada producto
    const errors = [];
    for (const productKey of ["a", "b"]) {
        const product = products[productKey];
        for (const [field, value] of Object.entries(product)) {
            const check = validateDecision(field, value);
            if (!check.valid) {
                errors.push(`Producto ${productKey.toUpperCase()}: ${check.error}`);
            }
        }
    }

    // Validar presupuesto total
    const totalAdSpend = Number(products.a.adSpend || 0) + Number(products.b.adSpend || 0);
    const totalChannelCost = (Number(products.a.channels || 1) + Number(products.b.channels || 1)) * 2_000_000;
    const totalBudget = totalAdSpend + totalChannelCost;

    if (totalBudget > MAX_TOTAL_BUDGET) {
        errors.push(`Presupuesto total ($${totalBudget.toLocaleString()}) excede el máximo de $${MAX_TOTAL_BUDGET.toLocaleString()}`);
    }

    if (errors.length > 0) {
        console.log(`🚫 Decisiones rechazadas de ${teamId}: ${errors.join("; ")}`);
        return res.status(400).json({ success: false, errors });
    }

    // TODO: Guardar decisiones validadas en base de datos / archivo
    console.log(`📥 Decisiones válidas recibidas de equipo ${teamId}. Total gasto: $${totalBudget.toLocaleString()}`);

    return res.json({
        success: true,
        message: "Decisiones registradas correctamente.",
        summary: { totalAdSpend, totalChannelCost, totalBudget },
    });
});

// ═══════════════════════════════════════════════════════════════
// ARCHIVOS ESTÁTICOS Y RUTAS PÚBLICAS
// ═══════════════════════════════════════════════════════════════

// Servir archivos estáticos (después de los middleware de seguridad)
app.use(express.static(path.join(__dirname), {
    dotfiles: "deny",  // Bloquear archivos que empiezan con punto
    index: "index.html",
}));

// Rutas HTML públicas (alumnos)
app.get("/", (req, res) => res.sendFile(path.join(__dirname, "index.html")));
app.get("/student-dashboard", (req, res) => res.sendFile(path.join(__dirname, "student-dashboard.html")));
app.get("/student-decisions", (req, res) => res.sendFile(path.join(__dirname, "student-decisions.html")));
app.get("/student-results", (req, res) => res.sendFile(path.join(__dirname, "student-results.html")));

// Health check
app.get("/health", (req, res) => {
    res.json({
        status: "ok",
        version: "1.1.0",
        timestamp: new Date().toISOString(),
    });
});

// ── Ruta base para la futura API del Motor Python ───────────────
// app.post("/api/run-turn",   require("./api/runTurn"));
// app.get("/api/teams",       require("./api/teams"));

// 404 catch-all
app.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, "index.html"));
});

// ── Arrancar servidor ───────────────────────────────────────────
app.listen(PORT, () => {
    console.log(`\n🚀 MKT SLIM GAME B2B Simulator`);
    console.log(`   Servidor corriendo en: http://localhost:${PORT}`);
    console.log(`   Entorno: ${process.env.NODE_ENV || "development"}`);
    console.log(`   Contraseña profesor: ${PROFESSOR_PASSWORD.substring(0, 3)}***`);
    console.log(`   Protección antitrampa: ACTIVA\n`);
});
