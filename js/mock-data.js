/**
 * MKT SLIM GAME — mock-data.js
 * Datos ficticios para demo sin backend.
 * Simula el estado de la base de datos tras 3 turnos completados.
 */

"use strict";

const MOCK = {
    currentTurn: 4,
    currentTurnLabel: "Q4 2025",

    // ── EQUIPO ACTIVO (POV del alumno) ──────────────────────────
    team: {
        id: "T-07",
        name: "Nexus Corp",
        segmento: "lujo",
        segmentoLabel: "💎 Mercado Lujo",
    },

    // ── MÉTRICAS DE MARCA (nivel consolidado) ──────────────────
    brandMetrics: {
        arr: { value: 4_820_000, delta: +12.4, deltaDir: "up" },
        marketShare: { value: 22.4, delta: +2.1, deltaDir: "up" },
        avgMargin: { value: 1_240, delta: -3.2, deltaDir: "down" },
        cac: { value: 8_800, delta: -10.2, deltaDir: "down", note: "CAC menor = más eficiente" },
    },

    // ── HISTORIAL TURNOS (para sparklines) ─────────────────────
    history: [
        { turn: "Q1", arr: 2_100_000, marketShare: 14.2, cac: 12_400, avgMargin: 1_820 },
        { turn: "Q2", arr: 3_280_000, marketShare: 18.1, cac: 10_900, avgMargin: 1_450 },
        { turn: "Q3", arr: 4_300_000, marketShare: 20.3, cac: 9_800, avgMargin: 1_380 },
        { turn: "Q4", arr: 4_820_000, marketShare: 22.4, cac: 8_800, avgMargin: 1_240 },
    ],

    // ── PRODUCTOS DEL EQUIPO ────────────────────────────────────
    products: {
        a: {
            id: "A",
            name: "Aurora Pro",
            quality: 8, design: 4,
            retailPrice: 5200, channels: 3,
            discountPct: 5, adSpend: 8_000_000,
            // Calculados (mostrados en dashboard, recalculados en formulario)
            unitCost: 2600, discPrice: 4940, margin: 2340,
            channelCost: 6_000_000, reach: 0.90,
            segmentShare: 14.1,
            mfsScore: 0.78,
        },
        b: {
            id: "B",
            name: "Aurora Lite",
            quality: 6, design: 3,
            retailPrice: 3800, channels: 3,
            discountPct: 10, adSpend: 4_000_000,
            unitCost: 1950, discPrice: 3420, margin: 1470,
            channelCost: 6_000_000, reach: 0.90,
            segmentShare: 8.3,
            mfsScore: 0.55,
        },
    },

    // ── TABLA DE POSICIONES (segmento Lujo, anónima) ────────────
    leaderboard: [
        { rank: 1, isSelf: true, name: "Nexus Corp", arr: 4_820_000, share: 22.4 },
        { rank: 2, isSelf: false, name: "Rival — #2", arr: 4_100_000, share: 19.1 },
        { rank: 3, isSelf: false, name: "Rival — #3", arr: 3_900_000, share: 18.2 },
        { rank: 4, isSelf: false, name: "Rival — #4", arr: 3_100_000, share: 14.4 },
        { rank: 5, isSelf: false, name: "Rival — #5", arr: 2_900_000, share: 13.8 },
        { rank: 6, isSelf: false, name: "Rival — #6", arr: 2_600_000, share: 12.1 },
    ],

    // ── EVENTO ACTIVO TURNO 4 ───────────────────────────────────
    activeEvent: {
        title: "Alza en Materiales Premium",
        description: "Los proveedores de componentes de alta gama reportan escasez. El costo de Design Level sube un 20% para el segmento Lujo este trimestre.",
        segmento: "lujo",
        coeficiente: "design_cost_multiplier",
        delta: "+20%",
        turnActivated: 4,
    },

    // ── EVENTO ENTRANTE TURNO 5 (señal débil) ──────────────────
    incomingSignal: {
        title: "Señal de Mercado",
        description: "Analistas del sector reportan que fondos de capital privado están evaluando activos en el segmento premium. La consolidación podría reconfigurar el panorama competitivo.",
    },

    // ── REPORTE DEL ÁRBITRO Q3 (último turno completado) ───────
    arbiterReport: {
        turn: "Q3 2025",
        metrics: {
            arr: { value: 4_300_000, deltaDir: "up", deltaPct: "+31.1%" },
            marketShare: { value: 20.3, deltaDir: "up", deltaPct: "+2.2pp" },
            avgMargin: { value: 1_380, deltaDir: "down", deltaPct: "-4.8%" },
        },
        verdict: `Su inversión concentrada en ABM Estratégico para "Aurora Pro" generó 18 cierres de alto valor, elevando el ACV promedio a $34,200 y empujando la cuota al 20.3%. Sin embargo, la combinación de descuento del 8% con un precio de $5,200 en un segmento donde el cliente de lujo premia el valor sobre el descuento fue una señal de inseguridad frente al comprador. El ratio precio/valor percibido se deterioró levemente, explicando la caída de margen promedio. 

"Aurora Lite" sigue siendo un producto sin una propuesta clara: su score de Market Fit en el segmento Lujo es 0.55, lo que sugiere que está capturando compradores de valor medio que eventualmente migraron a competidores con mejor posicionamiento. Recomendación: o subirle el Design Level para hacerlo coherente con el segmento, o reconocer que compite en Mercado Medio y replantear la estrategia de canales.`,
        incomingEvent: {
            title: "Alza en Materiales Premium",
            description: "Proveedores estratégicos de componentes de alta gama reportan escasez por disrupciones logísticas. El impacto sobre su estructura de costos para el próximo trimestre requerirá una revisión urgente de pricing.",
        },
    },

    // ── DATOS DEL PROFESOR (leaderboard global) ────────────────
    professor: {
        totalTeams: 18,
        submittedThisTurn: 14,
        pendingTeams: ["T-03 Vanguard", "T-09 Orion", "T-12 Meridian", "T-16 Apex"],
        segments: {
            economico: {
                label: "🏷️ Mercado Económico",
                teams: [
                    { rank: 1, name: "Vox Industries", arr: 3_200_000, share: 28.4 },
                    { rank: 2, name: "Rival — #2", arr: 2_800_000, share: 24.9 },
                    { rank: 3, name: "Rival — #3", arr: 2_100_000, share: 18.6 },
                    { rank: 4, name: "Rival — #4", arr: 1_800_000, share: 16.0 },
                    { rank: 5, name: "Rival — #5", arr: 1_350_000, share: 12.1 },
                ],
            },
            medio: {
                label: "⚡ Mercado Medio",
                teams: [
                    { rank: 1, name: "Prism Tech", arr: 5_100_000, share: 26.3 },
                    { rank: 2, name: "Rival — #2", arr: 4_400_000, share: 22.7 },
                    { rank: 3, name: "Rival — #3", arr: 3_700_000, share: 19.1 },
                    { rank: 4, name: "Rival — #4", arr: 3_100_000, share: 16.0 },
                    { rank: 5, name: "Rival — #5", arr: 3_050_000, share: 15.7 },
                    { rank: 6, name: "Rival — #6", arr: 230_000, share: 0.1 },
                ],
            },
            lujo: {
                label: "💎 Mercado Lujo",
                teams: [
                    { rank: 1, name: "Nexus Corp", arr: 4_820_000, share: 22.4 },
                    { rank: 2, name: "Rival — #2", arr: 4_100_000, share: 19.1 },
                    { rank: 3, name: "Rival — #3", arr: 3_900_000, share: 18.2 },
                    { rank: 4, name: "Rival — #4", arr: 3_100_000, share: 14.4 },
                    { rank: 5, name: "Rival — #5", arr: 2_900_000, share: 13.8 },
                    { rank: 6, name: "Rival — #6", arr: 2_600_000, share: 12.1 },
                ],
            },
        },
        events: [
            { turn: "Q4", segmento: "💎 Lujo", name: "Alza Materiales Premium", coef: "design_cost +20%", status: "active" },
            { turn: "Q5", segmento: "🏷️ Económico", name: "Entrada rival asiático", coef: "+1 competidor ficticio", status: "pending" },
            { turn: "Q5", segmento: "⚡ Medio", name: "Nueva regulación de etiquetado", coef: "unit_cost +$50", status: "pending" },
        ],
    },
};

// Hacer disponible globalmente
window.MOCK = MOCK;
