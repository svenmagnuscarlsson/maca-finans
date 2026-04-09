import { API_CONFIG } from './config.js';

/**
 * Yahoo Finance API Module (Optimized for yahoo-finance15)
 */
export const FinanceAPI = {
    async fetchQuote(symbol) {
        const url = `https://${API_CONFIG.HOST}/api/v1/markets/quotes?ticker=${symbol}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.KEY,
                'X-RapidAPI-Host': API_CONFIG.HOST,
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await fetch(url, options);
            
            if (response.status === 403) {
                throw new Error('403 Forbidden: Kontrollera din prenumeration på RapidAPI.');
            }
            if (!response.ok) throw new Error(`API error: ${response.status}`);
            
            const data = await response.json();
            
            // yahoo-finance15 returnerar ofta data i body-fältet
            const result = data.body ? data.body[0] : null;
            
            if (!result) return null;

            // Mappa om data till ett enhetligt format för UI:t
            return {
                symbol: result.symbol,
                shortName: result.name || result.symbol,
                regularMarketPrice: result.price || 0,
                regularMarketChangePercent: result.change_percent || 0,
                regularMarketChange: result.change || 0,
                currency: result.currency || 'USD',
                fullExchangeName: result.exchange || 'Market'
            };
        } catch (error) {
            console.error('Error fetching quote:', error);
            return null;
        }
    },

    async searchSymbol(query) {
        const url = `https://${API_CONFIG.HOST}/api/v1/markets/search?search=${query}`;
        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.KEY,
                'X-RapidAPI-Host': API_CONFIG.HOST,
                'Content-Type': 'application/json'
            }
        };

        try {
            const response = await fetch(url, options);
            if (!response.ok) throw new Error('Search failed');
            const data = await response.json();
            
            // Mappa sökresultat
            return (data.body || []).map(item => ({
                symbol: item.symbol,
                name: item.name
            }));
        } catch (error) {
            console.error('Error searching symbol:', error);
            return [];
        }
    }
};
