/**
 * Main Application Entry Point
 * Wagdy Investment Dashboard
 */

import Chart from 'chart.js/auto';
import { initializeCharts } from './charts/index.js';
import { initNavigation } from './navigation.js';
import { initFileUpload } from './fileUpload.js';
import { initAIChat } from './components/aiChat.js';
import { initAIInsights } from './components/aiInsights.js';
import { initOnboarding } from './components/onboarding.js';
import { initReportNavigation, updateNavigation } from './components/reportNavigation.js';
import { getCurrentReport, getReportCount } from './components/reportStore.js';
import { updateDashboardContent } from './components/dashboardUpdater.js';
import { getFinancialData } from './data/financialData.js';
import '../styles/index.css';

/**
 * Initialize the dashboard application
 */
async function initApp() {
    console.log('Wagdy Investment Dashboard - Initializing...');

    // Initialize navigation
    initNavigation();

    // Initialize file upload
    initFileUpload();

    // Initialize report navigation
    initReportNavigation();

    // Check if we have cached reports
    const reportCount = getReportCount();
    const currentReport = getCurrentReport();

    if (reportCount > 0 && currentReport) {
        // We have cached reports - show dashboard
        localStorage.setItem('dashboardData', 'uploaded');
        updateDashboardContent(getFinancialData());
        initializeCharts(Chart);
        initAIChat();
        initAIInsights('#summary').catch(err => {
            console.warn('AI Insights failed to load:', err.message);
        });
    } else {
        // Initialize onboarding (will show empty state if no data)
        initOnboarding();

        // Check if we have data loaded (demo or uploaded)
        const hasData = localStorage.getItem('dashboardData');

        if (hasData) {
            // Initialize charts only if data is available
            initializeCharts(Chart);

            // Initialize AI components
            initAIChat();

            // Load AI insights (async, non-blocking)
            initAIInsights('#summary').catch(err => {
                console.warn('AI Insights failed to load:', err.message);
            });
        }
    }

    // Listen for file processing events
    window.addEventListener('fileProcessed', (e) => {
        console.log('File processed:', e.detail.fileName);
        localStorage.setItem('dashboardData', 'uploaded');

        // Initialize charts after data is loaded
        const currentData = getFinancialData();
        updateDashboardContent(currentData);
        initializeCharts(Chart);
        initAIChat();
        initAIInsights('#summary').catch(err => {
            console.warn('AI Insights failed to load:', err.message);
        });

        // Update navigation
        updateNavigation();
    });

    // Listen for report change events (navigation between cached reports)
    window.addEventListener('reportChanged', (e) => {
        console.log('Report changed:', e.detail);
        if (e.detail.report) {
            // Reinitialize charts and content with new data
            const currentData = getFinancialData();
            updateDashboardContent(currentData);
            initializeCharts(Chart);

            // Reload AI Insights
            initAIInsights('#summary').catch(err => {
                console.warn('AI Insights failed to load:', err.message);
            });
        }
    });

    console.log('Dashboard initialized successfully');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

export default initApp;
