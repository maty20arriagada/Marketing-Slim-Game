/**
 * MKT SLIM GAME - mock-data.js
 * Adapter dinamico para vistas de alumno/profesor.
 * Todo se deriva desde DataStore para mantener sincronia real.
 */

"use strict";

(function buildDynamicViewModel() {
    const SEG_LABEL = {
        economico: "🏷️ Económico",
        medio: "⚡ Intermedio",
        lujo: "💎 Lujo",
    };

    const CHANNEL_REACH = { 1: 0.50, 2: 0.75, 3: 0.90, 4: 1.00 };

    function r(min, max) {
        return Math.random() * (max - min) + min;
    }

    function round1(v) {
        return Math.round(v * 10) / 10;
    }

    function getMarketMap(config) {
        const base = { moda: "Moda", autos: "Autos", casas: "Casas" };
        (config.mainMarkets || []).forEach(m => {
            base[m.id] = m.name;
        });
        return base;
    }

    function getDecisionContext(marketId) {
        if (hasStore && DataStore.getDecisionProfile) {
            return DataStore.getDecisionProfile(marketId || "moda");
        }
        return {
            costs: { qualityCostPerLevel: 250, designCostPerLevel: 150, channelCostPerUnit: 2_000_000 },
            price: { min: 10, max: 3_000_000 },
            adSpend: { max: 20_000_000 },
            sensitivity: { priceDistancePenalty: 1, minAlignment: 0.2 },
            targetPriceBySegment: { economico: 100, medio: 500, lujo: 1000 },
        };
    }

    function productMetrics(p, marketId) {
        const ctx = getDecisionContext(marketId);
        const unitCost = (p.quality * (ctx?.costs?.qualityCostPerLevel || 250)) + (p.design * (ctx?.costs?.designCostPerLevel || 150));
        const discPrice = p.retailPrice * (1 - (p.discountPct / 100));
        const margin = discPrice - unitCost;
        const channelCost = (p.channels || 1) * (ctx?.costs?.channelCostPerUnit || 2_000_000);
        const reach = CHANNEL_REACH[p.channels || 1] || 0.50;
        const target = ctx?.targetPriceBySegment?.medio || ((ctx?.price?.min || 100) + (ctx?.price?.max || 1000)) / 2;
        const distance = Math.abs(discPrice - target) / Math.max(1, target);
        const align = Math.max(ctx?.sensitivity?.minAlignment || 0.2, 1 - (distance * (ctx?.sensitivity?.priceDistancePenalty || 1)));
        const mfs = Math.max(
            0.2,
            Math.min(0.95, ((p.quality / 10) * 0.45) + ((p.design / 5) * 0.35) + (align * 0.2))
        );
        return { unitCost, discPrice, margin, channelCost, reach, mfsScore: mfs };
    }

    function classifyProduct(p, marketId) {
        if (hasStore && DataStore.classifyProductByAttributes) {
            return DataStore.classifyProductByAttributes(p, marketId || "moda");
        }
        return "medio";
    }

    function averageProductHistory(history, key) {
        return history.map(h => {
            const products = h.products || {};
            const arr = ["a", "b"].map(id => products[id]?.[key]).filter(v => typeof v === "number");
            if (!arr.length) return 0;
            return arr.reduce((acc, v) => acc + v, 0) / arr.length;
        });
    }

    function makeHistoryFromCurrent(currentTurn, currentMetrics) {
        const points = Math.max(1, currentTurn);
        const out = [];
        for (let i = 1; i <= points; i++) {
            const trend = i / points;
            out.push({
                turn: `Q${i}`,
                arr: Math.round((currentMetrics.arr || 1_700_000) * (0.55 + trend * 0.45) * r(0.93, 1.08)),
                marketShare: round1((currentMetrics.marketShare || 18) * (0.50 + trend * 0.50) * r(0.92, 1.06)),
                cac: Math.round((currentMetrics.cac || 9_000) * (1.25 - trend * 0.35) * r(0.95, 1.08)),
                avgMargin: Math.round((currentMetrics.avgMargin || 1200) * (0.85 + trend * 0.15) * r(0.92, 1.08)),
            });
        }
        return out;
    }

    const hasStore = typeof window.DataStore !== "undefined";
    const config = hasStore ? DataStore.getConfig() : { currentTurn: 1, currentTurnLabel: "Q1 2026", mainMarkets: [] };
    const allTeams = hasStore ? DataStore.getTeams() : [];
    let currentTeam = hasStore ? DataStore.getCurrentTeam() : null;
    if (!currentTeam) currentTeam = allTeams[0] || null;

    if (!currentTeam) {
        currentTeam = {
            id: "T-01",
            name: "Empresa Demo",
            market: "moda",
            segmento: "medio",
            members: [],
            products: {
                a: { name: "Producto A", quality: 6, design: 3, retailPrice: 3200, discountPct: 5, adSpend: 4_000_000, channels: 2 },
                b: { name: "Producto B", quality: 5, design: 2, retailPrice: 2600, discountPct: 8, adSpend: 2_500_000, channels: 2 },
            },
            currentMetrics: { arr: 2_000_000, marketShare: 100, cac: 8200, avgMargin: 1250 },
            history: [],
            arbiterReports: {},
        };
    }

    if (hasStore && DataStore.classifyTeamByProducts) {
        currentTeam.segmento = DataStore.classifyTeamByProducts(currentTeam);
    }

    const marketMap = getMarketMap(config);
    const marketTeams = allTeams.filter(t => (t.market || "moda") === (currentTeam.market || "moda"));
    const rankingBase = marketTeams.length ? marketTeams : [currentTeam];
    const rankingRows = rankingBase.map(t => {
        const baseArr = t.currentMetrics?.arr || Math.round(1_200_000 + r(0, 3_500_000));
        return { id: t.id, name: t.name, arr: baseArr };
    }).sort((a, b) => b.arr - a.arr);
    const rankingTotal = rankingRows.reduce((acc, row) => acc + row.arr, 0) || 1;
    const leaderboard = rankingRows.map((row, i) => ({
        rank: i + 1,
        isSelf: row.id === currentTeam.id,
        name: row.id === currentTeam.id ? row.name : `Rival - #${i + 1}`,
        arr: row.arr,
        share: round1((row.arr / rankingTotal) * 100),
    }));

    const pA = currentTeam.products?.a || {};
    const pB = currentTeam.products?.b || {};
    const mA = productMetrics({
        quality: pA.quality || 5,
        design: pA.design || 3,
        retailPrice: pA.retailPrice || 3000,
        discountPct: pA.discountPct || 5,
        adSpend: pA.adSpend || 0,
        channels: pA.channels || 2,
    }, currentTeam.market || "moda");
    const mB = productMetrics({
        quality: pB.quality || 5,
        design: pB.design || 3,
        retailPrice: pB.retailPrice || 3000,
        discountPct: pB.discountPct || 5,
        adSpend: pB.adSpend || 0,
        channels: pB.channels || 2,
    }, currentTeam.market || "moda");

    const currentTurn = config.currentTurn || 1;
    const currentLabel = config.currentTurnLabel || `Q${currentTurn} 2026`;
    const hasPrevTurn = currentTurn > 1;
    const prevTurn = currentTurn - 1;
    const prevKey = `Q${prevTurn}`;
    const histFromStore = (currentTeam.history || []).map(h => ({
        turn: h.turn || `Q${prevTurn}`,
        arr: h.arr || 0,
        marketShare: h.marketShare || 0,
        cac: h.cac || 0,
        avgMargin: h.avgMargin || 0,
        avgDiscPrice: h.avgDiscPrice || 0,
        products: h.products || null,
    }));
    const history = histFromStore.length ? histFromStore : makeHistoryFromCurrent(currentTurn, currentTeam.currentMetrics || {});
    const currHist = history[history.length - 1] || history[0];
    const prevHist = history[Math.max(0, history.length - 2)] || history[0];
    const avgPriceHist = averageProductHistory(currentTeam.history || [], "discPrice");
    const avgCostHist = averageProductHistory(currentTeam.history || [], "unitCost");
    const avgMarginHist = averageProductHistory(currentTeam.history || [], "margin");
    const financialHistory = history.map((h, i) => ({
        turn: h.turn,
        avgPrice: avgPriceHist[i] || h.avgDiscPrice || (((currentTeam.products?.a?.retailPrice || 3000) + (currentTeam.products?.b?.retailPrice || 3000)) / 2),
        avgCost: avgCostHist[i] || (((mA.unitCost || 0) + (mB.unitCost || 0)) / 2),
        avgMargin: avgMarginHist[i] || (((mA.margin || 0) + (mB.margin || 0)) / 2),
    }));

    const professorSegments = {
        economico: { label: "Economico", teams: [] },
        medio: { label: "Intermedio", teams: [] },
        lujo: { label: "Lujo", teams: [] },
    };
    allTeams.forEach(t => {
        const seg = t.segmento || (hasStore && DataStore.classifyTeamByProducts ? DataStore.classifyTeamByProducts(t) : "medio");
        professorSegments[seg] = professorSegments[seg] || { label: seg, teams: [] };
        professorSegments[seg].teams.push({
            rank: 0,
            name: t.name,
            arr: t.currentMetrics?.arr || Math.round(1_000_000 + r(0, 4_000_000)),
            share: 0,
        });
    });
    Object.keys(professorSegments).forEach(seg => {
        const rows = professorSegments[seg].teams.sort((a, b) => b.arr - a.arr);
        const total = rows.reduce((acc, row) => acc + row.arr, 0) || 1;
        rows.forEach((row, idx) => {
            row.rank = idx + 1;
            row.share = round1((row.arr / total) * 100);
        });
    });

    const analyticsBase = allTeams.length ? allTeams : [currentTeam];
    const marketAnalytics = ["moda", "autos", "casas"].map(mid => {
        const teamsInMarket = analyticsBase.filter(t => (t.market || "moda") === mid);
        const rows = teamsInMarket.flatMap(t => {
            const tr = (t.history || []).find(h => h.turn === `Q${currentTurn}`) || null;
            const src = tr?.products || t.products || {};
            return ["a", "b"].map(pid => {
                const p = src[pid];
                if (!p) return null;
                const seg = p.segmento || classifyProduct(p, mid);
                return {
                    segmento: seg,
                    price: p.discPrice || p.retailPrice || 0,
                    cost: p.unitCost || 0,
                    gain: p.margin || 0,
                };
            }).filter(Boolean);
        });
        const bySeg = { economico: 0, medio: 0, lujo: 0 };
        rows.forEach(r => { bySeg[r.segmento] = (bySeg[r.segmento] || 0) + 1; });
        const avgPrice = rows.length ? rows.reduce((a, r) => a + r.price, 0) / rows.length : 0;
        const avgCost = rows.length ? rows.reduce((a, r) => a + r.cost, 0) / rows.length : 0;
        const avgGain = rows.length ? rows.reduce((a, r) => a + r.gain, 0) / rows.length : 0;
        const turnSeries = Array.from({ length: config.maxTurns || 5 }, (_, i) => `Q${i + 1}`).map(turnKey => {
            return teamsInMarket.reduce((acc, t) => {
                const h = (t.history || []).find(x => x.turn === turnKey);
                return acc + (h?.arr || 0);
            }, 0);
        });
        return {
            marketId: mid,
            marketLabel: marketMap[mid] || mid,
            avgPrice,
            avgCost,
            avgGain,
            products: rows.length,
            segmentMix: bySeg,
            trendArr: turnSeries,
        };
    });

    const reportFromStore = hasPrevTurn ? (currentTeam.arbiterReports?.[prevKey] || null) : null;
    const events = hasStore && DataStore.getEvents ? DataStore.getEvents() : [];
    const activeEventCfg = events.find(ev => parseInt(String(ev.turn || "").replace(/[^\d]/g, ""), 10) === currentTurn) || null;
    const nextEventCfg = events.find(ev => parseInt(String(ev.turn || "").replace(/[^\d]/g, ""), 10) > currentTurn) || null;
    const arbiterReport = reportFromStore || {
        turn: hasPrevTurn ? `Q${prevTurn} 2026` : "Sin periodo previo",
        metrics: {
            arr: { value: prevHist.arr || 0, deltaDir: "up", deltaPct: "+0.0%" },
            marketShare: { value: prevHist.marketShare || 0, deltaDir: "up", deltaPct: "+0.0pp" },
            avgMargin: { value: prevHist.avgMargin || 0, deltaDir: "up", deltaPct: "+0.0%" },
        },
        verdict: hasPrevTurn
            ? `Tu empresa compite en ${marketMap[currentTeam.market] || currentTeam.market} con perfil ${SEG_LABEL[currentTeam.segmento] || currentTeam.segmento}.`
            : "Todavia no existe un turno previo evaluado. Completa y procesa el turno actual para generar el primer reporte.",
        incomingEvent: {
            title: "Ajuste de Demanda",
            description: "Mantener consistencia entre calidad, diseno y precio sera clave en el proximo turno.",
        },
    };

    window.MOCK = {
        currentTurn,
        currentTurnLabel: currentLabel,
        team: {
            id: currentTeam.id,
            name: currentTeam.name,
            market: currentTeam.market || "moda",
            marketLabel: marketMap[currentTeam.market || "moda"] || "Moda",
            segmento: currentTeam.segmento || "medio",
            segmentoLabel: SEG_LABEL[currentTeam.segmento || "medio"] || SEG_LABEL.medio,
            members: Array.isArray(currentTeam.members) ? currentTeam.members : [],
        },
        brandMetrics: {
            arr: { value: currHist.arr || 0, delta: round1((((currHist.arr || 1) - (prevHist.arr || 1)) / Math.max(1, prevHist.arr || 1)) * 100), deltaDir: (currHist.arr || 0) >= (prevHist.arr || 0) ? "up" : "down" },
            marketShare: { value: currHist.marketShare || 0, delta: round1((currHist.marketShare || 0) - (prevHist.marketShare || 0)), deltaDir: (currHist.marketShare || 0) >= (prevHist.marketShare || 0) ? "up" : "down" },
            avgMargin: { value: currHist.avgMargin || 0, delta: round1((((currHist.avgMargin || 1) - (prevHist.avgMargin || 1)) / Math.max(1, Math.abs(prevHist.avgMargin || 1))) * 100), deltaDir: (currHist.avgMargin || 0) >= (prevHist.avgMargin || 0) ? "up" : "down" },
            cac: { value: currHist.cac || 0, delta: round1((((currHist.cac || 1) - (prevHist.cac || 1)) / Math.max(1, prevHist.cac || 1)) * 100), deltaDir: (currHist.cac || 0) <= (prevHist.cac || 0) ? "up" : "down", note: "CAC menor = mas eficiente" },
        },
        history,
        products: {
            a: Object.assign({ id: "A", name: "Producto A" }, pA, {
                unitCost: mA.unitCost,
                discPrice: mA.discPrice,
                margin: mA.margin,
                channelCost: mA.channelCost,
                reach: mA.reach,
                segmentShare: round1((currHist.marketShare || 0) * 0.55),
                mfsScore: mA.mfsScore,
                market: currentTeam.market || "moda",
                segmento: classifyProduct(pA, currentTeam.market || "moda"),
            }),
            b: Object.assign({ id: "B", name: "Producto B" }, pB, {
                unitCost: mB.unitCost,
                discPrice: mB.discPrice,
                margin: mB.margin,
                channelCost: mB.channelCost,
                reach: mB.reach,
                segmentShare: round1((currHist.marketShare || 0) * 0.45),
                mfsScore: mB.mfsScore,
                market: currentTeam.market || "moda",
                segmento: classifyProduct(pB, currentTeam.market || "moda"),
            }),
        },
        financialHistory,
        marketOccupancy: (hasStore && DataStore.getMarketOccupancy) ? DataStore.getMarketOccupancy() : null,
        marketAnalytics,
        decisionProfile: getDecisionContext(currentTeam.market || "moda"),
        leaderboard,
        activeEvent: {
            title: activeEventCfg?.name || (leaderboard.length > 1 ? "Competencia en Mercado" : "Mercado en Apertura"),
            description: activeEventCfg
                ? `Evento activo: ${activeEventCfg.coefficient || activeEventCfg.coeficiente || "coef"} ${activeEventCfg.deltaValue ?? activeEventCfg.delta ?? 0}${(activeEventCfg.deltaMode || "pct") === "pct" ? "%" : ""}.`
                : (leaderboard.length > 1
                    ? `Tu empresa compite contra ${leaderboard.length - 1} rival(es) en ${marketMap[currentTeam.market] || currentTeam.market}.`
                    : "Todavia no hay competidores directos. Tu desempeno actual define la base del mercado."),
            segmento: currentTeam.segmento || "medio",
            coeficiente: activeEventCfg?.coefficient || activeEventCfg?.coeficiente || "market_pressure",
            delta: activeEventCfg ? `${activeEventCfg.deltaValue ?? activeEventCfg.delta ?? 0}${(activeEventCfg.deltaMode || "pct") === "pct" ? "%" : ""}` : (leaderboard.length > 1 ? "+8%" : "N/A"),
            turnActivated: currentTurn,
        },
        incomingSignal: {
            title: nextEventCfg?.name || "Senal de Mercado",
            description: nextEventCfg
                ? `Programado para ${nextEventCfg.turn}: ${nextEventCfg.coefficient || nextEventCfg.coeficiente || "coef"} ${nextEventCfg.deltaValue ?? nextEventCfg.delta ?? 0}${(nextEventCfg.deltaMode || "pct") === "pct" ? "%" : ""}.`
                : "Analistas observan cambios de demanda para el siguiente periodo.",
        },
        arbiterReport,
        professor: {
            totalTeams: allTeams.length || 1,
            submittedThisTurn: (allTeams || []).filter(t => t.submitted && t.submitted[`Q${currentTurn}`]).length,
            pendingTeams: (allTeams || []).filter(t => !(t.submitted && t.submitted[`Q${currentTurn}`])).map(t => `${t.id} ${t.name}`).slice(0, 4),
            segments: professorSegments,
            events: (events || []).map(ev => ({
                turn: ev.turn,
                segmento: ev.segmento || "todos",
                name: ev.name || "Evento",
                coef: `${ev.coefficient || ev.coeficiente || "coef"} ${ev.deltaValue ?? ev.delta ?? 0}${(ev.deltaMode || "pct") === "pct" ? "%" : ""}`,
                status: ev.status || "pending",
            })),
        },
    };
})();
