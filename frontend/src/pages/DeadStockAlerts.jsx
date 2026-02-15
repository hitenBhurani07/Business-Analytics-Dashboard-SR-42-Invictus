


import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { BiPackage, BiDollar, BiLink, BiGift, BiMobile } from 'react-icons/bi';
import { FiTrendingUp, FiAlertTriangle, FiTarget } from 'react-icons/fi';
import { HiOutlineSparkles } from 'react-icons/hi';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/landing/Footer';

const DeadStockAlerts = () => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [analyzed, setAnalyzed] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const analyzeDeadStock = async () => {
    setLoading(true);
    setError('');
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post('http://localhost:5000/api/deadstock/analyze', {}, { headers });
      setAnalysis(res.data);
      setAnalyzed(true);
    } catch (err) {
      setError('Error analyzing dead stock: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category) => {
    const icons = {
      bundling: <BiPackage className="w-5 h-5" />,
      discount: <BiDollar className="w-5 h-5" />,
      crosssell: <BiLink className="w-5 h-5" />,
      promotion: <BiGift className="w-5 h-5" />,
      bulk: <BiMobile className="w-5 h-5" />,
      seasonal: <HiOutlineSparkles className="w-5 h-5" />
    };
    return icons[category?.toLowerCase()] || <FiTarget className="w-5 h-5" />;
  };

  const getCategoryColor = (category) => {
    const colors = {
      bundling: { bg: 'bg-white', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-600' },
      discount: { bg: 'bg-white', border: 'border-amber-500', text: 'text-amber-700', icon: 'text-amber-600' },
      crosssell: { bg: 'bg-white', border: 'border-emerald-500', text: 'text-emerald-700', icon: 'text-emerald-600' },
      promotion: { bg: 'bg-white', border: 'border-purple-500', text: 'text-purple-700', icon: 'text-purple-600' },
      bulk: { bg: 'bg-white', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-600' },
      seasonal: { bg: 'bg-white', border: 'border-pink-500', text: 'text-pink-700', icon: 'text-pink-600' }
    };
    return colors[category?.toLowerCase()] || { bg: 'bg-white', border: 'border-slate-300', text: 'text-slate-700', icon: 'text-slate-600' };
  };

  const getRiskColor = (riskLevel) => {
    switch (riskLevel?.toLowerCase()) {
      case 'high':
        return { bg: 'bg-white', border: 'border-red-200', badge: 'bg-red-100 text-red-800', text: 'text-red-700' };
      case 'medium':
        return { bg: 'bg-white', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-700' };
      case 'low':
        return { bg: 'bg-white', border: 'border-green-200', badge: 'bg-green-100 text-green-800', text: 'text-green-700' };
      default:
        return { bg: 'bg-white', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-700' };
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <AppNavbar />

      {/* Hero Section */}
      {!analyzed && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <HiOutlineSparkles className="w-5 h-5" />
              AI-Powered Inventory Intelligence
            </div>
            <h1 className="text-5xl font-bold text-slate-900 mb-4">
              Unlock Hidden Profit in Your Inventory
            </h1>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Instantly identify dead stock and get actionable business strategies to move slow-moving inventory. Maximize revenue with AI-powered solutions.
            </p>
          </div>

          <div className="flex justify-center mb-12">
            {loading ? (
              <>
                <button disabled className="bg-blue-700 text-white px-12 py-5 rounded-2xl font-semibold text-lg shadow-2xl flex items-center gap-3 cursor-not-allowed opacity-75">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  Analyzing Your Inventory...
                </button>
              </>
            ) : (
              <>
                <button onClick={analyzeDeadStock} className="bg-blue-700 hover:bg-blue-600 text-white px-12 py-5 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-300 transition-all duration-300 flex items-center gap-3 hover:scale-105">
                  <FiTrendingUp className="w-6 h-6" />
                  Analyze Dead Stock
                </button>
              </>
            )}
          </div>

          {/* Feature Highlight */}
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-blue-700 mb-2">5+</div>
              <div className="font-semibold text-slate-900 mb-1">Actionable Solutions</div>
              <div className="text-sm text-slate-600">Per dead stock item</div>
            </div>
            <div className="bg-white border-2 border-purple-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-purple-700 mb-2">AI-Powered</div>
              <div className="font-semibold text-slate-900 mb-1">Smart Analysis</div>
              <div className="text-sm text-slate-600">Using Mistral AI</div>
            </div>
            <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 text-center shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-4xl font-bold text-emerald-700 mb-2">Instant</div>
              <div className="font-semibold text-slate-900 mb-1">Real-Time Results</div>
              <div className="text-sm text-slate-600">In 5-15 seconds</div>
            </div>
          </div>
        </div>
      )}

      {/* Results Section */}
      {analyzed && analysis && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-xl mb-6">
              {error}
            </div>
          )}

          {/* Summary Cards */}
          {analysis.deadStockAlerts && (
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FiAlertTriangle className="w-6 h-6 text-blue-600" />
                  <h3 className="font-semibold text-slate-700">Dead Stock Items</h3>
                </div>
                <div className="text-4xl font-bold text-blue-700">{analysis.deadStockAlerts.length}</div>
              </div>
              <div className="bg-white border-2 border-red-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FiAlertTriangle className="w-6 h-6 text-red-600" />
                  <h3 className="font-semibold text-slate-700">High Risk Items</h3>
                </div>
                <div className="text-4xl font-bold text-red-700">
                  {analysis.deadStockAlerts.filter(a => a.risk_level?.toLowerCase() === 'high').length}
                </div>
              </div>
              <div className="bg-white border-2 border-amber-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <BiPackage className="w-6 h-6 text-amber-600" />
                  <h3 className="font-semibold text-slate-700">Total Stock Units</h3>
                </div>
                <div className="text-4xl font-bold text-amber-700">
                  {analysis.deadStockAlerts.reduce((sum, a) => sum + (a.currentStock || 0), 0)}
                </div>
              </div>
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <FiTrendingUp className="w-6 h-6 text-emerald-600" />
                  <h3 className="font-semibold text-slate-700">Potential Revenue</h3>
                </div>
                <div className="text-4xl font-bold text-emerald-700">
                  +{Math.round(analysis.deadStockAlerts.reduce((sum, a) => sum + (a.currentStock || 0), 0) * 0.4)}%
                </div>
              </div>
            </div>
          )}

          {/* Analysis Summary */}
          {analysis.summary && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <HiOutlineSparkles className="w-7 h-7 text-blue-600" />
                Analysis Summary
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg">{analysis.summary}</p>
            </div>
          )}

          {/* Dead Stock Items */}
          {analysis.deadStockAlerts && analysis.deadStockAlerts.length > 0 && (
            <div className="mb-12">
              <h2 className="text-3xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <FiAlertTriangle className="w-8 h-8 text-red-600" />
                Dead Stock Items Identified
              </h2>
              <div className="space-y-6">
                {analysis.deadStockAlerts.map((alert, index) => {
                  const riskColor = getRiskColor(alert.risk_level);
                  return (
                    <div key={index} className={`${riskColor.bg} border-2 ${riskColor.border} rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow`}>
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-2xl font-bold text-slate-900 mb-2">{alert.itemName}</h3>
                          <p className="text-slate-600">{alert.reason}</p>
                        </div>
                        <span className={`${riskColor.badge} px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2`}>
                          <FiAlertTriangle className="w-4 h-4" />
                          {alert.risk_level?.toUpperCase() || 'MEDIUM'} Risk
                        </span>
                      </div>

                      {/* Metrics Grid */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="text-sm text-slate-600 mb-1">Current Stock</div>
                          <div className="text-2xl font-bold text-slate-900">{alert.currentStock || alert.quantity || 'N/A'} units</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="text-sm text-slate-600 mb-1">Sales Count</div>
                          <div className="text-2xl font-bold text-slate-900">{alert.salesCount || 0}</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="text-sm text-slate-600 mb-1">Total Sold</div>
                          <div className="text-2xl font-bold text-slate-900">{alert.quantitySold || 0} units</div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-4">
                          <div className="text-sm text-slate-600 mb-1">Last Sale</div>
                          <div className="text-2xl font-bold text-slate-900">{alert.daysLastSold || 'N/A'} days ago</div>
                        </div>
                      </div>

                      {/* Business Solutions */}
                      {alert.solutions && alert.solutions.length > 0 && (
                        <div>
                          <h4 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                            <HiOutlineSparkles className="w-6 h-6 text-blue-600" />
                            Recommended Action Plans
                          </h4>
                          <div className="grid md:grid-cols-2 gap-4">
                            {alert.solutions.map((solution, solIndex) => {
                              const categoryColor = getCategoryColor(solution.category);
                              return (
                                <div key={solIndex} className={`${categoryColor.bg} border-2 ${categoryColor.border} rounded-xl p-5 hover:shadow-md transition-shadow`}>
                                  <div className="flex items-center gap-3 mb-3">
                                    <div className={`${categoryColor.icon}`}>
                                      {getCategoryIcon(solution.category)}
                                    </div>
                                    <span className={`${categoryColor.text} text-xs font-bold tracking-wider`}>
                                      {solution.category?.toUpperCase()}
                                    </span>
                                  </div>
                                  <h5 className="font-bold text-slate-900 mb-2">
                                    {solIndex + 1}. {solution.title}
                                  </h5>
                                  <p className="text-slate-600 text-sm mb-3">{solution.description}</p>
                                  {solution.expectedOutcome && (
                                    <div className="bg-white border border-slate-200 rounded-lg p-3 mt-3">
                                      <div className="text-xs font-semibold text-slate-500 mb-1">Expected Outcome</div>
                                      <div className="text-sm text-slate-700">{solution.expectedOutcome}</div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Dead Stock Message */}
          {analysis.deadStockAlerts && analysis.deadStockAlerts.length === 0 && (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-12 text-center shadow-lg">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <FiTrendingUp className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-3xl font-bold text-slate-900 mb-3">Excellent Inventory Health</h3>
              <p className="text-slate-600 text-lg">No dead stock detected. Your inventory is performing well with strong sales velocity across all items.</p>
            </div>
          )}

          {/* Inventory Performance Table */}
          {analysis.inventoryData && analysis.inventoryData.length > 0 && (
            <div className="bg-white border-2 border-slate-200 rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                <BiPackage className="w-7 h-7 text-slate-700" />
                Complete Inventory Performance
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-slate-200">
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Item Name</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Current Stock</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Total Sold</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Sales Count</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Last Sale</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Turnover</th>
                      <th className="text-left py-4 px-4 font-bold text-slate-700">Margin</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analysis.inventoryData.map((item, index) => (
                      <tr key={index} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-4 font-semibold text-slate-900">{item.itemName}</td>
                        <td className="py-4 px-4 text-slate-700">{item.quantity}</td>
                        <td className="py-4 px-4 text-slate-700">{item.totalQuantitySold}</td>
                        <td className="py-4 px-4 text-slate-700">{item.salesCount}</td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.daysLastSold > 30 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {item.daysLastSold === 999 ? 'Never' : item.daysLastSold + 'd'}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${item.turnover_ratio > 0.5 ? 'bg-green-100 text-green-800' : item.turnover_ratio > 0.2 ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                            {item.turnover_ratio}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-slate-700">{item.profit_margin}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Detailed Analysis */}
          {analysis.overallAnalysis && (
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-2xl p-8 mb-8 shadow-lg">
              <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3">
                <HiOutlineSparkles className="w-7 h-7 text-indigo-600" />
                Detailed Analysis Report
              </h2>
              <p className="text-slate-700 leading-relaxed text-lg whitespace-pre-line">{analysis.overallAnalysis}</p>
            </div>
          )}

          {/* Action Button */}
          <div className="text-center">
            <button onClick={() => setAnalyzed(false)} className="inline-flex items-center gap-2 bg-blue-700 hover:bg-blue-600 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              <FiTrendingUp className="w-5 h-5" />
              Run New Analysis
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-20 w-20 border-b-4 border-blue-700 mb-6"></div>
          <h3 className="text-2xl font-bold text-slate-900 mb-2">Analyzing Your Inventory</h3>
          <p className="text-slate-600">Our AI is reviewing your inventory and sales data to identify opportunities...</p>
        </div>
      )}

      {/* Error State */}
      {error && !analyzed && (
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white border-2 border-red-200 rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FiAlertTriangle className="w-10 h-10 text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">Analysis Failed</h3>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={analyzeDeadStock} className="bg-blue-700 hover:bg-blue-600 text-white px-8 py-3 rounded-xl font-semibold shadow-lg transition-all duration-300">
              Try Again
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default DeadStockAlerts;
