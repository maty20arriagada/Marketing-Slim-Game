/**
 * MKT SLIM GAME — data-store.js
 * Motor de persistencia local (localStorage).
 * Todas las páginas leen/escriben aquí para compartir estado.
 * 
 * Estructura en localStorage:
 *   ag_teams       → Array de equipos registrados
 *   ag_sim_config  → Configuración del simulador (parámetros, turno actual)
 *   ag_current_team → ID del equipo activo (para la vista del alumno)
 */

"use strict";

const DataStore = (() => {

    // ═══════════════════════════════════════════════════════════
    // DEFAULTS
    // ═══════════════════════════════════════════════════════════

    const DEFAULT_CONFIG = {
        currentTurn: 1,
        currentTurnLabel: "Q1 2026",
        maxBudget: 30_000_000,
        qualityCostPerLevel: 250,
        designCostPerLevel: 150,
        channelCostPerUnit: 2_000_000,
        channelReachBase: 0.55,
        registrationOpen: true,  // El profesor puede cerrar el registro
        segments: {
            economico: { label: "🏷️ Mercado Económico", totalMarketSize: 11_250_000, growthRate: 0.04 },
            medio: { label: "⚡ Mercado Medio", totalMarketSize: 19_400_000, growthRate: 0.06 },
            lujo: { label: "💎 Mercado Lujo", totalMarketSize: 21_500_000, growthRate: 0.03 },
        },
        mfsThresholds: {
            economico: { minQuality: 3, maxPrice: 4000, penaltyDesign: false },
            medio: { minQuality: 5, maxPrice: 8000, penaltyDesign: false },
            lujo: { minQuality: 7, maxPrice: 99999, penaltyDesign: true },
        },
        decisionLimits: {
            quality: { min: 1, max: 10 },
            design: { min: 1, max: 5 },
            retailPrice: { min: 1000, max: 6000 },
            discountPct: { min: 0, max: 50 },
            adSpend: { min: 0, max: 20_000_000 },
            channels: { min: 1, max: 4 },
        },
    };

    const TEAM_TEMPLATE = {
        id: "",
        name: "",
        passwordHash: "",   // Hash simple de la contraseña del equipo
        segmento: "medio",
        createdAt: "",
        products: {
            a: { name: "Producto A", description: "", quality: 5, design: 3, retailPrice: 3000, discountPct: 5, adSpend: 4_000_000, channels: 2 },
            b: { name: "Producto B", description: "", quality: 4, design: 2, retailPrice: 2500, discountPct: 5, adSpend: 2_000_000, channels: 2 },
        },
        history: [],
        currentMetrics: { arr: 0, marketShare: 0, cac: 0, avgMargin: 0 },
        submitted: {},  // { "Q1": true, "Q2": true }
        arbiterReports: {},
    };

    // ═══════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════

    function _get(key, fallback) {
        try {
            const raw = localStorage.getItem(key);
            return raw ? JSON.parse(raw) : fallback;
        } catch { return fallback; }
    }

    function _set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    function generateId() {
        const num = getTeams().length + 1;
        return `T-${String(num).padStart(2, "0")}`;
    }

    // Simple hash function (NOT cryptographic — sufficient for classroom use)
    function simpleHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const chr = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        // Mix with salt to add some obscurity
        return 'ag_' + Math.abs(hash).toString(36) + '_' + str.length;
    }

    // ═══════════════════════════════════════════════════════════
    // TEAMS
    // ═══════════════════════════════════════════════════════════

    function getTeams() {
        return _get("ag_teams", []);
    }

    function getTeam(teamId) {
        return getTeams().find(t => t.id === teamId) || null;
    }

    function saveTeam(team) {
        const teams = getTeams();
        const idx = teams.findIndex(t => t.id === team.id);
        if (idx >= 0) {
            teams[idx] = team;
        } else {
            teams.push(team);
        }
        _set("ag_teams", teams);
    }

    function createTeam(name, segmento, password, productA, productB) {
        const team = JSON.parse(JSON.stringify(TEAM_TEMPLATE));
        team.id = generateId();
        team.name = name;
        team.passwordHash = simpleHash(password);
        team.segmento = segmento;
        team.createdAt = new Date().toISOString();
        if (productA) {
            team.products.a.name = productA.name || "Producto A";
            team.products.a.description = productA.description || "";
        }
        if (productB) {
            team.products.b.name = productB.name || "Producto B";
            team.products.b.description = productB.description || "";
        }
        saveTeam(team);
        return team;
    }

    function deleteTeam(teamId) {
        const teams = getTeams().filter(t => t.id !== teamId);
        _set("ag_teams", teams);
    }

    function updateTeamField(teamId, path, value) {
        const team = getTeam(teamId);
        if (!team) return false;
        // path like "products.a.name" or "name"
        const keys = path.split(".");
        let obj = team;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
            if (!obj) return false;
        }
        obj[keys[keys.length - 1]] = value;
        saveTeam(team);
        return true;
    }

    // ═══════════════════════════════════════════════════════════
    // STUDENT AUTHENTICATION
    // ═══════════════════════════════════════════════════════════

    function loginTeam(teamId, password) {
        const team = getTeam(teamId);
        if (!team) return { success: false, error: "Equipo no encontrado." };
        if (team.passwordHash !== simpleHash(password)) {
            return { success: false, error: "Contrase\u00f1a incorrecta." };
        }
        setCurrentTeam(teamId);
        return { success: true, team };
    }

    function logoutTeam() {
        localStorage.removeItem("ag_current_team");
    }

    function isRegistrationOpen() {
        return getConfig().registrationOpen !== false;
    }

    function setRegistrationOpen(open) {
        updateConfig({ registrationOpen: open });
    }

    function setCurrentTeam(teamId) {
        _set("ag_current_team", teamId);
    }

    function getCurrentTeamId() {
        return _get("ag_current_team", null);
    }

    function getCurrentTeam() {
        const id = getCurrentTeamId();
        return id ? getTeam(id) : null;
    }

    // ═══════════════════════════════════════════════════════════
    // CONFIG
    // ═══════════════════════════════════════════════════════════

    function getConfig() {
        return _get("ag_sim_config", { ...DEFAULT_CONFIG });
    }

    function saveConfig(config) {
        _set("ag_sim_config", config);
    }

    function updateConfig(partial) {
        const config = getConfig();
        Object.assign(config, partial);
        _set("ag_sim_config", config);
        return config;
    }

    function resetConfig() {
        _set("ag_sim_config", { ...DEFAULT_CONFIG });
    }

    // ═══════════════════════════════════════════════════════════
    // ROUND MANAGEMENT
    // ═══════════════════════════════════════════════════════════

    function advanceTurn() {
        const config = getConfig();
        config.currentTurn += 1;
        config.currentTurnLabel = `Q${config.currentTurn} 2026`;
        saveConfig(config);
        return config;
    }

    function resetRound() {
        // Reset all teams' submissions and metrics, keep names and products
        const teams = getTeams();
        teams.forEach(team => {
            team.history = [];
            team.currentMetrics = { arr: 0, marketShare: 0, cac: 0, avgMargin: 0 };
            team.submitted = {};
            team.arbiterReports = {};
            // Reset product decisions to defaults
            ["a", "b"].forEach(p => {
                team.products[p].quality = 5;
                team.products[p].design = 3;
                team.products[p].retailPrice = 3000;
                team.products[p].discountPct = 5;
                team.products[p].adSpend = 4_000_000;
                team.products[p].channels = 2;
            });
        });
        _set("ag_teams", teams);
        resetConfig();
    }

    function fullReset() {
        // Nuclear option: delete everything
        localStorage.removeItem("ag_teams");
        localStorage.removeItem("ag_sim_config");
        localStorage.removeItem("ag_current_team");
    }

    // ═══════════════════════════════════════════════════════════
    // INITIALIZATION — seed defaults if empty
    // ═══════════════════════════════════════════════════════════

    function init() {
        if (!localStorage.getItem("ag_sim_config")) {
            saveConfig({ ...DEFAULT_CONFIG });
        }
    }

    init();

    // ═══════════════════════════════════════════════════════════
    // PUBLIC API
    // ═══════════════════════════════════════════════════════════

    return {
        getTeams, getTeam, saveTeam, createTeam, deleteTeam, updateTeamField,
        setCurrentTeam, getCurrentTeamId, getCurrentTeam,
        loginTeam, logoutTeam, isRegistrationOpen, setRegistrationOpen,
        getConfig, saveConfig, updateConfig, resetConfig,
        advanceTurn, resetRound, fullReset,
        generateId, simpleHash, TEAM_TEMPLATE, DEFAULT_CONFIG,
    };
})();

window.DataStore = DataStore;
