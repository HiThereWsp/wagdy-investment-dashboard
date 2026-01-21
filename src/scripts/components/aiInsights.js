/**
 * AI Insights Component
 * Displays AI-generated investment insights
 */

import { generateInsights, generateExecutiveSummary, detectAnomalies } from '../../services/openaiService.js';
import { financialData } from '../data/financialData.js';

/**
 * Create AI Insights Panel HTML
 */
function createInsightsPanelHTML() {
    return `
        <div class="ai-insights-panel" id="aiInsightsPanel">
            <h3>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                </svg>
                AI Investment Insights
            </h3>
            <div class="ai-insights-content" id="aiInsightsContent">
                <div class="ai-insights-loading">
                    <div class="spinner"></div>
                    <span>Generating AI insights...</span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Create Anomalies Alert HTML
 */
function createAnomaliesHTML(anomalies) {
    if (!anomalies || anomalies.length === 0) {
        return '<p>No significant anomalies detected.</p>';
    }

    return anomalies.map(anomaly => `
        <div class="anomaly-item anomaly-${anomaly.severity}">
            <div class="anomaly-header">
                <span class="anomaly-metric">${anomaly.metric}</span>
                <span class="anomaly-severity">${anomaly.severity}</span>
            </div>
            <p class="anomaly-description">${anomaly.description}</p>
            <p class="anomaly-recommendation"><strong>Recommendation:</strong> ${anomaly.recommendation}</p>
        </div>
    `).join('');
}

/**
 * Format insights text for display
 */
function formatInsights(text) {
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/### (.*?)(\n|$)/g, '<h4>$1</h4>')
        .replace(/## (.*?)(\n|$)/g, '<h4>$1</h4>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '</p><p>• ')
        .replace(/\n\d\. /g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
}

/**
 * Load and display AI insights
 */
async function loadInsights() {
    const contentEl = document.getElementById('aiInsightsContent');

    try {
        const insights = await generateInsights(financialData);
        contentEl.innerHTML = formatInsights(insights);
    } catch (error) {
        contentEl.innerHTML = `
            <p style="color: var(--negative);">
                Failed to generate insights: ${error.message}
            </p>
            <button class="retry-btn" onclick="window.retryInsights()">
                Retry
            </button>
        `;
        console.error('Failed to load insights:', error);
    }
}

/**
 * Retry loading insights
 */
window.retryInsights = async function() {
    const contentEl = document.getElementById('aiInsightsContent');
    contentEl.innerHTML = `
        <div class="ai-insights-loading">
            <div class="spinner"></div>
            <span>Generating AI insights...</span>
        </div>
    `;
    await loadInsights();
};

/**
 * Initialize AI Insights component
 */
export async function initAIInsights(targetSelector = '#summary') {
    const targetSection = document.querySelector(targetSelector);
    if (!targetSection) {
        console.warn('Target section not found for AI insights');
        return;
    }

    // Insert panel after the KPI grid
    const kpiGrid = targetSection.querySelector('.kpi-grid');
    if (kpiGrid) {
        kpiGrid.insertAdjacentHTML('afterend', createInsightsPanelHTML());
    } else {
        targetSection.insertAdjacentHTML('beforeend', createInsightsPanelHTML());
    }

    // Load insights asynchronously
    await loadInsights();

    console.log('AI Insights initialized');
}

export default { initAIInsights };
