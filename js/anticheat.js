/**
 * MKT SLIM GAME — anticheat.js
 * Medidas antitrampa del lado del cliente.
 * 
 * IMPORTANTE: La validación REAL ocurre en el servidor (server.js).
 * Este archivo es una capa adicional de disuasión y detección.
 * Un alumno técnicamente avanzado PUEDE saltárselo, pero el servidor
 * lo rechazará de todas formas.
 */

"use strict";

const AntiCheat = (() => {

    // ═══════════════════════════════════════════════════════════════
    // 1. RANGOS VÁLIDOS (espejo del servidor para validación local)
    // ═══════════════════════════════════════════════════════════════
    const LIMITS = {
        quality: { min: 1, max: 10 },
        design: { min: 1, max: 5 },
        retailPrice: { min: 1000, max: 6000 },
        discountPct: { min: 0, max: 50 },
        adSpend: { min: 0, max: 20_000_000 },
        channels: { min: 1, max: 4 },
    };

    const MAX_BUDGET = 30_000_000;

    // ═══════════════════════════════════════════════════════════════
    // 2. PROTECCIÓN DE INPUTS — Forzar rangos incluso si los editan
    // ═══════════════════════════════════════════════════════════════
    function clampInputs() {
        document.querySelectorAll("input[type='range'], input[type='number']").forEach(input => {
            input.addEventListener("change", () => {
                const min = parseFloat(input.getAttribute("min"));
                const max = parseFloat(input.getAttribute("max"));
                let val = parseFloat(input.value);

                if (isNaN(val)) val = min;
                if (val < min) val = min;
                if (val > max) val = max;

                // Para enteros (calidad, diseño, canales)
                if (input.getAttribute("step") === "1") {
                    val = Math.round(val);
                }

                input.value = val;
            });
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 3. DETECCIÓN DE DEVTOOLS — Disuasión (no bloqueo total)
    // ═══════════════════════════════════════════════════════════════
    let devtoolsWarned = false;

    function detectDevTools() {
        // Detectar apertura de DevTools mediante diferencia de tamaño
        const threshold = 160;
        const checkDevTools = () => {
            const widthDiff = window.outerWidth - window.innerWidth;
            const heightDiff = window.outerHeight - window.innerHeight;

            if (widthDiff > threshold || heightDiff > threshold) {
                if (!devtoolsWarned) {
                    devtoolsWarned = true;
                    showWarning();
                }
            }
        };

        setInterval(checkDevTools, 2000);
    }

    function showWarning() {
        // Crear overlay de advertencia
        const overlay = document.createElement("div");
        overlay.id = "ac-warning";
        overlay.innerHTML = `
            <div style="
                position:fixed; inset:0; z-index:99999;
                background:rgba(10,12,20,0.95);
                display:flex; align-items:center; justify-content:center;
                animation: fadeIn 0.4s ease;
            ">
                <div style="
                    text-align:center; max-width:500px; padding:40px;
                    background:#131720; border:2px solid rgba(244,63,94,0.4);
                    border-radius:22px; box-shadow:0 0 60px rgba(244,63,94,0.15);
                ">
                    <div style="font-size:3rem; margin-bottom:16px;">🚨</div>
                    <h2 style="font-size:1.4rem; color:#F43F5E; margin-bottom:12px;">
                        Herramientas de Desarrollo Detectadas
                    </h2>
                    <p style="font-size:0.9rem; color:#94A3B8; line-height:1.6; margin-bottom:20px;">
                        El simulador ha detectado que las herramientas de desarrollador están abiertas.
                        Cualquier intento de modificar datos del juego es registrado y 
                        <strong style="color:#F1F5F9;">las decisiones se validan en el servidor</strong>.
                        La manipulación de datos no tendrá efecto y será reportada al profesor.
                    </p>
                    <button onclick="document.getElementById('ac-warning').remove()" style="
                        padding:10px 24px; background:#F43F5E; color:white;
                        border:none; border-radius:10px; font-weight:700;
                        font-size:0.9rem; cursor:pointer;
                    ">Entendido, cerrar aviso</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    // ═══════════════════════════════════════════════════════════════
    // 4. PROTECCIÓN DE DATOS GLOBALES — Congelar MOCK
    // ═══════════════════════════════════════════════════════════════
    function freezeMockData() {
        // Esperar a que MOCK se cargue y congelarlo
        const waitForMock = setInterval(() => {
            if (window.MOCK) {
                // Deep freeze del objeto MOCK
                deepFreeze(window.MOCK);
                clearInterval(waitForMock);
            }
        }, 100);
    }

    function deepFreeze(obj) {
        Object.freeze(obj);
        Object.getOwnPropertyNames(obj).forEach(prop => {
            if (obj[prop] !== null && typeof obj[prop] === "object" && !Object.isFrozen(obj[prop])) {
                deepFreeze(obj[prop]);
            }
        });
        return obj;
    }

    // ═══════════════════════════════════════════════════════════════
    // 5. DESHABILITAR CLIC DERECHO en la app (disuasión)
    // ═══════════════════════════════════════════════════════════════
    function disableContextMenu() {
        document.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            return false;
        });
    }

    // ═══════════════════════════════════════════════════════════════
    // 6. VALIDACIÓN ANTES DE ENVÍO — Doble check client-side
    // ═══════════════════════════════════════════════════════════════
    function validateBeforeSubmit(products) {
        const errors = [];
        for (const [key, product] of Object.entries(products)) {
            for (const [field, value] of Object.entries(product)) {
                const limit = LIMITS[field];
                if (!limit) continue;
                const num = Number(value);
                if (isNaN(num) || num < limit.min || num > limit.max) {
                    errors.push(`Producto ${key.toUpperCase()}: ${field} = ${value} está fuera de rango [${limit.min}–${limit.max}]`);
                }
            }
        }

        // Verificar presupuesto
        const totalAd = Number(products.a?.adSpend || 0) + Number(products.b?.adSpend || 0);
        const totalCh = (Number(products.a?.channels || 1) + Number(products.b?.channels || 1)) * 2_000_000;
        if (totalAd + totalCh > MAX_BUDGET) {
            errors.push(`Presupuesto total ($${(totalAd + totalCh).toLocaleString()}) supera el máximo de $${MAX_BUDGET.toLocaleString()}`);
        }

        return errors;
    }

    // ═══════════════════════════════════════════════════════════════
    // INICIALIZACIÓN
    // ═══════════════════════════════════════════════════════════════
    function init() {
        clampInputs();
        detectDevTools();
        freezeMockData();
        disableContextMenu();
        console.log(
            "%c🛡️ MKT SLIM GAME — Sistema antitrampa activo. Modificar datos no tendrá efecto: todas las decisiones se validan en el servidor.",
            "color: #F43F5E; font-size: 14px; font-weight: bold; background: #1C2233; padding: 8px 12px; border-radius: 6px;"
        );
    }

    return { init, validateBeforeSubmit };
})();

// Auto-inicializar cuando el DOM esté listo
document.addEventListener("DOMContentLoaded", AntiCheat.init);

// Exportar globalmente
window.AntiCheat = AntiCheat;
