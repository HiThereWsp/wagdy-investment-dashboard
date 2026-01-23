/**
 * File Upload Module
 * Handles PDF file uploads for annual reports
 * Integrates with AI for data extraction
 * Supports multi-file upload and merging
 */

import { extractFinancialData, extractQualitativeEvents } from '../services/openaiService.js';
import { showLoading, updateLoadingStep, hideLoading } from './components/loadingOverlay.js';
import { addReport, addMergedReport } from './components/reportStore.js';

// Helper to update file status in onboarding UI (if visible)
function updateFileStatusSafe(index, status) {
    const statusEl = document.getElementById(`fileStatus${index}`);
    if (statusEl) {
        statusEl.textContent = status;
        statusEl.className = `file-status ${status.toLowerCase().replace(/\s+/g, '-')}`;
    }
}

// Store extracted data globally
let extractedData = null;
let allExtractedData = [];

/**
 * Initialize file upload functionality
 */
export function initFileUpload() {
    const uploadZone = document.querySelector('.upload-zone');
    const fileInput = document.getElementById('fileInput');

    if (!uploadZone || !fileInput) return;

    // Enable multiple file selection
    fileInput.setAttribute('multiple', 'true');

    // Click to upload
    uploadZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Handle file selection (single or multiple)
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
        const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
        if (files.length === 1) {
            processFile(files[0]);
        } else if (files.length > 1) {
            processMultipleFiles(files.slice(0, 3));
        }
    });

    // Listen for multiple files selected event from onboarding
    window.addEventListener('multipleFilesSelected', (e) => {
        const { files } = e.detail;
        if (files.length === 1) {
            processFile(files[0]);
        } else if (files.length > 1) {
            processMultipleFiles(files);
        }
    });
}

/**
 * Handle file upload event
 */
function handleFileUpload(event) {
    const files = Array.from(event.target.files).filter(f => f.type === 'application/pdf');
    if (files.length === 1) {
        processFile(files[0]);
    } else if (files.length > 1) {
        processMultipleFiles(files.slice(0, 3));
    }
}

/**
 * Extract text from PDF using pdf.js library
 */
async function extractTextFromPDF(file) {
    // Dynamically import pdf.js
    const pdfjsLib = await import('pdfjs-dist');

    // Set worker source
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
        'pdfjs-dist/build/pdf.worker.min.mjs',
        import.meta.url
    ).href;

    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const typedArray = new Uint8Array(e.target.result);
                const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;

                let fullText = '';

                // Extract text from all pages
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const pageText = textContent.items
                        .map(item => item.str)
                        .join(' ');
                    fullText += pageText + '\n';
                }

                resolve(fullText);
            } catch (err) {
                reject(err);
            }
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(file);
    });
}

/**
 * Process multiple uploaded files
 * @param {File[]} files - Array of uploaded files
 */
async function processMultipleFiles(files) {
    const uploadZone = document.querySelector('.upload-zone');
    allExtractedData = [];

    // Show loading
    showLoading('extracting');

    try {
        // Process each file sequentially
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            updateFileStatusSafe(i, 'Processing');

            // Extract text from PDF
            updateLoadingStep('extracting');
            const textContent = await extractTextFromPDF(file);

            // Send to AI for data extraction
            updateLoadingStep('analyzing');
            const data = await extractFinancialData(textContent);

            if (data) {
                // Extract qualitative events for this file
                const qualEvents = await extractQualitativeEvents(textContent);
                if (qualEvents && qualEvents.length > 0) {
                    data.qualitativeEvents = qualEvents;
                }

                data._fileName = file.name;
                allExtractedData.push(data);
                updateFileStatusSafe(i, 'Done');
            } else {
                updateFileStatusSafe(i, 'Error');
            }
        }

        if (allExtractedData.length > 0) {
            // Merge all extracted data
            updateLoadingStep('rendering');
            const mergedData = mergeExtractedData(allExtractedData);

            // Save merged report
            const fileNames = files.map(f => f.name).join(', ');
            const report = addMergedReport({
                fileName: fileNames,
                companyName: mergedData.companyName,
                fiscalYears: mergedData.years,
                extractedData: mergedData
            });

            await new Promise(resolve => setTimeout(resolve, 500));
            hideLoading();

            if (uploadZone) {
                showSuccess(uploadZone, `${allExtractedData.length} files processed`);
            }

            // Emit event for merged data
            window.dispatchEvent(new CustomEvent('fileProcessed', {
                detail: {
                    fileName: fileNames,
                    extractedData: mergedData,
                    report,
                    isMerged: true
                }
            }));

            // Emit all files processed event
            window.dispatchEvent(new CustomEvent('allFilesProcessed'));

            showDataNotification(mergedData);
        } else {
            hideLoading();
            if (uploadZone) {
                showError(uploadZone, 'Could not extract data from PDFs');
            }
        }
    } catch (error) {
        hideLoading();
        console.error('Multi-file processing error:', error);
        if (uploadZone) {
            showError(uploadZone, error.message || 'Failed to process files');
        }
    }
}

/**
 * Merge extracted data from multiple PDFs
 * Combines data from multiple years into a single dataset
 */
