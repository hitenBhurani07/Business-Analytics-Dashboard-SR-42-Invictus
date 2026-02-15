// import { useState, useEffect, useCallback } from 'react';
// import axios from 'axios';
// import { useNavigate, Link } from 'react-router-dom';
// import AppNavbar from '../components/AppNavbar';

// const Dashboard = () => {
//     const [summary, setSummary] = useState(null);
//     const [alerts, setAlerts] = useState([]);
//     const [inventoryRisk, setInventoryRisk] = useState([]);
//     const [cashProjection, setCashProjection] = useState(null);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState('');
//     const [stockOpen, setStockOpen] = useState(false);
//     const [stockForm, setStockForm] = useState({ itemName: '', addQuantity: '' });
//     const [lastUpdated, setLastUpdated] = useState(null);
//     const [inventoryAll, setInventoryAll] = useState([]);
//     const navigate = useNavigate();

//     const fetchData = useCallback(async () => {
//         try {
//             const token = localStorage.getItem('token');
//             if (!token) {
//                 navigate('/login');
//                 return;
//             }

//             const config = {
//                 headers: {
//                     Authorization: `Bearer ${token}`,
//                 },
//             };

//             const [summaryRes, alertsRes, riskRes, projectionRes, inventoryRes] = await Promise.all([
//                 axios.get('http://localhost:5000/api/dashboard/summary', config),
//                 axios.get('http://localhost:5000/api/dashboard/alerts', config),
//                 axios.get('http://localhost:5000/api/dashboard/inventory-risk', config),
//                 axios.get('http://localhost:5000/api/dashboard/cash-projection', config),
//                 axios.get('http://localhost:5000/api/dashboard/inventory', config),
//             ]);

//             setSummary(summaryRes.data);
//             setAlerts(alertsRes.data);
//             setInventoryRisk(riskRes.data);
//             setCashProjection(projectionRes.data);
//             setInventoryAll(inventoryRes.data);
//             setLastUpdated(new Date());
//         } catch (err) {
//             console.error(err);
//             setError('Failed to fetch dashboard data');
//             if (err.response && err.response.status === 401) {
//                 navigate('/login');
//             }
//         } finally {
//             setLoading(false);
//         }
//     }, [navigate]);

//     useEffect(() => {
//         fetchData();
//     }, [fetchData]);

//     useEffect(() => {
//         const id = setInterval(() => {
//             setLoading(true);
//             fetchData();
//         }, 30000);
//         return () => clearInterval(id);
//     }, [fetchData]);

//     const submitUpdateStock = async () => {
//         try {
//             const token = localStorage.getItem('token');
//             const config = { headers: { Authorization: `Bearer ${token}` } };
//             const payload = {
//                 itemName: stockForm.itemName,
//                 addQuantity: Number(stockForm.addQuantity)
//             };
//             await axios.post('http://localhost:5000/api/dashboard/update-stock', payload, config);
//             setStockOpen(false);
//             setStockForm({ itemName: '', addQuantity: '' });
//             setLoading(true);
//             await fetchData();
//         } catch (err) {
//             console.error(err);
//             setError(err.response?.data?.message || 'Failed to update stock');
//         }
//     };

//     if (loading) return (
//         <div className="flex justify-center items-center h-screen bg-white">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
//         </div>
//     );

//     if (error) return (
//         <div className="flex justify-center items-center h-screen bg-white">
//             <div className="text-red-600 font-semibold">{error}</div>
//         </div>
//     );

//     // Determine Overall Status
//     let statusColor = 'bg-gradient-to-r from-green-500 to-emerald-600';
//     let statusIcon = (
//         <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//         </svg>
//     );
//     let statusText = 'System Healthy';
//     let statusSubtext = 'Operations running smoothly';

//     const hasCriticalAlerts = alerts.some(a => a.level === 'red');
//     const hasWarningAlerts = alerts.some(a => a.level === 'yellow');

