/**
 * OpenAI Service Module
 * Handles all AI-powered features for the investment dashboard
 */

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Send a request to OpenAI API
 */
async function callOpenAI(messages, options = {}) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`
        },
        body: JSON.stringify({
            model: options.model || 'gpt-4-turbo-preview',
            messages,
            max_tokens: options.maxTokens || 4096,
            temperature: options.temperature || 0.7
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
}

/**
 * Extract financial data from text content
 */
export async function extractFinancialData(textContent) {
    const systemPrompt = `You are a financial data extraction expert. Extract structured financial data from the provided text.

Return a JSON object with the following structure:
{
    "companyName": "string",
    "fiscalYear": "string",
    "revenue": { "value": number, "currency": "SAR", "unit": "millions" },
    "netProfit": { "value": number, "currency": "SAR", "unit": "millions" },
    "grossMargin": { "value": number, "unit": "percent" },
    "netMargin": { "value": number, "unit": "percent" },
    "totalAssets": { "value": number, "currency": "SAR", "unit": "millions" },
    "totalLiabilities": { "value": number, "currency": "SAR", "unit": "millions" },
    "totalEquity": { "value": number, "currency": "SAR", "unit": "millions" },
    "currentRatio": number,
    "debtToEquity": number,
    "operatingCashFlow": { "value": number, "currency": "SAR", "unit": "millions" },
    "dividendPerShare": { "value": number, "currency": "SAR" },
    "roe": { "value": number, "unit": "percent" },
    "keyHighlights": ["string"],
    "risks": ["string"]
}

Only include fields where you can find reliable data. Return valid JSON only.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Extract financial data from this text:\n\n${textContent}` }
    ];

    const response = await callOpenAI(messages, { temperature: 0.3 });

    try {
        // Parse JSON from response (handle markdown code blocks)
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || [null, response];
        return JSON.parse(jsonMatch[1] || response);
    } catch (e) {
        console.error('Failed to parse financial data:', e);
        return null;
    }
}

/**
 * Generate investment insights from financial data
 */
export async function generateInsights(financialData) {
    const systemPrompt = `You are a senior financial analyst. Analyze the provided financial data and generate actionable investment insights.

Focus on:
1. Profitability trends
2. Liquidity position
3. Debt management
4. Growth indicators
5. Key risks and opportunities
6. Investment recommendation (Buy/Hold/Sell with reasoning)

Be specific, use numbers, and keep the analysis professional and concise.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Analyze this financial data and provide investment insights:\n\n${JSON.stringify(financialData, null, 2)}` }
    ];

    return await callOpenAI(messages);
}

/**
 * Answer questions about financial data
 */
export async function queryFinancialData(question, financialData) {
    const systemPrompt = `You are a helpful financial assistant for an investment dashboard. Answer questions about the company's financial data accurately and concisely.

Available financial data:
${JSON.stringify(financialData, null, 2)}

Guidelines:
- Be precise with numbers
- If data is not available, say so
- Provide context when helpful
- Keep answers concise but complete`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
    ];

    return await callOpenAI(messages, { temperature: 0.5 });
}

/**
 * Detect anomalies in financial data
 */
export async function detectAnomalies(financialData, historicalData) {
    const systemPrompt = `You are a financial auditor specialized in anomaly detection. Analyze the financial data for unusual patterns, discrepancies, or red flags.

Look for:
1. Unusual changes in key ratios (>20% YoY change)
2. Inconsistencies between related metrics
3. Revenue/profit divergence
4. Cash flow concerns
5. Debt level changes

Return a JSON array of anomalies:
[
    {
        "metric": "string",
        "severity": "low|medium|high",
        "description": "string",
        "recommendation": "string"
    }
]`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Current data:\n${JSON.stringify(financialData, null, 2)}\n\nHistorical data:\n${JSON.stringify(historicalData, null, 2)}` }
    ];

    const response = await callOpenAI(messages, { temperature: 0.3 });

    try {
        const jsonMatch = response.match(/```json\n?([\s\S]*?)\n?```/) || [null, response];
        return JSON.parse(jsonMatch[1] || response);
    } catch (e) {
        console.error('Failed to parse anomalies:', e);
        return [];
    }
}

/**
 * Generate executive summary
 */
export async function generateExecutiveSummary(financialData) {
    const systemPrompt = `You are a financial analyst preparing an executive summary for investors.

Create a brief, professional summary (3-4 paragraphs) covering:
1. Company performance overview
2. Key financial highlights
3. Risk factors
4. Outlook

Use specific numbers from the data. Be objective and professional.`;

    const messages = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Generate an executive summary for:\n\n${JSON.stringify(financialData, null, 2)}` }
    ];

    return await callOpenAI(messages);
}

export default {
    extractFinancialData,
    generateInsights,
    queryFinancialData,
    detectAnomalies,
    generateExecutiveSummary
};
