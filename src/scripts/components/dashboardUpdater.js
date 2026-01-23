/**
 * Dashboard Updater Module
 * Updates the DOM content with dynamic financial data
 */

import { generateExecutiveSummary, generateRiskAnalysis } from '../../services/openaiService.js';

/**
 * Update all dashboard content with new data
 * @param {Object} data - The financial data object
 */
export async function updateDashboardContent(data) {
    if (!data) return;

    console.log('Updating dashboard content for:', data.companyName);

    // Call all update functions
    updateHeader(data);
    updateKPIs(data);
    updatePerformanceSection(data);
    updateRiskSection(data);
    updateCashFlowSection(data);
    updateQualitativeSection(data);
}

/**
 * Update header information
 */
function updateHeader(data) {
    const headerTitle = document.querySelector('.header-content h2');
    const headerSubtitle = document.querySelector('.header-content p');
    const dateElement = document.querySelector('.header-meta .date');

    if (headerTitle) headerTitle.textContent = data.companyName || 'Company Name';

    if (headerSubtitle) {
        const years = data.years || [];
        if (years.length > 0) {
            const range = years.length > 1
                ? `${years[0]}-${years[years.length - 1]}`
                : years[0];
            headerSubtitle.textContent = `Investment Analysis Dashboard - Fiscal Year ${range}`;
        }
    }

    if (dateElement) {
        const today = new Date();
        dateElement.textContent = `Last Updated: ${today.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`;
    }

    updateBadge(data);
}

/**
 * Update Profitable/Loss badge
 */
function updateBadge(data) {
    const badge = document.querySelector('.header-meta .badge');
    if (!badge) return;

    const netProfit = Array.isArray(data.netProfit) ? data.netProfit[data.netProfit.length - 1] : data.netProfit;

    if (netProfit > 0) {
        badge.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
            Profitable
        `;
        badge.style.background = 'rgba(16, 185, 129, 0.1)';
        badge.style.color = '#10b981';
    } else if (netProfit < 0) {
        badge.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Loss Making
        `;
        badge.style.background = 'rgba(239, 68, 68, 0.1)';
        badge.style.color = '#ef4444';
    }
}

/**
 * Calculate CAGR (Compound Annual Growth Rate)
 * Formula: CAGR = (EndValue / StartValue)^(1/n) - 1
 */
function calculateCAGR(values) {
    if (!Array.isArray(values) || values.length < 2) return 0;
    const startValue = values[0];
    const endValue = values[values.length - 1];
    const years = values.length - 1;
    if (startValue <= 0 || endValue <= 0) return 0;
    return ((Math.pow(endValue / startValue, 1 / years)) - 1) * 100;
}

/**
 * Update KPI Grid
 */
function updateKPIs(data) {
    const kpiGrid = document.querySelector('.kpi-grid');
    if (!kpiGrid) return;

    const getLast = (arr) => Array.isArray(arr) ? arr[arr.length - 1] : arr;

    const netMargin = getLast(data.netMargin);
    const roe = data.roe;
    const currentRatio = getLast(data.currentRatio);
    const debtToEquity = getLast(data.debtToEquity);
    const fcf = getLast(data.fcf);

    // Calculate true CAGR for revenue
    const revenueCAGR = calculateCAGR(data.revenue);

    const kpiConfig = [
        {
            label: 'Net Profit Margin',
            value: formatPercent(netMargin),
            subtitle: 'Profitability'
        },
        {
            label: 'Return on Equity (ROE)',
            value: formatPercent(roe),
            subtitle: 'Efficiency'
        },
        {
            label: 'Current Ratio',
            value: formatNumber(currentRatio) + 'x',
            subtitle: 'Liquidity'
        },
        {
            label: 'Debt-to-Equity Ratio',
            value: formatNumber(debtToEquity) + 'x',
            subtitle: 'Solvency'
        },
        {
            label: 'Revenue CAGR',
            value: formatPercent(revenueCAGR),
            subtitle: 'Compound Growth'
        },
        {
            label: 'Free Cash Flow',
            value: formatLargeMoney(fcf),
            subtitle: 'Cash Generation'
        }
    ];

    const cards = kpiGrid.querySelectorAll('.kpi-card');
    cards.forEach((card, i) => {
        if (kpiConfig[i]) {
            const label = card.querySelector('.kpi-label');
            const value = card.querySelector('.kpi-value');
            const subtitle = card.querySelector('.kpi-subtitle');

            if (label) label.textContent = kpiConfig[i].label;
            if (value) value.textContent = kpiConfig[i].value;
            if (subtitle) subtitle.textContent = kpiConfig[i].subtitle;
        }
    });
}

/**
 * Update Performance & Growth headers
 */
function updatePerformanceSection(data) {
    const revenueTitle = document.querySelector('#performance .chart-card:nth-child(1) h3');
    if (revenueTitle) {
        const range = data.years.length > 1 ? `${data.years[0]}-${data.years[data.years.length - 1]}` : data.years[0];
        revenueTitle.textContent = `Annual Revenue Trend (${range})`;
    }
}

/**
 * Update Liquidity & Risk Section
 */
