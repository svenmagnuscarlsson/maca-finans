import { API_CONFIG } from './config.js';

/**
 * Yahoo Finance API Module (Optimized for yahoo-finance15)
 */
export const FinanceAPI = {
    async fetchQuote(symbol) {
        // Uppdaterad endpoint: singular 'quote' och parametern 'symbol'
        const url = `https://${API_CONFIG.HOST}/api/v1/markets/quote?symbol=${symbol}`;
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
            
            // yahoo-finance15 returnerar data antingen direkt eller i body
            // Vi försöker hitta det mest relevanta objektet
            let result = data.body ? (Array.isArray(data.body) ? data.body[0] : data.body) : data;
            
            if (!result || (!result.symbol && !result.price)) return null;

            return {
                symbol: result.symbol || symbol,
                shortName: result.name || result.shortName || result.symbol || symbol,
                regularMarketPrice: result.price || result.regularMarketPrice || 0,
                regularMarketChangePercent: result.change_percent || result.regularMarketChangePercent || 0,
                regularMarketChange: result.change || result.regularMarketChange || 0,
                currency: result.currency || 'USD',
                fullExchangeName: result.exchange || result.fullExchangeName || 'Market'
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
    },

    async fetchRSI(symbol) {
        // Synkat med användarens fungerande cURL: time_period=50, limit=50
        const url = `https://${API_CONFIG.HOST}/api/v1/markets/indicators/rsi?symbol=${symbol}&interval=1h&series_type=close&time_period=50&limit=50`;
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
            if (!response.ok) return null;
            const data = await response.json();
            
            // Hämta det senaste RSI-värdet (index 0 i body om det är en array)
            const body = data.body || [];
            const result = Array.isArray(body) ? body[0] : body;
            return result ? result.rsi : null;
        } catch (error) {
            console.error('Error fetching RSI:', error);
            return null;
        }
    }
};
