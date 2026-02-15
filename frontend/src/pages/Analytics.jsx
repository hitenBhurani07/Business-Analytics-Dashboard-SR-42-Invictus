import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AppNavbar from '../components/AppNavbar';
import Footer from '../components/landing/Footer';

const Analytics = () => {
    const [salesData, setSalesData] = useState(null);
    const [expenseData, setExpenseData] = useState(null);
    const [inventoryData, setInventoryData] = useState(null);
    const [cashFlowData, setCashFlowData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

    const fetchAnalyticsData = useCallback(async () => {
        try {
            setLoading(true);
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

            const [salesRes, expensesRes, inventoryRes, cashflowRes] = await Promise.all([
                axios.get('http://localhost:5000/api/dashboard/analytics/sales', config),
                axios.get('http://localhost:5000/api/dashboard/analytics/expenses', config),
                axios.get('http://localhost:5000/api/dashboard/analytics/inventory', config),
                axios.get('http://localhost:5000/api/dashboard/analytics/cashflow', config),
            ]);

            setSalesData(salesRes.data);
            setExpenseData(expensesRes.data);
            setInventoryData(inventoryRes.data);
            setCashFlowData(cashflowRes.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch analytics data');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchAnalyticsData();
    }, [fetchAnalyticsData]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="text-slate-600 text-lg">Loading analytics...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <AppNavbar />
            
            <main className="flex-grow pt-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                )}

                {/* Summary Cards */}
                {cashFlowData && (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-blue-500">
                            <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Current Cash</h3>
                            <p className="text-3xl font-bold text-blue-600">
                                ₹{cashFlowData.summary.currentCash.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-green-500">
                            <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Total Sales</h3>
                            <p className="text-3xl font-bold text-green-600">
                                ₹{cashFlowData.summary.totalSales.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
                            <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Total Expenses</h3>
                            <p className="text-3xl font-bold text-red-600">
                                ₹{cashFlowData.summary.totalExpenses.toLocaleString('en-IN')}
                            </p>
                        </div>
                        <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${cashFlowData.summary.netProfit >= 0 ? 'border-green-500' : 'border-red-500'}`}>
                            <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Net Profit</h3>
                            <p className={`text-3xl font-bold ${cashFlowData.summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                ₹{cashFlowData.summary.netProfit.toLocaleString('en-IN')}
                            </p>
                        </div>
                    </div>
                )}

                {/* Charts Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Sales Revenue Over Time */}
                    {salesData && salesData.chartData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Sales Revenue Trend</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="amount" 
                                        stroke="#10b981" 
                                        strokeWidth={2}
                                        dot={{ fill: '#10b981' }}
                                        activeDot={{ r: 6 }}
                                        name="Revenue"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-slate-600 mt-4">Total: ₹{salesData.totalSales.toLocaleString('en-IN')}</p>
                        </div>
                    )}

                    {/* Cash Flow Over Time */}
                    {cashFlowData && cashFlowData.chartData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Cash Flow Projection</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={cashFlowData.chartData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="date" stroke="#6b7280" />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    />
                                    <Legend />
                                    <Line 
                                        type="monotone" 
                                        dataKey="cash" 
                                        stroke="#3b82f6" 
                                        strokeWidth={2}
                                        dot={{ fill: '#3b82f6' }}
                                        activeDot={{ r: 6 }}
                                        name="Cash Balance"
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Sales by Item */}
                    {salesData && salesData.itemData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Sales by Item</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <BarChart data={salesData.itemData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                    <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                                    <YAxis stroke="#6b7280" />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                        formatter={(value) => `₹${value.toLocaleString('en-IN')}`}
                                    />
                                    <Legend />
                                    <Bar dataKey="amount" fill="#3b82f6" name="Revenue" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}

                    {/* Expenses by Category */}
                    {expenseData && expenseData.categoryData.length > 0 && (
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Expenses by Category</h2>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={expenseData.categoryData}
                                        cx="50%"
                                        cy="50%"
                                        labelLine={false}
                                        label={({ name, value }) => `${name}: ₹${value}`}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        dataKey="value"
                                    >
                                        {expenseData.categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value) => `₹${value.toLocaleString('en-IN')}`} />
                                </PieChart>
                            </ResponsiveContainer>
                            <p className="text-sm text-slate-600 mt-4">Total: ₹{expenseData.totalExpenses.toLocaleString('en-IN')}</p>
                        </div>
                    )}
                </div>

                {/* Inventory Stock Levels */}
                {inventoryData && inventoryData.inventoryData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Inventory Stock Levels</h2>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={inventoryData.inventoryData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                                <XAxis dataKey="name" stroke="#6b7280" angle={-45} textAnchor="end" height={80} />
                                <YAxis stroke="#6b7280" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: '#fff', border: '1px solid #e5e7eb', borderRadius: '8px' }}
                                />
                                <Legend />
                                <Bar dataKey="quantity" fill="#8b5cf6" name="Quantity" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                )}

                {/* Inventory Details Table */}
                {inventoryData && inventoryData.inventoryData.length > 0 && (
                    <div className="bg-white p-6 rounded-lg shadow mb-8">
                        <h2 className="text-xl font-bold text-slate-900 mb-4">Inventory Details</h2>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-slate-100 border-b-2 border-slate-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Item Name</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Quantity</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Cost Price</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Selling Price</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Stock Value</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Daily Usage</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Days Remaining</th>
                                        <th className="px-4 py-3 text-left font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {inventoryData.inventoryData.map((item, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                            <td className="px-4 py-3 font-medium text-slate-900">{item.name}</td>
                                            <td className="px-4 py-3 text-slate-900">{item.quantity}</td>
                                            <td className="px-4 py-3 text-slate-900">₹{item.costPrice.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-slate-900">₹{item.sellingPrice.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 font-semibold text-slate-900">₹{item.value.toLocaleString('en-IN')}</td>
                                            <td className="px-4 py-3 text-slate-900">{item.dailyUsage}</td>
                                            <td className="px-4 py-3 text-slate-900">{item.daysRemaining === 999 ? '∞' : item.daysRemaining}</td>
                                            <td className="px-4 py-3">
                                                {item.daysRemaining < 2 ? (
                                                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Critical</span>
                                                ) : item.daysRemaining < 5 ? (
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">Warning</span>
                                                ) : (
                                                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Healthy</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <p className="text-sm text-slate-600 mt-4">
                            Total Inventory Value: ₹{inventoryData.totalInventoryValue.toLocaleString('en-IN')} | 
                            Low Stock Items: {inventoryData.lowStockCount}
                        </p>
                    </div>
                )}
                </div>
            </main>
            
            <Footer />
        </div>
    );
};

export default Analytics;
