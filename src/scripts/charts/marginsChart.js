/**
 * Margins Chart Module
 */

import { colors, tooltipConfig, gridConfig, legendConfig } from '../config/chartConfig.js';

export function createMarginsChart(Chart, canvasId, data) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    // Calculate dynamic y-axis range
    const allValues = [...data.grossMargin, ...data.netMargin];
    const minVal = Math.min(...allValues);
    const maxVal = Math.max(...allValues);
    const yMin = Math.max(0, minVal - 5);
    const yMax = maxVal + 5;

    return new Chart(ctx, {
        type: 'line',
        data: {
            labels: data.years,
            datasets: [
                {
                    label: 'Gross Margin',
                    data: data.grossMargin,
                    borderColor: colors.blue,
                    backgroundColor: colors.blueDim,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 6,
                    pointHoverRadius: 8
                },
                {
                    label: 'Net Margin',
                    data: data.netMargin,
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
                    min: yMin,
                    max: yMax,
                    grid: gridConfig,
                    ticks: { callback: v => v + '%' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

export default createMarginsChart;
