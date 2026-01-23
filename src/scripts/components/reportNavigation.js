/**
 * Report Navigation Component
 * Navigation UI for switching between cached reports
 */

import {
    getCurrentReport,
    getCurrentIndex,
    getReportCount,
    navigatePrev,
    navigateNext,
    canNavigatePrev,
    canNavigateNext,
    clearReports
} from './reportStore.js';

let navElement = null;

/**
 * Create navigation HTML
 */
function createNavigationHTML() {
    const report = getCurrentReport();
    const index = getCurrentIndex();
    const count = getReportCount();

    if (!report || count === 0) {
        return '';
    }

    const displayName = report.companyName || report.fileName || 'Report';
    const fiscalYear = report.fiscalYear ? ` - ${report.fiscalYear}` : '';

    return `
        <div class="report-nav" id="reportNav">
            <button class="report-nav-btn prev" id="navPrevBtn" ${!canNavigateNext() ? 'disabled' : ''} title="Rapport precedent">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
            <div class="report-nav-info">
                <span class="report-nav-name">${displayName}${fiscalYear}</span>
                <span class="report-nav-counter">${index + 1} / ${count}</span>
            </div>
            <button class="report-nav-btn next" id="navNextBtn" ${!canNavigatePrev() ? 'disabled' : ''} title="Rapport suivant">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
            </button>
            <button class="report-nav-btn reset" id="navResetBtn" title="Reinitialiser tout">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
            </button>
        </div>
    `;
}

/**
 * Initialize report navigation
 */
export function initReportNavigation() {
    const container = document.getElementById('reportNavContainer');
    if (!container) return;

    updateNavigation();
    setupEventListeners();

    // Listen for report changes
    window.addEventListener('reportChanged', updateNavigation);
}

/**
 * Update navigation UI
 */
export function updateNavigation() {
    const container = document.getElementById('reportNavContainer');
    if (!container) return;

    const html = createNavigationHTML();
    container.innerHTML = html;

    if (html) {
        setupNavigationButtons();
        updateHeaderTitle();
    }
}

/**
 * Setup navigation button events
 */
function setupNavigationButtons() {
    const prevBtn = document.getElementById('navPrevBtn');
    const nextBtn = document.getElementById('navNextBtn');
    const resetBtn = document.getElementById('navResetBtn');

    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            if (navigateNext()) {
                updateNavigation();
            }
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            if (navigatePrev()) {
                updateNavigation();
            }
        });
    }

    if (resetBtn) {
        resetBtn.addEventListener('click', handleReset);
    }
}

/**
 * Handle reset - clear all data and reload
 */
function handleReset() {
    if (confirm('Supprimer tous les rapports et reinitialiser le dashboard ?')) {
        // Clear all reports from store
        clearReports();

        // Clear other localStorage data
        localStorage.removeItem('dashboardData');
        localStorage.removeItem('onboardingComplete');

        // Reload the page
        window.location.reload();
    }
}

/**
 * Setup keyboard navigation
 */
function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        // Only if not in input/textarea
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

        if (e.key === 'ArrowLeft' && e.altKey) {
            e.preventDefault();
            if (navigateNext()) {
                updateNavigation();
            }
        } else if (e.key === 'ArrowRight' && e.altKey) {
            e.preventDefault();
            if (navigatePrev()) {
                updateNavigation();
            }
        }
    });
}

/**
 * Update the header title with current report info
 */
export function updateHeaderTitle() {
    const report = getCurrentReport();
    const headerTitle = document.querySelector('.header-content h2');
    const headerSubtitle = document.querySelector('.header-content p');

    if (report && headerTitle) {
        headerTitle.textContent = report.companyName || 'Company Report';
    }

    if (report && headerSubtitle) {
        const year = report.fiscalYear || 'N/A';
        headerSubtitle.textContent = `Investment Analysis Dashboard - ${year}`;
    }
}

export default {
    initReportNavigation,
    updateNavigation,
    updateHeaderTitle
};
