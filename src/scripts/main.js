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
import '../styles/index.css';

/**
 * Initialize the dashboard application
 */
async function initApp() {
    console.log('Wagdy Investment Dashboard - Initializing...');

    // Initialize charts
    initializeCharts(Chart);

    // Initialize navigation
    initNavigation();

    // Initialize file upload
    initFileUpload();

    // Initialize AI components
    initAIChat();

    // Load AI insights (async, non-blocking)
    initAIInsights('#summary').catch(err => {
        console.warn('AI Insights failed to load:', err.message);
    });

    // Listen for file processing events
    window.addEventListener('fileProcessed', (e) => {
        console.log('File processed:', e.detail.fileName);
        // TODO: Refresh dashboard with new data
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
