/**
 * Onboarding Component
 * Simplified upload-focused empty state
 */

let isDataLoaded = false;
let uploadedFiles = [];

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
                <h1 class="onboarding-title">Investment Analytics</h1>
                <p class="onboarding-subtitle">Upload annual reports to generate AI-powered financial insights</p>
            </div>

            <!-- Upload Zone -->
            <div class="onboarding-upload" id="onboardingUpload">
                <div class="upload-dropzone">
                    <div class="dropzone-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                    </div>
                    <h3>Upload Annual Reports</h3>
                    <p>Drop PDF files here or <span class="browse-link">browse</span></p>
                    <div class="upload-badge">Up to 3 files for multi-year analysis</div>
                </div>
                <div class="selected-files" id="selectedFiles"></div>
            </div>

            <!-- Demo Link -->
            <div class="onboarding-demo">
                <button class="demo-btn" id="loadDemoBtn">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Try with sample data
                </button>
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
    const dropzone = document.querySelector('.upload-dropzone');
    const browseLink = document.querySelector('.browse-link');
    const fileInput = document.getElementById('fileInput');
    const demoBtn = document.getElementById('loadDemoBtn');

    // Enable multiple file selection
    if (fileInput) {
        fileInput.setAttribute('multiple', 'true');
    }

    if (dropzone && fileInput) {
        // Click to upload
        dropzone.addEventListener('click', () => fileInput.click());

        // Drag and drop
        dropzone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('dragover');
        });

        dropzone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('dragover');
        });

        dropzone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.classList.remove('dragover');
            const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
            if (files.length > 0) {
                handleMultipleFiles(files);
            }
        });
    }

    if (browseLink && fileInput) {
        browseLink.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });
    }

    // Handle file input change
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
            if (files.length > 0) {
                handleMultipleFiles(files);
            }
        });
    }

    // Demo button
    if (demoBtn) {
        demoBtn.addEventListener('click', loadDemoData);
    }

    // Listen for all files processed event
    window.addEventListener('allFilesProcessed', () => {
        setTimeout(() => {
            hideOnboarding();
        }, 500);
    });
}

/**
 * Handle multiple file selection
 */
function handleMultipleFiles(files) {
    // Limit to 3 files
    const filesToProcess = files.slice(0, 3);
    uploadedFiles = filesToProcess;

    // Show selected files
    updateSelectedFilesDisplay(filesToProcess);

    // Dispatch event with all files for processing
    window.dispatchEvent(new CustomEvent('multipleFilesSelected', {
        detail: { files: filesToProcess }
    }));
}

/**
 * Update selected files display
 */
function updateSelectedFilesDisplay(files) {
    const container = document.getElementById('selectedFiles');
    if (!container) return;

    if (files.length === 0) {
        container.innerHTML = '';
        return;
    }

    container.innerHTML = `
        <div class="files-list">
            ${files.map((file, idx) => `
                <div class="file-item">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span class="file-name">${file.name}</span>
                    <span class="file-status" id="fileStatus${idx}">Pending</span>
                </div>
            `).join('')}
        </div>
    `;
}


/**
 * Load demo data
 */
function loadDemoData() {
    // Simulate loading
    const demoBtn = document.getElementById('loadDemoBtn');
    if (demoBtn) {
        demoBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" class="spin">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Loading...
        `;
        demoBtn.disabled = true;
    }

    setTimeout(() => {
        localStorage.setItem('dashboardData', 'demo');
        setTimeout(() => {
            hideOnboarding();
        }, 500);
    }, 1000);
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
    uploadedFiles = [];

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
