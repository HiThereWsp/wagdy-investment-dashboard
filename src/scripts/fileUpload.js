/**
 * File Upload Module
 * Handles PDF file uploads for annual reports
 * Integrates with AI for data extraction
 */

import { extractFinancialData } from '../services/openaiService.js';

// Store extracted data globally
let extractedData = null;

/**
 * Initialize file upload functionality
 */
export function initFileUpload() {
    const uploadZone = document.querySelector('.upload-zone');
    const fileInput = document.getElementById('fileInput');

    if (!uploadZone || !fileInput) return;

    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection
    fileInput.addEventListener('change', handleFileUpload);

    // Drag and drop support
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
        if (files.length > 0) {
            processFile(files[0]);
        }
    });
}

/**
 * Handle file upload event
 */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        processFile(file);
    }
}

/**
 * Extract text from PDF using browser FileReader
 * Note: For production, consider using pdf.js for better extraction
 */
async function extractTextFromPDF(file) {
    // For now, we'll read the file and extract what we can
    // In production, use pdf.js library for proper PDF parsing
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                // Try to extract text (basic approach)
                const text = e.target.result;
                resolve(text);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsText(file);
    });
}

/**
 * Process uploaded file
 * @param {File} file - The uploaded file
 */
async function processFile(file) {
    const uploadZone = document.querySelector('.upload-zone');

    // Validate file type
    if (!file.type.includes('pdf')) {
        showError(uploadZone, 'Please upload a PDF file');
        return;
    }

    // Show processing state
    showProcessing(uploadZone, file.name);

    try {
        // Extract text from PDF
        showProcessing(uploadZone, file.name, 'Extracting text...');

        // Note: PDF text extraction requires pdf.js in production
        // For now, we'll use a placeholder that can be enhanced
        const textContent = await extractTextFromPDF(file);

        // Send to AI for data extraction
        showProcessing(uploadZone, file.name, 'AI analyzing...');
        extractedData = await extractFinancialData(textContent);

        if (extractedData) {
            showSuccess(uploadZone, file.name);

            // Emit custom event for data update
            window.dispatchEvent(new CustomEvent('fileProcessed', {
                detail: {
                    fileName: file.name,
                    file,
                    extractedData
                }
            }));

            // Show notification about extracted data
            showDataNotification(extractedData);
        } else {
            showError(uploadZone, 'Could not extract data from PDF');
        }

    } catch (error) {
        showError(uploadZone, error.message || 'Failed to process file');
        console.error('File processing error:', error);
    }
}

/**
 * Show processing state
 */
function showProcessing(uploadZone, fileName, status = 'Processing...') {
    uploadZone.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--accent-gold); animation: spin 1s linear infinite;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
        <p style="color: var(--accent-gold)"><strong>${fileName}</strong><br>${status}</p>
    `;
}

/**
 * Show success state
 */
function showSuccess(uploadZone, fileName) {
    uploadZone.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--positive)">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
        </svg>
        <p style="color: var(--positive)"><strong>${fileName}</strong><br>Data extracted successfully!</p>
    `;

    // Reset after delay
    setTimeout(() => resetUploadZone(uploadZone), 5000);
}

/**
 * Show error state
 */
function showError(uploadZone, message) {
    uploadZone.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" style="color: var(--negative)">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p style="color: var(--negative)"><strong>Error</strong><br>${message}</p>
    `;

    setTimeout(() => resetUploadZone(uploadZone), 4000);
}

/**
 * Reset upload zone to default state
 */
function resetUploadZone(uploadZone) {
    uploadZone.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
        <p><strong>Upload PDF</strong><br>Drop annual report here</p>
    `;
}

/**
 * Show notification about extracted data
 */
function showDataNotification(data) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'data-notification';
    notification.innerHTML = `
        <div style="
            position: fixed;
            bottom: 100px;
            right: 24px;
            background: var(--bg-card);
            border: 1px solid var(--positive);
            border-radius: 12px;
            padding: 16px 20px;
            max-width: 300px;
            z-index: 1001;
            animation: slideUp 0.3s ease;
        ">
            <h4 style="color: var(--positive); font-size: 0.9rem; margin-bottom: 8px;">
                ✓ Data Extracted
            </h4>
            <p style="color: var(--text-secondary); font-size: 0.8rem; line-height: 1.5;">
                ${data.companyName || 'Company'} - ${data.fiscalYear || 'FY'}<br>
                Revenue: ${data.revenue?.value ? `SAR ${data.revenue.value}M` : 'N/A'}<br>
                Net Profit: ${data.netProfit?.value ? `SAR ${data.netProfit.value}M` : 'N/A'}
            </p>
        </div>
    `;

    document.body.appendChild(notification);

    // Remove after delay
    setTimeout(() => notification.remove(), 6000);
}

/**
 * Get extracted data
 */
export function getExtractedData() {
    return extractedData;
}

export default {
    initFileUpload,
    processFile,
    getExtractedData
};