function mergeExtractedData(dataArray) {
    // Sort by fiscal year
    dataArray.sort((a, b) => {
        const yearA = parseInt(a.fiscalYear) || 0;
        const yearB = parseInt(b.fiscalYear) || 0;
        return yearA - yearB;
    });

    // Use the most recent company name
    const companyName = dataArray[dataArray.length - 1].companyName || 'Company';

    // Initialize merged data structure
    const merged = {
        companyName,
        fiscalYear: dataArray[dataArray.length - 1].fiscalYear,
        years: [],
        revenue: [],
        grossProfit: [],
        netProfit: [],
        grossMargin: [],
        netMargin: [],
        totalAssets: [],
        currentAssets: [],
        totalLiabilities: [],
        currentLiabilities: [],
        shareholderEquity: [],
        roe: [],
        currentRatio: [],
        debtToEquity: [],
        eps: [],
        operatingCashFlow: [],
        investingCashFlow: [],
        financingCashFlow: [],
        fcf: [],
        dividends: {},
        cashEquivalents: {},
        qualitativeEvents: [],
        _sources: dataArray.map(d => ({ year: d.fiscalYear, file: d._fileName }))
    };

    // Helper to get numeric value
    const getVal = (obj, key) => {
        const val = obj[key];
        if (val === null || val === undefined) return null;
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val.value !== undefined) return val.value;
        return null;
    };

    // Merge data from each year
    dataArray.forEach(data => {
        const year = data.fiscalYear || 'N/A';
        merged.years.push(year);

        // Revenue and profit metrics
        merged.revenue.push(getVal(data, 'revenue') || 0);
        merged.grossProfit.push(getVal(data, 'grossProfit') || 0);
        merged.netProfit.push(getVal(data, 'netProfit') || 0);

        // Margins
        merged.grossMargin.push(getVal(data, 'grossMargin') || 0);
        merged.netMargin.push(getVal(data, 'netMargin') || 0);

        // Balance sheet
        merged.totalAssets.push(getVal(data, 'totalAssets') || 0);
        merged.currentAssets.push(getVal(data, 'currentAssets') || 0);
        merged.totalLiabilities.push(getVal(data, 'totalLiabilities') || 0);
        merged.currentLiabilities.push(getVal(data, 'currentLiabilities') || 0);
        merged.shareholderEquity.push(getVal(data, 'shareholderEquity') || 0);

        // Ratios
        merged.roe.push(getVal(data, 'roe') || 0);
        merged.currentRatio.push(getVal(data, 'currentRatio') || 0);
        merged.debtToEquity.push(getVal(data, 'debtToEquity') || 0);
        merged.eps.push(getVal(data, 'eps') || 0);

        // Cash flow
        merged.operatingCashFlow.push(getVal(data, 'operatingCashFlow') || 0);
        merged.investingCashFlow.push(getVal(data, 'investingCashFlow') || 0);
        merged.financingCashFlow.push(getVal(data, 'financingCashFlow') || 0);
        merged.fcf.push(getVal(data, 'fcf') || 0);

        // Dividends and cash
        if (data.dividends) {
            merged.dividends[year] = getVal(data, 'dividends') || getVal(data.dividends, year);
        }
        if (data.cashEquivalents || data.cash) {
            merged.cashEquivalents[year] = getVal(data, 'cashEquivalents') || getVal(data, 'cash') || 0;
        }

        // Collect qualitative events
        if (data.qualitativeEvents && data.qualitativeEvents.length > 0) {
            merged.qualitativeEvents.push(...data.qualitativeEvents);
        }
    });

    // Sort qualitative events by year
    merged.qualitativeEvents.sort((a, b) => {
        const yearA = parseInt(a.year) || 0;
        const yearB = parseInt(b.year) || 0;
        return yearB - yearA; // Most recent first
    });

    console.log('Merged data from', dataArray.length, 'files:', merged);
    return merged;
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

    // Show full-screen loading overlay
    showLoading('extracting');
    showProcessing(uploadZone, file.name);

    try {
        // Extract text from PDF
        updateLoadingStep('extracting');
        const textContent = await extractTextFromPDF(file);

        // Send to AI for data extraction
        updateLoadingStep('analyzing');
        extractedData = await extractFinancialData(textContent);

        if (extractedData) {
            // Extract qualitative events (one-time vs recurring)
            const qualEvents = await extractQualitativeEvents(textContent);
            if (qualEvents && qualEvents.length > 0) {
                extractedData.qualitativeEvents = qualEvents;
                console.log('Extracted qualitative events:', qualEvents.length);
            }

            // Update to rendering step
            updateLoadingStep('rendering');

            // Save report to store
            const report = addReport({
                fileName: file.name,
                companyName: extractedData.companyName,
                fiscalYear: extractedData.fiscalYear,
                extractedData
            });

            // Small delay to show rendering step
            await new Promise(resolve => setTimeout(resolve, 500));

            // Hide loading overlay
            hideLoading();
            showSuccess(uploadZone, file.name);

            // Emit custom event for data update
            window.dispatchEvent(new CustomEvent('fileProcessed', {
                detail: {
                    fileName: file.name,
                    file,
                    extractedData,
                    report
                }
            }));

            // Emit all files processed event (for single file)
            window.dispatchEvent(new CustomEvent('allFilesProcessed'));

            // Show notification about extracted data
            showDataNotification(extractedData);
        } else {
            hideLoading();
            showError(uploadZone, 'Could not extract data from PDF');
        }

    } catch (error) {
        hideLoading();
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
