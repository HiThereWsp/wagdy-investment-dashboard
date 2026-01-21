/**
 * Charts Index Module
 * Initializes all dashboard charts
 */

import { initChartDefaults, colors, tooltipConfig, gridConfig, legendConfig } from '../config/chartConfig.js';
import { financialData } from '../data/financialData.js';
import { createRevenueChart } from './revenueChart.js';
import { createMarginsChart } from './marginsChart.js';

/**
 * Create all dashboard charts
 */
export function initializeCharts(Chart) {
    // Set global defaults
    initChartDefaults(Chart);

    // Initialize individual charts
    createRevenueChart(Chart, 'revenueChart');
    createMarginsChart(Chart, 'marginsChart');
    createSegmentChart(Chart);
    createProfitChart(Chart);
    createCapitalChart(Chart);
    createRatiosChart(Chart);
    createCashflowChart(Chart);
    createFcfChart(Chart);
}

function createSegmentChart(Chart) {
    const ctx = document.getElementById('segmentChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Pharma Distribution', 'Front Shop'],
            datasets: [{
                data: [financialData.segmentPharma, financialData.segmentFrontShop],
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

function createProfitChart(Chart) {
    const ctx = document.getElementById('profitChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: financialData.years,
            datasets: [{
                label: 'Net Profit',
                data: financialData.netProfit,
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

function createCapitalChart(Chart) {
    const ctx = document.getElementById('capitalChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: financialData.years,
            datasets: [
                {
                    label: 'Total Liabilities',
                    data: financialData.totalLiabilities,
                    backgroundColor: colors.purpleDim,
                    borderColor: colors.purple,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 35
                },
                {
                    label: 'Shareholders\' Equity',
                    data: financialData.totalEquity,
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

function createRatiosChart(Chart) {
    const ctx = document.getElementById('ratiosChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: financialData.years,
            datasets: [
                {
                    label: 'Current Ratio',
                    data: financialData.currentRatio,
                    borderColor: colors.teal,
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8,
                    yAxisID: 'y'
                },
                {
                    label: 'Debt-to-Equity',
                    data: financialData.debtToEquity,
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
                    min: 1.5,
                    max: 1.8,
                    grid: gridConfig,
                    ticks: { callback: v => v + 'x' }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 1.1,
                    max: 1.3,
                    grid: { drawOnChartArea: false },
                    ticks: { callback: v => v + 'x' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

function createCashflowChart(Chart) {
    const ctx = document.getElementById('cashflowChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: financialData.years,
            datasets: [
                {
                    label: 'Operating',
                    data: financialData.operatingCashFlow,
                    backgroundColor: colors.tealDim,
                    borderColor: colors.teal,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 30
                },
                {
                    label: 'Investing',
                    data: financialData.investingCashFlow,
                    backgroundColor: colors.purpleDim,
                    borderColor: colors.purple,
                    borderWidth: 2,
                    borderRadius: 6,
                    barThickness: 30
                },
                {
                    label: 'Financing',
                    data: financialData.financingCashFlow,
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

function createFcfChart(Chart) {
    const ctx = document.getElementById('fcfChart');
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: financialData.years,
            datasets: [{
                label: 'Free Cash Flow',
                data: financialData.fcf,
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
