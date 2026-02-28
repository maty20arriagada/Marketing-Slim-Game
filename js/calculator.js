/**
 * MKT SLIM GAME - calculator.js
 * Real-time 4Ps helper calculators.
 */

"use strict";

const CHANNEL_REACH = { 1: 0.50, 2: 0.75, 3: 0.90, 4: 1.00 };
const DEFAULT_PRICE_MIN = 10;
const DEFAULT_PRICE_MAX = 3_000_000;
const DEFAULT_AD_MAX = 150_000_000;
const DEFAULT_COSTS = {
  qualityCostPerLevel: 250,
  designCostPerLevel: 150,
  channelCostPerUnit: 2_000_000,
};
const DEFAULT_SENSITIVITY = {
  priceDistancePenalty: 1,
  minAlignment: 0.2,
};
const DEFAULT_TARGET_PRICE = {
  economico: 100,
  medio: 500,
  lujo: 1000,
};

const SEGMENT_WEIGHTS = {
  economico: { quality: 0.24, design: 0.10, priceLow: 0.46, channels: 0.24, adspend: 0.12 },
  medio: { quality: 0.34, design: 0.24, priceLow: 0.22, channels: 0.20, adspend: 0.15 },
  lujo: { quality: 0.38, design: 0.34, priceLow: 0.08, channels: 0.14, adspend: 0.18 },
};

function clamp(v, min, max) {
  if (!Number.isFinite(v)) return min;
  if (v < min) return min;
  if (v > max) return max;
  return v;
}

function buildCalcContext(options = {}) {
  const costs = Object.assign({}, DEFAULT_COSTS, options.costs || {});
  const price = Object.assign({
    min: options.priceMin ?? DEFAULT_PRICE_MIN,
    max: options.priceMax ?? DEFAULT_PRICE_MAX,
  }, options.price || {});
  const adSpend = Object.assign({
    max: options.adMax ?? DEFAULT_AD_MAX,
  }, options.adSpend || {});
  const sensitivity = Object.assign({}, DEFAULT_SENSITIVITY, options.sensitivity || {});
  const targetPriceBySegment = Object.assign({}, DEFAULT_TARGET_PRICE, options.targetPriceBySegment || {});
  return { costs, price, adSpend, sensitivity, targetPriceBySegment };
}

function calcPriceAlignment(price, segmento, context) {
  const target = context.targetPriceBySegment?.[segmento] || ((context.price.min + context.price.max) / 2);
  const distance = Math.abs(price - target) / Math.max(1, target);
  const penalty = context.sensitivity.priceDistancePenalty || 1;
  const minAlignment = context.sensitivity.minAlignment || 0.2;
  const alignment = clamp(1 - (distance * penalty), minAlignment, 1);
  return { target, distance, alignment };
}

const fmt = {
  currency: (v) => new Intl.NumberFormat("es-CL", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v),
  pct: (v) => `${(v * 100).toFixed(1)}%`,
  int: (v) => Math.round(v).toLocaleString("es-CL"),
};

function calcProductMetrics(inputs, options = {}) {
  const ctx = buildCalcContext(options);
  const { quality, design, retailPrice, channels, discountPct, adSpend } = inputs;

  const unitCost = (quality * ctx.costs.qualityCostPerLevel) + (design * ctx.costs.designCostPerLevel);
  const discountFactor = 1 - (discountPct / 100);
  const discPrice = retailPrice * discountFactor;
  const margin = discPrice - unitCost;
  const channelCost = channels * ctx.costs.channelCostPerUnit;
  const reach = CHANNEL_REACH[channels] ?? 0.50;

  return {
    unitCost,
    discPrice,
    margin,
    channelCost,
    reach,
    marginPct: discPrice > 0 ? margin / discPrice : 0,
    adSpend,
  };
}

function calcMarketFitScore(inputs, segmento, options = {}) {
  const ctx = buildCalcContext(options);
  const weights = SEGMENT_WEIGHTS[segmento] ?? SEGMENT_WEIGHTS.medio;

  const normalQuality = inputs.quality / 10;
  const normalDesign = inputs.design / 5;
  const rawPriceLow = 1 - ((inputs.retailPrice - ctx.price.min) / Math.max(1, (ctx.price.max - ctx.price.min)));
  const priceFit = calcPriceAlignment(inputs.retailPrice, segmento, ctx);
  const normalPriceLow = clamp(rawPriceLow, 0, 1) * priceFit.alignment;
  const normalChannels = CHANNEL_REACH[inputs.channels] ?? 0.5;
  const normalAd = Math.min(inputs.adSpend / Math.max(1, ctx.adSpend.max), 1);

  const raw = (
    weights.quality * normalQuality +
    weights.design * normalDesign +
    weights.priceLow * normalPriceLow +
    weights.channels * normalChannels +
    weights.adspend * normalAd
  );

  const maxWeight = weights.quality + weights.design + weights.priceLow + weights.channels + weights.adspend;
  return Math.min(raw / (maxWeight * 0.6), 1);
}

