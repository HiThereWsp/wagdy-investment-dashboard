/**
 * Onboarding Component
 * Interactive empty state with guided steps
 */

let currentStep = 1;
let isDataLoaded = false;

/**
 * Create the onboarding HTML
 */
function createOnboardingHTML() {
    return `
        <div class="onboarding-container" id="onboardingContainer">
            <!-- Hero Section -->
            <div class="onboarding-hero">
                <div class="onboarding-icon">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                </div>
                <h1 class="onboarding-title">Investment Analytics Dashboard</h1>
                <p class="onboarding-subtitle">Transform annual reports into actionable insights with AI-powered analysis</p>
            </div>

            <!-- Steps Section -->
            <div class="onboarding-steps">
                <div class="step ${currentStep >= 1 ? 'active' : ''}" data-step="1">
                    <div class="step-number">1</div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                        </div>
                        <h3>Upload Annual Report</h3>
                        <p>Drop a PDF of the company's annual report</p>
                    </div>
                    <div class="step-connector"></div>
                </div>

                <div class="step ${currentStep >= 2 ? 'active' : ''}" data-step="2">
                    <div class="step-number">2</div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                            </svg>
                        </div>
                        <h3>AI Analysis</h3>
                        <p>Our AI extracts financial metrics automatically</p>
                    </div>
                    <div class="step-connector"></div>
                </div>

                <div class="step ${currentStep >= 3 ? 'active' : ''}" data-step="3">
                    <div class="step-number">3</div>
                    <div class="step-content">
                        <div class="step-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <h3>Get Insights</h3>
                        <p>View KPIs, charts, and investment recommendations</p>
                    </div>
                </div>
            </div>

            <!-- Upload Zone -->
            <div class="onboarding-upload" id="onboardingUpload">
                <div class="upload-dropzone">
                    <div class="dropzone-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3>Drop your PDF here</h3>
                    <p>or <span class="browse-link">browse files</span></p>
                    <div class="supported-formats">Supports: PDF annual reports, financial statements</div>
                </div>
            </div>

            <!-- Feature Preview Cards -->
            <div class="onboarding-features">
                <h2>What you'll get</h2>
                <div class="feature-cards">
                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h4>KPI Dashboard</h4>
                        <p>ROE, margins, ratios at a glance</p>
                        <div class="feature-preview">
                            <div class="mini-kpi">
                                <span class="mini-label">ROE</span>
                                <span class="mini-value">36.2%</span>
                            </div>
                            <div class="mini-kpi">
                                <span class="mini-label">Margin</span>
                                <span class="mini-value">10.2%</span>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                        <h4>Trend Analysis</h4>
                        <p>Multi-year performance charts</p>
                        <div class="feature-preview">
                            <div class="mini-chart">
                                <div class="bar" style="height: 40%"></div>
                                <div class="bar" style="height: 60%"></div>
                                <div class="bar" style="height: 80%"></div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h4>AI Assistant</h4>
                        <p>Ask questions in natural language</p>
                        <div class="feature-preview">
                            <div class="mini-chat">
                                <div class="chat-bubble">"What's the dividend trend?"</div>
                            </div>
                        </div>
                    </div>

                    <div class="feature-card">
                        <div class="feature-icon">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h4>Risk Alerts</h4>
                        <p>Automatic anomaly detection</p>
                        <div class="feature-preview">
                            <div class="mini-alert">
                                <span class="alert-dot"></span>
                                <span>Credit concentration detected</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Demo Link -->
            <div class="onboarding-demo">
                <button class="demo-btn" id="loadDemoBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    View Demo with Sample Data
                </button>
                <p class="demo-note">See the dashboard in action with Nahdi Medical Company data</p>
            </div>
        </div>
    `;
}

/**
 * Initialize onboarding
 */
