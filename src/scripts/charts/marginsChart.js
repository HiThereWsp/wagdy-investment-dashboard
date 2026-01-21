/**
 * Margins Chart Module
 */

import { colors, tooltipConfig, gridConfig, legendConfig } from '../config/chartConfig.js';
import { financialData } from '../data/financialData.js';

export function createMarginsChart(Chart, canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: financialData.years,
            datasets: [
                {
                    label: 'Gross Margin',
                    data: financialData.grossMargin,
                    borderColor: colors.blue,
                    backgroundColor: colors.blueDim,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Net Margin',
                    data: financialData.netMargin,
                    borderColor: colors.gold,
                    backgroundColor: colors.goldDim,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
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
                    callbacks: {
                        label: ctx => `${ctx.dataset.label}: ${ctx.raw}%`
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 40,
                    grid: gridConfig,
                    ticks: { callback: v => v + '%' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

export default createMarginsChart;