function updateProductDisplay(prefix, segmento, options = {}) {
  const get = (id) => document.getElementById(`${prefix}-${id}`);
  const setText = (id, val) => { const el = get(id); if (el) el.textContent = val; };

  const quality = parseFloat(get("quality")?.value ?? 5);
  const design = parseFloat(get("design")?.value ?? 3);
  const retailPrice = parseFloat(get("price")?.value ?? 3000);
  const channels = parseInt(get("channels")?.value ?? 2, 10);
  const discountPct = parseFloat(get("discount")?.value ?? 0);
  const adSpend = parseFloat(get("adspend")?.value ?? 0);

  const inputs = { quality, design, retailPrice, channels, discountPct, adSpend };
  const m = calcProductMetrics(inputs, options);
  const mfs = calcMarketFitScore(inputs, segmento, options);

  setText("calc-unitcost", fmt.currency(m.unitCost));
  setText("calc-discprice", fmt.currency(m.discPrice));
  setText("calc-margin", fmt.currency(m.margin));
  setText("calc-channelcost", fmt.currency(m.channelCost));
  setText("calc-reach", fmt.pct(m.reach));

  const marginEl = get("calc-margin");
  if (marginEl) {
    marginEl.className = `calc-value ${m.margin >= 0 ? "calc-value--positive" : "calc-value--negative"}`;
  }

  updateMFSBar(prefix, mfs, segmento);

  const qualityLabel = get("quality-label");
  if (qualityLabel) qualityLabel.textContent = quality;
  const designLabel = get("design-label");
  if (designLabel) designLabel.textContent = design;
  const channelLabel = get("channel-label");
  if (channelLabel) channelLabel.textContent = channels;
  const discountLabel = get("discount-label");
  if (discountLabel) discountLabel.textContent = `${discountPct}%`;
  const pricePreview = get("price-preview");
  if (pricePreview) pricePreview.textContent = fmt.currency(retailPrice);
  const adPreview = get("adspend-preview");
  if (adPreview) adPreview.textContent = fmt.currency(adSpend);
}

function updateMFSBar(prefix, score, segmento) {
  const pct = Math.round(score * 100);

  const barA = document.getElementById(`${prefix}-mfs-fill`);
  if (barA) {
    barA.style.width = `${pct}%`;
    barA.className = `mfs-bar-fill ${
      pct < 35 ? "mfs-bar-fill--low" :
      pct < 65 ? "mfs-bar-fill--mid" :
      "mfs-bar-fill--high"
    }`;
  }

  const scoreEl = document.getElementById(`${prefix}-mfs-score`);
  if (scoreEl) {
    scoreEl.textContent = `${pct}%`;
    scoreEl.style.color = pct < 35 ? "var(--accent-rose)" :
      pct < 65 ? "var(--accent-amber)" :
      "var(--accent-emerald)";
  }

  const descEl = document.getElementById(`${prefix}-mfs-desc`);
  const segLabels = {
    economico: "Mercado Economico",
    medio: "Mercado Medio",
    lujo: "Mercado Lujo",
  };
  if (descEl) {
    descEl.textContent = pct < 35 ? `Debil para ${segLabels[segmento] ?? segmento}` :
      pct < 65 ? `Competitivo en ${segLabels[segmento] ?? segmento}` :
      `Fuerte en ${segLabels[segmento] ?? segmento}`;
  }
}

function bindDecisionForm() {
  const segmentoEl = document.getElementById("segmento-select");
  const getSegmento = () => segmentoEl?.value ?? "medio";

  ["a", "b"].forEach((prefix) => {
    const ids = ["quality", "design", "price", "channels", "discount", "adspend"];
    ids.forEach((id) => {
      const el = document.getElementById(`${prefix}-${id}`);
      if (!el) return;
      el.addEventListener("input", () => updateProductDisplay(prefix, getSegmento(), {}));
    });
  });

  segmentoEl?.addEventListener("change", () => {
    updateProductDisplay("a", getSegmento(), {});
    updateProductDisplay("b", getSegmento(), {});
  });

  updateProductDisplay("a", getSegmento(), {});
  updateProductDisplay("b", getSegmento(), {});
}

if (typeof document !== "undefined") {
  document.addEventListener("DOMContentLoaded", bindDecisionForm);
}

if (typeof module !== "undefined") {
  module.exports = {
    calcProductMetrics,
    calcMarketFitScore,
    calcPriceAlignment,
    buildCalcContext,
    fmt,
  };
}
