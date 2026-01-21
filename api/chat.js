/**
 * Vercel Serverless Function - OpenAI Chat API
 * Keeps API key secure on the server side
 */

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ error: 'OpenAI API key not configured' });
    }

    try {
        const { messages, action, data } = req.body;

        let systemPrompt = '';
        let userContent = '';

        switch (action) {
            case 'query':
                systemPrompt = `You are a financial analyst assistant for Nahdi Medical Company investment analysis.
                    You have access to the following financial data: ${JSON.stringify(data)}
                    Answer questions about this data clearly and concisely.
                    Always cite specific numbers and trends when relevant.
                    Format currency in SAR (Saudi Riyals) with millions abbreviated as M.`;
                userContent = messages;
                break;

            case 'insights':
                systemPrompt = `You are a senior investment analyst providing insights on Nahdi Medical Company.
                    Analyze the following financial data and provide key investment insights.
                    Focus on: growth trends, profitability, operational efficiency, and investment potential.
                    Be specific with numbers and provide actionable recommendations.`;
                userContent = `Analyze this financial data and provide investment insights:\n${JSON.stringify(data, null, 2)}`;
                break;

            case 'extract':
                systemPrompt = `You are a financial data extraction specialist.
                    Extract structured financial data from the provided text.
                    Return a JSON object with: companyName, fiscalYear, revenue, netProfit, grossMargin, operatingMargin, netMargin, totalAssets, totalLiabilities, shareholderEquity, eps, roe, currentRatio.
                    For each metric, include value and yoyChange if available.`;
                userContent = `Extract financial data from this annual report text:\n${data}`;
                break;

            case 'anomalies':
                systemPrompt = `You are a financial anomaly detection specialist.
                    Analyze the data for unusual patterns, significant changes, or potential red flags.
                    Return a JSON array of anomalies with: metric, description, severity (low/medium/high), recommendation.`;
                userContent = `Detect anomalies in this financial data:\n${JSON.stringify(data, null, 2)}`;
                break;

            case 'summary':
                systemPrompt = `You are a financial analyst preparing an executive summary for investors.
                    Create a brief, professional summary (3-4 paragraphs) covering:
                    1. Company performance overview
                    2. Key financial highlights
                    3. Risk factors
                    4. Outlook
                    Use specific numbers from the data. Be objective and professional.`;
                userContent = `Generate an executive summary for:\n${JSON.stringify(data, null, 2)}`;
                break;

            default:
                systemPrompt = 'You are a helpful financial analyst assistant.';
                userContent = messages;
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                max_tokens: 4096,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const result = await response.json();
        const content = result.choices[0]?.message?.content;

        // Try to parse JSON for structured responses
        if (action === 'extract' || action === 'anomalies') {
            try {
                const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/) ||
                                  content.match(/\{[\s\S]*\}/) ||
                                  content.match(/\[[\s\S]*\]/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
                    return res.status(200).json({ result: parsed });
                }
            } catch {
                // Return as text if JSON parsing fails
            }
        }

        return res.status(200).json({ result: content });

    } catch (error) {
        console.error('API Error:', error);
        return res.status(500).json({ error: error.message || 'Internal server error' });
    }
}
