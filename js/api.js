import { API_CONFIG } from './config.js';

/**
 * Yahoo Finance API Module
 */
export const FinanceAPI = {
    async fetchQuote(symbol) {
        const url = `https://${API_CONFIG.HOST}/v1/market/quotes?region=US&lang=en&symbols=${symbol}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.KEY,
                'X-RapidAPI-Host': API_CONFIG.HOST
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('API request failed');
            const data = await response.json();
            return data.quoteResponse.result[0];
        } catch (error) {
            console.error('Error fetching quote:', error);
            return null;
        }
    },

    async searchSymbol(query) {
        const url = `https://${API_CONFIG.HOST}/v1/search?q=${query}&region=US`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.KEY,
                'X-RapidAPI-Host': API_CONFIG.HOST
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            return data.quotes;
        } catch (error) {
            console.error('Error searching symbol:', error);
            return [];
        }
    }
};
