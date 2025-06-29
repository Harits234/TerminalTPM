import React, { useState, useEffect, createContext, useContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore'; 

// Inisialisasi Firebase (akan diisi oleh environment Canvas)
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Context untuk status autentikasi pengguna (tetap ada untuk UID anonim)
const AuthContext = createContext(null);

// Komponen Provider Autentikasi
const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setCurrentUser(user);
        setUserId(user.uid);
      } else {
        try {
          await signInAnonymously(auth);
        } catch (anonError) {
          console.error("Error signing in anonymously:", anonError);
          // Mungkin tampilkan pesan error umum jika gagal login anonim
        }
        setCurrentUser(auth.currentUser);
        setUserId(auth.currentUser ? auth.currentUser.uid : null);
      }
      setIsAuthReady(true);
    });

    return () => unsubscribeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, userId, isAuthReady, auth, db }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook untuk menggunakan konteks autentikasi
const useAuth = () => useContext(AuthContext);

// Komponen Loading (untuk tampilan premium)
const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full min-h-[100px]">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-purple-500"></div>
    </div>
);

// --- Komponen Dashboard Pengguna (Tanpa Login, dengan Input Gambar & Strategi) ---
const UserDashboard = () => {
  const { userId } = useAuth();
  const [chartImage, setChartImage] = useState(null); // Menyimpan file gambar
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null); // Menyimpan URL untuk preview
  const [timeframe, setTimeframe] = useState('H1'); // Default H1 for better general analysis
  const [selectedStrategy, setSelectedStrategy] = useState('SMC'); // Default strategy
  const [analysisResult, setAnalysisResult] = useState(null);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setChartImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file); // Baca sebagai Data URL untuk preview dan pengiriman ke AI
      setErrorMessage(''); // Bersihkan pesan error jika ada
    } else {
      setChartImage(null);
      setImagePreviewUrl(null);
      setErrorMessage("Harap unggah file gambar yang valid (JPG, PNG, GIF, dll.).");
    }
  };

  const getStrategySpecificPrompt = (strategy) => {
    switch (strategy) {
      case 'SMC':
        return `Sebagai analis Smart Money Concept (SMC) profesional, identifikasi Order Blocks (OB), Liquidity Sweeps, Fair Value Gaps (FVG), dan Market Structure (tren, Break of Structure/Change of Character) dari gambar chart ini.`;
      case 'ICT':
        return `Sebagai analis Inner Circle Trader (ICT) profesional, identifikasi Inducement, Premium/Discount Arrays, Mitigation Blocks, Breaker Blocks, Order Blocks, Liquidity Voids, dan Market Structure Shifts dari gambar chart ini.`;
      case 'Price Action':
        return `Sebagai analis Price Action profesional, identifikasi pola candlestick (misal: Engulfing, Hammer, Doji), level Support dan Resistance, garis tren, serta pola chart (misal: Head and Shoulders, Double Top/Bottom) dari gambar chart ini.`;
      case 'CRT':
        return `Sebagai analis Contextualized Trading (CRT) profesional, lakukan analisis komprehensif dari gambar chart ini. Pertimbangkan struktur pasar, pola harga, likuiditas, dan potensi konteks pasar yang lebih luas (jika terlihat).`;
      default:
        return `Sebagai analis trading profesional, analisis gambar chart ini.`;
    }
  };

  const handleAnalyze = async () => {
    if (!chartImage) {
      setErrorMessage("Harap unggah gambar chart untuk dianalisis.");
      return;
    }

    setLoadingAnalysis(true);
    setAnalysisResult(null);
    setErrorMessage('');

    try {
      const base64ImageData = imagePreviewUrl.split(',')[1];
      const mimeType = imagePreviewUrl.split(',')[0].split(':')[1].split(';')[0];

      const strategyPrompt = getStrategySpecificPrompt(selectedStrategy);

      const prompt = `${strategyPrompt} Berikan rekomendasi entry BUY/SELL beserta alasannya.
      Pastikan output Anda berupa objek JSON yang valid dengan kunci "recommendations" yang berisi array objek, di mana setiap objek memiliki "type" (BUY/SELL), "price" (format string, jika memungkinkan dari chart, jika tidak, sebutkan area umum), dan "reason" (string penjelasan singkat berdasarkan analisis dari gambar dan strategi ${selectedStrategy}).
      Timeframe yang dianalisis: ${timeframe}.

      Contoh output JSON yang diinginkan:
      {
        "recommendations": [
          {
            "type": "BUY",
            "price": "1.2345",
            "reason": "Harga bereaksi positif pada Order Block bullish setelah liquidity sweep di area support."
          },
          {
            "type": "SELL",
            "price": "1.2360",
            "reason": "Terjadi Break of Structure bearish dan Fair Value Gap terbentuk, menandakan potensi kelanjutan downtrend."
          }
        ]
      }

      Berikan analisis Anda dalam format JSON saja, tanpa teks tambahan di luar JSON.`;

      const payload = {
        contents: [
            {
                role: "user",
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64ImageData
                        }
                    }
                ]
            }
        ],
        generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
                type: "OBJECT",
                properties: {
                    "recommendations": {
                        type: "ARRAY",
                        items: {
                            type: "OBJECT",
                            properties: {
                                "type": { "type": "STRING", "enum": ["BUY", "SELL"] },
                                "price": { "type": "STRING" },
                                "reason": { "type": "STRING" }
                            },
                            "propertyOrdering": ["type", "price", "reason"]
                        }
                    }
                },
                "propertyOrdering": ["recommendations"]
            }
        }
      };

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (result.candidates && result.candidates.length > 0 &&
          result.candidates[0].content && result.candidates[0].content.parts &&
          result.candidates[0].content.parts.length > 0) {
        const jsonString = result.candidates[0].content.parts[0].text;
        const parsedJson = JSON.parse(jsonString);

        if (parsedJson && parsedJson.recommendations) {
          setAnalysisResult(parsedJson.recommendations);
        } else {
          setErrorMessage("Format respons AI tidak valid. Silakan coba lagi.");
        }
      } else {
        setErrorMessage("Tidak ada respons dari AI. Coba berikan gambar chart yang lebih jelas.");
      }
    } catch (error) {
      console.error("Error saat menganalisis chart:", error);
      setErrorMessage("Terjadi kesalahan saat memproses analisis. " + error.message);
    } finally {
      setLoadingAnalysis(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 to-gray-800 text-white flex flex-col items-center p-4">
      <div className="w-full max-w-4xl bg-gray-800 p-10 rounded-3xl shadow-2xl border border-purple-700/50 mt-8 mb-8">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-pink-600">
            The Pips Mafia AI
          </h2>
          <div className="flex items-center space-x-4">
            <span className="text-gray-400 text-sm">ID Sesi: <span className="font-semibold text-purple-400">{userId ? userId.substring(0, 8) + '...' : 'Memuat...'}</span></span>
          </div>
        </div>

        <div className="space-y-8 mb-8">
          <div>
            <label htmlFor="chartImageUpload" className="block text-base font-medium text-purple-300 mb-2">
              Unggah Gambar Chart Anda
            </label>
            <input
              type="file"
              id="chartImageUpload"
              accept="image/*"
              className="w-full text-white bg-gray-700/50 border border-purple-500 rounded-xl px-4 py-3 cursor-pointer file:mr-4 file:py-2 file:px-4
                         file:rounded-xl file:border-0 file:text-sm file:font-semibold
                         file:bg-purple-500 file:text-white hover:file:bg-purple-600 transition duration-200"
              onChange={handleImageChange}
            />
            <p className="text-sm text-gray-400 mt-2">
              Unggah screenshot chart Anda (misalnya dari TradingView, MT4/MT5). Pastikan chart jelas.
            </p>
          </div>

          {imagePreviewUrl && (
            <div className="mt-4 border border-gray-600 rounded-xl p-4 bg-gray-700/30">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Pratinjau Gambar:</h3>
              <img src={imagePreviewUrl} alt="Pratinjau Chart" className="max-w-full h-auto rounded-lg shadow-md" />
            </div>
          )}

          <div>
            <label htmlFor="selectedStrategy" className="block text-base font-medium text-purple-300 mb-2">Pilih Strategi Analisis</label>
            <select
              id="selectedStrategy"
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500 rounded-xl text-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200"
              value={selectedStrategy}
              onChange={(e) => setSelectedStrategy(e.target.value)}
            >
              <option value="SMC">Smart Money Concept (SMC)</option>
              <option value="ICT">Inner Circle Trader (ICT)</option>
              <option value="Price Action">Price Action</option>
              <option value="CRT">Contextualized Trading (CRT)</option>
            </select>
            <p className="text-sm text-gray-400 mt-2">
              Pilih strategi trading yang ingin digunakan AI untuk menganalisis gambar Anda.
            </p>
          </div>

          <div>
            <label htmlFor="timeframe" className="block text-base font-medium text-purple-300 mb-2">Pilih Timeframe Chart</label>
            <select
              id="timeframe"
              className="w-full px-4 py-3 bg-gray-700/50 border border-purple-500 rounded-xl text-lg text-white focus:ring-2 focus:ring-purple-400 focus:border-purple-400 transition duration-200"
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
            >
              <option value="M15">M15</option>
              <option value="M30">M30</option>
              <option value="H1">H1</option>
              <option value="H4">H4</option>
            </select>
            <p className="text-sm text-gray-400 mt-2">
              Pilih timeframe yang sesuai dengan gambar chart yang Anda unggah.
            </p>
          </div>

          {errorMessage && (
            <div className="bg-red-600 bg-opacity-30 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-sm" role="alert">
              {errorMessage}
            </div>
          )}

          <button
            onClick={handleAnalyze}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold py-4 px-8 rounded-xl text-xl shadow-lg transform hover:scale-105 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-70"
            disabled={loadingAnalysis || !chartImage}
          >
            {loadingAnalysis ? <LoadingSpinner /> : 'Analisa Gambar Chart dengan AI'}
          </button>
        </div>

        {analysisResult && (
          <div className="mt-8 p-8 bg-gray-700 rounded-3xl border border-purple-600/50 shadow-xl">
            <h3 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-blue-500 mb-6">Rekomendasi Analisis:</h3>
            {analysisResult.length > 0 ? (
              <div className="space-y-4">
                {analysisResult.map((rec, index) => (
                  <div key={index} className="p-5 bg-gray-600 rounded-2xl shadow-md border border-gray-500 transform hover:scale-[1.02] transition duration-200">
                    <p className={`text-xl font-semibold ${rec.type === 'BUY' ? 'text-green-300' : 'text-red-300'}`}>
                      {rec.type} di Harga: <span className="font-extrabold">{rec.price}</span>
                    </p>
                    <p className="text-gray-300 mt-2 text-base">
                      Alasan: {rec.reason}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center">Tidak ada rekomendasi yang dihasilkan berdasarkan analisis gambar dan strategi yang dipilih. Coba unggah gambar yang lebih jelas atau dengan kondisi market yang lebih khas {selectedStrategy}.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// --- Komponen Utama Aplikasi Analisis ---
const AnalysisApp = () => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdn.tailwindcss.com';
    document.head.appendChild(script);
  }, []);

  return (
    <AuthProvider>
      <div className="font-inter">
        <UserDashboard /> {/* Langsung tampilkan dashboard tanpa login */}
      </div>
    </AuthProvider>
  );
};

export default AnalysisApp;
