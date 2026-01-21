/**
 * Revenue Chart Module
 */

import { colors, tooltipConfig, gridConfig } from '../config/chartConfig.js';
import { financialData } from '../data/financialData.js';

export function createRevenueChart(Chart, canvasId) {
    const ctx = document.getElementById(canvasId);
    if (!ctx) return null;

    return new Chart(ctx, {
        type: 'bar',
        data: {
            labels: financialData.years,
            datasets: [{
                label: 'Revenue (SAR Billions)',
                data: financialData.revenue.map(v => v / 1000),
                backgroundColor: colors.goldDim,
                borderColor: colors.gold,
                borderWidth: 2,
                borderRadius: 8,
                barThickness: 60
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    ...tooltipConfig,
                    callbacks: {
                        label: ctx => `SAR ${(ctx.raw * 1000).toLocaleString()}M`
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: gridConfig,
                    ticks: { callback: v => v + 'B' }
                },
                x: { grid: { display: false } }
            }
        }
    });
}

export default createRevenueChart;
