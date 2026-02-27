/**
 * MKT SLIM GAME — calculator.js
 * Motor de cálculo 4Ps en tiempo real.
 * Actualiza el DOM sin side-effects; puede ser re-importado como módulo.
 */

"use strict";

// ── CONSTANTES ────────────────────────────────────────────────
const CHANNEL_REACH   = { 1: 0.50, 2: 0.75, 3: 0.90, 4: 1.00 };
const CHANNEL_COST    = 2_000_000; // $ por canal
const QUALITY_COST_K  = 250;       // $ por punto de Quality
const DESIGN_COST_K   = 150;       // $ por punto de Design

// Ponderaciones por segmento para Market Fit Score
const SEGMENT_WEIGHTS = {
  economico: { quality: 0.20, design: 0.10, priceLow: 0.50, channels: 0.30, adspend: 0.10 },
  medio:     { quality: 0.35, design: 0.25, priceLow: 0.25, channels: 0.20, adspend: 0.15 },
  lujo:      { quality: 0.40, design: 0.40, priceLow: 0.05, channels: 0.15, adspend: 0.20 },
};

const PRICE_MIN = 1_000;
const PRICE_MAX = 6_000;
const AD_MAX    = 20_000_000;

// ── FORMATTERS ────────────────────────────────────────────────
const fmt = {
  currency: (v) => new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(v),
  pct:      (v) => `${(v * 100).toFixed(1)}%`,
  int:      (v) => Math.round(v).toLocaleString('es-CL'),
};

// ── CORE CALCULATORS ──────────────────────────────────────────

/**
 * Calcula métricas de un producto dado sus inputs.
 * @param {Object} inputs - Valores del formulario
 * @returns {Object} métricas calculadas
 */
function calcProductMetrics(inputs) {
  const { quality, design, retailPrice, channels, discountPct, adSpend } = inputs;

  const unitCost       = (quality * QUALITY_COST_K) + (design * DESIGN_COST_K);
  const discountFactor = 1 - (discountPct / 100);
  const discPrice      = retailPrice * discountFactor;
  const margin         = discPrice - unitCost;
  const channelCost    = channels * CHANNEL_COST;
  const reach          = CHANNEL_REACH[channels] ?? 0.50;

  return {
    unitCost,
    discPrice,
    margin,
    channelCost,
    reach,
    marginPct: discPrice > 0 ? margin / discPrice : 0,
  };
}

/**
 * Calcula el Market Fit Score (0—1) para un segmento dado.
 */
function calcMarketFitScore(inputs, segmento) {
  const weights = SEGMENT_WEIGHTS[segmento] ?? SEGMENT_WEIGHTS.medio;

  const normalQuality  = inputs.quality / 10;
  const normalDesign   = inputs.design / 5;
  const normalPriceLow = 1 - ((inputs.retailPrice - PRICE_MIN) / (PRICE_MAX - PRICE_MIN));
  const normalChannels = CHANNEL_REACH[inputs.channels] ?? 0.5;
  const normalAd       = Math.min(inputs.adSpend / AD_MAX, 1);

  // Score ponderado (sin normalizar a 1 porque los pesos no suman 1 individualmente)
  const raw = (
    weights.quality   * normalQuality  +
    weights.design    * normalDesign   +
    weights.priceLow  * normalPriceLow +
    weights.channels  * normalChannels +
    weights.adspend   * normalAd
  );

  // Normalizar: suma de pesos máximos
  const maxWeight = weights.quality + weights.design + weights.priceLow + weights.channels + weights.adspend;
  return Math.min(raw / (maxWeight * 0.6), 1); // 0.6 = factor de dificultad pedagógica
}

// ── DOM UPDATERS ──────────────────────────────────────────────

/**
 * Actualiza las celdas calculadas de un producto en el DOM.
 * @param {string} prefix - "a" o "b" (para los IDs del DOM)
 * @param {string} segmento - "economico" | "medio" | "lujo"
 */
