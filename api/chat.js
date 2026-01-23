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
                systemPrompt = `You are an expert financial data extraction specialist for Saudi Arabian company annual reports.

TASK: Extract ALL financial metrics from the text. Search the ENTIRE document thoroughly.

WHERE TO FIND KEY DATA:
- "Statement of Profit or Loss" / "Income Statement": Revenue, Cost of Sales, Gross Profit, Operating Expenses, Net Profit
- "Statement of Financial Position" / "Balance Sheet": Total Assets, Current Assets, Non-Current Assets, Total Liabilities, Current Liabilities, Shareholders' Equity
- "Statement of Changes in Equity": Total Equity figures
- Look for tables with column headers like "2024", "2023", "31 December"

REQUIRED JSON FORMAT (return ONLY this JSON, no markdown):
{
    "companyName": "Nahdi Medical Company",
    "fiscalYear": "2024",
    "revenue": 9446.4,
    "grossProfit": 3062.5,
    "operatingProfit": 1094.2,
    "netProfit": 820.7,
    "grossMargin": 32.4,
    "operatingMargin": 11.6,
    "netMargin": 8.7,
    "totalAssets": 6173.3,
    "currentAssets": 3200.5,
    "totalLiabilities": 3587.2,
    "currentLiabilities": 2400.1,
    "shareholderEquity": 2586.1,
    "cash": 1240.5,
    "eps": 6.31,
    "roe": 31.7,
    "currentRatio": 1.33,
    "debtToEquity": 1.39
}

CALCULATION RULES - ALWAYS calculate if base values found:
- grossMargin = (grossProfit / revenue) * 100
- netMargin = (netProfit / revenue) * 100
- roe = (netProfit / shareholderEquity) * 100
- currentRatio = currentAssets / currentLiabilities
- debtToEquity = totalLiabilities / shareholderEquity

CRITICAL INSTRUCTIONS:
1. Values in MILLIONS SAR (if document shows thousands, divide by 1000)
2. Return plain NUMBERS, not objects
3. Search for "Total current assets", "Total current liabilities", "Total equity attributable to"
4. Use the MOST RECENT year's data (latest column)
5. ALWAYS calculate derived metrics when base values exist
6. Only use null if data truly cannot be found AND cannot be calculated`;
                userContent = `Extract ALL financial data from this annual report. Pay special attention to the Statement of Financial Position (Balance Sheet) for assets, liabilities, and equity figures:\n\n${data}`;
                break;

            case 'anomalies':
                systemPrompt = `You are a financial anomaly detection specialist.
                    Analyze the data for unusual patterns, significant changes, or potential red flags.
                    Return a JSON array of anomalies with: metric, description, severity (low/medium/high), recommendation.`;
                userContent = `Detect anomalies in this financial data:\n${JSON.stringify(data, null, 2)}`;
                break;

            case 'extractQualitative':
                systemPrompt = `You are a financial analyst specializing in footnote and disclosure analysis.

TASK: Extract qualitative events that materially affected profits from this annual report.
Focus on identifying items that explain profit fluctuations between periods.

WHAT TO LOOK FOR:
- Finance income/expenses (interest, deposits)
- Impairment charges or reversals
- Asset write-offs or disposals
- Restructuring charges
- Legal settlements
- Foreign exchange gains/losses
- Government grants or subsidies
- Any non-recurring items mentioned in notes

For each event, determine:
1. Description (brief, specific)
2. Financial impact (SAR amount, positive or negative)
3. Nature: "recurring" (normal operations) or "one-time" (non-recurring)
4. Category: "operational" or "non-operational"
5. Trend: "positive" (increases profit) or "negative" (decreases profit)
6. Year it occurred

RETURN FORMAT (JSON array only, no markdown):
[
    {
        "description": "Finance income from bank deposits",
        "amount": 64727602,
        "year": "2023",
        "nature": "recurring",
        "category": "non-operational",
        "trend": "positive"
    },
    {
        "description": "Write-off of old distribution center",
        "amount": -6950568,
        "year": "2022",
        "nature": "one-time",
        "category": "non-operational",
        "trend": "negative"
    }
]

IMPORTANT:
- Only include items with clear financial impact mentioned in the report
- Use negative amounts for losses/expenses
- Classify carefully: one-time events are non-recurring, unusual items
- Return empty array [] if no significant events found`;
                userContent = `Extract qualitative events affecting profits from this annual report:\n\n${data}`;
                break;

            case 'risk':
                systemPrompt = `You are a financial risk analyst.
                    Analyze the following financial data for liquidity and capital structure risks.
                    Provide a concise (1-2 paragraphs) alert regarding credit risk, concentration, or leverage.
                    Be specific if the data shows high debt or low liquidity.
                    Use a professional, cautionary tone.`;
                userContent = `Analyze risks for this financial data:\n${JSON.stringify(data, null, 2)}`;
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
                model: (action === 'extract' || action === 'extractQualitative') ? 'gpt-4o' : 'gpt-4-turbo-preview',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userContent }
                ],
                max_tokens: 4096,
                temperature: (action === 'extract' || action === 'extractQualitative') ? 0.2 : 0.7
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'OpenAI API error');
        }

        const result = await response.json();
        const content = result.choices[0]?.message?.content;

        // Try to parse JSON for structured responses
        if (action === 'extract' || action === 'anomalies' || action === 'extractQualitative') {
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
