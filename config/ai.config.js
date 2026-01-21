/**
 * AI Configuration
 * Configure your AI provider settings here
 */

export const aiConfig = {
    // OpenAI Configuration
    openai: {
        apiKey: import.meta.env.VITE_OPENAI_API_KEY || '',
        model: 'gpt-4-turbo-preview',
        maxTokens: 4096,
        temperature: 0.7
    },

    // Anthropic Claude Configuration
    anthropic: {
        apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY || '',
        model: 'claude-3-opus-20240229',
        maxTokens: 4096
    },

    // Azure OpenAI Configuration
    azure: {
        apiKey: import.meta.env.VITE_AZURE_OPENAI_API_KEY || '',
        endpoint: import.meta.env.VITE_AZURE_OPENAI_ENDPOINT || '',
        deploymentName: import.meta.env.VITE_AZURE_OPENAI_DEPLOYMENT || '',
        apiVersion: '2024-02-15-preview'
    },

    // Default provider
    defaultProvider: 'openai',

    // Feature flags
    features: {
        pdfExtraction: true,
        insightGeneration: true,
        naturalLanguageQuery: true,
        anomalyDetection: true,
        benchmarkComparison: false // Requires additional data sources
    }
};

export default aiConfig;
