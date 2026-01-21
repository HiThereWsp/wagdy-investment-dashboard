/**
 * OpenAI Service Module
 * Handles all AI-powered features via secure serverless API
 */

// Use relative path for API - works in both dev and production
const API_URL = '/api/chat';

/**
 * Send a request to our secure API endpoint
 */
async function callAPI(action, data, messages = null) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            action,
            data,
            messages
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'API error');
    }

    const result = await response.json();
    return result.result;
}

/**
 * Extract financial data from text content
 */
export async function extractFinancialData(textContent) {
    try {
        return await callAPI('extract', textContent);
    } catch (e) {
        console.error('Failed to extract financial data:', e);
        return null;
    }
}

/**
 * Generate investment insights from financial data
 */
export async function generateInsights(financialData) {
    return await callAPI('insights', financialData);
}

/**
 * Answer questions about financial data
 */
export async function queryFinancialData(question, financialData) {
    return await callAPI('query', financialData, question);
}

/**
 * Detect anomalies in financial data
 */
export async function detectAnomalies(financialData, historicalData = null) {
    try {
        return await callAPI('anomalies', { current: financialData, historical: historicalData });
    } catch (e) {
        console.error('Failed to detect anomalies:', e);
        return [];
    }
}

/**
 * Generate executive summary
 */
export async function generateExecutiveSummary(financialData) {
    return await callAPI('summary', financialData);
}

export default {
    extractFinancialData,
    generateInsights,
    queryFinancialData,
    detectAnomalies,
    generateExecutiveSummary
};
