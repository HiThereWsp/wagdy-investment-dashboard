/**
 * Tests for Financial Data Transformation
 */

import { describe, it, expect } from 'vitest';

// Copy of helper functions for testing (since they're not exported)
function normalizeCompanyName(name) {
    if (!name) return 'Company';
    return name
        .replace(/^(AL\s+)/i, '')
        .replace(/\s+(COMPANY|CO\.?|LTD\.?|INC\.?)$/i, ' Company')
        .replace(/\s+/g, ' ')
        .trim()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
}

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

function toMillions(value) {
    if (!value || value === 0) return 0;
    if (Math.abs(value) > 100000) return value / 1000000;
    return value;
}

// Tests
describe('normalizeCompanyName', () => {
    it('should normalize "AL NAHDI MEDICAL COMPANY" to "Nahdi Medical Company"', () => {
        expect(normalizeCompanyName('AL NAHDI MEDICAL COMPANY')).toBe('Nahdi Medical Company');
    });

    it('should normalize "NAHDI MEDICAL COMPANY" to "Nahdi Medical Company"', () => {
        expect(normalizeCompanyName('NAHDI MEDICAL COMPANY')).toBe('Nahdi Medical Company');
    });

    it('should handle lowercase input', () => {
        expect(normalizeCompanyName('al nahdi medical company')).toBe('Nahdi Medical Company');
    });

    it('should handle mixed case input', () => {
        expect(normalizeCompanyName('Al Nahdi Medical Company')).toBe('Nahdi Medical Company');
    });

    it('should return "Company" for null/undefined', () => {
        expect(normalizeCompanyName(null)).toBe('Company');
        expect(normalizeCompanyName(undefined)).toBe('Company');
    });
});

describe('getValue', () => {
    it('should return number directly', () => {
        expect(getValue(42)).toBe(42);
        expect(getValue(10.5)).toBe(10.5);
    });

    it('should extract value from {value: X} object', () => {
        expect(getValue({ value: 100 })).toBe(100);
        expect(getValue({ value: 25.5 })).toBe(25.5);
    });

    it('should parse numeric strings', () => {
        expect(getValue('42')).toBe(42);
        expect(getValue('10.5%')).toBe(10.5);
        expect(getValue('SAR 1,234.56')).toBe(1234.56);
    });

    it('should return default for null/undefined', () => {
        expect(getValue(null)).toBe(0);
        expect(getValue(undefined)).toBe(0);
        expect(getValue(null, 99)).toBe(99);
    });

    it('should handle invalid object.value', () => {
        expect(getValue({ value: 'not a number' })).toBe(0);
        expect(getValue({ value: null })).toBe(0);
    });
});

describe('toMillions', () => {
    it('should keep values already in millions', () => {
        expect(toMillions(8713.7)).toBe(8713.7);
        expect(toMillions(892.6)).toBe(892.6);
    });

    it('should convert large values to millions', () => {
        expect(toMillions(8713700000)).toBeCloseTo(8713.7, 1);
        expect(toMillions(892600000)).toBeCloseTo(892.6, 1);
    });

    it('should handle zero', () => {
        expect(toMillions(0)).toBe(0);
    });

    it('should handle negative values', () => {
        expect(toMillions(-500)).toBe(-500);
        expect(toMillions(-500000000)).toBeCloseTo(-500, 1);
    });
});

describe('KPI Calculations', () => {
    it('should calculate netMargin correctly', () => {
        const netProfit = 892.6;
        const revenue = 8713.7;
        const netMargin = (netProfit / revenue) * 100;
        expect(netMargin).toBeCloseTo(10.24, 1);
    });

    it('should calculate ROE correctly', () => {
        const netProfit = 892.6;
        const shareholderEquity = 2462.8;
        const roe = (netProfit / shareholderEquity) * 100;
        expect(roe).toBeCloseTo(36.24, 1);
    });

    it('should calculate currentRatio correctly', () => {
        const currentAssets = 4200;
        const currentLiabilities = 2485;
        const currentRatio = currentAssets / currentLiabilities;
        expect(currentRatio).toBeCloseTo(1.69, 1);
    });

    it('should calculate debtToEquity correctly', () => {
        const totalLiabilities = 2908.6;
        const shareholderEquity = 2462.8;
        const debtToEquity = totalLiabilities / shareholderEquity;
        expect(debtToEquity).toBeCloseTo(1.18, 1);
    });
});