//     if (hasCriticalAlerts) {
//         statusColor = 'bg-gradient-to-r from-red-600 to-rose-700';
//         statusIcon = (
//             <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//             </svg>
//         );
//         statusText = 'CRITICAL RISK DETECTED';
//         statusSubtext = 'Immediate action required';
//     } else if (hasWarningAlerts) {
//         statusColor = 'bg-gradient-to-r from-yellow-500 to-amber-600';
//         statusIcon = (
//             <svg className="w-12 h-12 text-white opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//         );
//         statusText = 'Warning State';
//         statusSubtext = 'Potential risks emerging';
//     }

//     return (
//         <div className="min-h-screen bg-white pb-24 md:pb-8 font-sans">
//             <AppNavbar />

//             <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">

//                 {/* 1. Status Card */}
//                 <div className={`${statusColor} rounded-2xl shadow-xl p-6 text-white transform transition-all hover:scale-[1.01]`}>
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <div className="flex items-center space-x-2 text-white/80 text-sm font-medium mb-1 uppercase tracking-wider">
//                                 <span className="relative flex h-3 w-3">
//                                     <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
//                                     <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
//                                 </span>
//                                 <span>Live Monitoring</span>
//                             </div>
//                             <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight">{statusText}</h2>
//                             <p className="mt-1 text-white/90 text-lg font-light">{statusSubtext}</p>
//                             {lastUpdated && (
//                                 <p className="mt-2 text-white/70 text-xs">Last updated at {lastUpdated.toLocaleTimeString()}</p>
//                             )}
//                         </div>
//                         <div className="hidden md:block">
//                             {statusIcon}
//                         </div>
//                     </div>
//                 </div>



//                 {/* Quick Navigation Cards */}
//                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-slate-900">
//                     <button
//                         onClick={() => navigate('/inventory')}
//                         className="bg-linear-to-br from-primary to-accent text-black rounded-xl p-6 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 text-left group"
//                     >
//                         <div className="flex items-center justify-between mb-4">
//                             <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-3xl">
                                
//                             </div>
//                             <svg className="w-6 h-6 text-black/80 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                             </svg>
//                         </div>
//                         <h3 className="text-xl font-bold mb-2">Smart Inventory</h3>
//                         <p className="text-black/80 text-sm">AI-powered seasonal reorder management</p>
//                         <div className="mt-4 flex items-center gap-2">
//                             <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold"> AI Enabled</span>
//                         </div>
//                     </button>
//                 </div>

//                 {/* 2. Key Metrics Snapshot */}
//                 <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
//                     <MetricCard
//                         title="Current Cash"
//                         value={`$${summary?.currentCash?.toLocaleString()}`}
//                         trend="Real-time"
//                         color="blue"
//                         icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
//                     />
//                     <MetricCard
//                         title="Today's Sales"
//                         value={`$${summary?.todaysSales?.toLocaleString()}`}
//                         trend="Daily"
//                         color="green"
//                         icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>}
//                     />
//                     <MetricCard
//                         title="Today's Expenses"
//                         value={`$${summary?.todaysExpenses?.toLocaleString()}`}
//                         trend="Daily"
//                         color="red"
//                         icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>}
//                     />
//                     <MetricCard
//                         title="Low Stock Items"
//                         value={summary?.lowStockCount}
//                         trend="Action Needed"
//                         color="orange"
//                         icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>}
//                     />
//                 </div>

//                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//                     {/* 3. Risk Alerts Section */}
//                     <div className="lg:col-span-2">
//                         <SectionHeader title="Operational Risks & Alerts" />
//                         {alerts.length === 0 ? (
//                             <div className="bg-white rounded-xl shadow-sm p-8 text-center border border-gray-100">
//                                 <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-600 mb-4">
//                                     <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
//                                 </div>
//                                 <h3 className="text-lg font-medium text-slate-900">No Active Risks</h3>
//                                 <p className="text-slate-600 mt-1">Your business is operating within safe parameters.</p>
//                             </div>
//                         ) : (
//                             <div className="space-y-3">
//                                 {alerts.map((alert, index) => (
//                                     <div key={index} className={`flex items-start p-4 rounded-xl border shadow-sm transition-all ${alert.level === 'red'
//                                         ? 'bg-red-50 border-red-200'
//                                         : 'bg-yellow-50 border-yellow-200'
//                                         }`}>
//                                         <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${alert.level === 'red' ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-600'
//                                             }`}>
//                                             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
//                                             </svg>
//                                         </div>
//                                         <div className="ml-4 flex-1">
//                                             <div className="flex items-center justify-between">
//                                                 <h4 className={`text-sm font-bold uppercase tracking-wide ${alert.level === 'red' ? 'text-red-800' : 'text-yellow-800'
//                                                     }`}>
//                                                     {alert.type}
//                                                 </h4>
//                                                 <span className="text-xs font-medium bg-white/50 px-2 py-0.5 rounded text-slate-600">Just now</span>
//                                             </div>
//                                             <p className={`mt-1 text-sm ${alert.level === 'red' ? 'text-red-700' : 'text-yellow-700'
//                                                 }`}>
//                                                 {alert.message}
//                                             </p>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>
//                         )}
//                     </div>

