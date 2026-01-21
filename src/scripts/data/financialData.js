/**
 * Financial Data Module
 * Contains all financial data for the Nahdi Medical Company dashboard
 * Data sources: 2022-2023 from annual reports, 2021 simulated
 */

export const financialData = {
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

export default financialData;
