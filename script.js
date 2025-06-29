document.addEventListener('DOMContentLoaded', () => {
    const timeDateElement = document.getElementById('time-date');
    const connectionStatusElement = document.getElementById('connection-status');
    const newsContent = document.getElementById('news-content');
    const marketContent = document.getElementById('market-content');
    const marketNavButtons = document.querySelectorAll('.market-nav .nav-btn');
    const commandInput = document.getElementById('command-input');

    // --- WebSocket Connection ---
    // Backend endpoint for socket.io is the server root
    const socket = io('http://localhost:3000');

    socket.on('connect', () => {
        console.log('Connected to backend server.');
        connectionStatusElement.textContent = '●';
        connectionStatusElement.classList.remove('disconnected');
        connectionStatusElement.classList.add('connected');
        // Request initial data on connect
        socket.emit('request_initial_data');
    });

    socket.on('disconnect', () => {
        console.log('Disconnected from backend server.');
        connectionStatusElement.textContent = '●';
        connectionStatusElement.classList.remove('connected');
        connectionStatusElement.classList.add('disconnected');
    });

    socket.on('news_update', (newsData) => {
        console.log('Received news update:', newsData);
        updateNewsFeed(newsData);
    });

    socket.on('market_update', (marketData) => {
        console.log('Received market update:', marketData);
        updateMarketData(marketData.type, marketData.data);
    });


    // --- UI Updates ---
    function updateClock() {
        const now = new Date();
        const options = {
            year: 'numeric', month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit', second: '2-digit',
            hour12: false
        };
        timeDateElement.textContent = now.toLocaleString('id-ID', options).replace(/\./g, ':');
    }

    function updateNewsFeed(articles) {
        if (!articles || articles.length === 0) {
            newsContent.innerHTML = '<p>Tidak ada berita yang tersedia saat ini.</p>';
            return;
        }
        newsContent.innerHTML = articles.map(article => `
            <div class="news-item">
                <div class="news-source">${article.source.name} (${new Date(article.publishedAt).toLocaleString('id-ID')})</div>
                <div class="news-title">${article.title}</div>
                <div class="news-summary">${article.description || 'Tidak ada ringkasan.'}</div>
            </div>
        `).join('');
    }

    function updateMarketData(marketType, data) {
        // Only update if the current view matches the data type
        const currentMarket = document.querySelector('.market-nav .nav-btn.active').dataset.market;
        if (currentMarket !== marketType) {
            return;
        }

        if (!data || data.length === 0) {
            marketContent.innerHTML = '<p>Data tidak tersedia.</p>';
            return;
        }

        let tableHTML = `
            <table>
                <thead>
                    <tr>
                        <th>Simbol</th>
                        <th>Harga Terakhir</th>
                        <th>Perubahan (24j)</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        data.forEach(item => {
            const priceChange = parseFloat(item.priceChangePercent);
            const priceClass = priceChange >= 0 ? 'price-up' : 'price-down';
            const sign = priceChange >= 0 ? '+' : '';
            tableHTML += `
                <tr>
                    <td>${item.symbol}</td>
                    <td class="${priceClass}">${parseFloat(item.lastPrice).toFixed(5)}</td>
                    <td class="${priceClass}">${sign}${priceChange.toFixed(2)}%</td>
                </tr>
            `;
        });

        tableHTML += '</tbody></table>';
        marketContent.innerHTML = tableHTML;
    }


    // --- Event Listeners ---
    marketNavButtons.forEach(button => {
        button.addEventListener('click', () => {
            marketNavButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            const marketType = button.dataset.market;
            marketContent.innerHTML = `<p>Memuat data untuk pasar ${marketType.toUpperCase()}...</p>`;
            socket.emit('request_market_data', marketType);
        });
    });

    commandInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const command = commandInput.value.trim();
            if (command) {
                console.log(`Executing command: ${command}`);
                // Basic command handling
                if (command.toLowerCase() === 'berita') {
                    socket.emit('request_news_update');
                } else if (command.toLowerCase().startsWith('harga')) {
                    const symbol = command.split(' ')[1];
                    if(symbol) {
                       alert(`Fungsi pencarian harga untuk ${symbol.toUpperCase()} akan diimplementasikan.`);
                    } else {
                       alert(`Silakan masukkan simbol, contoh: 'harga BTCUSDT'`);
                    }
                }
                commandInput.value = '';
            }
        }
    });

    // --- Initial Load ---
    updateClock();
    setInterval(updateClock, 1000);
    // Trigger the click on the default active button to load initial market data
    document.querySelector('.market-nav .nav-btn.active').click();
}); 