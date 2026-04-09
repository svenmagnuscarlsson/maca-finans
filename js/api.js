import { API_CONFIG } from './config.js';

// Använd en CORS-proxy för att undvika problem på GitHub Pages
const PROXY_URL = 'https://corsproxy.io/?';

/**
 * Yahoo Finance API Module (Optimized for yahoo-finance15 with CORS Proxy support)
 */
export const FinanceAPI = {
    /**
     * Privat hjälpmetod för att hantera API-anrop med proxy
     */
    async _fetch(endpoint, params = {}) {
        const queryParams = new URLSearchParams(params).toString();
        const targetUrl = `https://${API_CONFIG.HOST}/api/v1/${endpoint}?${queryParams}`;
        
        // Vi använder proxyn för ALLA anrop när vi kör på en domän (t.ex. GitHub Pages)
        const url = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? targetUrl 
            : PROXY_URL + encodeURIComponent(targetUrl);

        const options = {
            method: 'GET',
            headers: {
                'X-RapidAPI-Key': API_CONFIG.KEY,
                'X-RapidAPI-Host': API_CONFIG.HOST,
                'Content-Type': 'application/json'
            }
        };

        const response = await fetch(url, options);
        
        if (response.status === 403) {
            throw new Error('403 Forbidden: Kontrollera din prenumeration på RapidAPI.');
        }
        if (!response.ok) throw new Error(`API error: ${response.status}`);
        
        return await response.json();
    },

    async fetchQuote(symbol) {
        try {
            // Vi testar 'markets/quote' (plural markets, singular quote) 
            // men genom proxyn spelar redirects ingen roll.
            const data = await this._fetch('markets/quote', { symbol });
            
            // Hantera olika svarstyper från yahoo-finance15
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
        try {
            const data = await this._fetch('markets/search', { search: query });
            
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
        try {
            const data = await this._fetch('markets/indicators/rsi', {
                symbol: symbol,
                interval: '1h',
                series_type: 'close',
                time_period: 50,
                limit: 50
            });
            
            const body = data.body || [];
            const result = Array.isArray(body) ? body[0] : body;
            return result ? result.rsi : null;
        } catch (error) {
            console.error('Error fetching RSI:', error);
            return null;
        }
    }
};