async function updateRiskSection(data) {
    const riskCard = document.querySelector('.risk-card');
    const riskContent = riskCard?.querySelector('.risk-content');

    if (riskContent) {
        // Show loading state
        riskContent.innerHTML = `<p class="loading-dots">Analyzing liquidity and capital structure risks...</p>`;

        try {
            const analysis = await generateRiskAnalysis(data);
            riskContent.innerHTML = markdownToHTML(analysis);
        } catch (err) {
            console.warn('Risk analysis failed:', err);
            riskContent.innerHTML = '<p>Check detailed liquidity ratios in the charts below for a comprehensive risk assessment.</p>';
        }
    }

    // Update Cash Item Grid
    const cashItems = document.querySelectorAll('.cash-item');
    if (cashItems.length >= 2) {
        const currentYear = data.years[data.years.length - 1];
        const prevYear = data.years.length > 1 ? data.years[data.years.length - 2] : null;

        const currentCash = data.cashEquivalents?.[currentYear] || (data.revenue?.[data.years.length - 1] * 0.1) || 0;

        cashItems[0].querySelector('.label').textContent = `Est. Cash & Equivalents ${currentYear}`;
        cashItems[0].querySelector('.value').textContent = formatLargeMoneyShort(currentCash);

        if (prevYear) {
            const prevCash = data.cashEquivalents?.[prevYear] || (data.revenue?.[data.years.length - 2] * 0.1) || 0;
            cashItems[1].querySelector('.label').textContent = `Est. Cash & Equivalents ${prevYear}`;
            cashItems[1].querySelector('.value').textContent = formatLargeMoneyShort(prevCash);
            cashItems[1].style.display = 'block';
        } else {
            cashItems[1].style.display = 'none';
        }
    }
}

/**
 * Update Cash Flow & Dividends
 */
function updateCashFlowSection(data) {
    const dividendGrid = document.querySelector('.dividend-grid');
    if (!dividendGrid) return;

    if (data.dividends && Object.keys(data.dividends).length > 0) {
        dividendGrid.innerHTML = Object.entries(data.dividends).map(([year, amount]) => `
            <div class="dividend-item">
                <div class="year">${year}</div>
                <div class="amount">${amount.toFixed(2)}</div>
                <div class="note">SAR per share</div>
            </div>
        `).join('');

        const card = document.querySelector('.dividend-card');
        if (card) card.style.display = 'block';
    } else {
        // Hide if no dividend data
        const card = document.querySelector('.dividend-card');
        if (card) {
            dividendGrid.innerHTML = '<p style="color: var(--text-muted); font-size: 0.8rem; padding: 10px;">Dividend data not found in this report.</p>';
        }
    }
}

/**
 * Update Qualitative Section (Table and Conclusion)
 */
async function updateQualitativeSection(data) {
    // 1. Update qualitative events table
    const tableBody = document.querySelector('.qual-table tbody');
    if (tableBody) {
        // Check if we have extracted qualitative events
        if (data.qualitativeEvents && data.qualitativeEvents.length > 0) {
            tableBody.innerHTML = data.qualitativeEvents.map(event => `
                <tr>
                    <td>${event.description}</td>
                    <td style="color: ${event.trend === 'positive' ? 'var(--positive)' : 'var(--negative)'}">
                        ${event.trend === 'positive' ? '+' : ''}${formatEventAmount(event.amount)}
                    </td>
                    <td>${event.year || '-'}</td>
                    <td>
                        <span class="event-badge ${event.nature === 'one-time' ? 'one-time' : 'recurring'}">
                            ${event.nature === 'one-time' ? 'One-time' : 'Recurring'}
                        </span>
                        ${event.category ? `<span class="event-category">${event.category}</span>` : ''}
                    </td>
                </tr>
            `).join('');
        } else {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="4" style="text-align: center; color: var(--text-muted); padding: 2rem;">
                        Upload a PDF to extract qualitative insights from footnotes.
                    </td>
                </tr>
            `;
        }
    }

    // 2. Update Investment Conclusion
    const conclusionContent = document.querySelector('.conclusion-card .conclusion-content');
    if (conclusionContent) {
        conclusionContent.innerHTML = `<p class="loading-dots">Generating investment conclusion based on ${data.companyName}'s data...</p>`;

        try {
            const summary = await generateExecutiveSummary(data);
            conclusionContent.innerHTML = markdownToHTML(summary);
        } catch (err) {
            console.warn('Conclusion generation failed:', err);
            conclusionContent.innerHTML = '<p>Investment conclusion available via AI Insights.</p>';
        }
    }
}

/**
 * Format event amount for display
 */
function formatEventAmount(amount) {
    if (!amount) return '-';
    const absAmount = Math.abs(amount);
    if (absAmount >= 1000000) {
        return 'SAR ' + (absAmount / 1000000).toFixed(2) + 'M';
    } else if (absAmount >= 1000) {
        return 'SAR ' + (absAmount / 1000).toFixed(0) + 'K';
    }
    return 'SAR ' + absAmount.toLocaleString();
}

/**
 * Convert markdown to HTML for AI-generated content
 */
function markdownToHTML(text) {
    if (!text) return '';

    return text
        // Headers
        .replace(/####\s*(.+)/g, '<h4>$1</h4>')
        .replace(/###\s*(.+)/g, '<h3>$1</h3>')
        // Bold
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        // Line breaks for paragraphs (double newline)
        .replace(/\n\n/g, '</p><p>')
        // Single line breaks
        .replace(/\n/g, '<br>')
        // Wrap in paragraph if not already
        .replace(/^(?!<[hp])/, '<p>')
        .replace(/(?<![>])$/, '</p>');
}

// Helpers
function formatNumber(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return Number(num).toFixed(2);
}

function formatPercent(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return Number(num).toFixed(2) + '%';
}

function formatLargeMoney(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    return 'SAR ' + new Intl.NumberFormat('en-US', { maximumFractionDigits: 1 }).format(num) + 'M';
}

function formatLargeMoneyShort(num) {
    if (num === null || num === undefined || isNaN(num)) return '-';
    if (num >= 1000) return 'SAR ' + (num / 1000).toFixed(2) + 'B';
    return 'SAR ' + num.toFixed(1) + 'M';
}
