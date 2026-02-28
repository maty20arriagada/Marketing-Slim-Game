/**
 * MKT SLIM GAME - data-store.js
 * Shared persistence layer (localStorage) for student/professor views.
 */

"use strict";

const DataStore = (() => {
    const STORAGE_PREFIX = "mktmix_v1";
    const DATASET_MODE_KEY = "dataset_mode";
    const DATASET_VALUES = ["real", "demo"];
    const MARKET_IDS = ["moda", "autos", "casas"];
    const CHANNEL_REACH = { 1: 0.50, 2: 0.75, 3: 0.90, 4: 1.00 };

    function createDefaultMarketProfiles() {
        return {
            moda: {
                id: "moda",
                priceMin: 10,
                priceMax: 1000,
                priceStep: 10,
                qualityCostPerLevel: 18,
                designCostPerLevel: 12,
                channelCostPerUnit: 95_000,
                adSpendMax: 4_000_000,
                adSpendStep: 50_000,
                defaultPriceA: 180,
                defaultPriceB: 90,
                defaultAdSpendA: 1_200_000,
                defaultAdSpendB: 700_000,
                maxBudgetPerTurn: 8_000_000,
                demandUnitsBase: 3000,
                demandUnitsNoise: 450,
                minUnits: 250,
                cacBase: 55,
                sensitivity: {
                    priceDistancePenalty: 1.05,
                    cacDistancePenalty: 0.70,
                    minAlignment: 0.20,
                },
                targetPriceBySegment: {
                    economico: 70,
                    medio: 280,
                    lujo: 760,
                },
            },
            autos: {
                id: "autos",
                priceMin: 8_000,
                priceMax: 150_000,
                priceStep: 500,
                qualityCostPerLevel: 1_800,
                designCostPerLevel: 900,
                channelCostPerUnit: 1_500_000,
                adSpendMax: 45_000_000,
                adSpendStep: 250_000,
                defaultPriceA: 45_000,
                defaultPriceB: 32_000,
                defaultAdSpendA: 12_000_000,
                defaultAdSpendB: 8_000_000,
                maxBudgetPerTurn: 45_000_000,
                demandUnitsBase: 210,
                demandUnitsNoise: 45,
                minUnits: 18,
                cacBase: 14_500,
                sensitivity: {
                    priceDistancePenalty: 0.90,
                    cacDistancePenalty: 0.35,
                    minAlignment: 0.25,
                },
                targetPriceBySegment: {
                    economico: 18_000,
                    medio: 52_000,
                    lujo: 115_000,
                },
            },
            casas: {
                id: "casas",
                priceMin: 100_000,
                priceMax: 3_000_000,
                priceStep: 25_000,
                qualityCostPerLevel: 40_000,
                designCostPerLevel: 22_000,
                channelCostPerUnit: 6_500_000,
                adSpendMax: 120_000_000,
                adSpendStep: 1_000_000,
                defaultPriceA: 950_000,
                defaultPriceB: 700_000,
                defaultAdSpendA: 28_000_000,
                defaultAdSpendB: 20_000_000,
                maxBudgetPerTurn: 150_000_000,
                demandUnitsBase: 36,
                demandUnitsNoise: 9,
                minUnits: 3,
                cacBase: 65_000,
                sensitivity: {
                    priceDistancePenalty: 1.25,
                    cacDistancePenalty: 0.55,
                    minAlignment: 0.12,
                },
                targetPriceBySegment: {
                    economico: 260_000,
                    medio: 950_000,
                    lujo: 2_400_000,
                },
            },
        };
    }

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    const DEFAULT_CONFIG = {
        currentTurn: 1,
        currentTurnLabel: "Q1 2026",
        maxTurns: 5,
        maxTeamsPerMarket: 9,
        maxBudget: 150_000_000,
        qualityCostPerLevel: 250,
        designCostPerLevel: 150,
        channelCostPerUnit: 2_000_000,
        channelReachBase: 0.55,
        registrationOpen: true,
        segments: {
            economico: { label: "Mercado Economico", totalMarketSize: 11_250_000, growthRate: 0.04 },
            medio: { label: "Mercado Medio", totalMarketSize: 19_400_000, growthRate: 0.06 },
            lujo: { label: "Mercado Lujo", totalMarketSize: 21_500_000, growthRate: 0.03 },
        },
        mainMarkets: [
            { id: "moda", name: "Moda", totalMarketSize: 18_500_000, growthRate: 0.06 },
            { id: "autos", name: "Autos", totalMarketSize: 26_000_000, growthRate: 0.04 },
            { id: "casas", name: "Casas", totalMarketSize: 21_000_000, growthRate: 0.05 },
        ],
        marketProfiles: createDefaultMarketProfiles(),
        mfsThresholds: {
            economico: { minQuality: 3, penaltyDesign: false },
            medio: { minQuality: 5, penaltyDesign: false },
            lujo: { minQuality: 7, penaltyDesign: true },
        },
        decisionLimits: {
            quality: { min: 1, max: 10 },
            design: { min: 1, max: 5 },
            retailPrice: { min: 10, max: 3_000_000, step: 10 },
            discountPct: { min: 0, max: 50 },
            adSpend: { min: 0, max: 150_000_000, step: 50_000 },
            channels: { min: 1, max: 4 },
        },
        events: [],
        submissionDeadline: null,
    };

    const TEAM_TEMPLATE = {
        id: "",
        name: "",
        passwordHash: "",
        market: "moda",
        segmento: "medio",
        members: [],
        createdAt: "",
        products: {
            a: {
                name: "Producto A",
                description: "",
                quality: 5,
                design: 3,
                retailPrice: 180,
                discountPct: 5,
                adSpend: 1_200_000,
                channels: 2,
            },
            b: {
                name: "Producto B",
                description: "",
                quality: 4,
                design: 2,
                retailPrice: 90,
                discountPct: 5,
                adSpend: 700_000,
                channels: 2,
            },
        },
        history: [],
        currentMetrics: { arr: 0, marketShare: 0, cac: 0, avgMargin: 0 },
        submitted: {},
        arbiterReports: {},
    };

    function clamp(value, min, max) {
        if (!Number.isFinite(value)) return min;
        if (value < min) return min;
        if (value > max) return max;
        return value;
    }

    function _key(key) {
        return `${STORAGE_PREFIX}_${key}`;
    }

    function _get(key, fallback) {
        try {
            const raw = localStorage.getItem(_key(key));
            return raw ? JSON.parse(raw) : fallback;
        } catch {
            return fallback;
        }
    }

    function _set(key, value) {
        localStorage.setItem(_key(key), JSON.stringify(value));
    }

    function _remove(key) {
        localStorage.removeItem(_key(key));
    }

    function _exists(key) {
        return localStorage.getItem(_key(key)) !== null;
    }

    function getDatasetMode() {
        const raw = localStorage.getItem(_key(DATASET_MODE_KEY));
        return DATASET_VALUES.includes(raw) ? raw : "real";
    }

    function setDatasetMode(mode) {
        const next = DATASET_VALUES.includes(mode) ? mode : "real";
        localStorage.setItem(_key(DATASET_MODE_KEY), next);
        _ensureDataset(next);
        return next;
    }

    function _teamsKey(mode) {
        return `ag_teams_${mode || getDatasetMode()}`;
    }

    function _configKey(mode) {
        return `ag_sim_config_${mode || getDatasetMode()}`;
    }

    function _currentTeamKey(mode) {
        return `ag_current_team_${mode || getDatasetMode()}`;
    }

    function _ensureDataset(mode) {
        if (!_exists(_configKey(mode))) {
            _set(_configKey(mode), _normalizeConfig(deepClone(DEFAULT_CONFIG)));
        }
    }

    function clearDataset(mode) {
        const target = DATASET_VALUES.includes(mode) ? mode : getDatasetMode();
        _remove(_teamsKey(target));
        _remove(_configKey(target));
        _remove(_currentTeamKey(target));
    }

    function getStorageKey(base, modeAware = false) {
        return _key(modeAware ? `${base}_${getDatasetMode()}` : base);
    }

    function _normalizeMarketId(id) {
        if (!id) return "moda";
        if (id === "vehiculos") return "autos";
        return MARKET_IDS.includes(id) ? id : "moda";
    }

    function randomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    function randomItem(items) {
        return items[randomInt(0, items.length - 1)];
    }

    function _roundToStep(value, step, min) {
        const safeStep = Math.max(1, parseFloat(step) || 1);
        const safeMin = Number.isFinite(min) ? min : 0;
        return Math.round((value - safeMin) / safeStep) * safeStep + safeMin;
    }

    function _normalizeMembers(members) {
        const list = Array.isArray(members)
            ? members
            : typeof members === "string"
                ? members.split(/[,;\n]/g)
                : [];
        const seen = new Set();
        const out = [];
        list.forEach(item => {
            const value = String(item || "").trim();
            if (!value) return;
            const key = value.toLowerCase();
            if (seen.has(key)) return;
            seen.add(key);
            out.push(value);
        });
        return out;
    }

    function _normalizeConfig(config) {
        const merged = Object.assign({}, deepClone(DEFAULT_CONFIG), config || {});
        merged.currentTurn = Math.max(1, parseInt(merged.currentTurn, 10) || 1);
        merged.currentTurnLabel = merged.currentTurnLabel || `Q${merged.currentTurn} 2026`;
        merged.maxTurns = Math.max(1, parseInt(merged.maxTurns, 10) || 5);
        merged.maxTeamsPerMarket = Math.max(1, parseInt(merged.maxTeamsPerMarket, 10) || 9);
        merged.maxBudget = Math.max(1_000_000, parseInt(merged.maxBudget, 10) || DEFAULT_CONFIG.maxBudget);

        merged.decisionLimits = Object.assign({}, DEFAULT_CONFIG.decisionLimits, merged.decisionLimits || {});
        merged.decisionLimits.quality = Object.assign({}, DEFAULT_CONFIG.decisionLimits.quality, merged.decisionLimits.quality || {});
        merged.decisionLimits.design = Object.assign({}, DEFAULT_CONFIG.decisionLimits.design, merged.decisionLimits.design || {});
        merged.decisionLimits.retailPrice = Object.assign({}, DEFAULT_CONFIG.decisionLimits.retailPrice, merged.decisionLimits.retailPrice || {});
        merged.decisionLimits.discountPct = Object.assign({}, DEFAULT_CONFIG.decisionLimits.discountPct, merged.decisionLimits.discountPct || {});
        merged.decisionLimits.adSpend = Object.assign({}, DEFAULT_CONFIG.decisionLimits.adSpend, merged.decisionLimits.adSpend || {});
        merged.decisionLimits.channels = Object.assign({}, DEFAULT_CONFIG.decisionLimits.channels, merged.decisionLimits.channels || {});

        merged.mainMarkets = Array.isArray(merged.mainMarkets) && merged.mainMarkets.length >= 3
            ? merged.mainMarkets.map((m, i) => ({
                id: _normalizeMarketId(m?.id || DEFAULT_CONFIG.mainMarkets[i]?.id || "moda"),
                name: m?.name || DEFAULT_CONFIG.mainMarkets[i]?.name || "Mercado",
                totalMarketSize: m?.totalMarketSize || DEFAULT_CONFIG.mainMarkets[i]?.totalMarketSize || 0,
                growthRate: m?.growthRate || DEFAULT_CONFIG.mainMarkets[i]?.growthRate || 0,
            }))
            : deepClone(DEFAULT_CONFIG.mainMarkets);

        const defaultsByMarket = createDefaultMarketProfiles();
        const incomingProfiles = (merged.marketProfiles && typeof merged.marketProfiles === "object") ? merged.marketProfiles : {};
        const normalizedProfiles = {};
        MARKET_IDS.forEach(id => {
            const base = defaultsByMarket[id];
            const inP = incomingProfiles[id] || {};
            const inSensitivity = inP.sensitivity || {};
            const inTargets = inP.targetPriceBySegment || inP.targetPrices || {};

            const priceMin = Math.max(1, parseFloat(inP.priceMin ?? base.priceMin) || base.priceMin);
            const priceMaxRaw = parseFloat(inP.priceMax ?? base.priceMax) || base.priceMax;
            const priceStep = Math.max(1, parseFloat(inP.priceStep ?? base.priceStep) || base.priceStep);
            const priceMax = Math.max(priceMin + priceStep, priceMaxRaw);

            const profile = {
                id,
                priceMin,
                priceMax,
                priceStep,
                qualityCostPerLevel: Math.max(1, parseFloat(inP.qualityCostPerLevel ?? base.qualityCostPerLevel) || base.qualityCostPerLevel),
                designCostPerLevel: Math.max(1, parseFloat(inP.designCostPerLevel ?? base.designCostPerLevel) || base.designCostPerLevel),
                channelCostPerUnit: Math.max(1, parseFloat(inP.channelCostPerUnit ?? base.channelCostPerUnit) || base.channelCostPerUnit),
                adSpendMax: Math.max(10_000, parseFloat(inP.adSpendMax ?? base.adSpendMax) || base.adSpendMax),
                adSpendStep: Math.max(1_000, parseFloat(inP.adSpendStep ?? base.adSpendStep) || base.adSpendStep),
                defaultPriceA: clamp(parseFloat(inP.defaultPriceA ?? base.defaultPriceA) || base.defaultPriceA, priceMin, priceMax),
                defaultPriceB: clamp(parseFloat(inP.defaultPriceB ?? base.defaultPriceB) || base.defaultPriceB, priceMin, priceMax),
                defaultAdSpendA: Math.max(0, parseFloat(inP.defaultAdSpendA ?? base.defaultAdSpendA) || base.defaultAdSpendA),
                defaultAdSpendB: Math.max(0, parseFloat(inP.defaultAdSpendB ?? base.defaultAdSpendB) || base.defaultAdSpendB),
                maxBudgetPerTurn: Math.max(1_000_000, parseFloat(inP.maxBudgetPerTurn ?? base.maxBudgetPerTurn) || base.maxBudgetPerTurn),
                demandUnitsBase: Math.max(1, parseFloat(inP.demandUnitsBase ?? base.demandUnitsBase) || base.demandUnitsBase),
                demandUnitsNoise: Math.max(0, parseFloat(inP.demandUnitsNoise ?? base.demandUnitsNoise) || base.demandUnitsNoise),
                minUnits: Math.max(1, parseFloat(inP.minUnits ?? base.minUnits) || base.minUnits),
                cacBase: Math.max(1, parseFloat(inP.cacBase ?? base.cacBase) || base.cacBase),
                sensitivity: {
                    priceDistancePenalty: clamp(parseFloat(inSensitivity.priceDistancePenalty ?? base.sensitivity.priceDistancePenalty) || base.sensitivity.priceDistancePenalty, 0.05, 3),
                    cacDistancePenalty: clamp(parseFloat(inSensitivity.cacDistancePenalty ?? base.sensitivity.cacDistancePenalty) || base.sensitivity.cacDistancePenalty, 0, 3),
                    minAlignment: clamp(parseFloat(inSensitivity.minAlignment ?? base.sensitivity.minAlignment) || base.sensitivity.minAlignment, 0.05, 1),
                },
                targetPriceBySegment: {
                    economico: clamp(parseFloat(inTargets.economico ?? base.targetPriceBySegment.economico) || base.targetPriceBySegment.economico, priceMin, priceMax),
                    medio: clamp(parseFloat(inTargets.medio ?? base.targetPriceBySegment.medio) || base.targetPriceBySegment.medio, priceMin, priceMax),
                    lujo: clamp(parseFloat(inTargets.lujo ?? base.targetPriceBySegment.lujo) || base.targetPriceBySegment.lujo, priceMin, priceMax),
                },
            };

            profile.defaultPriceA = _roundToStep(profile.defaultPriceA, priceStep, priceMin);
            profile.defaultPriceB = _roundToStep(profile.defaultPriceB, priceStep, priceMin);
            normalizedProfiles[id] = profile;
        });

        merged.marketProfiles = normalizedProfiles;
        merged.events = Array.isArray(merged.events) ? merged.events : [];
        return merged;
    }

    function getConfig() {
        return _normalizeConfig(_get(_configKey(), deepClone(DEFAULT_CONFIG)));
    }

    function saveConfig(config) {
        _set(_configKey(), _normalizeConfig(config));
    }

    function updateConfig(partial) {
        const config = getConfig();
        Object.assign(config, partial);
        _set(_configKey(), _normalizeConfig(config));
        return getConfig();
    }

    function resetConfig() {
        _set(_configKey(), _normalizeConfig(deepClone(DEFAULT_CONFIG)));
    }

    function getMarketProfile(marketId, configOverride = null) {
        const cfg = _normalizeConfig(configOverride || getConfig());
        const id = _normalizeMarketId(marketId || "moda");
        const profile = deepClone(cfg.marketProfiles?.[id] || createDefaultMarketProfiles()[id]);
        profile.id = id;
        profile.marketName = (cfg.mainMarkets || []).find(m => m.id === id)?.name || id;
        return profile;
    }

    function getDecisionProfile(marketId, configOverride = null) {
        const cfg = _normalizeConfig(configOverride || getConfig());
        const p = getMarketProfile(marketId, cfg);
        return {
            marketId: p.id,
            marketName: p.marketName,
            quality: {
                min: cfg.decisionLimits.quality.min,
                max: cfg.decisionLimits.quality.max,
            },
            design: {
                min: cfg.decisionLimits.design.min,
                max: cfg.decisionLimits.design.max,
            },
            price: {
                min: p.priceMin,
                max: p.priceMax,
                step: p.priceStep,
            },
            discountPct: {
                min: cfg.decisionLimits.discountPct.min,
                max: cfg.decisionLimits.discountPct.max,
                step: 1,
            },
            adSpend: {
                min: 0,
                max: p.adSpendMax,
                step: p.adSpendStep,
            },
            channels: {
                min: cfg.decisionLimits.channels.min,
                max: cfg.decisionLimits.channels.max,
            },
            costs: {
                qualityCostPerLevel: p.qualityCostPerLevel,
                designCostPerLevel: p.designCostPerLevel,
                channelCostPerUnit: p.channelCostPerUnit,
            },
            sensitivity: deepClone(p.sensitivity),
            targetPriceBySegment: deepClone(p.targetPriceBySegment),
            maxBudget: p.maxBudgetPerTurn || cfg.maxBudget,
        };
    }

    function classifyProductByAttributes(product, marketId = "moda", configOverride = null) {
        const p = product || {};
        const profile = getMarketProfile(marketId, configOverride);
        const q = clamp(parseFloat(p.quality ?? 5) || 5, 1, 10);
        const d = clamp(parseFloat(p.design ?? 3) || 3, 1, 5);
        const price = clamp(parseFloat(p.retailPrice ?? profile.defaultPriceA) || profile.defaultPriceA, profile.priceMin, profile.priceMax);

        const qualityNorm = (q - 1) / 9;
        const designNorm = (d - 1) / 4;
        const priceNorm = (price - profile.priceMin) / Math.max(1, profile.priceMax - profile.priceMin);

        const score = (qualityNorm * 0.42) + (designNorm * 0.33) + (priceNorm * 0.25);
        if (score < 0.33) return "economico";
        if (score < 0.66) return "medio";
        return "lujo";
    }

    function classifyTeamByProducts(team) {
        const marketId = _normalizeMarketId(team?.market || "moda");
        const pA = team?.products?.a || {};
        const pB = team?.products?.b || {};
        return classifyProductByAttributes({
            quality: ((pA.quality || 5) + (pB.quality || 5)) / 2,
            design: ((pA.design || 3) + (pB.design || 3)) / 2,
            retailPrice: ((pA.retailPrice || 0) + (pB.retailPrice || 0)) / 2 || getMarketProfile(marketId).defaultPriceA,
        }, marketId);
    }

    function _normalizeProductForMarket(product, profile, fallback) {
        const src = Object.assign({}, fallback || {}, product || {});
        src.quality = clamp(parseFloat(src.quality) || 5, 1, 10);
        src.design = clamp(parseFloat(src.design) || 3, 1, 5);
        // Only apply default price if the stored price is clearly invalid (0, null, or out of range)
        const rawPrice = parseFloat(src.retailPrice);
        const priceIsValid = Number.isFinite(rawPrice) && rawPrice >= profile.priceMin && rawPrice <= profile.priceMax;
        src.retailPrice = priceIsValid
            ? _roundToStep(rawPrice, profile.priceStep, profile.priceMin)
            : clamp(parseFloat(fallback?.retailPrice) || profile.defaultPriceA, profile.priceMin, profile.priceMax);
        src.retailPrice = _roundToStep(src.retailPrice, profile.priceStep, profile.priceMin);
        src.discountPct = clamp(parseFloat(src.discountPct) || 0, 0, 50);
        src.channels = clamp(parseInt(src.channels, 10) || 2, 1, 4);
        // Only apply default adSpend if zero or missing
        const rawAdSpend = parseFloat(src.adSpend);
        src.adSpend = (Number.isFinite(rawAdSpend) && rawAdSpend > 0)
            ? clamp(_roundToStep(rawAdSpend, profile.adSpendStep, 0), 0, profile.adSpendMax)
            : clamp(parseFloat(fallback?.adSpend) || 0, 0, profile.adSpendMax);
        return src;
    }

    function _normalizeTeam(team) {
        if (!team || typeof team !== "object") return team;
        const merged = deepClone(TEAM_TEMPLATE);
        Object.assign(merged, team);
        merged.market = _normalizeMarketId(team.market || team.products?.a?.mainMarket || "moda");
        merged.members = _normalizeMembers(team.members);

        const profile = getMarketProfile(merged.market);

        merged.products = merged.products || {};
        merged.products.a = _normalizeProductForMarket(merged.products.a, profile, Object.assign({}, TEAM_TEMPLATE.products.a, {
            retailPrice: profile.defaultPriceA,
            adSpend: profile.defaultAdSpendA,
        }));
        merged.products.b = _normalizeProductForMarket(merged.products.b, profile, Object.assign({}, TEAM_TEMPLATE.products.b, {
            retailPrice: profile.defaultPriceB,
            adSpend: profile.defaultAdSpendB,
        }));

        delete merged.products.a.mainMarket;
        delete merged.products.b.mainMarket;
        delete merged.products.a.targetTier;
        delete merged.products.b.targetTier;

        merged.history = Array.isArray(merged.history) ? merged.history : [];
        merged.submitted = merged.submitted || {};
        merged.arbiterReports = merged.arbiterReports || {};
        merged.currentMetrics = merged.currentMetrics || { arr: 0, marketShare: 0, cac: 0, avgMargin: 0 };
        merged.segmento = classifyTeamByProducts(merged);
        return merged;
    }

    function generateId() {
        const ids = getTeams()
            .map(t => {
                const m = String(t.id || "").match(/^T-(\d+)$/);
                return m ? parseInt(m[1], 10) : 0;
            })
            .filter(n => Number.isFinite(n));
        const num = (ids.length ? Math.max(...ids) : 0) + 1;
        return `T-${String(num).padStart(2, "0")}`;
    }

    function simpleHash(str) {
        let hash = 0;
        const source = String(str || "");
        for (let i = 0; i < source.length; i++) {
            const chr = source.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0;
        }
        return "ag_" + Math.abs(hash).toString(36) + "_" + source.length;
    }

    function getTeams() {
        const raw = _get(_teamsKey(), []);
        return raw.map(t => _normalizeTeam(t));
    }

    function getTeam(teamId) {
        return getTeams().find(t => t.id === teamId) || null;
    }

    function saveTeam(team) {
        const normalized = _normalizeTeam(team);
        const teams = getTeams();
        const idx = teams.findIndex(t => t.id === normalized.id);
        if (idx >= 0) {
            teams[idx] = normalized;
        } else {
            teams.push(normalized);
        }
        _set(_teamsKey(), teams);
    }

    function getMarketLimit() {
        return Math.max(1, parseInt(getConfig().maxTeamsPerMarket, 10) || 9);
    }

    function getMarketOccupancy() {
        const teams = getTeams();
        const max = getMarketLimit();
        const counts = { moda: 0, autos: 0, casas: 0 };
        teams.forEach(t => {
            const m = _normalizeMarketId(t.market || "moda");
            counts[m] = (counts[m] || 0) + 1;
        });
        return {
            maxPerMarket: max,
            markets: Object.keys(counts).reduce((acc, k) => {
                acc[k] = {
                    count: counts[k],
                    remaining: Math.max(0, max - counts[k]),
                    full: counts[k] >= max,
                };
                return acc;
            }, {}),
        };
    }

    function createTeam(name, market, password, productA, productB, members) {
        const marketId = _normalizeMarketId(market || "moda");
        const cap = getMarketLimit();
        const currentInMarket = getTeams().filter(t => _normalizeMarketId(t.market || "moda") === marketId).length;
        if (currentInMarket >= cap) {
            const marketLabel = (getConfig().mainMarkets || []).find(m => m.id === marketId)?.name || marketId;
            return {
                success: false,
                error: `El mercado ${marketLabel} alcanzo su capacidad (${cap} equipos).`,
                code: "market_full",
            };
        }

        const team = deepClone(TEAM_TEMPLATE);
        const profile = getMarketProfile(marketId);

        team.id = generateId();
        team.name = String(name || "").trim();
        team.passwordHash = simpleHash(password || "");
        team.market = marketId;
        team.members = _normalizeMembers(members);
        team.createdAt = new Date().toISOString();

        team.products.a.retailPrice = profile.defaultPriceA;
        team.products.b.retailPrice = profile.defaultPriceB;
        team.products.a.adSpend = profile.defaultAdSpendA;
        team.products.b.adSpend = profile.defaultAdSpendB;

        if (productA) {
            team.products.a.name = productA.name || "Producto A";
            team.products.a.description = productA.description || "";
        }
        if (productB) {
            team.products.b.name = productB.name || "Producto B";
            team.products.b.description = productB.description || "";
        }

        saveTeam(team);
        return { success: true, team: getTeam(team.id) };
    }

    function deleteTeam(teamId) {
        const teams = getTeams().filter(t => t.id !== teamId);
        _set(_teamsKey(), teams);
        if (getCurrentTeamId() === teamId) {
            _remove(_currentTeamKey());
        }
    }

    function updateTeamField(teamId, path, value) {
        const team = getTeam(teamId);
        if (!team) return false;

        if (path === "members") {
            team.members = _normalizeMembers(value);
            saveTeam(team);
            return true;
        }

        const keys = String(path || "").split(".");
        let obj = team;
        for (let i = 0; i < keys.length - 1; i++) {
            obj = obj[keys[i]];
            if (!obj) return false;
        }
        const leaf = keys[keys.length - 1];

        if (leaf === "market") {
            const nextMarket = _normalizeMarketId(value);
            if (nextMarket !== team.market) {
                const cap = getMarketLimit();
                const count = getTeams().filter(t => t.id !== teamId && _normalizeMarketId(t.market || "moda") === nextMarket).length;
                if (count >= cap) return false;
            }
            obj[leaf] = nextMarket;
        } else {
            obj[leaf] = value;
        }

        saveTeam(team);
        return true;
    }

    function setTeamMembers(teamId, members) {
        const team = getTeam(teamId);
        if (!team) return { success: false, error: "Equipo no encontrado." };
        team.members = _normalizeMembers(members);
        saveTeam(team);
        return { success: true, team };
    }

    function addTeamMember(teamId, memberName) {
        const team = getTeam(teamId);
        if (!team) return { success: false, error: "Equipo no encontrado." };
        const next = _normalizeMembers([...(team.members || []), memberName]);
        team.members = next;
        saveTeam(team);
        return { success: true, team };
    }

    function removeTeamMember(teamId, memberIndex) {
        const team = getTeam(teamId);
        if (!team) return { success: false, error: "Equipo no encontrado." };
        const idx = parseInt(memberIndex, 10);
        if (!Number.isInteger(idx) || idx < 0 || idx >= (team.members || []).length) {
            return { success: false, error: "Integrante invalido." };
        }
        team.members.splice(idx, 1);
        team.members = _normalizeMembers(team.members);
        saveTeam(team);
        return { success: true, team };
    }

    function resetTeamPassword(teamId, newPassword) {
        if (!newPassword || String(newPassword).length < 4) {
            return { success: false, error: "La contrasena debe tener al menos 4 caracteres." };
        }
        const team = getTeam(teamId);
        if (!team) {
            return { success: false, error: "Equipo no encontrado." };
        }
        team.passwordHash = simpleHash(newPassword);
        saveTeam(team);
        return { success: true };
    }

    function loginTeam(teamId, password) {
        const team = getTeam(teamId);
        if (!team) return { success: false, error: "Equipo no encontrado." };
        if (team.passwordHash !== simpleHash(password)) {
            return { success: false, error: "Contrasena incorrecta." };
        }
        setCurrentTeam(teamId);
        return { success: true, team };
    }

    function logoutTeam() {
        _remove(_currentTeamKey());
    }

    function isRegistrationOpen() {
        return getConfig().registrationOpen !== false;
    }

    function setRegistrationOpen(open) {
        updateConfig({ registrationOpen: !!open });
    }

    function setCurrentTeam(teamId) {
        if (!teamId) {
            _remove(_currentTeamKey());
            return;
        }
        _set(_currentTeamKey(), teamId);
    }

    function getCurrentTeamId() {
        return _get(_currentTeamKey(), null);
    }

    function getCurrentTeam() {
        const id = getCurrentTeamId();
        return id ? getTeam(id) : null;
    }

    function advanceTurn() {
        const config = getConfig();
        config.currentTurn += 1;
        config.currentTurnLabel = `Q${config.currentTurn} 2026`;
        saveConfig(config);
        return config;
    }

    function getTurnLabel(turn) {
        return `Q${turn} 2026`;
    }

    function _turnNum(turnKey) {
        return parseInt(String(turnKey || "").replace(/[^\d]/g, ""), 10) || 0;
    }

    function _eventAppliesToTeam(event, team, productSegment) {
        const seg = event?.segmento || "todos";
        if (seg === "todos") return true;
        if (productSegment) return seg === productSegment;
        return seg === (team.segmento || "medio");
    }

    function _applyDelta(base, mode, delta) {
        if (!Number.isFinite(base)) return base;
        const d = Number(delta || 0);
        if (mode === "abs") return base + d;
        return base * (1 + (d / 100));
    }

    function _buildEventFactors(config, team, activeEvents, productSegment, marketProfile) {
        const profile = marketProfile || getMarketProfile(team?.market || "moda", config);
        const factors = {
            qualityCostPerLevel: profile.qualityCostPerLevel || config.qualityCostPerLevel || 250,
            designCostPerLevel: profile.designCostPerLevel || config.designCostPerLevel || 150,
            channelCostPerUnit: profile.channelCostPerUnit || config.channelCostPerUnit || 2_000_000,
            arrMultiplier: 1,
            cacMultiplier: 1,
            marginMultiplier: 1,
            sensitivityMultiplier: 1,
            appliedEvents: [],
        };

        (activeEvents || []).forEach(ev => {
            if (!_eventAppliesToTeam(ev, team, productSegment)) return;
            const coef = ev.coefficient || ev.coeficiente || "";
            const mode = ev.deltaMode || "pct";
            const delta = Number(ev.deltaValue ?? ev.delta ?? 0);
            if (!Number.isFinite(delta)) return;

            if (coef === "quality_cost_per_level") {
                factors.qualityCostPerLevel = _applyDelta(factors.qualityCostPerLevel, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "design_cost_per_level") {
                factors.designCostPerLevel = _applyDelta(factors.designCostPerLevel, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "channel_cost_per_unit") {
                factors.channelCostPerUnit = _applyDelta(factors.channelCostPerUnit, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "arr_multiplier") {
                factors.arrMultiplier = _applyDelta(factors.arrMultiplier, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "cac_multiplier") {
                factors.cacMultiplier = _applyDelta(factors.cacMultiplier, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "margin_multiplier") {
                factors.marginMultiplier = _applyDelta(factors.marginMultiplier, mode, delta);
                factors.appliedEvents.push(ev);
            } else if (coef === "price_distance_penalty") {
                factors.sensitivityMultiplier = _applyDelta(factors.sensitivityMultiplier, mode, delta);
                factors.appliedEvents.push(ev);
            }
        });

        factors.qualityCostPerLevel = Math.max(1, Math.round(factors.qualityCostPerLevel));
        factors.designCostPerLevel = Math.max(1, Math.round(factors.designCostPerLevel));
        factors.channelCostPerUnit = Math.max(1, Math.round(factors.channelCostPerUnit));
        factors.arrMultiplier = Math.max(0.1, factors.arrMultiplier);
        factors.cacMultiplier = Math.max(0.1, factors.cacMultiplier);
        factors.marginMultiplier = Math.max(0.1, factors.marginMultiplier);
        factors.sensitivityMultiplier = Math.max(0.1, factors.sensitivityMultiplier);
        return factors;
    }

    function _marketPriceAlignment(discPrice, productSegment, profile, sensitivityMultiplier = 1) {
        const target = profile.targetPriceBySegment?.[productSegment] || ((profile.priceMin + profile.priceMax) / 2);
        const distanceRatio = Math.abs(discPrice - target) / Math.max(1, target);
        const penalty = (profile.sensitivity?.priceDistancePenalty || 1) * sensitivityMultiplier;
        const minAlignment = profile.sensitivity?.minAlignment || 0.2;
        const alignment = clamp(1 - (distanceRatio * penalty), minAlignment, 1);
        return {
            target,
            distanceRatio,
            alignment,
        };
    }

    function _uniqEvents(events) {
        const out = [];
        const seen = new Set();
        (events || []).forEach(ev => {
            const id = ev?.id || JSON.stringify(ev);
            if (seen.has(id)) return;
            seen.add(id);
            out.push(ev);
        });
        return out;
    }

    function computeTeamMetrics(team, config, activeEvents) {
        const marketId = _normalizeMarketId(team?.market || "moda");
        const profile = getMarketProfile(marketId, config);
        const products = ["a", "b"];

        let totalArr = 0;
        let totalMargin = 0;
        let totalPower = 0;
        let totalDiscPrice = 0;
        let totalPriceDistance = 0;
        const productMetrics = {};
        let allAppliedEvents = [];

        const limits = getDecisionProfile(marketId, config);

        products.forEach(k => {
            const raw = team.products?.[k] || {};
            const p = _normalizeProductForMarket(raw, profile, raw);
            const productSegment = classifyProductByAttributes(p, marketId, config);
            const factors = _buildEventFactors(config, team, activeEvents, productSegment, profile);

            const unitCost = (p.quality * factors.qualityCostPerLevel) + (p.design * factors.designCostPerLevel);
            const discPrice = p.retailPrice * (1 - ((p.discountPct || 0) / 100));
            const margin = (discPrice - unitCost) * factors.marginMultiplier;
            const channelReach = CHANNEL_REACH[p.channels] || 0.50;
            const adFactor = Math.min(1, (p.adSpend || 0) / Math.max(1, profile.adSpendMax));
            const qualityNorm = (p.quality - limits.quality.min) / Math.max(1, limits.quality.max - limits.quality.min);
            const designNorm = (p.design - limits.design.min) / Math.max(1, limits.design.max - limits.design.min);

            const priceFit = _marketPriceAlignment(discPrice, productSegment, profile, factors.sensitivityMultiplier);
            const power = clamp(
                (qualityNorm * 0.36) +
                (designNorm * 0.24) +
                (adFactor * 0.20) +
                (channelReach * 0.12) +
                (priceFit.alignment * 0.08),
                0.05,
                1
            );

            const unitsBase = profile.demandUnitsBase * (0.55 + (power * 0.95)) * priceFit.alignment;
            const unitsNoise = randomInt(-Math.round(profile.demandUnitsNoise), Math.round(profile.demandUnitsNoise));
            const units = Math.max(profile.minUnits, Math.round(unitsBase + unitsNoise));
            const arr = Math.round(units * discPrice * factors.arrMultiplier);

            totalArr += Math.max(1, arr);
            totalMargin += margin;
            totalPower += power;
            totalDiscPrice += discPrice;
            totalPriceDistance += priceFit.distanceRatio;
            allAppliedEvents = allAppliedEvents.concat(factors.appliedEvents || []);

            productMetrics[k] = {
                id: k.toUpperCase(),
                name: p.name || `Producto ${k.toUpperCase()}`,
                segmento: productSegment,
                retailPrice: Math.round(p.retailPrice),
                unitCost: Math.round(unitCost),
                discPrice: Math.round(discPrice),
                margin: Math.round(margin),
                arr: Math.max(1, Math.round(arr)),
                units,
                channelCost: Math.round((p.channels || 1) * factors.channelCostPerUnit),
                priceTarget: Math.round(priceFit.target),
                priceDistancePct: Math.round(priceFit.distanceRatio * 1000) / 10,
            };
        });

        const avgPower = totalPower / products.length;
        const avgMargin = totalMargin / products.length;
        const avgPrice = totalDiscPrice / products.length;
        const avgPriceDistance = totalPriceDistance / products.length;
        const teamFactors = _buildEventFactors(config, team, activeEvents, null, profile);

        const cacBase = profile.cacBase
            * (1.25 - (avgPower * 0.45))
            * (1 + (avgPriceDistance * (profile.sensitivity?.cacDistancePenalty || 0.5)));
        const cac = Math.round(cacBase * teamFactors.cacMultiplier);

        allAppliedEvents = _uniqEvents(allAppliedEvents.concat(teamFactors.appliedEvents || []));

        return {
            arr: Math.max(1, Math.round(totalArr)),
            cac: Math.max(1, cac),
            avgMargin: Math.round(avgMargin),
            avgDiscPrice: Math.round(avgPrice),
            products: productMetrics,
            appliedEvents: allAppliedEvents,
            marketSensitivity: {
                avgPriceDistancePct: Math.round(avgPriceDistance * 1000) / 10,
                penalty: profile.sensitivity?.priceDistancePenalty || 1,
            },
        };
    }

    function processTurn() {
        const config = getConfig();
        const turn = config.currentTurn || 1;
        const turnKey = `Q${turn}`;
        const teams = getTeams();
        if (!teams.length) {
            return { success: false, error: "No hay equipos para procesar." };
        }

        const allEvents = getEvents();
        const activeEvents = allEvents.filter(ev => _turnNum(ev.turn) === turn);

        const groupedByMarket = {};
        teams.forEach(team => {
            team.segmento = classifyTeamByProducts(team);
            const market = _normalizeMarketId(team.market || "moda");
            groupedByMarket[market] = groupedByMarket[market] || [];
            groupedByMarket[market].push(team);
        });

        Object.keys(groupedByMarket).forEach(market => {
            const marketTeams = groupedByMarket[market];
            const metricRows = marketTeams.map(team => ({
                team,
                metrics: computeTeamMetrics(team, config, activeEvents),
            })).sort((a, b) => b.metrics.arr - a.metrics.arr);

            const totalArr = metricRows.reduce((acc, row) => acc + row.metrics.arr, 0) || 1;

            metricRows.forEach(row => {
                const t = row.team;
                const share = (row.metrics.arr / totalArr) * 100;
                const last = (t.history && t.history.length) ? t.history[t.history.length - 1] : null;

                t.currentMetrics = {
                    arr: row.metrics.arr,
                    marketShare: Math.round(share * 10) / 10,
                    cac: row.metrics.cac,
                    avgMargin: row.metrics.avgMargin,
                };

                t.history = t.history || [];
                t.history.push({
                    turn: turnKey,
                    turnLabel: getTurnLabel(turn),
                    market: t.market,
                    classification: t.segmento,
                    arr: t.currentMetrics.arr,
                    marketShare: t.currentMetrics.marketShare,
                    cac: t.currentMetrics.cac,
                    avgMargin: t.currentMetrics.avgMargin,
                    avgDiscPrice: row.metrics.avgDiscPrice,
                    products: row.metrics.products,
                    activeEvents: (row.metrics.appliedEvents || []).map(ev => ev.id),
                    marketSensitivity: row.metrics.marketSensitivity,
                    submitted: !!(t.submitted && t.submitted[turnKey]),
                });

                t.arbiterReports = t.arbiterReports || {};
                const arrDelta = last ? ((t.currentMetrics.arr - (last.arr || 1)) / Math.max(1, last.arr || 1)) * 100 : 0;
                const shareDelta = last ? (t.currentMetrics.marketShare - (last.marketShare || 0)) : 0;
                const marginDelta = last ? ((t.currentMetrics.avgMargin - (last.avgMargin || 1)) / Math.max(1, Math.abs(last.avgMargin || 1))) * 100 : 0;
                const cacDelta = last ? ((t.currentMetrics.cac - (last.cac || 1)) / Math.max(1, last.cac || 1)) * 100 : 0;

                const evInfo = activeEvents[0] || null;
                const marketLabel = (config.mainMarkets || []).find(m => m.id === market)?.name || market;
                t.arbiterReports[turnKey] = {
                    turn: getTurnLabel(turn),
                    metrics: {
                        arr: { value: t.currentMetrics.arr, deltaDir: arrDelta >= 0 ? "up" : "down", deltaPct: `${Math.round(arrDelta * 10) / 10}%` },
                        marketShare: { value: t.currentMetrics.marketShare, deltaDir: shareDelta >= 0 ? "up" : "down", deltaPct: `${Math.round(shareDelta * 10) / 10}pp` },
                        avgMargin: { value: t.currentMetrics.avgMargin, deltaDir: marginDelta >= 0 ? "up" : "down", deltaPct: `${Math.round(marginDelta * 10) / 10}%` },
                        cac: { value: t.currentMetrics.cac, deltaDir: cacDelta <= 0 ? "up" : "down", deltaPct: `${Math.round(cacDelta * 10) / 10}%` },
                    },
                    verdict: `La empresa compitio en ${marketLabel} con perfil ${t.segmento}. Revisa coherencia entre calidad, diseno y precio para el proximo turno.`,
                    incomingEvent: evInfo
                        ? {
                            title: evInfo.name || "Evento de Mercado",
                            description: `Se aplico ${evInfo.coefficient || evInfo.coeficiente || "coeficiente"} con variacion ${evInfo.deltaValue ?? evInfo.delta ?? 0}${(evInfo.deltaMode || "pct") === "pct" ? "%" : ""}.`,
                        }
                        : {
                            title: `Senal de Mercado ${marketLabel}`,
                            description: "El proximo periodo demandara mayor coherencia entre propuesta de valor y sensibilidad de precio.",
                        },
                };
            });
        });

        const updatedEvents = allEvents.map(ev => {
            const evTurn = _turnNum(ev.turn);
            if (evTurn <= turn) return Object.assign({}, ev, { status: "ejecutado" });
            return Object.assign({}, ev, { status: "pendiente" });
        });

        _set(_teamsKey(), teams);
        saveEvents(updatedEvents);
        advanceTurn();
        return { success: true, processedTeams: teams.length, turnProcessed: turnKey };
    }

    function resetRound() {
        const teams = getTeams();
        teams.forEach(team => {
            const profile = getMarketProfile(team.market || "moda");
            team.history = [];
            team.currentMetrics = { arr: 0, marketShare: 0, cac: 0, avgMargin: 0 };
            team.submitted = {};
            team.arbiterReports = {};
            ["a", "b"].forEach((p, idx) => {
                team.products[p].quality = 5;
                team.products[p].design = 3;
                team.products[p].retailPrice = idx === 0 ? profile.defaultPriceA : profile.defaultPriceB;
                team.products[p].discountPct = 5;
                team.products[p].adSpend = idx === 0 ? profile.defaultAdSpendA : profile.defaultAdSpendB;
                team.products[p].channels = 2;
            });
            team.segmento = classifyTeamByProducts(team);
        });
        _set(_teamsKey(), teams);
        resetConfig();
    }

    function fullReset() {
        const mode = getDatasetMode();
        clearDataset(mode);
        _ensureDataset(mode);
    }

    function _randomPriceBySegment(profile, segment) {
        const target = profile.targetPriceBySegment?.[segment] || ((profile.priceMin + profile.priceMax) / 2);
        const spread = target * (segment === "lujo" ? 0.28 : segment === "medio" ? 0.22 : 0.18);
        const min = clamp(target - spread, profile.priceMin, profile.priceMax);
        const max = clamp(target + spread, profile.priceMin, profile.priceMax);
        return _roundToStep(randomInt(Math.round(min), Math.round(max)), profile.priceStep, profile.priceMin);
    }

    function generateDemoData(teamCount = 27) {
        // Brand names per market for realism
        const MARKET_BRANDS = {
            moda: {
                companies: ["Vogue", "Elara", "Lumina", "Velvet", "Aura", "Tessera", "Bloom", "Soleil", "Riva", "Nuance"],
                suffixes: ["Studio", "Atelier", "Couture", "Design", "Mode"],
                productA: ["Collection Premium", "Linea Urban", "Serie Signature", "Drop Exclusivo", "Edicion Limited"],
                productB: ["Linea Core", "Basicos Pro", "Serie Casual", "Pack Essential", "Edicion Sport"],
                descA: ["Alta gama con materiales sostenibles", "Diseno urbano para profesionales", "Coleccion capsule de temporada"],
                descB: ["Basicos de calidad accesible", "Esenciales para el dia a dia", "Versatilidad a precio justo"],
            },
            autos: {
                companies: ["Nexus", "Orion", "Titan", "Apex", "Vertex", "Cobalt", "Meridian", "Helix", "Prism", "Atlas"],
                suffixes: ["Motors", "Auto", "Drive", "Mobility", "Automotive"],
                productA: ["GT Series", "Executive Pro", "Sport Plus", "Elite Edition", "Performance X"],
                productB: ["City Compact", "Eco Drive", "Urban Base", "Standard Plus", "Entry Sport"],
                descA: ["Sedan premium con tecnologia avanzada", "SUV ejecutiva de alta gama", "Deportivo con motor turbo"],
                descB: ["Compacto eficiente para ciudad", "Hatchback economico y confiable", "Sedan de entrada con buena relacion calidad-precio"],
            },
            casas: {
                companies: ["Habitat", "Aldea", "Piedra", "Roble", "Cenit", "Terrae", "Viento", "Brisa", "Faro", "Raiz"],
                suffixes: ["Propiedades", "Inmobiliaria", "Desarrollo", "Proyectos", "Capital"],
                productA: ["Torre Mirador", "Condominio Premium", "Edificio Central", "Proyecto Altura", "Residencias Select"],
                productB: ["Casas del Valle", "Parcelas Norte", "Vivienda Social", "Casas Basicas", "Proyecto Comun"],
                descA: ["Departamentos de lujo con vista panoramica", "Condominio cerrado con amenities premium", "Edificio ejecutivo en sector oriente"],
                descB: ["Casas en sector periurbano de buena conectividad", "Viviendas accesibles con subsidio disponible", "Proyecto habitacional con areas verdes"],
            },
        };

        const firstNames = ["Matias", "Sofia", "Valentina", "Ignacio", "Camila", "Martina", "Felipe", "Diego", "Antonia", "Javiera", "Nicolas", "Isidora", "Tomas", "Paula", "Rodrigo"];
        const markets = ["moda", "autos", "casas"];

        setDatasetMode("demo");
        clearDataset("demo");

        const demoConfig = deepClone(DEFAULT_CONFIG);
        demoConfig.currentTurn = 4;  // Demo starts mid-game — 3 turns already played
        demoConfig.currentTurnLabel = "Q4 2026";
        demoConfig.registrationOpen = false;
        demoConfig.maxTeamsPerMarket = 9;

        // Seed realistic events
        demoConfig.events = [
            _normalizeEvent({ id: "EV-D01", turn: "Q1", segmento: "lujo", name: "Boom de Consumo Premium", coefficient: "arr_multiplier", deltaMode: "pct", deltaValue: 12, status: "ejecutado" }),
            _normalizeEvent({ id: "EV-D02", turn: "Q2", segmento: "economico", name: "Presion de Precios Bajos", coefficient: "price_distance_penalty", deltaMode: "pct", deltaValue: 15, status: "ejecutado" }),
            _normalizeEvent({ id: "EV-D03", turn: "Q3", segmento: "todos", name: "Alza en Costos de Canal", coefficient: "channel_cost_per_unit", deltaMode: "pct", deltaValue: 8, status: "ejecutado" }),
            _normalizeEvent({ id: "EV-D04", turn: "Q4", segmento: "medio", name: "Demanda Intermedia Alta", coefficient: "arr_multiplier", deltaMode: "pct", deltaValue: 10, status: "pendiente" }),
            _normalizeEvent({ id: "EV-D05", turn: "Q5", segmento: "todos", name: "Cierre de Mercado Global", coefficient: "margin_multiplier", deltaMode: "pct", deltaValue: -5, status: "pendiente" }),
        ];
        saveConfig(demoConfig);

        const teams = [];
        const normalizedCount = clamp(parseInt(teamCount, 10) || 27, 3, 27);
        const usedNames = new Set();

        for (let i = 0; i < normalizedCount; i++) {
            const market = markets[i % markets.length];
            const profile = getMarketProfile(market, demoConfig);
            const mb = MARKET_BRANDS[market];

            // Unique company name
            let companyName;
            let tries = 0;
            do {
                const base = mb.companies[randomInt(0, mb.companies.length - 1)];
                const suffix = mb.suffixes[randomInt(0, mb.suffixes.length - 1)];
                companyName = `${base} ${suffix}`;
                tries++;
            } while (usedNames.has(companyName) && tries < 20);
            usedNames.add(companyName);

            const team = deepClone(TEAM_TEMPLATE);
            team.id = `T-${String(i + 1).padStart(2, "0")}`;
            team.name = companyName;
            team.passwordHash = simpleHash("demo1234");
            team.market = market;
            team.createdAt = new Date(Date.now() - randomInt(1, 60) * 86400000).toISOString();
            team.members = _normalizeMembers(
                Array.from({ length: randomInt(2, 5) }, () => randomItem(firstNames))
            );

            // Product names from market-specific catalog
            team.products.a.name = mb.productA[randomInt(0, mb.productA.length - 1)];
            team.products.b.name = mb.productB[randomInt(0, mb.productB.length - 1)];
            team.products.a.description = mb.descA[randomInt(0, mb.descA.length - 1)];
            team.products.b.description = mb.descB[randomInt(0, mb.descB.length - 1)];

            // Randomize segment positioning with intentional variety
            const segs = ["economico", "medio", "lujo"];
            const segA = segs[randomInt(0, 2)];
            const segB = segs[randomInt(0, 2)];

            // Product A — primary/premium product
            team.products.a.quality = randomInt(5, 10);
            team.products.a.design = randomInt(2, 5);
            team.products.a.retailPrice = _randomPriceBySegment(profile, segA);
            team.products.a.discountPct = randomInt(0, 15);
            team.products.a.channels = randomInt(2, 4);
            team.products.a.adSpend = _roundToStep(
                randomInt(Math.round(profile.adSpendMax * 0.20), Math.round(profile.adSpendMax * 0.80)),
                profile.adSpendStep, 0
            );

            // Product B — secondary/entry product
            team.products.b.quality = randomInt(3, 8);
            team.products.b.design = randomInt(1, 4);
            team.products.b.retailPrice = _randomPriceBySegment(profile, segB);
            team.products.b.discountPct = randomInt(3, 25);
            team.products.b.channels = randomInt(1, 3);
            team.products.b.adSpend = _roundToStep(
                randomInt(Math.round(profile.adSpendMax * 0.10), Math.round(profile.adSpendMax * 0.60)),
                profile.adSpendStep, 0
            );

            team.segmento = classifyTeamByProducts(team);

            // Generate realistic 3-turn history
            const baseArr = randomInt(
                Math.round(profile.demandUnitsBase * profile.targetPriceBySegment.medio * 0.3),
                Math.round(profile.demandUnitsBase * profile.targetPriceBySegment.medio * 1.2)
            );
            const baseShare = randomInt(5, 28);
            const baseCac = Math.round(profile.cacBase * r(0.7, 1.4));
            const baseMargin = Math.round(
                (team.products.a.retailPrice * 0.25 + team.products.b.retailPrice * 0.20) * r(0.8, 1.2)
            );

            const historyTrend = r(0.85, 1.15);  // team-specific trend multiplier
            team.history = [];
            for (let q = 1; q <= 3; q++) {
                const trendFactor = Math.pow(historyTrend, q - 1);
                const noise = r(0.93, 1.08);
                const qArr = Math.round(baseArr * trendFactor * noise);
                const qShare = Math.round(baseShare * trendFactor * r(0.90, 1.10) * 10) / 10;
                const qCac = Math.round(baseCac * (1.15 - (q * 0.05)) * r(0.95, 1.08));
                const qMargin = Math.round(baseMargin * trendFactor * r(0.92, 1.08));

                team.history.push({
                    turn: `Q${q}`,
                    turnLabel: `Q${q} 2026`,
                    market: market,
                    classification: team.segmento,
                    arr: Math.max(profile.minUnits * profile.priceMin, qArr),
                    marketShare: clamp(qShare, 1, 45),
                    cac: Math.max(Math.round(profile.cacBase * 0.4), qCac),
                    avgMargin: qMargin,
                    avgDiscPrice: Math.round((team.products.a.retailPrice + team.products.b.retailPrice) / 2),
                    submitted: true,
                    products: {
                        a: { name: team.products.a.name, segmento: segA, discPrice: Math.round(team.products.a.retailPrice * (1 - team.products.a.discountPct / 100)), margin: Math.round(baseMargin * 0.55 * r(0.9, 1.1)) },
                        b: { name: team.products.b.name, segmento: segB, discPrice: Math.round(team.products.b.retailPrice * (1 - team.products.b.discountPct / 100)), margin: Math.round(baseMargin * 0.45 * r(0.9, 1.1)) },
                    },
                });
            }

            // currentMetrics = last history turn
            const lastHist = team.history[team.history.length - 1];
            team.currentMetrics = {
                arr: lastHist.arr,
                marketShare: lastHist.marketShare,
                cac: lastHist.cac,
                avgMargin: lastHist.avgMargin,
            };
            team.submitted = { Q1: true, Q2: true, Q3: true };

            // Arbiter report for Q3
            team.arbiterReports = {
                Q3: {
                    turn: "Q3 2026",
                    metrics: {
                        arr: { value: lastHist.arr, deltaDir: historyTrend >= 1 ? "up" : "down", deltaPct: `${Math.round((historyTrend - 1) * 100 * 10) / 10}%` },
                        marketShare: { value: lastHist.marketShare, deltaDir: "up", deltaPct: "+0.0pp" },
                        avgMargin: { value: lastHist.avgMargin, deltaDir: historyTrend >= 1 ? "up" : "down", deltaPct: `${Math.round((historyTrend - 1) * 100 * 10) / 10}%` },
                        cac: { value: lastHist.cac, deltaDir: "up", deltaPct: "-5.0%" },
                    },
                    verdict: `La empresa compitio en ${market} con perfil ${team.segmento}. Revisa coherencia entre calidad, diseno y precio para el proximo turno.`,
                    incomingEvent: { title: "Demanda Intermedia Alta", description: "Se aplica arr_multiplier +10% para el segmento medio en Q4." },
                },
            };

            teams.push(team);
        }

        _set(_teamsKey("demo"), teams);
        setCurrentTeam(teams[0]?.id || null);
        return teams;
    }

    function _normalizeEvent(ev) {
        const out = Object.assign({
            id: `EV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            turn: "Q1",
            segmento: "todos",
            name: "Evento",
            coefficient: "arr_multiplier",
            deltaMode: "pct",
            deltaValue: 0,
            status: "pendiente",
            createdAt: new Date().toISOString(),
        }, ev || {});

        out.turn = `Q${Math.max(1, _turnNum(out.turn) || 1)}`;
        out.segmento = out.segmento || "todos";
        out.coefficient = out.coefficient || out.coeficiente || "arr_multiplier";
        out.coeficiente = out.coefficient;
        out.deltaMode = out.deltaMode === "abs" ? "abs" : "pct";
        out.deltaValue = Number.isFinite(parseFloat(out.deltaValue ?? out.delta)) ? parseFloat(out.deltaValue ?? out.delta) : 0;
        out.delta = out.deltaValue;
        return out;
    }

    function getEvents() {
        const config = getConfig();
        return Array.isArray(config.events)
            ? config.events.map(ev => _normalizeEvent(ev))
            : [];
    }

    function saveEvents(events) {
        const config = getConfig();
        config.events = Array.isArray(events) ? events.map(ev => _normalizeEvent(ev)) : [];
        saveConfig(config);
        return config.events;
    }

    function addEvent(event) {
        const list = getEvents();
        list.push(_normalizeEvent(event));
        saveEvents(list);
        return list[list.length - 1];
    }

    function clearEvents() {
        saveEvents([]);
    }

    function updateEvent(eventId, partial) {
        const list = getEvents();
        const idx = list.findIndex(e => e.id === eventId);
        if (idx < 0) return { success: false, error: "Evento no encontrado." };
        list[idx] = Object.assign({}, list[idx], partial || {});
        saveEvents(list);
        return { success: true, event: list[idx] };
    }

    function deleteEvent(eventId) {
        const list = getEvents();
        const next = list.filter(e => e.id !== eventId);
        saveEvents(next);
        return { success: true };
    }

    function init() {
        const legacyMap = [
            { old: "ag_teams", next: _teamsKey("real") },
            { old: "ag_sim_config", next: _configKey("real") },
            { old: "ag_current_team", next: _currentTeamKey("real") },
        ];
        legacyMap.forEach(({ old, next }) => {
            const nextExists = _exists(next);
            const oldRaw = localStorage.getItem(old);
            if (!nextExists && oldRaw !== null) {
                localStorage.setItem(_key(next), oldRaw);
            }
        });

        if (!localStorage.getItem(_key(DATASET_MODE_KEY))) {
            localStorage.setItem(_key(DATASET_MODE_KEY), "real");
        }
        _ensureDataset(getDatasetMode());
    }

    init();

    // ── DEADLINE HELPERS ──────────────────────────────────────────────
    function getDeadline() {
        const raw = getConfig().submissionDeadline;
        if (!raw) return null;
        const d = new Date(raw);
        return isNaN(d.getTime()) ? null : d;
    }

    function setDeadline(isoString) {
        updateConfig({ submissionDeadline: isoString || null });
    }

    return {
        getTeams, getTeam, saveTeam, createTeam, deleteTeam, updateTeamField,
        setTeamMembers, addTeamMember, removeTeamMember, resetTeamPassword,
        setCurrentTeam, getCurrentTeamId, getCurrentTeam,
        loginTeam, logoutTeam, isRegistrationOpen, setRegistrationOpen,
        getConfig, saveConfig, updateConfig, resetConfig,
        getMarketProfile, getDecisionProfile, getMarketOccupancy,
        getEvents, saveEvents, addEvent, clearEvents, updateEvent, deleteEvent,
        advanceTurn, processTurn, resetRound, fullReset, clearDataset,
        classifyTeamByProducts, classifyProductByAttributes, getTurnLabel,
        getDatasetMode, setDatasetMode, getStorageKey,
        generateDemoData,
        generateId, simpleHash, TEAM_TEMPLATE, DEFAULT_CONFIG,
        getDeadline, setDeadline,
    };
})();

window.DataStore = DataStore;