describe('Data Transformation Integration', () => {
    // Simulate the transformExtractedData function
    function transformExtractedData(data) {
        const revenue = toMillions(getValue(data.revenue));
        const netProfit = toMillions(getValue(data.netProfit));
        const grossMargin = getValue(data.grossMargin);
        const totalLiabilities = toMillions(getValue(data.totalLiabilities));
        const shareholderEquity = toMillions(getValue(data.shareholderEquity));
        const currentAssets = toMillions(getValue(data.currentAssets));
        const currentLiabilities = toMillions(getValue(data.currentLiabilities));

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

        return {
            companyName: normalizeCompanyName(data.companyName),
            fiscalYear: data.fiscalYear || 'N/A',
            revenue, netProfit, grossMargin, netMargin,
            currentRatio, debtToEquity, roe,
            totalLiabilities, shareholderEquity
        };
    }

    it('should handle AI response with {value: X} format', () => {
        const aiData = {
            companyName: 'AL NAHDI MEDICAL COMPANY',
            fiscalYear: '2024',
            revenue: { value: 8713.7 },
            netProfit: { value: 892.6 },
            grossMargin: { value: 32.4 },
            netMargin: { value: 10.24 },
            totalLiabilities: { value: 2908.6 },
            shareholderEquity: { value: 2462.8 },
            currentAssets: { value: 4200 },
            currentLiabilities: { value: 2485 },
            currentRatio: { value: 1.69 },
            debtToEquity: { value: 1.18 },
            roe: { value: 36.24 }
        };

        const result = transformExtractedData(aiData);

        expect(result.companyName).toBe('Nahdi Medical Company');
        expect(result.revenue).toBeCloseTo(8713.7, 1);
        expect(result.netMargin).toBeCloseTo(10.24, 1);
        expect(result.roe).toBeCloseTo(36.24, 1);
    });

    it('should handle AI response with direct numeric values', () => {
        const aiData = {
            companyName: 'NAHDI MEDICAL COMPANY',
            fiscalYear: '2022',
            revenue: 8616.2,
            netProfit: 887.8,
            grossMargin: 32.8,
            totalLiabilities: 2701.5,
            shareholderEquity: 2243.4,
            currentAssets: 3800,
            currentLiabilities: 2235
        };

        const result = transformExtractedData(aiData);

        expect(result.companyName).toBe('Nahdi Medical Company');
        expect(result.revenue).toBeCloseTo(8616.2, 1);
        // Should calculate missing values
        expect(result.netMargin).toBeCloseTo(10.3, 1);
        expect(result.currentRatio).toBeCloseTo(1.7, 1);
        expect(result.debtToEquity).toBeCloseTo(1.2, 1);
        expect(result.roe).toBeCloseTo(39.6, 1);
    });

    it('should handle large values (raw SAR instead of millions)', () => {
        const aiData = {
            companyName: 'Nahdi Medical Company',
            fiscalYear: '2024',
            revenue: 8713700000,  // Raw SAR
            netProfit: 892600000,
            totalLiabilities: 2908600000,
            shareholderEquity: 2462800000,
            currentAssets: 4200000000,
            currentLiabilities: 2485000000
        };

        const result = transformExtractedData(aiData);

        expect(result.revenue).toBeCloseTo(8713.7, 0);
        expect(result.netProfit).toBeCloseTo(892.6, 0);
    });
});

describe('mergeExtractedData', () => {
    // Copy of merge function for testing
    function mergeExtractedData(dataArray) {
        dataArray.sort((a, b) => {
            const yearA = parseInt(a.fiscalYear) || 0;
            const yearB = parseInt(b.fiscalYear) || 0;
            return yearA - yearB;
        });

        const companyName = dataArray[dataArray.length - 1].companyName || 'Company';

        const getVal = (obj, key) => {
            const val = obj[key];
            if (val === null || val === undefined) return null;
            if (typeof val === 'number') return val;
            if (typeof val === 'object' && val.value !== undefined) return val.value;
            return null;
        };

        const merged = {
            companyName,
            fiscalYear: dataArray[dataArray.length - 1].fiscalYear,
            years: dataArray.map(d => d.fiscalYear),
            revenue: dataArray.map(d => getVal(d, 'revenue') || 0),
            netProfit: dataArray.map(d => getVal(d, 'netProfit') || 0),
            netMargin: dataArray.map(d => getVal(d, 'netMargin') || 0),
            roe: dataArray.map(d => getVal(d, 'roe') || 0)
        };

        return merged;
    }

    it('should merge two years of data sorted by year', () => {
        const data2023 = {
            companyName: 'Nahdi Medical Company',
            fiscalYear: '2023',
            revenue: 8713.7,
            netProfit: 892.6,
            netMargin: 10.24,
            roe: 36.24
        };

        const data2022 = {
            companyName: 'Nahdi Medical Company',
            fiscalYear: '2022',
            revenue: 8616.2,
            netProfit: 887.8,
            netMargin: 10.30,
            roe: 39.57
        };

        // Pass in unsorted order
        const merged = mergeExtractedData([data2023, data2022]);

        // Should be sorted by year
        expect(merged.years).toEqual(['2022', '2023']);
        expect(merged.revenue).toEqual([8616.2, 8713.7]);
        expect(merged.netProfit).toEqual([887.8, 892.6]);
    });

    it('should merge three years of data', () => {
        const data = [
            { fiscalYear: '2021', companyName: 'Nahdi', revenue: 8250, netProfit: 833.3 },
            { fiscalYear: '2023', companyName: 'Nahdi', revenue: 8713.7, netProfit: 892.6 },
            { fiscalYear: '2022', companyName: 'Nahdi', revenue: 8616.2, netProfit: 887.8 }
        ];

        const merged = mergeExtractedData(data);

        expect(merged.years).toEqual(['2021', '2022', '2023']);
        expect(merged.revenue.length).toBe(3);
        expect(merged.fiscalYear).toBe('2023'); // Latest year
    });

    it('should use the most recent company name', () => {
        const data = [
            { fiscalYear: '2022', companyName: 'Old Name', revenue: 100 },
            { fiscalYear: '2023', companyName: 'New Name', revenue: 200 }
        ];

        const merged = mergeExtractedData(data);

        expect(merged.companyName).toBe('New Name');
    });
});