//                     {/* 4. Cash Flow Projection */}
//                     <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
//                         <div>
//                             <SectionHeader title="48h Cash Projection" className="mb-6" />
//                             <div className="relative pt-2">
//                                 <div className="flex justify-between items-end mb-2">
//                                     <span className="text-slate-600 text-sm">Now</span>
//                                     <span className="text-slate-600 text-sm">In 2 Days</span>
//                                 </div>
//                                 <div className="h-4 bg-slate-200 rounded-full overflow-hidden">
//                                     <div className={`h-full rounded-full transition-all duration-1000 ${cashProjection?.projectedCash < 0 ? 'bg-red-500 w-full' : 'bg-green-500'
//                                         }`} style={{ width: '100%' }}></div>
//                                 </div>
//                                 <div className="flex justify-between items-center mt-4">
//                                     <div>
//                                         <p className="text-2xl font-bold text-slate-900">${summary?.currentCash?.toLocaleString()}</p>
//                                         <p className="text-xs text-slate-600">Current Balance</p>
//                                     </div>
//                                     <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
//                                     <div className="text-right">
//                                         <p className={`text-2xl font-bold ${cashProjection?.projectedCash < 0 ? 'text-red-600' : 'text-green-600'}`}>
//                                             ${cashProjection?.projectedCash?.toLocaleString()}
//                                         </p>
//                                         <p className="text-xs text-slate-600">Projected</p>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                         <div className="mt-6 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
//                             <div className="bg-green-50 p-3 rounded-lg text-center">
//                                 <p className="text-xs text-green-600 uppercase font-semibold">Avg Daily Sales</p>
//                                 <p className="text-lg font-bold text-green-700">+${cashProjection?.avgDailySales?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
//                             </div>
//                             <div className="bg-red-50 p-3 rounded-lg text-center">
//                                 <p className="text-xs text-red-600 uppercase font-semibold">Avg Daily Burn</p>
//                                 <p className="text-lg font-bold text-red-700">-${cashProjection?.avgDailyExpenses?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
//                             </div>
//                         </div>
//                     </div>

//                 </div>

//                 {/* 5. Inventory Monitor Table */}
//                 <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
//                     <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
//                         <SectionHeader title="Critical Inventory Watchlist" className="mb-0" />
//                         <span className="bg-orange-100 text-orange-800 text-xs font-bold px-2 py-1 rounded-full">{inventoryRisk.length} Items</span>
//                     </div>
//                     {inventoryRisk.length === 0 ? (
//                         <div className="p-8 text-center text-slate-600">
//                             Excellent! No inventory items are at critical risk levels.
//                         </div>
//                     ) : (
//                         <div className="overflow-x-auto">
//                             <table className="min-w-full divide-y divide-gray-200">
//                                 <thead className="bg-slate-50">
//                                     <tr>
//                                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Item Name</th>
//                                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Current Stock</th>
//                                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Burn Rate/Day</th>
//                                         <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Runway Remaining</th>
//                                     </tr>
//                                 </thead>
//                                 <tbody className="bg-white divide-y divide-gray-200">
//                                     {inventoryRisk.map((item) => (
//                                         <tr key={item._id} className="hover:bg-slate-50 transition-colors">
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm font-semibold text-slate-900">{item.itemName}</div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-slate-600">{item.quantity} units</div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <div className="text-sm text-slate-600">{item.dailyUsage} units</div>
//                                             </td>
//                                             <td className="px-6 py-4 whitespace-nowrap">
//                                                 <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${item.daysRemaining < 3 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
//                                                     }`}>
//                                                     {item.daysRemaining} Days Left
//                                                 </span>
//                                             </td>
//                                         </tr>
//                                     ))}
//                                 </tbody>
//                             </table>
//                         </div>
//                     )}
//                 </div>

