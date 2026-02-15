import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
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

    const getRiskStyle = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return {backgroundColor: '#FEE2E2', borderColor: '#EF4444', color: '#991B1B', borderLeft: '4px solid #EF4444'};
            case 'medium':
                return {backgroundColor: '#FEF3C7', borderColor: '#FCD34D', color: '#92400E', borderLeft: '4px solid #FCD34D'};
            case 'low':
                return {backgroundColor: '#DCFCE7', borderColor: '#10B981', color: '#166534', borderLeft: '4px solid #10B981'};
            default:
                return {backgroundColor: '#DBEAFE', borderColor: '#3B82F6', color: '#1E40AF', borderLeft: '4px solid #3B82F6'};
        }
    };

    const getRiskBadgeColor = (riskLevel) => {
        switch (riskLevel?.toLowerCase()) {
            case 'high':
                return {backgroundColor: '#EF4444', color: '#FFFFFF'};
            case 'medium':
                return {backgroundColor: '#F59E0B', color: '#FFFFFF'};
            case 'low':
                return {backgroundColor: '#10B981', color: '#FFFFFF'};
            default:
                return {backgroundColor: '#2563EB', color: '#FFFFFF'};
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            <AppNavbar />
            
            <main className="flex-grow pt-20">
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    {error && (
                        <div className="mb-4 p-4 rounded" style={{backgroundColor: '#FEE2E2', borderColor: '#EF4444', border: '1px solid #EF4444', color: '#991B1B'}}>
                            {error}
                        </div>
                    )}

                    {!analyzed && (
                        <div className="shadow rounded-lg p-6 mb-6" style={{backgroundColor: '#FFFFFF'}}>
                            <h2 className="text-2xl font-semibold mb-4" style={{color: '#111827'}}>Analyze Your Inventory</h2>
                            <p className="mb-6" style={{color: '#6B7280'}}>
                                Our AI-powered system will analyze your inventory and sales data to identify dead stock items that aren't selling well compared to others.
                            </p>
                            <button
                                onClick={analyzeDeadStock}
                                disabled={loading}
                                className="px-6 py-3 text-white rounded-lg font-semibold transition disabled:opacity-50"
                                style={{backgroundColor: '#2563EB'}}
                            >
                                {loading ? 'Analyzing...' : 'Analyze Dead Stock'}
                            </button>
                        </div>
                    )}

                    {analyzed && analysis && (
                        <>
                            {/* Summary Section */}
                            <div className="shadow rounded-lg p-6 mb-6" style={{backgroundColor: '#FFFFFF'}}>
                                <h2 className="text-2xl font-semibold mb-4" style={{color: '#111827'}}>Analysis Summary</h2>
                                <p className="mb-4" style={{color: '#111827'}}>
                                    {analysis.summary || analysis.overallAnalysis || 'Analysis completed'}
                                </p>
                                <button
                                    onClick={() => setAnalyzed(false)}
                                    className="px-4 py-2 text-white rounded font-semibold transition"
                                    style={{backgroundColor: '#6B7280'}}
                                >
                                    Run New Analysis
                                </button>
                            </div>

                            {/* Dead Stock Alerts */}
                            {analysis.deadStockAlerts && analysis.deadStockAlerts.length > 0 && (
                                <div className="mb-6">
                                    <h3 className="text-2xl font-semibold mb-4" style={{color: '#111827'}}>Dead Stock Items Detected</h3>
                                    <div className="space-y-4">
                                        {analysis.deadStockAlerts.map((alert, index) => (
                                            <div
                                                key={index}
                                                className="rounded-lg p-4"
                                                style={getRiskStyle(alert.risk_level)}
                                            >
                                                <div className="flex items-start justify-between mb-2">
                                                    <h4 className="text-lg font-semibold">{alert.itemName}</h4>
                                                    <span className="px-3 py-1 rounded-full text-sm font-semibold" style={getRiskBadgeColor(alert.risk_level)}>
                                                        {alert.risk_level?.toUpperCase()}
                                                    </span>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                                                    <div>
                                                        <p style={{color: 'inherit'}} className="opacity-75">Current Stock</p>
                                                        <p className="font-semibold">{alert.currentStock || alert.quantity || 'N/A'}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{color: 'inherit'}} className="opacity-75">Sales Count</p>
                                                        <p className="font-semibold">{alert.salesCount || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{color: 'inherit'}} className="opacity-75">Quantity Sold</p>
                                                        <p className="font-semibold">{alert.quantitySold || 0}</p>
                                                    </div>
                                                    <div>
                                                        <p style={{color: 'inherit'}} className="opacity-75">Urgency</p>
                                                        <p className="font-semibold">{alert.urgency || 'Medium'}</p>
                                                    </div>
                                                </div>

                                                <div className="mb-3">
                                                    <p className="text-sm font-semibold mb-1">Reason</p>
                                                    <p className="text-sm">{alert.reason}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold mb-1">Recommendation</p>
                                                    <p className="text-sm">{alert.recommendation}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {analysis.deadStockAlerts && analysis.deadStockAlerts.length === 0 && (
                                <div className="rounded-lg p-6 mb-6" style={{backgroundColor: '#DCFCE7', borderColor: '#10B981', border: '1px solid #10B981', color: '#166534'}}>
                                    <h3 className="text-lg font-semibold mb-2">Great News!</h3>
                                    <p>No dead stock detected. Your inventory is selling well!</p>
                                </div>
                            )}

                            {/* Overall Analysis */}
                            {analysis.overallAnalysis && (
                                <div className="shadow rounded-lg p-6" style={{backgroundColor: '#FFFFFF'}}>
                                    <h2 className="text-2xl font-semibold mb-4" style={{color: '#111827'}}>Detailed Analysis</h2>
                                    <div className="whitespace-pre-wrap" style={{color: '#111827'}}>
                                        {analysis.overallAnalysis}
                                    </div>
                                </div>
                            )}

                            {/* Inventory Data Table */}
                            {analysis.inventoryData && analysis.inventoryData.length > 0 && (
                                <div className="shadow rounded-lg p-6 mt-6" style={{backgroundColor: '#FFFFFF'}}>
                                    <h2 className="text-2xl font-semibold mb-4" style={{color: '#111827'}}>Inventory Performance Data</h2>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="border-b" style={{backgroundColor: '#F9FAFB'}}>
                                                <tr>
                                                    <th className="px-4 py-2 text-left">Item Name</th>
                                                    <th className="px-4 py-2 text-left">Stock</th>
                                                    <th className="px-4 py-2 text-left">Sold</th>
                                                    <th className="px-4 py-2 text-left">Sales Count</th>
                                                    <th className="px-4 py-2 text-left">Turnover Ratio</th>
                                                    <th className="px-4 py-2 text-left">Profit Margin</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {analysis.inventoryData.map((item, index) => (
                                                    <tr key={index} className="border-b hover:bg-gray-50">
                                                        <td className="px-4 py-2">{item.itemName}</td>
                                                        <td className="px-4 py-2">{item.quantity}</td>
                                                        <td className="px-4 py-2">{item.totalQuantitySold}</td>
                                                        <td className="px-4 py-2">{item.salesCount}</td>
                                                        <td className="px-4 py-2">
                                                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                                                item.turnover_ratio > 0.5 ? 'bg-green-100 text-green-800' :
                                                                item.turnover_ratio > 0.2 ? 'bg-yellow-100 text-yellow-800' :
                                                                'bg-red-100 text-red-800'
                                                            }`}>
                                                                {item.turnover_ratio}
                                                            </span>
                                                        </td>
                                                        <td className="px-4 py-2">{item.profit_margin}%</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </>
                    )}

                    {loading && (
                        <div className="bg-white shadow rounded-lg p-6 text-center">
                            <p className="text-lg text-gray-600 mb-4">AI is analyzing your inventory...</p>
                            <div className="flex justify-center">
                                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default DeadStockAlerts;
