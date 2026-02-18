import React, { useState, useEffect } from 'react';
import { Search, Loader2, ExternalLink, AlertCircle, BarChart2, Table } from 'lucide-react';
// Import Recharts components
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const App = () => {
  const [selectedQuery, setSelectedQuery] = useState('CNN and YOLO deep learning models in crime detection papers');
  const [results, setResults] = useState([]);
  const [analysisData, setAnalysisData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    "CNN and YOLO deep learning models in crime detection papers",
    "RNN and LSTM architectures for criminal profiling research",
    "Transformer and BERT networks for forensic text classification",
    "GAN models for synthetic forensic data generation papers"
  ];

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/results');
      if (response.ok) {
        const data = await response.json();
        setResults(data.data || []);
        setAnalysisData(data.analysis || []);
      }
    } catch (err) {
      console.error("Initial fetch failed:", err);
    }
  };

  const handleScrape = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('http://127.0.0.1:5000/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ queries: [selectedQuery] }),
      });

      if (!response.ok) throw new Error('Backend error or rate limited');

      const data = await response.json();
      setResults(data.data);
      setAnalysisData(data.analysis); 
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">SERP Analyzer</h1>
          <p className="text-gray-600">Multithreaded Scraper & Deep Learning Model Visualization</p>
        </header>

        {/* Form Section */}
        <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
          <form onSubmit={handleScrape} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">Select Research Category</label>
            <div className="flex gap-4">
              <select
                className="flex-1 p-3 border border-gray-300 rounded-md outline-none bg-white text-gray-800"
                value={selectedQuery}
                onChange={(e) => setSelectedQuery(e.target.value)}
                disabled={loading}
              >
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-semibold flex items-center gap-2 disabled:bg-blue-300 transition-colors"
              >
                {loading ? <Loader2 className="animate-spin" size={20} /> : <Search size={20} />}
                {loading ? 'Analyzing...' : 'Fetch & Analyze'}
              </button>
            </div>
          </form>
        </section>

        {/* Error Handling */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 flex items-center gap-3">
            <AlertCircle size={20} />
            <p>{error}</p>
          </div>
        )}

        {/* Visualization Section */}
        {analysisData.length > 0 && (
          <section className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
            <div className="flex items-center gap-2 mb-6 border-b pb-4">
              <BarChart2 className="text-blue-600" size={24} />
              <h2 className="text-xl font-semibold text-gray-800">Deep Learning Model Frequency</h2>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" stroke="#4B5563" />
                  <YAxis allowDecimals={false} stroke="#4B5563" />
                  <Tooltip cursor={{fill: '#F3F4F6'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                  <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* Results Table Section */}
        <section className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center gap-2 justify-between">
            <div className="flex items-center gap-2">
              <Table className="text-blue-600" size={20} />
              <h2 className="font-semibold text-gray-700">Recent Findings ({results.length})</h2>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100 text-xs uppercase text-gray-600 font-bold">
                  <th className="px-6 py-3 border-b">Category</th>
                  <th className="px-6 py-3 border-b">Document Title</th>
                  <th className="px-6 py-3 border-b">Access</th>
                </tr>
              </thead>
              <tbody>
                {results.length > 0 ? (
                  results.map((res, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 border-b text-sm text-blue-600 font-semibold">{res.query}</td>
                      <td className="px-6 py-4 border-b text-sm text-gray-800 leading-relaxed">{res.title}</td>
                      <td className="px-6 py-4 border-b text-sm">
                        <a 
                          href={res.link} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="text-blue-500 hover:text-blue-700 font-medium inline-flex items-center gap-1"
                        >
                          View Source <ExternalLink size={14} />
                        </a>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-6 py-12 text-center text-gray-500 italic">
                      Ready for analysis. Select a category and start scraping.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
};

export default App;