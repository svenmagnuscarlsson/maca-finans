import { FinanceAPI } from './api.js';
import { UI } from './ui.js';

/**
 * Main Application Logic
 */
class FinanceTracker {
    constructor() {
        this.watchlist = JSON.parse(localStorage.getItem('watchlist')) || [];
        this.currentStock = null;

        this.init();
    }

    init() {
        // Event Listeners
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('searchInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleSearch();
        });

        // Watchlist Delegation
        document.getElementById('watchlistGrid').addEventListener('click', async (e) => {
            const removeBtn = e.target.closest('.remove-btn');
            if (removeBtn) {
                e.stopPropagation();
                this.removeFromWatchlist(removeBtn.dataset.symbol);
                return;
            }

            const card = e.target.closest('.mini-card');
            if (card) {
                const symbol = card.dataset.symbol;
                document.getElementById('searchInput').value = symbol;
                this.handleSearch(symbol);
            }
        });

        // Add to Watchlist Delegation
        document.getElementById('stockDisplay').addEventListener('click', (e) => {
            if (e.target.id === 'addToWatchlist') {
                this.addToWatchlist();
            }
        });

        // Initial Load
        this.updateWatchlistUI();
        
        // Auto-load a default if watchlist exists
        if (this.watchlist.length > 0) {
            this.handleSearch(this.watchlist[0].symbol);
        } else {
            // Hardcoded initial test as requested in project plan
            this.handleSearch('AAPL');
        }
    }

    async handleSearch(customSymbol) {
        const symbol = (customSymbol || document.getElementById('searchInput').value).toUpperCase();
        if (!symbol) return;

        UI.showLoading();

        // Hämta både kurs och RSI parallellt
        const [data, rsi] = await Promise.all([
            FinanceAPI.fetchQuote(symbol),
            FinanceAPI.fetchRSI(symbol)
        ]);

        this.currentStock = data;
        UI.renderStockCard(data, rsi);
    }

    addToWatchlist() {
        if (!this.currentStock) return;

        const exists = this.watchlist.some(s => s.symbol === this.currentStock.symbol);
        if (exists) return;

        const stockToSave = {
            symbol: this.currentStock.symbol,
            name: this.currentStock.shortName || this.currentStock.symbol,
            price: this.currentStock.regularMarketPrice,
            change: this.currentStock.regularMarketChangePercent
        };

        this.watchlist.push(stockToSave);
        this.saveWatchlist();
        this.updateWatchlistUI();
    }

    removeFromWatchlist(symbol) {
        this.watchlist = this.watchlist.filter(s => s.symbol !== symbol);
        this.saveWatchlist();
        this.updateWatchlistUI();
    }

    saveWatchlist() {
        localStorage.setItem('watchlist', JSON.stringify(this.watchlist));
    }

    updateWatchlistUI() {
        UI.renderWatchlist(this.watchlist);
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new FinanceTracker();
});
