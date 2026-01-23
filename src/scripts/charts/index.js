/**
 * Charts Index Module
 * Initializes all dashboard charts
 */

import { initChartDefaults, colors, tooltipConfig, gridConfig, legendConfig } from '../config/chartConfig.js';
import { getFinancialData } from '../data/financialData.js';
import { createRevenueChart } from './revenueChart.js';
import { createMarginsChart } from './marginsChart.js';

// Store chart instances for cleanup
let chartInstances = {};

/**
 * Destroy all existing charts before creating new ones
 */
export function destroyCharts() {
    Object.values(chartInstances).forEach(chart => {
        if (chart) chart.destroy();
    });
    chartInstances = {};
}

/**
 * Create all dashboard charts
 */
export function initializeCharts(Chart) {
    // Destroy existing charts first
    destroyCharts();

    // Get current financial data (from report or demo)
    const data = getFinancialData();
    console.log('Initializing charts with data:', data.companyName, data.fiscalYear);

    // Set global defaults
    initChartDefaults(Chart);

    // Initialize individual charts and store references
    chartInstances.revenue = createRevenueChart(Chart, 'revenueChart', data);
    chartInstances.margins = createMarginsChart(Chart, 'marginsChart', data);
    chartInstances.segment = createSegmentChart(Chart, data);
    chartInstances.profit = createProfitChart(Chart, data);
    chartInstances.capital = createCapitalChart(Chart, data);
    chartInstances.ratios = createRatiosChart(Chart, data);
    chartInstances.cashflow = createCashflowChart(Chart, data);
    chartInstances.fcf = createFcfChart(Chart, data);

    // Update KPIs
    updateKPIs(data);
}

/**
 * Format number safely
 */
function formatNum(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return Number(val).toFixed(decimals);
}

/**
 * Format ratio - returns N/A for 0 or missing values (ratios should never be exactly 0)
 */
function formatRatio(val, decimals = 2) {
    if (val === null || val === undefined || isNaN(val) || val === 0) return 'N/A';
    return Number(val).toFixed(decimals);
}

/**
 * Format large number without locale-specific separators
 */
function formatLargeNum(val) {
    if (val === null || val === undefined || isNaN(val)) return 'N/A';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(val);
}

/**
 * Update KPIs with dynamic data
 */
function updateKPIs(data) {
    const kpiCards = document.querySelectorAll('.kpi-card');
    if (!kpiCards.length) return;

    // Get the last value from arrays (most recent year)
    const getLatest = (arr) => Array.isArray(arr) ? arr[arr.length - 1] : arr;

    // Get values with safe defaults
    const netMargin = getLatest(data.netMargin);
    const roe = data.roe;
    const currentRatio = getLatest(data.currentRatio);
    const debtToEquity = getLatest(data.debtToEquity);
    const revenue = getLatest(data.revenue);
    const netProfit = getLatest(data.netProfit);

    const kpiData = [
        {
            label: 'Net Profit Margin',
            value: `${formatRatio(netMargin)}%`,
            subtitle: data.companyName || 'Company'
        },
        {
            label: 'Return on Equity (ROE)',
            value: `${formatRatio(roe)}%`,
            subtitle: `FY ${data.fiscalYear || 'N/A'}`
        },
        {
            label: 'Current Ratio',
            value: `${formatRatio(currentRatio)}x`,
            subtitle: 'Liquidity position'
        },
        {
            label: 'Debt-to-Equity Ratio',
            value: `${formatRatio(debtToEquity)}x`,
            subtitle: 'Capital structure'
        },
        {
            label: 'Revenue',
            value: `${formatNum(revenue / 1000)}B`,
            subtitle: 'SAR'
        },
        {
            label: 'Net Profit',
            value: `${formatLargeNum(netProfit)}M`,
            subtitle: 'SAR'
        }
    ];

    kpiCards.forEach((card, index) => {
        if (kpiData[index]) {
            const labelEl = card.querySelector('.kpi-label');
            const valueEl = card.querySelector('.kpi-value');
            const subtitleEl = card.querySelector('.kpi-subtitle');

            if (labelEl) labelEl.textContent = kpiData[index].label;
            if (valueEl) valueEl.textContent = kpiData[index].value;
            if (subtitleEl) subtitleEl.textContent = kpiData[index].subtitle;
        }
    });
}

