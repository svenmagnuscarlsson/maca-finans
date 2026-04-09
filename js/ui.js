/**
 * UI Manipulation Module
 */
export const UI = {
    renderStockCard(data, rsi) {
        const container = document.getElementById('stockDisplay');
        if (!data) {
            container.innerHTML = `<div class="empty-state"><p>Kunde inte hitta aktien. Försök igen.</p></div>`;
            return;
        }

        const isUp = data.regularMarketChange >= 0;
        const changeClass = isUp ? 'up' : 'down';
        const changeSymbol = isUp ? '+' : '';
        const rsiValue = rsi ? rsi.toFixed(2) : 'N/A';
        const rsiColor = rsi > 70 ? 'var(--danger)' : (rsi < 30 ? 'var(--success)' : 'var(--accent)');

        container.innerHTML = `
            <div class="stock-card">
                <div class="stock-info">
                    <span class="symbol">${data.symbol}</span>
                    <h2>${data.shortName || data.longName || data.symbol}</h2>
                    <p class="market">${data.fullExchangeName}</p>
                    <div class="indicator-badge" style="margin-top: 1rem;">
                        <span class="label">RSI (14h):</span>
                        <span class="value" style="color: ${rsiColor}; font-weight: 700;">${rsiValue}</span>
                    </div>
                </div>
                <div class="stock-price">
                    <span class="price">${data.regularMarketPrice.toFixed(2)} ${data.currency}</span>
                    <span class="change ${changeClass}">
                        ${changeSymbol}${data.regularMarketChange.toFixed(2)} (${data.regularMarketChangePercent.toFixed(2)}%)
                    </span>
                    <div class="actions" style="margin-top: 1.5rem;">
                        <button id="addToWatchlist" class="secondary-btn">Bevaka Aktie</button>
                    </div>
                </div>
            </div>
        `;
    },

    renderWatchlist(items, onRemove) {
        const grid = document.getElementById('watchlistGrid');
        if (items.length === 0) {
            grid.innerHTML = `<p style="grid-column: 1/-1; color: var(--text-secondary); padding: 2rem; text-align: center;">Din watchlist är tom.</p>`;
            return;
        }

        grid.innerHTML = items.map(item => `
            <div class="mini-card" data-symbol="${item.symbol}">
                <div class="mini-card-info">
                    <span style="display: block; font-weight: 700;">${item.symbol}</span>
                    <span style="font-size: 0.8rem; color: var(--text-secondary); display: block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${item.name}</span>
                </div>
                <div style="text-align: right; display: flex; align-items: center; gap: 1rem;">
                    <div>
                        <span style="display: block; font-weight: 600;">${item.price.toFixed(2)}</span>
                        <span class="${item.change >= 0 ? 'up' : 'down'}" style="font-size: 0.8rem;">
                            ${item.change >= 0 ? '+' : ''}${item.change.toFixed(2)}%
                        </span>
                    </div>
                    <button class="remove-btn" title="Ta bort" data-symbol="${item.symbol}" style="background: transparent; color: var(--text-secondary); padding: 5px; min-width: auto; border-radius: 5px;">&times;</button>
                </div>
            </div>
        `).join('');
    },

    showLoading() {
        document.getElementById('stockDisplay').innerHTML = `<div class="loading">Hämtar data...</div>`;
    }
};
