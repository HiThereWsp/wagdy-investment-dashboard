/**
 * Report Store Module
 * Manages caching and navigation of multiple reports
 */

const STORAGE_KEY = 'wagdy_reports';
const MAX_REPORTS = 5;

let reports = [];
let currentIndex = -1;

/**
 * Initialize store from localStorage
 */
export function initReportStore() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            const data = JSON.parse(saved);
            reports = data.reports || [];
            currentIndex = data.currentIndex ?? -1;
        }
    } catch (e) {
        console.warn('Failed to load reports from storage:', e);
        reports = [];
        currentIndex = -1;
    }
}

/**
 * Save store to localStorage
 */
function saveStore() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
            reports,
            currentIndex
        }));
    } catch (e) {
        console.warn('Failed to save reports to storage:', e);
    }
}

/**
 * Add a new report to the store
 */
export function addReport(report) {
    const newReport = {
        id: Date.now().toString(),
        fileName: report.fileName,
        companyName: report.companyName || 'Unknown Company',
        fiscalYear: report.fiscalYear || 'N/A',
        extractedData: report.extractedData,
        uploadedAt: new Date().toISOString()
    };

    // Add to beginning of array
    reports.unshift(newReport);

    // Limit to MAX_REPORTS
    if (reports.length > MAX_REPORTS) {
        reports = reports.slice(0, MAX_REPORTS);
    }

    // Set as current
    currentIndex = 0;

    saveStore();
    dispatchChangeEvent();

    return newReport;
}

/**
 * Add a merged report (from multiple PDFs)
 */
export function addMergedReport(report) {
    const years = report.fiscalYears || report.extractedData?.years || [];
    const yearRange = years.length > 1
        ? `${years[0]}-${years[years.length - 1]}`
        : years[0] || 'N/A';

    const newReport = {
        id: Date.now().toString(),
        fileName: report.fileName,
        companyName: report.companyName || 'Unknown Company',
        fiscalYear: yearRange,
        fiscalYears: years,
        isMerged: true,
        extractedData: report.extractedData,
        uploadedAt: new Date().toISOString()
    };

    // Add to beginning of array
    reports.unshift(newReport);

    // Limit to MAX_REPORTS
    if (reports.length > MAX_REPORTS) {
        reports = reports.slice(0, MAX_REPORTS);
    }

    // Set as current
    currentIndex = 0;

    saveStore();
    dispatchChangeEvent();

    return newReport;
}

/**
 * Get all reports
 */
export function getReports() {
    return [...reports];
}

/**
 * Get current report
 */
export function getCurrentReport() {
    if (currentIndex >= 0 && currentIndex < reports.length) {
        return reports[currentIndex];
    }
    return null;
}

/**
 * Get current index
 */
export function getCurrentIndex() {
    return currentIndex;
}

/**
 * Get report count
 */
export function getReportCount() {
    return reports.length;
}

/**
 * Set current report by index
 */
export function setCurrentIndex(index) {
    if (index >= 0 && index < reports.length) {
        currentIndex = index;
        saveStore();
        dispatchChangeEvent();
        return true;
    }
    return false;
}

/**
 * Navigate to previous report
 */
export function navigatePrev() {
    if (currentIndex < reports.length - 1) {
        currentIndex++;
        saveStore();
        dispatchChangeEvent();
        return true;
    }
    return false;
}

/**
 * Navigate to next report (more recent)
 */
export function navigateNext() {
    if (currentIndex > 0) {
        currentIndex--;
        saveStore();
        dispatchChangeEvent();
        return true;
    }
    return false;
}

/**
 * Check if can navigate
 */
export function canNavigatePrev() {
    return currentIndex < reports.length - 1;
}

export function canNavigateNext() {
    return currentIndex > 0;
}

/**
 * Delete a report by index
 */
export function deleteReport(index) {
    if (index >= 0 && index < reports.length) {
        reports.splice(index, 1);

        // Adjust current index
        if (reports.length === 0) {
            currentIndex = -1;
        } else if (currentIndex >= reports.length) {
            currentIndex = reports.length - 1;
        }

        saveStore();
        dispatchChangeEvent();
        return true;
    }
    return false;
}

/**
 * Clear all reports
 */
export function clearReports() {
    reports = [];
    currentIndex = -1;
    saveStore();
    dispatchChangeEvent();
}

/**
 * Dispatch change event
 */
function dispatchChangeEvent() {
    window.dispatchEvent(new CustomEvent('reportChanged', {
        detail: {
            report: getCurrentReport(),
            index: currentIndex,
            count: reports.length
        }
    }));
}

// Initialize on module load
initReportStore();

export default {
    initReportStore,
    addReport,
    addMergedReport,
    getReports,
    getCurrentReport,
    getCurrentIndex,
    getReportCount,
    setCurrentIndex,
    navigatePrev,
    navigateNext,
    canNavigatePrev,
    canNavigateNext,
    deleteReport,
    clearReports
};
