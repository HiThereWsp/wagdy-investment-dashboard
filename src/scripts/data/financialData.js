/**
 * Financial Data Module
 * Contains all financial data for the Nahdi Medical Company dashboard
 * Data sources: 2022-2023 from annual reports, 2021 simulated
 */

import { getCurrentReport } from '../components/reportStore.js';

/**
 * Get current financial data (from report or demo)
 */
export function getFinancialData() {
    const report = getCurrentReport();

    if (report && report.extractedData) {
        return transformExtractedData(report.extractedData);
    }

    return demoFinancialData;
}

/**
 * Normalize company name for comparison
 */
function normalizeCompanyName(name) {
    if (!name) return 'Company';
    // Remove common prefixes/suffixes and normalize
    return name
        .replace(/^(AL\s+)/i, '')           // Remove "AL " prefix
        .replace(/\s+(COMPANY|CO\.?|LTD\.?|INC\.?)$/i, ' Company')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

/**
 * Helper to extract value from AI data (handles both { value: X } and raw X formats)
 */
function getValue(field, defaultVal = 0) {
    if (field === null || field === undefined) return defaultVal;
    if (typeof field === 'number') return field;
    if (typeof field === 'object' && field.value !== undefined) {
        return typeof field.value === 'number' ? field.value : defaultVal;
    }
    if (typeof field === 'string') {
        const parsed = parseFloat(field.replace(/[^0-9.-]/g, ''));
        return isNaN(parsed) ? defaultVal : parsed;
    }
    return defaultVal;
}

/**
 * Helper to normalize values to millions SAR
 * If value > 100,000, assume it's in raw SAR and convert to millions
 */
function toMillions(value) {
    if (!value || value === 0) return 0;
    // If > 100,000, likely in raw SAR, convert to millions
    if (Math.abs(value) > 100000) return value / 1000000;
    return value;
}

/**
 * Transform AI-extracted data to chart format
 */
function transformExtractedData(data) {
    // Check if this is already merged/transformed data (has arrays)
    if (data.years && Array.isArray(data.years) && data.years.length > 0 && Array.isArray(data.revenue)) {
        console.log('Data is already in merged format, passing through:', data);
        // Normalize company name and return as-is
        return {
            ...data,
            companyName: normalizeCompanyName(data.companyName),
            // Ensure roe is the latest value for KPI display
            roe: Array.isArray(data.roe) ? data.roe[data.roe.length - 1] : data.roe,
            // Also keep totalEquity as alias for shareholderEquity
            totalEquity: data.shareholderEquity || data.totalEquity
        };
    }

    // Debug: log raw extracted data
    console.log('Raw extracted data:', JSON.stringify(data, null, 2));

    // Extract values with helpers that handle both formats
    const revenue = toMillions(getValue(data.revenue));
    const netProfit = toMillions(getValue(data.netProfit));
    const grossMargin = getValue(data.grossMargin);
    const totalLiabilities = toMillions(getValue(data.totalLiabilities));
    const shareholderEquity = toMillions(getValue(data.shareholderEquity));
    const currentAssets = toMillions(getValue(data.currentAssets));
    const currentLiabilities = toMillions(getValue(data.currentLiabilities));

    // Calculate derived metrics with fallbacks
    let netMargin = getValue(data.netMargin);
    if (!netMargin && revenue > 0) {
        netMargin = (netProfit / revenue) * 100;
    }

    let currentRatio = getValue(data.currentRatio);
    if (!currentRatio && currentLiabilities > 0) {
        currentRatio = currentAssets / currentLiabilities;
    }

    let debtToEquity = getValue(data.debtToEquity);
    if (!debtToEquity && shareholderEquity > 0) {
        debtToEquity = totalLiabilities / shareholderEquity;
    }

    let roe = getValue(data.roe);
    if (!roe && shareholderEquity > 0) {
        roe = (netProfit / shareholderEquity) * 100;
    }

    // Debug: log calculated values with explicit formatting
    console.log(`Transformed values for ${data.companyName} (${data.fiscalYear}):
    - revenue: ${revenue}M SAR
    - netProfit: ${netProfit}M SAR
    - grossMargin: ${grossMargin}%
    - netMargin: ${netMargin?.toFixed(2)}%
    - currentRatio: ${currentRatio?.toFixed(2)}x
    - debtToEquity: ${debtToEquity?.toFixed(2)}x
    - ROE: ${roe?.toFixed(2)}%
    - totalLiabilities: ${totalLiabilities}M SAR
    - shareholderEquity: ${shareholderEquity}M SAR`);

    // Create single-year data arrays (for charts that expect arrays)
    const year = data.fiscalYear || 'N/A';
    const companyName = normalizeCompanyName(data.companyName);

    return {
        companyName: companyName,
        fiscalYear: year,
        years: [year],

        // Revenue in millions SAR
        revenue: [revenue],

        // Profitability Margins (%)
        grossMargin: [grossMargin],
        netMargin: [netMargin],

        // Net Profit in millions SAR
        netProfit: [netProfit],

        // Liquidity Ratios
        currentRatio: [currentRatio],
        debtToEquity: [debtToEquity],

        // Balance Sheet Items (millions SAR)
        totalLiabilities: [totalLiabilities],
        totalEquity: [shareholderEquity],

        // Cash Flow - use estimates if not available
        operatingCashFlow: [data.operatingCashFlow?.value || netProfit * 1.2],
        investingCashFlow: [data.investingCashFlow?.value || -netProfit * 0.3],
        financingCashFlow: [data.financingCashFlow?.value || -netProfit * 0.5],

        // Free Cash Flow
        fcf: [data.fcf?.value || netProfit * 0.9],

        // Revenue Segments (%)
        segmentPharma: data.segmentPharma || 65,
        segmentFrontShop: data.segmentFrontShop || 35,

        // Additional metrics
        roe: roe,
        eps: data.eps?.value || 0,
        dividends: data.dividends ? { [year]: getValue(data.dividends) } : null,
        cashEquivalents: data.cashEquivalents ? { [year]: toMillions(getValue(data.cashEquivalents)) } : null,

        // Raw extracted data for reference
        _extracted: data
    };
}

/**
 * Demo/static financial data
 */
const demoFinancialData = {
    companyName: 'Nahdi Medical Company',
    fiscalYear: '2023',
    years: ['2021', '2022', '2023'],

    // Revenue in millions SAR
    revenue: [8250, 8616.2, 8713.7],

    // Profitability Margins (%)
    grossMargin: [32.5, 32.8, 32.4],
    netMargin: [10.1, 10.30, 10.24],

    // Net Profit in millions SAR
    netProfit: [833.3, 887.8, 892.6],

    // Liquidity Ratios
    currentRatio: [1.72, 1.70, 1.69],
    debtToEquity: [1.25, 1.20, 1.18],

    // Balance Sheet Items (millions SAR)
    totalLiabilities: [2550, 2701.5, 2908.6],
    totalEquity: [2040, 2243.4, 2462.8],

    // Cash Flow (millions SAR)
    operatingCashFlow: [1450, 1667.9, 1368.7],
    investingCashFlow: [-280, -275.2, -384.5],
    financingCashFlow: [-720, -650, -700], // Estimated

    // Free Cash Flow (millions SAR)
    fcf: [1180, 1392.6, 984.2],

    // Revenue Segments (%)
    segmentPharma: 65,
    segmentFrontShop: 35,

    // Cash Position (millions SAR)
    cashEquivalents: {
        2022: 892,
        2023: 1240
    },

    // Dividend per share (SAR)
    dividends: {
        2021: 5.00,
        2022: 5.50,
        2023: 6.00
    }
};

/**
 * KPI Configuration with labels and trends
 */
export const kpiConfig = [
    {
        id: 'netProfitMargin',
        label: 'Net Profit Margin',
        value: '10.24%',
        trend: 'negative',
        trendValue: '-0.06% vs 2022',
        subtitle: 'Stable profitability'
    },
    {
        id: 'roe',
        label: 'Return on Equity (ROE)',
        value: '36.24%',
        trend: 'negative',
        trendValue: '-3.33% vs 2022',
        subtitle: 'Still strong performance'
    },
    {
        id: 'currentRatio',
        label: 'Current Ratio',
        value: '1.69x',
        trend: 'negative',
        trendValue: '-0.01 vs 2022',
        subtitle: 'Healthy liquidity position'
    },
    {
        id: 'debtToEquity',
        label: 'Debt-to-Equity Ratio',
        value: '1.18x',
        trend: 'positive',
        trendValue: '-0.02 vs 2022',
        subtitle: 'Improving capital structure'
    },
    {
        id: 'revenueCagr',
        label: 'Revenue CAGR (YoY)',
        value: '1.13%',
        trend: 'positive',
        trendValue: 'Growth maintained',
        subtitle: 'Modest revenue expansion'
    },
    {
        id: 'fcf',
        label: 'Free Cash Flow (Est.)',
        value: '984.2M',
        trend: 'negative',
        trendValue: '-29.3% vs 2022',
        subtitle: 'SAR • Increased CapEx'
    }
];

/**
 * Qualitative events data
 */
export const qualitativeEvents = [
    {
        description: 'Finance Income (Interest on deposits)',
        amount2023: '+64,727,602',
        amount2022: '+13,927,481',
        nature: 'recurring',
        trend: 'positive'
    },
    {
        description: 'Reversal of Impairment on Investment Properties',
        amount2023: '+498,000',
        amount2022: '+14,526,595',
        nature: 'one-time',
        trend: 'positive'
    },
    {
        description: 'Loss on write-off of old distribution center',
        amount2023: '—',
        amount2022: '-6,950,568',
        nature: 'one-time',
        trend: 'negative'
    },
    {
        description: 'Loss on derecognition of investment properties',
        amount2023: '—',
        amount2022: '-7,062,411',
        nature: 'one-time',
        trend: 'negative'
    }
];

// Backward compatibility - static reference
export const financialData = demoFinancialData;

export default { getFinancialData, financialData: demoFinancialData };
