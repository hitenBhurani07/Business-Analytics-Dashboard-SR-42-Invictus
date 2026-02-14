import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = ({ onLogout }) => {
    const [summary, setSummary] = useState(null);
    const [alerts, setAlerts] = useState([]);
    const [inventoryRisk, setInventoryRisk] = useState([]);
    const [cashProjection, setCashProjection] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [stockOpen, setStockOpen] = useState(false);
    const [stockForm, setStockForm] = useState({ itemName: '', addQuantity: '' });
    const [lastUpdated, setLastUpdated] = useState(null);
    const [inventoryAll, setInventoryAll] = useState([]);
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const [summaryRes, alertsRes, riskRes, projectionRes, inventoryRes] = await Promise.all([
                    axios.get('http://localhost:5000/api/dashboard/summary', config),
                    axios.get('http://localhost:5000/api/dashboard/alerts', config),
                    axios.get('http://localhost:5000/api/dashboard/inventory-risk', config),
                    axios.get('http://localhost:5000/api/dashboard/cash-projection', config),
                    axios.get('http://localhost:5000/api/dashboard/inventory', config),
                ]);

                setSummary(summaryRes.data);
                setAlerts(alertsRes.data);
                setInventoryRisk(riskRes.data);
                setCashProjection(projectionRes.data);
                setInventoryAll(inventoryRes.data);
                setLastUpdated(new Date());
            } catch (err) {
                console.error(err);
                setError('Failed to fetch dashboard data');
                if (err.response && err.response.status === 401) {
                    navigate('/login');
                }
            } finally {
                setLoading(false);
            }
    }, [navigate]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        const id = setInterval(() => {
            setLoading(true);
            fetchData();
        }, 30000);
        return () => clearInterval(id);
    }, [fetchData]);

    const submitUpdateStock = async () => {
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const payload = {
                itemName: stockForm.itemName,
                addQuantity: Number(stockForm.addQuantity)
            };
            await axios.post('http://localhost:5000/api/dashboard/update-stock', payload, config);
            setStockOpen(false);
            setStockForm({ itemName: '', addQuantity: '' });
            setLoading(true);
            await fetchData();
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to update stock');
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-gray-50">
            <div className="text-red-500 font-semibold">{error}</div>
        </div>
    );

    // Determine Overall Status
    let statusColor = 'bg-gradient-to-r from-green-500 to-emerald-600';
    let statusIcon = (
        <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    );
    let statusText = 'System Healthy';
    let statusSubtext = 'Operations running smoothly';

    const hasCriticalAlerts = alerts.some(a => a.level === 'red');
    const hasWarningAlerts = alerts.some(a => a.level === 'yellow');

    if (hasCriticalAlerts) {
        statusColor = 'bg-gradient-to-r from-red-600 to-rose-700';
        statusIcon = (
            <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
        );
        statusText = 'CRITICAL RISK DETECTED';
        statusSubtext = 'Immediate action required';
    } else if (hasWarningAlerts) {
        statusColor = 'bg-gradient-to-r from-yellow-500 to-amber-600';
        statusIcon = (
            <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        );
        statusText = 'Warning State';
        statusSubtext = 'Potential risks emerging';
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24 md:pb-8 font-sans">

            {/* Top Navigation */}
            <nav className="bg-white border-b border-gray-200 px-4 py-3 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold">VS</div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Vyapaar<span className="text-blue-600">Sathi</span></h1>
                    </div>
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/analytics"
                            className="text-sm text-gray-600 hover:text-blue-600 font-medium transition-colors"
                        >
                            Analytics
                        </Link>
                        <button
                            onClick={() => {
                                localStorage.removeItem('token');
                                navigate('/login');
                            }}
                            className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">

                {/* 1. Status Card */}
                <div className={`${statusColor} rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-[1.01]`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                                </span>
                                <span>Live Monitoring</span>
                            </div>
                            <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{statusText}</h2>
                            <p className="mt-1 text-white/90 text-lg font-light">{statusSubtext}</p>
                            {lastUpdated && (
                                <p className="mt-2 text-white/70 text-xs">Last updated at {lastUpdated.toLocaleTimeString()}</p>
                            )}
                        </div>
                        <div className="hidden md:block">
                            {statusIcon}
                        </div>
                    </div>
                </div>

                {/* 2. Key Metrics Snapshot */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <MetricCard
                        title="Current Cash"
                        value={`$${summary?.currentCash?.toLocaleString()}`}
                        trend="Real-time"
                        color="blue"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    />
                    <MetricCard
                        title="Today's Sales"
                        value={`$${summary?.todaysSales?.toLocaleString()}`}
                        trend="Daily"
                        color="green"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
                    />
                    <MetricCard
                        title="Today's Expenses"
                        value={`$${summary?.todaysExpenses?.toLocaleString()}`}
                        trend="Daily"
                        color="red"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
                    />
                    <MetricCard
                        title="Low Stock Items"
                        value={summary?.lowStockCount}
                        trend="Action Needed"
                        color="orange"
                        icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* 3. Risk Alerts Section */}
                    <div className="lg:col-span-2">
                        <SectionHeader title="Operational Risks & Alerts" />
                        {alerts.length === 0 ? (
                            <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900">No Active Risks</h3>
                                <p className="text-gray-500 mt-1">Your business is operating within safe parameters.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert, index) => (
                                    <div key={index} className={`flex items-start p-4 rounded-xl border shadow-sm transition-all ${alert.level === 'red'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-yellow-50 border-yellow-200'
                                        }`}>
                                        <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${alert.level === 'red' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
                                            }`}>
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="ml-4 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold uppercase tracking-wide ${alert.level === 'red' ? 'text-red-800' : 'text-yellow-800'
                                                    }`}>
                                                    {alert.type}
                                                </h4>
                                                <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded text-gray-500">Just now</span>
                                            </div>
                                            <p className={`mt-1 text-sm ${alert.level === 'red' ? 'text-red-700' : 'text-yellow-700'
                                                }`}>
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Cash Flow Projection */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <div>
                            <SectionHeader title="48h Cash Projection" className="mb-6" />
                            <div className="relative pt-2">
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-gray-500 text-sm">Now</span>
                                    <span className="text-gray-500 text-sm">In 2 Days</span>
                                </div>
                                <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${cashProjection?.projectedCash < 0 ? 'bg-red-500 w-full' : 'bg-green-500'
                                        }`} style={{ width: '100%' }}></div>
                                </div>
                                <div className="flex justify-between items-center mt-4">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">${summary?.currentCash?.toLocaleString()}</p>
                                        <p className="text-xs text-gray-500">Current Balance</p>
                                    </div>
                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                                    <div className="text-right">
                                        <p className={`text-2xl font-bold ${cashProjection?.projectedCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
                                            ${cashProjection?.projectedCash?.toLocaleString()}
                                        </p>
                                        <p className="text-xs text-gray-500">Projected</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                            <div className="bg-green-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-green-600 uppercase font-semibold">Avg Daily Sales</p>
                                <p className="text-lg font-bold text-green-700">+${cashProjection?.avgDailySales?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-lg text-center">
                                <p className="text-xs text-red-600 uppercase font-semibold">Avg Daily Burn</p>
                                <p className="text-lg font-bold text-red-700">-${cashProjection?.avgDailyExpenses?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>

                </div>

                {/* 5. Inventory Monitor Table */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <SectionHeader title="Critical Inventory Watchlist" className="mb-0" />
                        <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{inventoryRisk.length} Items</span>
                    </div>
                    {inventoryRisk.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            Excellent! No inventory items are at critical risk levels.
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50/50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Item Name</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Current Stock</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Burn Rate/Day</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Runway Remaining</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {inventoryRisk.map((item) => (
                                        <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-gray-900">{item.itemName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.quantity} units</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-gray-500">{item.dailyUsage} units</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${item.daysRemaining < 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                                                    }`}>
                                                    {item.daysRemaining} Days Left
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>

            {/* 6. Quick Action Buttons (Mobile Floating / Desktop Fixed) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-lg md:hidden z-50">
                <div className="flex justify-around">
                    <ActionButton icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} label="Audit" />
                    <ActionButton onClick={() => setStockOpen(true)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Update Stock" />
                </div>
            </div>
            <div className="hidden md:block fixed bottom-8 right-8 z-50">
                <div className="flex space-x-4">
                    <button onClick={() => setStockOpen(true)} className="bg-gray-800 hover:bg-gray-900 text-white shadow-lg px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                        Update Stock
                    </button>
                </div>
            </div>

            {stockOpen && (
                <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-lg p-6 w-96">
                        <h4 className="text-lg font-bold text-gray-800 mb-4">Update Stock</h4>
                        <div className="space-y-3">
                            <select value={stockForm.itemName} onChange={e => setStockForm({ ...stockForm, itemName: e.target.value })} className="w-full border rounded-md px-3 py-2">
                                <option value="">Select Item</option>
                                {inventoryAll.map(it => (
                                    <option key={it._id} value={it.itemName}>{it.itemName} (Stock: {it.quantity})</option>
                                ))}
                            </select>
                            <input type="number" value={stockForm.addQuantity} onChange={e => setStockForm({ ...stockForm, addQuantity: e.target.value })} placeholder="Add Quantity (+/-)" className="w-full border rounded-md px-3 py-2" />
                        </div>
                        <div className="mt-4 flex justify-end gap-2">
                            <button onClick={() => setStockOpen(false)} className="px-4 py-2 rounded-md border">Cancel</button>
                            <button onClick={submitUpdateStock} className="px-4 py-2 rounded-md bg-gray-900 text-white">Save</button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-components for cleaner code
const MetricCard = ({ title, value, trend, color, icon }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        green: 'text-green-600 bg-green-50 border-green-100',
        red: 'text-red-600 bg-red-50 border-red-100',
        orange: 'text-orange-600 bg-orange-50 border-orange-100',
    };

    return (
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-50`}>
                    {icon}
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{trend}</span>
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
            </div>
        </div>
    );
};

const SectionHeader = ({ title, className = "mb-4" }) => (
    <h3 className={`text-lg font-bold text-gray-800 tracking-tight ${className}`}>{title}</h3>
);

const ActionButton = ({ icon, label, onClick }) => (
    <button onClick={onClick} className="flex flex-col items-center justify-center text-gray-600 hover:text-blue-600 transition-colors">
        <div className="mb-1">{icon}</div>
        <span className="text-xs font-medium">{label}</span>
    </button>
);

export default Dashboard;

