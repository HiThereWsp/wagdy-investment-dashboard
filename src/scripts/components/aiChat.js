/**
 * AI Chat Component
 * Interactive chat interface for querying financial data
 */

import { queryFinancialData, generateInsights } from '../../services/openaiService.js';
import { financialData } from '../data/financialData.js';

let isOpen = false;
let isLoading = false;
let messages = [];

const quickActions = [
    { label: 'ROE trend', query: 'What is the ROE trend over the last 3 years?' },
    { label: 'Key risks', query: 'What are the main investment risks?' },
    { label: 'Cash position', query: 'How is the company\'s cash position?' },
    { label: 'Dividend info', query: 'Tell me about the dividend history' }
];

/**
 * Create the chat component HTML
 */
function createChatHTML() {
    return `
        <div class="ai-chat-container" id="aiChat">
            <button class="ai-chat-toggle" id="aiChatToggle" aria-label="Toggle AI Chat">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5M14.25 3.104c.251.023.501.05.75.082M19 14.5l-2.47-2.47M5 14.5l2.47-2.47m0 0a48.303 48.303 0 007.06 0" />
                </svg>
            </button>

            <div class="ai-chat-window" id="aiChatWindow">
                <div class="ai-chat-header">
                    <div class="ai-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714a2.25 2.25 0 00.659 1.591L19 14.5" />
                        </svg>
                    </div>
                    <div>
                        <h4>AI Financial Assistant</h4>
                        <p>Ask questions about Nahdi's financials</p>
                    </div>
                </div>

                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message assistant">
                        Hello! I'm your AI financial assistant. Ask me anything about Nahdi Medical Company's financial data, performance metrics, or investment insights.
                    </div>
                </div>

                <div class="ai-quick-actions" id="aiQuickActions">
                    ${quickActions.map(action => `
                        <button class="ai-quick-action" data-query="${action.query}">${action.label}</button>
                    `).join('')}
                </div>

                <div class="ai-chat-input-container">
                    <input
                        type="text"
                        class="ai-chat-input"
                        id="aiChatInput"
                        placeholder="Ask about financials..."
                        autocomplete="off"
                    >
                    <button class="ai-chat-send" id="aiChatSend" aria-label="Send message">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    `;
}

/**
 * Toggle chat window
 */
function toggleChat() {
    isOpen = !isOpen;
    const chatWindow = document.getElementById('aiChatWindow');
    const toggleBtn = document.getElementById('aiChatToggle');

    if (isOpen) {
        chatWindow.classList.add('open');
        toggleBtn.classList.add('active');
        document.getElementById('aiChatInput').focus();
    } else {
        chatWindow.classList.remove('open');
        toggleBtn.classList.remove('active');
    }
}

/**
 * Add message to chat
 */
function addMessage(content, role) {
    const messagesContainer = document.getElementById('aiChatMessages');
    const messageEl = document.createElement('div');
    messageEl.className = `ai-message ${role}`;
    messageEl.innerHTML = content;
    messagesContainer.appendChild(messageEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    messages.push({ role, content });
}

/**
 * Show loading indicator
 */
function showLoading() {
    const messagesContainer = document.getElementById('aiChatMessages');
    const loadingEl = document.createElement('div');
    loadingEl.className = 'ai-message assistant loading';
    loadingEl.id = 'aiLoadingMessage';
    loadingEl.textContent = 'Analyzing';
    messagesContainer.appendChild(loadingEl);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

/**
 * Remove loading indicator
 */
function removeLoading() {
    const loadingEl = document.getElementById('aiLoadingMessage');
    if (loadingEl) {
        loadingEl.remove();
    }
}

/**
 * Send message to AI
 */
async function sendMessage(query) {
    if (isLoading || !query.trim()) return;

    // Add user message
    addMessage(query, 'user');

    // Clear input
    const input = document.getElementById('aiChatInput');
    input.value = '';

    // Show loading
    isLoading = true;
    showLoading();
    document.getElementById('aiChatSend').disabled = true;

    try {
        // Call OpenAI
        const response = await queryFinancialData(query, financialData);

        // Remove loading and add response
        removeLoading();
        addMessage(formatResponse(response), 'assistant');

    } catch (error) {
        removeLoading();
        addMessage(`Sorry, I encountered an error: ${error.message}. Please try again.`, 'assistant');
        console.error('AI Chat Error:', error);
    } finally {
        isLoading = false;
        document.getElementById('aiChatSend').disabled = false;
    }
}

/**
 * Format AI response for display
 */
function formatResponse(text) {
    // Convert markdown-style formatting to HTML
    return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n- /g, '</p><p>• ')
        .replace(/\n/g, '<br>');
}

/**
 * Initialize AI Chat component
 */
export function initAIChat() {
    // Add HTML to page
    document.body.insertAdjacentHTML('beforeend', createChatHTML());

    // Event listeners
    document.getElementById('aiChatToggle').addEventListener('click', toggleChat);

    document.getElementById('aiChatSend').addEventListener('click', () => {
        const input = document.getElementById('aiChatInput');
        sendMessage(input.value);
    });

    document.getElementById('aiChatInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage(e.target.value);
        }
    });

    // Quick actions
    document.querySelectorAll('.ai-quick-action').forEach(btn => {
        btn.addEventListener('click', () => {
            sendMessage(btn.dataset.query);
        });
    });

    console.log('AI Chat initialized');
}

export default { initAIChat };
