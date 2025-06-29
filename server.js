// --- Konfigurasi Dasar ---
require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const axios = require('axios');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*", // Izinkan koneksi dari mana saja untuk pengembangan
        methods: ["GET", "POST"]
    }
});

const port = process.env.PORT || 3000;

// --- Konfigurasi Kunci API ---
const NEWS_API_KEY = process.env.NEWS_API_KEY;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Verifikasi bahwa kunci API sudah diatur
if (!NEWS_API_KEY || NEWS_API_KEY === "fadb8f16daaf4ad3baa0aa710051d8f1") {
    console.error("Kesalahan Kritis: NEWS_API_KEY belum diatur di file .env.");
    process.exit(1);
}
if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === "LTE27T8HU4J8VOYA") {
    console.error("Kesalahan Kritis: ALPHA_VANTAGE_API_KEY belum diatur di file .env.");
    process.exit(1);
}

// --- Middleware ---
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// --- Cache Data & Konfigurasi ---
let dataCache = {
    news: null,
    crypto: null,
    forex: null,
    stocks: null,
};
const TOP_CRYPTO_SYMBOLS = ['BTCUSDT', 'ETHUSDT', 'BNBUSDT', 'SOLUSDT', 'XRPUSDT', 'DOGEUSDT'];
const TOP_FOREX_PAIRS = [['EUR', 'USD'], ['USD', 'JPY'], ['GBP', 'USD'], ['USD', 'CHF'], ['AUD', 'USD']];
const TOP_STOCKS_SYMBOLS = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'TSLA'];

// --- Fungsi Pengambilan Data ---

// 1. Berita
async function fetchNews() {
    try {
        console.log("Mengambil berita terbaru...");
        const url = `https://newsapi.org/v2/top-headlines?country=id&category=business&apiKey=${NEWS_API_KEY}`;
        const response = await axios.get(url);
        dataCache.news = response.data.articles;
        console.log(`Berhasil mengambil ${dataCache.news.length} artikel berita.`);
        io.emit('news_update', dataCache.news); // Kirim update ke semua klien
    } catch (error) {
        console.error("Gagal mengambil data berita:", error.response ? error.response.data : error.message);
    }
}

// 2. Kripto (dari Binance)
async function fetchCryptoData() {
    try {
        console.log("Mengambil data kripto...");
        const url = 'https://api.binance.com/api/v3/ticker/24hr';
        const response = await axios.get(url);
        const filteredData = response.data.filter(d => TOP_CRYPTO_SYMBOLS.includes(d.symbol));
        dataCache.crypto = filteredData.map(item => ({
            symbol: item.symbol,
            lastPrice: parseFloat(item.lastPrice),
            priceChangePercent: parseFloat(item.priceChangePercent)
        }));
        io.emit('market_update', { type: 'crypto', data: dataCache.crypto });
    } catch (error) {
        console.error("Gagal mengambil data kripto:", error.message);
    }
}

// 3. Forex (dari Alpha Vantage)
async function fetchForexData() {
    try {
        console.log("Mengambil data forex...");
        const requests = TOP_FOREX_PAIRS.map(pair => {
            const url = `https://www.alphavantage.co/query?function=CURRENCY_EXCHANGE_RATE&from_currency=${pair[0]}&to_currency=${pair[1]}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            return axios.get(url);
        });

        const responses = await Promise.all(requests);
        const forexData = responses.map(res => res.data['Realtime Currency Exchange Rate']);
        
        // Periksa jika ada respons yang tidak valid (karena batasan API)
        if (forexData.some(d => !d)) {
            console.warn("Satu atau lebih panggilan API Alpha Vantage gagal, mungkin karena batasan panggilan. Data tidak diperbarui.");
            // Jangan perbarui cache jika ada data yang gagal
            return;
        }

        dataCache.forex = forexData.map(item => ({
            symbol: `${item['1. From_Currency Code']}/${item['3. To_Currency Code']}`,
            lastPrice: parseFloat(item['5. Exchange Rate']),
            // AlphaVantage tidak menyediakan persen perubahan di endpoint ini, jadi kita set ke 0
            priceChangePercent: 0 
        }));
        io.emit('market_update', { type: 'forex', data: dataCache.forex });

    } catch (error) {
        console.error("Gagal mengambil data forex:", error.message);
    }
}

// 4. Saham (dari Alpha Vantage)
async function fetchStockData() {
    try {
        console.log("Mengambil data saham...");
        const requests = TOP_STOCKS_SYMBOLS.map(symbol => {
             const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
            return axios.get(url);
        });
        
        const responses = await Promise.all(requests);
        const stockData = responses.map(res => res.data['Global Quote']);

        if (stockData.some(d => !d || Object.keys(d).length === 0)) {
            console.warn("Satu atau lebih panggilan API Alpha Vantage gagal, mungkin karena batasan panggilan. Data saham tidak diperbarui.");
            return;
        }

        dataCache.stocks = stockData.map(item => ({
            symbol: item['01. symbol'],
            lastPrice: parseFloat(item['05. price']),
            priceChangePercent: parseFloat(item['10. change percent'].replace('%', ''))
        }));
        io.emit('market_update', { type: 'stocks', data: dataCache.stocks });

    } catch (error) {
        console.error("Gagal mengambil data saham:", error.message);
    }
}

// --- Logika Socket.IO ---
io.on('connection', (socket) => {
    console.log(`Klien terhubung: ${socket.id}`);

    // Kirim data cache saat klien baru terhubung
    socket.on('request_initial_data', () => {
        if (dataCache.news) socket.emit('news_update', dataCache.news);
        if (dataCache.crypto) socket.emit('market_update', { type: 'crypto', data: dataCache.crypto });
    });

    // Kirim data pasar yang diminta
    socket.on('request_market_data', (marketType) => {
        if (dataCache[marketType]) {
            socket.emit('market_update', { type: marketType, data: dataCache[marketType] });
        } else {
            console.log(`Data untuk ${marketType} belum ada di cache, memicu pengambilan...`);
            switch(marketType) {
                case 'crypto': fetchCryptoData(); break;
                case 'forex': fetchForexData(); break;
                case 'stocks': fetchStockData(); break;
            }
        }
    });
    
    // Refresh berita secara manual
    socket.on('request_news_update', () => {
        fetchNews();
    });

    socket.on('disconnect', () => {
        console.log(`Klien terputus: ${socket.id}`);
    });
});

// --- Server & Jadwal Pengambilan Data ---
server.listen(port, () => {
    console.log(`Terminal backend berjalan di http://localhost:${port}`);
    
    // Pengambilan data awal saat server menyala
    fetchNews();
    fetchCryptoData();
    fetchForexData();
    fetchStockData();

    // Atur jadwal pengambilan data berkala
    setInterval(fetchNews, 1000 * 60 * 30); // Berita setiap 30 menit
    setInterval(fetchCryptoData, 1000 * 60); // Kripto setiap 1 menit
    setInterval(fetchForexData, 1000 * 60 * 2); // Forex setiap 2 menit (karena batasan API)
    setInterval(fetchStockData, 1000 * 60 * 2); // Saham setiap 2 menit (karena batasan API)
});