function updateProductDisplay(prefix, segmento) {
  const get = (id) => document.getElementById(`${prefix}-${id}`);
  const setText = (id, val) => { const el = get(id); if (el) el.textContent = val; };
  const setClass = (id, cls) => { const el = get(id); if (el) el.className = cls; };

  // Leer inputs
  const quality     = parseFloat(get('quality')?.value    ?? 5);
  const design      = parseFloat(get('design')?.value     ?? 3);
  const retailPrice = parseFloat(get('price')?.value      ?? 3000);
  const channels    = parseInt(get('channels')?.value     ?? 2);
  const discountPct = parseFloat(get('discount')?.value   ?? 0);
  const adSpend     = parseFloat(get('adspend')?.value    ?? 0);

  const inputs = { quality, design, retailPrice, channels, discountPct, adSpend };
  const m = calcProductMetrics(inputs);
  const mfs = calcMarketFitScore(inputs, segmento);

  // ── Actualizar valores calculados (celdas) ──
  setText('calc-unitcost',   fmt.currency(m.unitCost));
  setText('calc-discprice',  fmt.currency(m.discPrice));
  setText('calc-margin',     fmt.currency(m.margin));
  setText('calc-channelcost',fmt.currency(m.channelCost));
  setText('calc-reach',      fmt.pct(m.reach));

  // Color del margen
  const marginEl = get('calc-margin');
  if (marginEl) {
    marginEl.className = `calc-value ${m.margin >= 0 ? 'calc-value--positive' : 'calc-value--negative'}`;
  }

  // ── Market Fit Score ──
  updateMFSBar(prefix, mfs, segmento);

  // ── Actualizar slider labels ──
  const qualityLabel = get('quality-label');
  if (qualityLabel) qualityLabel.textContent = quality;
  const designLabel = get('design-label');
  if (designLabel) designLabel.textContent = design;
  const channelLabel = get('channel-label');
  if (channelLabel) channelLabel.textContent = channels;
  const discountLabel = get('discount-label');
  if (discountLabel) discountLabel.textContent = `${discountPct}%`;

  // Live preview de precio final en label
  const pricePreview = get('price-preview');
  if (pricePreview) pricePreview.textContent = fmt.currency(retailPrice);
  const adPreview = get('adspend-preview');
  if (adPreview) adPreview.textContent = fmt.currency(adSpend);
}

/**
 * Actualiza la barra de Market Fit Score en el DOM.
 */
function updateMFSBar(prefix, score, segmento) {
  const pct = Math.round(score * 100);

  // Barra
  const barA = document.getElementById(`${prefix}-mfs-fill`);
  if (barA) {
    barA.style.width = `${pct}%`;
    barA.className = `mfs-bar-fill ${
      pct < 35 ? 'mfs-bar-fill--low' :
      pct < 65 ? 'mfs-bar-fill--mid' :
                 'mfs-bar-fill--high'
    }`;
  }

  // Score numérico
  const scoreEl = document.getElementById(`${prefix}-mfs-score`);
  if (scoreEl) {
    scoreEl.textContent = `${pct}%`;
    scoreEl.style.color = pct < 35 ? 'var(--accent-rose)' :
                          pct < 65 ? 'var(--accent-amber)' :
                                     'var(--accent-emerald)';
  }

  // Descripción textual
  const descEl = document.getElementById(`${prefix}-mfs-desc`);
  const segLabels = {
    economico: 'Mercado Económico',
    medio:     'Mercado Medio',
    lujo:      'Mercado Lujo',
  };
  if (descEl) {
    descEl.textContent = pct < 35 ? `Débil para ${segLabels[segmento] ?? segmento}` :
                         pct < 65 ? `Competitivo en ${segLabels[segmento] ?? segmento}` :
                                    `Fuerte en ${segLabels[segmento] ?? segmento}`;
  }
}

// ── BINDING AUTOMÁTICO ────────────────────────────────────────

/**
 * Enlaza todos los inputs del formulario de decisiones con updateProductDisplay.
 * Se llama al cargar la página.
 */
function bindDecisionForm() {
  const segmentoEl = document.getElementById('segmento-select');
  const getSegmento = () => segmentoEl?.value ?? 'medio';

  ['a', 'b'].forEach((prefix) => {
    const ids = ['quality', 'design', 'price', 'channels', 'discount', 'adspend'];
    ids.forEach((id) => {
      const el = document.getElementById(`${prefix}-${id}`);
      if (!el) return;
      el.addEventListener('input', () => updateProductDisplay(prefix, getSegmento()));
    });
  });

  // Si el segmento cambia, recalcular ambos
  segmentoEl?.addEventListener('change', () => {
    updateProductDisplay('a', getSegmento());
    updateProductDisplay('b', getSegmento());
  });

  // Trigger inicial
  updateProductDisplay('a', getSegmento());
  updateProductDisplay('b', getSegmento());
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', bindDecisionForm);

// Exportar para tests y uso externo
if (typeof module !== 'undefined') {
  module.exports = { calcProductMetrics, calcMarketFitScore, fmt };
}