export function initOnboarding() {
    const mainContent = document.querySelector('.main');
    if (!mainContent) return;

    // Check if data is already loaded (from localStorage or previous session)
    const savedData = localStorage.getItem('dashboardData');
    if (savedData) {
        isDataLoaded = true;
        return; // Don't show onboarding if data exists
    }

    // Hide all sections initially
    const sections = mainContent.querySelectorAll('.section');
    const header = mainContent.querySelector('.header');

    sections.forEach(section => {
        section.style.display = 'none';
    });
    if (header) {
        header.style.display = 'none';
    }

    // Insert onboarding
    mainContent.insertAdjacentHTML('afterbegin', createOnboardingHTML());

    // Setup event listeners
    setupOnboardingEvents();

    console.log('Onboarding initialized');
}

/**
 * Setup onboarding event listeners
 */
function setupOnboardingEvents() {
    const uploadZone = document.getElementById('onboardingUpload');
    const browseLink = document.querySelector('.browse-link');
    const fileInput = document.getElementById('fileInput');
    const demoBtn = document.getElementById('loadDemoBtn');

    if (uploadZone && fileInput) {
        // Click to upload
        uploadZone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                handleFileUpload(files[0]);
            }
        });
    }

    if (browseLink && fileInput) {
        browseLink.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    // Demo button
    if (demoBtn) {
        demoBtn.addEventListener('click', loadDemoData);
    }

    // Listen for file processed event
    window.addEventListener('fileProcessed', (e) => {
        updateStep(3);
        setTimeout(() => {
            hideOnboarding();
        }, 1000);
    });
}

/**
 * Handle file upload from onboarding
 */
function handleFileUpload(file) {
    updateStep(2);

    // Trigger the existing file upload handler
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        fileInput.files = dataTransfer.files;
        fileInput.dispatchEvent(new Event('change', { bubbles: true }));
    }
}

/**
 * Update the current step
 */
function updateStep(step) {
    currentStep = step;
    const steps = document.querySelectorAll('.onboarding-steps .step');
    steps.forEach((stepEl, index) => {
        if (index + 1 <= step) {
            stepEl.classList.add('active');
            if (index + 1 === step) {
                stepEl.classList.add('current');
            } else {
                stepEl.classList.remove('current');
            }
        }
    });
}

/**
 * Load demo data
 */
function loadDemoData() {
    updateStep(2);

    // Simulate loading
    const demoBtn = document.getElementById('loadDemoBtn');
    if (demoBtn) {
        demoBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="spin">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading demo data...
        `;
        demoBtn.disabled = true;
    }

    setTimeout(() => {
        updateStep(3);
        localStorage.setItem('dashboardData', 'demo');
        setTimeout(() => {
            hideOnboarding();
        }, 800);
    }, 1500);
}

/**
 * Hide onboarding and show dashboard
 */
function hideOnboarding() {
    const onboarding = document.getElementById('onboardingContainer');
    const mainContent = document.querySelector('.main');

    if (onboarding) {
        onboarding.classList.add('fade-out');
        setTimeout(() => {
            onboarding.remove();

            // Show dashboard content
            const sections = mainContent.querySelectorAll('.section');
            const header = mainContent.querySelector('.header');

            if (header) {
                header.style.display = '';
            }
            sections.forEach(section => {
                section.style.display = '';
            });

            isDataLoaded = true;
        }, 500);
    }
}

/**
 * Show onboarding (for reset/new analysis)
 */
export function showOnboarding() {
    localStorage.removeItem('dashboardData');
    isDataLoaded = false;
    currentStep = 1;

    const mainContent = document.querySelector('.main');
    const existingOnboarding = document.getElementById('onboardingContainer');

    if (!existingOnboarding && mainContent) {
        const sections = mainContent.querySelectorAll('.section');
        const header = mainContent.querySelector('.header');

        sections.forEach(section => {
            section.style.display = 'none';
        });
        if (header) {
            header.style.display = 'none';
        }

        mainContent.insertAdjacentHTML('afterbegin', createOnboardingHTML());
        setupOnboardingEvents();
    }
}

export default { initOnboarding, showOnboarding };