//             </main>

//             {/* 6. Quick Action Buttons (Mobile Floating / Desktop Fixed) */}
//             <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 shadow-lg md:hidden z-50">
//                 <div className="flex justify-around">
//                     <ActionButton icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>} label="Audit" />
//                     <ActionButton onClick={() => setStockOpen(true)} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>} label="Update Stock" />
//                 </div>
//             </div>
//             <div className="hidden md:block fixed bottom-8 right-8 z-50">
//                 <div className="flex space-x-4">
//                     <button onClick={() => setStockOpen(true)} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg px-6 py-3 rounded-full font-bold transition-all transform hover:scale-105 flex items-center gap-2">
//                         <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
//                         Update Stock
//                     </button>
//                 </div>
//             </div>

//             {stockOpen && (
//                 <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
//                     <div className="bg-white rounded-xl shadow-lg p-6 w-96">
//                         <h4 className="text-lg font-bold text-slate-900 mb-4">Update Stock</h4>
//                         <div className="space-y-3">
//                             <select value={stockForm.itemName} onChange={e => setStockForm({ ...stockForm, itemName: e.target.value })} className="w-full border border-gray-300 bg-white text-slate-900 rounded-md px-3 py-2">
//                                 <option value="">Select Item</option>
//                                 {inventoryAll.map(it => (
//                                     <option key={it._id} value={it.itemName}>{it.itemName} (Stock: {it.quantity})</option>
//                                 ))}
//                             </select>
//                             <input type="number" value={stockForm.addQuantity} onChange={e => setStockForm({ ...stockForm, addQuantity: e.target.value })} placeholder="Add Quantity (+/-)" className="w-full border border-gray-300 bg-white text-slate-900 rounded-md px-3 py-2" />
//                         </div>
//                         <div className="mt-4 flex justify-end gap-2">
//                             <button onClick={() => setStockOpen(false)} className="px-4 py-2 rounded-md border border-gray-300 text-slate-900">Cancel</button>
//                             <button onClick={submitUpdateStock} className="px-4 py-2 rounded-md bg-slate-900 text-white">Save</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//         </div>
//     );
// };

// // Sub-components for cleaner code
// const MetricCard = ({ title, value, trend, color, icon }) => {
//     const colorClasses = {
//         blue: 'text-blue-600 bg-blue-50 border-blue-100',
//         green: 'text-green-600 bg-green-50 border-green-100',
//         red: 'text-red-600 bg-red-50 border-red-100',
//         orange: 'text-orange-600 bg-orange-50 border-orange-100',
//     };

//     return (
//         <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
//             <div className="flex justify-between items-start mb-4">
//                 <div className={`p-2 rounded-lg ${colorClasses[color]} bg-opacity-50`}>
//                     {icon}
//                 </div>
//                 <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded-full">{trend}</span>
//             </div>
//             <div>
//                 <p className="text-sm font-medium text-slate-600">{title}</p>
//                 <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
//             </div>
//         </div>
//     );
// };

// const SectionHeader = ({ title, className = "mb-4" }) => (
//     <h3 className={`text-lg font-bold text-slate-900 tracking-tight ${className}`}>{title}</h3>
// );

// const ActionButton = ({ icon, label, onClick }) => (
//     <button onClick={onClick} className="flex flex-col items-center justify-center text-slate-600 hover:text-blue-600 transition-colors">
//         <div className="mb-1">{icon}</div>
//         <span className="text-xs font-medium">{label}</span>
//     </button>
// );

// export default Dashboard;


import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';

