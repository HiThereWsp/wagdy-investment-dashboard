/**
 * Chart.js Configuration Module
 * Contains color palette and default chart settings
 */

// Color Palette
export const colors = {
    gold: '#d4af37',
    goldDim: 'rgba(212, 175, 55, 0.3)',
    blue: '#3b82f6',
    blueDim: 'rgba(59, 130, 246, 0.3)',
    purple: '#8b5cf6',
    purpleDim: 'rgba(139, 92, 246, 0.3)',
    teal: '#14b8a6',
    tealDim: 'rgba(20, 184, 166, 0.3)',
    positive: '#22c55e',
    negative: '#ef4444',
    gray: '#71717a'
};

/**
 * Set Chart.js global defaults
 */
export function initChartDefaults(Chart) {
    Chart.defaults.color = '#a1a1aa';
    Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.06)';
    Chart.defaults.font.family = "'DM Sans', sans-serif";
}

/**
 * Common tooltip configuration
 */
export const tooltipConfig = {
    backgroundColor: '#1c1e23',
    titleColor: '#f4f4f5',
    bodyColor: '#a1a1aa',
    borderColor: 'rgba(255,255,255,0.1)',
    borderWidth: 1,
    padding: 12,
    displayColors: false
};

/**
 * Common grid configuration
 */
export const gridConfig = {
    color: 'rgba(255,255,255,0.04)'
};

/**
 * Common legend configuration
 */
export const legendConfig = {
    position: 'top',
    align: 'end',
    labels: {
        usePointStyle: true,
        padding: 20
    }
};

export default {
    colors,
    initChartDefaults,
    tooltipConfig,
    gridConfig,
    legendConfig
};
