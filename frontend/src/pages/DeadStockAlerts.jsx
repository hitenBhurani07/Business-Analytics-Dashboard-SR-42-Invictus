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
            seasonal: <FiTarget className="w-5 h-5" />
        };
        return icons[category?.toLowerCase()] || <HiOutlineSparkles className="w-5 h-5" />;
    };

    const getCategoryColor = (category) => {
        const colors = {
            bundling: { bg: 'bg-blue-50', border: 'border-blue-500', text: 'text-blue-700', icon: 'text-blue-600' },
            discount: { bg: 'bg-amber-50', border: 'border-amber-500', text: 'text-amber-700', icon: 'text-amber-600' },
            crosssell: { bg: 'bg-emerald-50', border: 'border-emerald-500', text: 'text-emerald-700', icon: 'text-emerald-600' },
            promotion: { bg: 'bg-purple-50', border: 'border-purple-500', text: 'text-purple-700', icon: 'text-purple-600' },
            bulk: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', icon: 'text-orange-600' },
            seasonal: { bg: 'bg-pink-50', border: 'border-pink-500', text: 'text-pink-700', icon: 'text-pink-600' }
        };
        return colors[category?.toLowerCase()] || { bg: 'bg-slate-50', border: 'border-slate-300', text: 'text-slate-700', icon: 'text-slate-600' };
    };

    const getRiskColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return { bg: 'bg-red-50', border: 'border-red-200', badge: 'bg-red-100 text-red-800', text: 'text-red-700' };
            case 'medium':
                return { bg: 'bg-yellow-50', border: 'border-yellow-200', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-700' };
            case 'low':
                return { bg: 'bg-green-50', border: 'border-green-200', badge: 'bg-green-100 text-green-800', text: 'text-green-700' };
            default:
                return { bg: 'bg-blue-50', border: 'border-blue-200', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-700' };
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <AppNavbar />
            
            <main className="flex-grow">
                {/* Hero Section */}
                {!analyzed && (
                    <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
                        <div className="max-w-6xl mx-auto text-center">
                            <div className="inline-flex items-center px-4 py-2 bg-white rounded-full shadow-sm mb-8">
                                <HiOutlineSparkles className="w-4 h-4 text-indigo-600 mr-2" />
                                <span className="text-indigo-600 font-semibold text-sm">AI-Powered Inventory Intelligence</span>
                            </div>
                            
                            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                                Unlock Hidden <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Profit</span> in Your Inventory
                            </h1>
                            
                            <p className="text-xl sm:text-2xl text-slate-700 max-w-4xl mx-auto mb-12 leading-relaxed">
                                Instantly identify dead stock and get actionable business strategies to move slow-moving inventory. Maximize revenue with AI-powered solutions.
                            </p>

                            <button
                                onClick={analyzeDeadStock}
                                disabled={loading}
                                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-10 py-5 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                        Analyzing Your Inventory...
                                    </>
                                ) : (
                                    <>
                                        <FiTrendingUp className="w-5 h-5" />
                                        Analyze Dead Stock
                                    </>
                                )}
                            </button>

                            {/* Feature Highlight */}
                            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
                                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3 font-bold text-blue-600">5</div>
                                    <p className="text-slate-700 font-semibold">Actionable Solutions</p>
                                    <p className="text-slate-600 text-sm mt-1">Per dead stock item</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3 font-bold text-indigo-600">AI-Powered</div>
                                    <p className="text-slate-700 font-semibold">Smart Analysis</p>
                                    <p className="text-slate-600 text-sm mt-1">Using Mistral AI</p>
                                </div>
                                <div className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                                    <div className="text-3xl mb-3 font-bold text-purple-600">Instant</div>
                                    <p className="text-slate-700 font-semibold">Real-Time Results</p>
                                    <p className="text-slate-600 text-sm mt-1">In 5-15 seconds</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Results Section */}
                {analyzed && analysis && (
                    <div className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
                        <div className="max-w-6xl mx-auto">
                    {error && (
                        <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 font-semibold">
                            {error}
                        </div>
                    )}

                    {/* Summary Cards */}
                    {analysis.deadStockAlerts && (
                        <div className="mb-12 grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-blue-500">
                                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Dead Stock Items</p>
                                <p className="text-4xl font-bold text-blue-600 mt-2">{analysis.deadStockAlerts.length}</p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-red-500">
                                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">High Risk Items</p>
                                <p className="text-4xl font-bold text-red-600 mt-2">
                                    {analysis.deadStockAlerts.filter(a => a.risk_level?.toLowerCase() === 'high').length}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-yellow-500">
                                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Total Stock Units</p>
                                <p className="text-4xl font-bold text-yellow-600 mt-2">
                                    {analysis.deadStockAlerts.reduce((sum, a) => sum + (a.currentStock || 0), 0)}
                                </p>
                            </div>
                            <div className="bg-white rounded-xl p-6 shadow-sm border-l-4 border-green-500">
                                <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Potential Revenue</p>
                                <p className="text-4xl font-bold text-green-600 mt-2">
                                    +{Math.round(analysis.deadStockAlerts.reduce((sum, a) => sum + (a.currentStock || 0), 0) * 0.4)}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Analysis Summary */}
                    {analysis.summary && (
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-4">Analysis Summary</h2>
                            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                                <p className="text-lg text-slate-800 leading-relaxed">{analysis.summary}</p>
                            </div>
                        </div>
                    )}

                    {/* Dead Stock Items */}
                    {analysis.deadStockAlerts && analysis.deadStockAlerts.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Dead Stock Items Identified</h2>
                            <div className="space-y-6">
                                {analysis.deadStockAlerts.map((alert, index) => {
                                    const riskColor = getRiskColor(alert.risk_level);
                                    return (
                                        <div key={index} className={`${riskColor.bg} border ${riskColor.border} rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300`}>
                                            <div className="flex items-start justify-between mb-6">
                                                <div>
                                                    <h3 className="text-2xl font-bold text-slate-900">{alert.itemName}</h3>
                                                    <p className={`text-sm font-semibold mt-1 ${riskColor.text}`}>{alert.reason}</p>
                                                </div>
                                                <span className={`${riskColor.badge} px-4 py-2 rounded-lg font-bold text-sm uppercase tracking-wide`}>
                                                    {alert.risk_level?.toUpperCase() || 'MEDIUM'} Risk
                                                </span>
                                            </div>

                                            {/* Metrics Grid */}
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 pb-8 border-b border-slate border-opacity-30">
                                                <div>
                                                    <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Current Stock</p>
                                                    <p className="text-2xl font-bold text-slate-900 mt-2">{alert.currentStock || alert.quantity || 'N/A'} units</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Sales Count</p>
                                                    <p className="text-2xl font-bold text-slate-900 mt-2">{alert.salesCount || 0}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Total Sold</p>
                                                    <p className="text-2xl font-bold text-slate-900 mt-2">{alert.quantitySold || 0} units</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-700 text-sm font-semibold uppercase tracking-wide">Last Sale</p>
                                                    <p className="text-2xl font-bold text-slate-900 mt-2">{alert.daysLastSold || 'N/A'} days ago</p>
                                                </div>
                                            </div>

                                            {/* Business Solutions */}
                                            {alert.solutions && alert.solutions.length > 0 && (
                                                <div>
                                                    <h4 className="text-lg font-bold text-slate-900 mb-6 flex items-center">
                                                        <HiOutlineSparkles className="w-5 h-5 mr-2 text-indigo-600" />
                                                        Recommended Action Plans
                                                    </h4>
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                                        {alert.solutions.map((solution, solIndex) => {
                                                            const categoryColor = getCategoryColor(solution.category);
                                                            return (
                                                                <div 
                                                                    key={solIndex}
                                                                    className={`${categoryColor.bg} border-l-4 ${categoryColor.border} rounded-lg p-6 shadow-sm hover:shadow-md transition-all duration-300`}
                                                                >
                                                                    <div className="flex items-start justify-between mb-3">
                                                                        <div className={`${categoryColor.icon} text-2xl`}>
                                                                            {getCategoryIcon(solution.category)}
                                                                        </div>
                                                                        <span className={`${categoryColor.bg} border ${categoryColor.border} px-3 py-1 rounded text-xs font-bold uppercase tracking-wider ${categoryColor.text}`}>
                                                                            {solution.category?.toUpperCase()}
                                                                        </span>
                                                                    </div>
                                                                    <h5 className={`text-base font-bold mb-2 ${categoryColor.text}`}>{solIndex + 1}. {solution.title}</h5>
                                                                    <p className="text-slate-700 text-sm mb-3 leading-relaxed">{solution.description}</p>
                                                                    {solution.expectedOutcome && (
                                                                        <div className="bg-white bg-opacity-70 rounded p-3 border-l-2 border-slate-400">
                                                                            <p className="text-xs font-bold text-slate uppercase tracking-wide">Expected Outcome</p>
                                                                            <p className="text-sm text-slate-700 mt-1 font-semibold">{solution.expectedOutcome}</p>
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
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-12 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="bg-green-100 rounded-full p-4">
                                    <FiTarget className="w-8 h-8 text-green-600" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-green-900 mb-2">Excellent Inventory Health</h3>
                            <p className="text-green-700 text-lg">No dead stock detected. Your inventory is performing well with strong sales velocity across all items.</p>
                        </div>
                    )}

                    {/* Inventory Performance Table */}
                    {analysis.inventoryData && analysis.inventoryData.length > 0 && (
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Complete Inventory Performance</h2>
                            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate">
                                <div className="overflow-x-auto">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-b border-slate">
                                            <tr>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Item Name</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Current Stock</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Total Sold</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Sales Count</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Last Sale</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Turnover</th>
                                                <th className="px-6 py-4 text-left text-sm font-bold text-slate-900 uppercase tracking-wide">Margin</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-200">
                                            {analysis.inventoryData.map((item, index) => (
                                                <tr key={index} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">{item.itemName}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.quantity}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.totalQuantitySold}</td>
                                                    <td className="px-6 py-4 text-sm text-slate-700 font-medium">{item.salesCount}</td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            item.daysLastSold === 999 ? 'bg-red-100 text-red-800' :
                                                            item.daysLastSold > 30 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-green-100 text-green-800'
                                                        }`}>
                                                            {item.daysLastSold === 999 ? 'Never' : item.daysLastSold + 'd'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                                            item.turnover_ratio > 0.5 ? 'bg-green-100 text-green-800' :
                                                            item.turnover_ratio > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                                                            'bg-red-100 text-red-800'
                                                        }`}>
                                                            {item.turnover_ratio}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-sm font-bold text-slate-900">{item.profit_margin}%</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Detailed Analysis */}
                    {analysis.overallAnalysis && (
                        <div className="mt-12">
                            <h2 className="text-3xl font-bold text-slate-900 mb-8">Detailed Analysis Report</h2>
                            <div className="bg-white rounded-xl shadow-sm p-8 border border-slate ">
                                <div className="prose prose-lg max-w-none">
                                    <p className="text-slate leading-relaxed whitespace-pre-wrap">{analysis.overallAnalysis}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Button */}
                    <div className="mt-12 text-center">
                        <button
                            onClick={() => setAnalyzed(false)}
                            className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 text-white px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <FiTrendingUp className="w-5 h-5" />
                            Run New Analysis
                        </button>
                    </div>
                        </div>
                    </div>
                    )}

                {/* Loading State */}
                {loading && (
                    <div className="pt-32 pb-32 px-4">
                        <div className="max-w-2xl mx-auto text-center">
                            <div className="flex justify-center mb-8">
                                <div className="relative w-16 h-16">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full animate-spin"></div>
                                    <div className="absolute inset-2 bg-white rounded-full"></div>
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Your Inventory</h3>
                            <p className="text-slate-600">Our AI is reviewing your inventory and sales data to identify opportunities...</p>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && !analyzed && (
                    <div className="pt-32 pb-32 px-4">
                        <div className="max-w-2xl mx-auto">
                            <div className="bg-red-50 border border-red-200 rounded-xl p-8">
                                <div className="flex items-start">
                                    <FiAlertTriangle className="w-8 h-8 text-red-600 mt-1 mr-4 flex-shrink-0" />
                                    <div>
                                        <h3 className="text-lg font-bold text-red-900 mb-2">Analysis Failed</h3>
                                        <p className="text-red-700 mb-4">{error}</p>
                                        <button
                                            onClick={analyzeDeadStock}
                                            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                        >
                                            Try Again
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            
            <Footer />
        </div>
    );
};

export default DeadStockAlerts;