const Dashboard = () => {
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
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );

    if (error) return (
        <div className="flex justify-center items-center h-screen bg-slate-50">
            <div className="text-red-600 font-semibold">{error}</div>
        </div>
    );

    // Status Logic
    let statusConfig = {
        color: 'bg-emerald-600',
        text: 'System Healthy',
        subtext: 'All operations running smoothly',
        icon: (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        )
    };

    const hasCriticalAlerts = alerts.some(a => a.level === 'red');
    const hasWarningAlerts = alerts.some(a => a.level === 'yellow');

    if (hasCriticalAlerts) {
        statusConfig = {
            color: 'bg-rose-600',
            text: 'Critical Risk Detected',
            subtext: 'Immediate attention required',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            )
        };
    } else if (hasWarningAlerts) {
        statusConfig = {
            color: 'bg-amber-500',
            text: 'Warning State',
            subtext: 'Potential risks identified',
            icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )
        };
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
            <AppNavbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
                        <p className="mt-1 text-sm text-slate-500">
                            {lastUpdated ? `Last synchronized: ${lastUpdated.toLocaleTimeString()}` : 'Synchronizing...'}
                        </p>
                    </div>
                </div>

                {/* 1. Status Banner */}
                <div className={`${statusConfig.color} rounded-2xl shadow-lg p-6 text-white overflow-hidden relative`}>
                    <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
                        <svg viewBox="0 0 200 200" className="h-full w-full" fill="currentColor">
                            <path d="M44.7,-76.4C58.8,-69.2,71.8,-59.1,79.6,-45.8C87.4,-32.5,90,-16.3,87.3,-0.3C84.6,15.8,76.6,31.6,66.7,44.2C56.8,56.9,44.9,66.4,31.5,73.5C18.1,80.6,3.2,85.3,-11.7,87.9C-26.6,90.5,-41.5,91,-54.6,85.3C-67.7,79.6,-79,67.7,-86.2,53.2C-93.4,38.7,-96.5,21.6,-94.8,5.2C-93.1,-11.2,-86.6,-26.8,-77.2,-39.3C-67.8,-51.8,-55.5,-61.2,-42.3,-68.7C-29.1,-76.2,-15,-81.8,0.7,-82.9C16.4,-84,32.8,-80.5,44.7,-76.4Z" transform="translate(100 100)" />
                        </svg>
                    </div>
                    <div className="relative flex items-center justify-between">
                        <div>
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-white/20 backdrop-blur-sm">
                                Live Status
                            </span>
                            <h2 className="mt-2 text-3xl font-bold tracking-tight">{statusConfig.text}</h2>
                            <p className="mt-1 text-white/90">{statusConfig.subtext}</p>
                        </div>
                        <div className="hidden md:block bg-white/20 p-3 rounded-xl backdrop-blur-sm">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {statusConfig.icon}
                            </svg>
                        </div>
                    </div>
                </div>

                {/* 2. Metrics Grid & Smart Inventory Integration */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Cash Card */}
                    <MetricCard
                        title="Current Cash"
                        value={summary?.currentCash}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                        }
                        color="indigo"
                    />
                    {/* Sales Card */}
                    <MetricCard
                        title="Today's Sales"
                        value={summary?.todaysSales}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        }
                        color="emerald"
                        isCurrency
                    />
                    {/* Expenses Card */}
                    <MetricCard
                        title="Today's Expenses"
                        value={summary?.todaysExpenses}
                        icon={
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        }
                        color="rose"
                        isCurrency
                    />
                    
                    {/* Smart Inventory Navigation (Repositioned) */}
                    <button
                        onClick={() => navigate('/inventory')}
                        className="group relative bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 text-left overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -mr-10 -mt-10 group-hover:scale-150 transition-transform duration-500"></div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm text-white">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                                </div>
                                <span className="text-xs font-semibold text-white/80 bg-white/20 px-2 py-1 rounded-full">AI Enabled</span>
                            </div>
                            <h3 className="text-lg font-bold text-white">Smart Inventory</h3>
                            <div className="flex items-center mt-2 text-white/80 text-sm font-medium">
                                Manage Stock
                                <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                            </div>
                        </div>
                    </button>
                </div>

                {/* Low Stock Alert Banner (Placed here for better flow) */}
                {summary?.lowStockCount > 0 && (
                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="p-2 bg-amber-100 rounded-full mr-3">
                                <svg className="w-5 h-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                            </div>
                            <div>
                                <p className="font-bold text-amber-800">Low Stock Warning</p>
                                <p className="text-sm text-amber-700">{summary.lowStockCount} items are running low. Check the critical watchlist below.</p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 3. Alerts Section */}
                    <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Operational Alerts</h3>
                            <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full uppercase tracking-wider">Real-time</span>
                        </div>

                        {alerts.length === 0 ? (
                            <div className="text-center py-8 border-2 border-dashed border-slate-100 rounded-xl">
                                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-50 text-emerald-500 mb-3">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                </div>
                                <h4 className="text-slate-800 font-semibold">No Active Alerts</h4>
                                <p className="text-sm text-slate-500 mt-1">All systems are operating normally.</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {alerts.map((alert, index) => (
                                    <div key={index} className={`flex items-start p-4 rounded-xl border ${alert.level === 'red' ? 'bg-red-50 border-red-100' : 'bg-amber-50 border-amber-100'}`}>
                                        <div className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${alert.level === 'red' ? 'bg-red-100' : 'bg-amber-100'}`}>
                                            <svg className={`w-4 h-4 ${alert.level === 'red' ? 'text-red-600' : 'text-amber-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div className="ml-3 flex-1">
                                            <div className="flex items-center justify-between">
                                                <h4 className={`text-sm font-bold ${alert.level === 'red' ? 'text-red-800' : 'text-amber-800'}`}>
                                                    {alert.type}
                                                </h4>
                                            </div>
                                            <p className={`text-sm mt-0.5 ${alert.level === 'red' ? 'text-red-700' : 'text-amber-700'}`}>
                                                {alert.message}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* 4. Cash Projection */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
                        <h3 className="text-lg font-bold text-slate-900 mb-2">48h Cash Projection</h3>
                        <p className="text-sm text-slate-500 mb-6">Projected balance based on average burn rate.</p>

                        <div className="flex-1 flex flex-col justify-center">
                            <div className="flex justify-between items-center mb-2">
                                <span className="text-xs font-medium text-slate-500">Current</span>
                                <span className="text-xs font-medium text-slate-500">Projected</span>
                            </div>
                            
                            {/* Projection Bar */}
                            <div className="relative">
                                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                    <div className={`h-full rounded-full transition-all duration-500 ${cashProjection?.projectedCash < 0 ? 'bg-red-400' : 'bg-emerald-400'}`} style={{ width: '100%' }}></div>
                                </div>
                                <div className="absolute top-1/2 left-0 transform -translate-y-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-600 rounded-full border-2 border-white shadow"></div>
                                <div className={`absolute top-1/2 right-0 transform -translate-y-1/2 translate-x-1/2 w-3 h-3 rounded-full border-2 border-white shadow ${cashProjection?.projectedCash < 0 ? 'bg-red-500' : 'bg-emerald-500'}`}></div>
                            </div>

                            <div className="flex justify-between items-center mt-6">
                                <div>
                                    <p className="text-2xl font-bold text-slate-900">${summary?.currentCash?.toLocaleString()}</p>
                                    <p className="text-xs text-slate-500">Available Now</p>
                                </div>
                                <svg className="w-6 h-6 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                <div className="text-right">
                                    <p className={`text-2xl font-bold ${cashProjection?.projectedCash < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                                        ${cashProjection?.projectedCash?.toLocaleString()}
                                    </p>
                                    <p className="text-xs text-slate-500">In 48 Hours</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-2 gap-4">
                            <div className="bg-emerald-50 p-3 rounded-xl text-center">
                                <p className="text-xs text-emerald-600 font-semibold">Avg Daily Sales</p>
                                <p className="text-lg font-bold text-emerald-700">+${cashProjection?.avgDailySales?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                            <div className="bg-red-50 p-3 rounded-xl text-center">
                                <p className="text-xs text-red-600 font-semibold">Avg Daily Burn</p>
                                <p className="text-lg font-bold text-red-700">-${cashProjection?.avgDailyExpenses?.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 5. Inventory Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div>
                            <h3 className="text-lg font-bold text-slate-900">Critical Inventory Watchlist</h3>
                            <p className="text-sm text-slate-500">Items requiring immediate restocking attention</p>
                        </div>
                        {inventoryRisk.length > 0 && (
                            <span className="flex-shrink-0 inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                {inventoryRisk.length} Items Critical
                            </span>
                        )}
                    </div>
                    
                    {inventoryRisk.length === 0 ? (
                        <div className="p-12 text-center">
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-50 text-slate-400 mb-4">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
                            </div>
                            <h4 className="text-slate-700 font-semibold">Inventory Stable</h4>
                            <p className="text-sm text-slate-500 mt-1">No items are currently at critical risk levels.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Item Name</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Current Stock</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Burn Rate</th>
                                        <th className="px-6 py-3.5 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Runway</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-100">
                                    {inventoryRisk.map((item) => (
                                        <tr key={item._id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-semibold text-slate-800">{item.itemName}</div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-600 font-medium">{item.quantity} <span className="text-slate-400">units</span></span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm text-slate-600">{item.dailyUsage} <span className="text-slate-400">/ day</span></div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${item.daysRemaining < 3 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}>
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

            {/* Floating Action Button (Desktop) */}
            <div className="hidden md:block fixed bottom-8 right-8 z-50">
                <button 
                    onClick={() => setStockOpen(true)} 
                    className="flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg h-14 w-14 rounded-full transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    aria-label="Update Stock"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
            </div>

            {/* Mobile Bottom Nav */}
            <div className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 p-2 flex justify-around z-50">
                <MobileNavItem onClick={() => navigate('/inventory')} icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>} label="Inventory" />
                <MobileNavItem onClick={() => setStockOpen(true)} highlight icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>} label="Add Stock" />
            </div>

            {/* Update Stock Modal */}
            {stockOpen && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100">
                            <h4 className="text-xl font-bold text-slate-900">Quick Stock Update</h4>
                            <p className="text-sm text-slate-500 mt-1">Adjust inventory levels manually.</p>
                        </div>
                        
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Select Item</label>
                                <select 
                                    value={stockForm.itemName} 
                                    onChange={e => setStockForm({ ...stockForm, itemName: e.target.value })} 
                                    className="w-full border border-slate-200 bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                                >
                                    <option value="" disabled>Choose an item...</option>
                                    {inventoryAll.map(it => (
                                        <option key={it._id} value={it.itemName}>{it.itemName} (Stock: {it.quantity})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Quantity Adjustment</label>
                                <input 
                                    type="number" 
                                    value={stockForm.addQuantity} 
                                    onChange={e => setStockForm({ ...stockForm, addQuantity: e.target.value })} 
                                    placeholder="e.g. 10 or -5" 
                                    className="w-full border border-slate-200 bg-slate-50 text-slate-900 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all" 
                                />
                                <p className="text-xs text-slate-400 mt-1">Enter positive number to add, negative to subtract.</p>
                            </div>
                        </div>

                        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-3">
                            <button 
                                onClick={() => setStockOpen(false)} 
                                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={submitUpdateStock} 
                                className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                            >
                                Update Inventory
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

// Sub-components
const MetricCard = ({ title, value, icon, color, isCurrency = true }) => {
    const colors = {
        indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600' },
        emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
        rose: { bg: 'bg-rose-50', text: 'text-rose-600' },
    };

    const formatValue = (val) => {
        if (val === null || val === undefined) return '-';
        return isCurrency ? `$${val.toLocaleString()}` : val.toLocaleString();
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2.5 rounded-xl ${colors[color].bg} ${colors[color].text}`}>
                    {icon}
                </div>
            </div>
            <div>
                <p className="text-sm font-medium text-slate-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">
                    {formatValue(value)}
                </p>
            </div>
        </div>
    );
};

const MobileNavItem = ({ icon, label, onClick, highlight }) => (
    <button 
        onClick={onClick} 
        className={`flex flex-col items-center justify-center w-full py-2 rounded-xl transition-colors ${highlight ? 'bg-indigo-600 text-white' : 'text-slate-600 hover:bg-slate-50'}`}
    >
        {icon}
        <span className={`text-xs mt-1 font-medium ${highlight ? 'text-indigo-100' : 'text-slate-500'}`}>{label}</span>
    </button>
);

export default Dashboard;
