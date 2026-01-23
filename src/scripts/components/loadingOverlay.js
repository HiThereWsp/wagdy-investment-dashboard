/**
 * Loading Overlay Component
 * Full-screen loading with progress steps
 */

const STEPS = {
    extracting: {
        label: 'Extraction du texte du PDF...',
        progress: 25
    },
    analyzing: {
        label: 'Analyse AI en cours...',
        progress: 60
    },
    rendering: {
        label: 'Generation des graphiques...',
        progress: 90
    },
    complete: {
        label: 'Termine!',
        progress: 100
    }
};

let overlayElement = null;

/**
 * Create loading overlay HTML
 */
function createOverlayHTML(step = 'extracting') {
    const stepInfo = STEPS[step] || STEPS.extracting;

    return `
        <div class="loading-overlay" id="loadingOverlay">
            <div class="loading-content">
                <div class="loading-spinner">
                    <svg viewBox="0 0 50 50">
                        <circle cx="25" cy="25" r="20" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round">
                            <animate attributeName="stroke-dasharray" dur="1.5s" repeatCount="indefinite" values="1,150;90,150;90,150"/>
                            <animate attributeName="stroke-dashoffset" dur="1.5s" repeatCount="indefinite" values="0;-35;-124"/>
                        </svg>
                    </div>
                <div class="loading-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                </div>
                <h2 class="loading-title">Traitement du rapport</h2>
                <p class="loading-step" id="loadingStepText">${stepInfo.label}</p>
                <div class="loading-progress">
                    <div class="loading-progress-bar" id="loadingProgressBar" style="width: ${stepInfo.progress}%"></div>
                </div>
                <div class="loading-steps-indicator">
                    <span class="step-dot ${step === 'extracting' || step === 'analyzing' || step === 'rendering' || step === 'complete' ? 'active' : ''}"></span>
                    <span class="step-dot ${step === 'analyzing' || step === 'rendering' || step === 'complete' ? 'active' : ''}"></span>
                    <span class="step-dot ${step === 'rendering' || step === 'complete' ? 'active' : ''}"></span>
                </div>
            </div>
        </div>
    `;
}

/**
 * Show loading overlay
 */
export function showLoading(step = 'extracting') {
    // Remove existing if any
    hideLoading();

    // Create and append overlay
    document.body.insertAdjacentHTML('beforeend', createOverlayHTML(step));
    overlayElement = document.getElementById('loadingOverlay');

    // Force reflow for animation
    overlayElement.offsetHeight;
    overlayElement.classList.add('visible');
}

/**
 * Update loading step
 */
export function updateLoadingStep(step) {
    const stepInfo = STEPS[step];
    if (!stepInfo || !overlayElement) return;

    const stepText = document.getElementById('loadingStepText');
    const progressBar = document.getElementById('loadingProgressBar');
    const dots = overlayElement.querySelectorAll('.step-dot');

    if (stepText) {
        stepText.textContent = stepInfo.label;
    }

    if (progressBar) {
        progressBar.style.width = `${stepInfo.progress}%`;
    }

    // Update dots
    const stepOrder = ['extracting', 'analyzing', 'rendering', 'complete'];
    const currentStepIndex = stepOrder.indexOf(step);
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index <= currentStepIndex);
    });
}

/**
 * Hide loading overlay
 */
export function hideLoading() {
    const existing = document.getElementById('loadingOverlay');
    if (existing) {
        existing.classList.remove('visible');
        existing.classList.add('hiding');
        setTimeout(() => {
            existing.remove();
        }, 300);
    }
    overlayElement = null;
}

export default {
    showLoading,
    updateLoadingStep,
    hideLoading
};