function createSegmentChart(Chart, data) {
    const ctx = document.getElementById('segmentChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pharma Distribution', 'Front Shop'],
            datasets: [{
                data: [data.segmentPharma, data.segmentFrontShop],
                backgroundColor: [colors.goldDim, colors.blueDim],
                borderColor: [colors.gold, colors.blue],
                borderWidth: 2,
                hoverOffset: 10
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '65%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { usePointStyle: true, padding: 20 }
                },
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `${ctx.label}: ${ctx.raw}%` }
                }
            }
        }
    });
}

function createProfitChart(Chart, data) {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.years,
            datasets: [{
                label: 'Net Profit',
                data: data.netProfit,
                backgroundColor: colors.tealDim,
                borderColor: colors.teal,
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 50
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `SAR ${ctx.raw.toLocaleString()}M` }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: gridConfig,
                    ticks: { callback: v => v + 'M' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function createCapitalChart(Chart, data) {
    const ctx = document.getElementById('capitalChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Total Liabilities',
                    data: data.totalLiabilities,
                    backgroundColor: colors.purpleDim,
                    borderColor: colors.purple,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 35
                },
                {
                    label: 'Shareholders\' Equity',
                    data: data.totalEquity,
                    backgroundColor: colors.goldDim,
                    borderColor: colors.gold,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: legendConfig,
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `${ctx.dataset.label}: SAR ${ctx.raw.toLocaleString()}M` }
                }
            },
            scales: {
                y: {
                    grid: gridConfig,
                    ticks: { callback: v => (v/1000).toFixed(1) + 'B' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function createRatiosChart(Chart, data) {
    const ctx = document.getElementById('ratiosChart');
    if (!ctx) return null;

    // Calculate dynamic min/max for scales
    const crValues = data.currentRatio;
    const deValues = data.debtToEquity;
    const crMin = Math.min(...crValues) * 0.9;
    const crMax = Math.max(...crValues) * 1.1;
    const deMin = Math.min(...deValues) * 0.9;
    const deMax = Math.max(...deValues) * 1.1;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Current Ratio',
                    data: data.currentRatio,
                    borderColor: colors.teal,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'Debt-to-Equity',
                    data: data.debtToEquity,
                    borderColor: colors.purple,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: { mode: 'index', intersect: false },
            plugins: {
                legend: legendConfig,
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `${ctx.dataset.label}: ${ctx.raw}x` }
                }
            },
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    min: crMin,
                    max: crMax,
                    grid: gridConfig,
                    ticks: { callback: v => v.toFixed(2) + 'x' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: deMin,
                    max: deMax,
                    grid: { drawOnChartArea: false },
                    ticks: { callback: v => v.toFixed(2) + 'x' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function createCashflowChart(Chart, data) {
    const ctx = document.getElementById('cashflowChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Operating',
                    data: data.operatingCashFlow,
                    backgroundColor: colors.tealDim,
                    borderColor: colors.teal,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 30
                },
                {
                    label: 'Investing',
                    data: data.investingCashFlow,
                    backgroundColor: colors.purpleDim,
                    borderColor: colors.purple,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 30
                },
                {
                    label: 'Financing',
                    data: data.financingCashFlow,
                    backgroundColor: colors.blueDim,
                    borderColor: colors.blue,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 30
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: legendConfig,
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `${ctx.dataset.label}: SAR ${ctx.raw.toLocaleString()}M` }
                }
            },
            scales: {
                y: {
                    grid: gridConfig,
                    ticks: { callback: v => (v >= 0 ? '+' : '') + v + 'M' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function createFcfChart(Chart, data) {
    const ctx = document.getElementById('fcfChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: [{
                label: 'Free Cash Flow',
                data: data.fcf,
                borderColor: colors.gold,
                backgroundColor: colors.goldDim,
                fill: true,
                tension: 0.4,
                pointRadius: 8,
                pointHoverRadius: 10,
                pointBackgroundColor: colors.gold
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...tooltipConfig,
                    callbacks: { label: ctx => `FCF: SAR ${ctx.raw.toLocaleString()}M` }
                }
            },
            scales: {
                y: {
                    grid: gridConfig,
                    ticks: { callback: v => v + 'M' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

export default initializeCharts;
