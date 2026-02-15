import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import AppNavbar from '../components/AppNavbar';


// Financial Summary Component
const FinancialSummary = ({ radarData, onSendEmail, sendingEmail }) => {
    const { financialStatus, analytics, overdueInvoices, upcomingPayments, summary } = radarData;
    
    return (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-lg p-6 text-white mb-8 shadow-lg">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-bold mb-2">Financial Summary</h2>
                    <p className="text-slate-300">Payment Radar Report - {new Date().toLocaleDateString()}</p>
                </div>
                <button
                    onClick={onSendEmail}
                    disabled={sendingEmail}
                    className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2"
                >
                    {sendingEmail ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Sending...
                        </>
                    ) : (
                        <>
                            📧 Send Report via Email
                        </>
                    )}
                </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Current Cash */}
                <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-slate-300 text-sm font-semibold mb-2">Current Cash</p>
                    <p className="text-2xl font-bold">₹{financialStatus.currentCash.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400 mt-1">Available funds</p>
                </div>

                {/* Projected Cash */}
                <div className={`rounded-lg p-4 backdrop-blur-sm ${financialStatus.projectedCashAfterPayments < 0 ? 'bg-red-500/20' : 'bg-green-500/20'}`}>
                    <p className="text-slate-300 text-sm font-semibold mb-2">Projected Cash</p>
                    <p className={`text-2xl font-bold ${financialStatus.projectedCashAfterPayments < 0 ? 'text-red-200' : 'text-green-200'}`}>
                        ₹{financialStatus.projectedCashAfterPayments.toLocaleString('en-IN')}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">After payments</p>
                </div>

                {/* Total Pending */}
                <div className="bg-orange-500/20 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-slate-300 text-sm font-semibold mb-2">Total Pending</p>
                    <p className="text-2xl font-bold text-orange-200">₹{summary.totalPendingAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-slate-400 mt-1">{overdueInvoices.count + upcomingPayments.count} invoices</p>
                </div>

                {/* Risk Level */}
                <div className={`rounded-lg p-4 backdrop-blur-sm ${
                    financialStatus.riskLevel === 'CRITICAL' ? 'bg-red-500/20' :
                    financialStatus.riskLevel === 'HIGH' ? 'bg-yellow-500/20' :
                    'bg-green-500/20'
                }`}>
                    <p className="text-slate-300 text-sm font-semibold mb-2">Risk Level</p>
                    <p className={`text-2xl font-bold ${
                        financialStatus.riskLevel === 'CRITICAL' ? 'text-red-200' :
                        financialStatus.riskLevel === 'HIGH' ? 'text-yellow-200' :
                        'text-green-200'
                    }`}>
                        {financialStatus.riskLevel}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Risk Score: {analytics.riskScore}/100</p>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <p className="text-slate-400 text-sm">Overdue Invoices</p>
                        <p className="text-xl font-bold text-red-300">{overdueInvoices.count}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Upcoming Payments (3 days)</p>
                        <p className="text-xl font-bold text-yellow-300">{upcomingPayments.count}</p>
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">Avg Daily Sales</p>
                        <p className="text-xl font-bold text-green-300">₹{analytics.averageDailySales.toLocaleString('en-IN')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Risk Score Component
const RiskScore = ({ score, riskLevel }) => {
    const getScoreColor = () => {
        if (score >= 75) return 'from-red-600 to-red-400';
        if (score >= 50) return 'from-yellow-600 to-yellow-400';
        return 'from-green-600 to-green-400';
    };

    const getScoreLabel = () => {
        if (score >= 75) return 'Critical Risk';
        if (score >= 50) return 'Moderate Risk';
        return 'Low Risk';
    };

    return (
        <div className="bg-gradient-to-br from-slate-800 to-slate-700 rounded-lg p-6 text-white shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold">Risk Score</h3>
            </div>
            
            {/* Circular Score Display */}
            <div className="flex items-center justify-center mb-6">
                <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90" width="128" height="128">
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            fill="none"
                            stroke="#374151"
                            strokeWidth="8"
                        />
                        <circle
                            cx="64"
                            cy="64"
                            r="60"
                            fill="none"
                            stroke={score >= 75 ? '#ef4444' : (score >= 50 ? '#eab308' : '#22c55e')}
                            strokeWidth="8"
                            strokeDasharray={`${(score / 100) * 376.99} 376.99`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-bold">{score}</span>
                        <span className="text-xs text-gray-300">/100</span>
                    </div>
                </div>
            </div>
            
            {/* Score Label */}
            <div className="text-center">
                <p className="font-semibold text-lg">{getScoreLabel()}</p>
                <p className="text-sm text-gray-300 mt-2">
                    {score >= 75 ? 'Immediate action required' : 
                     score >= 50 ? 'Review your finances' : 
                     'Financial situation stable'}
                </p>
            </div>
        </div>
    );
};

// AI Explanation Component
const AIExplanation = ({ message, riskLevel }) => {
    const bgColor = {
        HIGH: 'bg-red-50 border-red-300',
        MEDIUM: 'bg-yellow-50 border-yellow-300',
        LOW: 'bg-green-50 border-green-300'
    };

    const textColor = {
        HIGH: 'text-red-800',
        MEDIUM: 'text-yellow-800',
        LOW: 'text-green-800'
    };

    const iconColor = {
        HIGH: '',
        MEDIUM: '',
        LOW: ''
    };

    return (
        <div className={`border-l-4 rounded-lg p-6 mb-6 ${bgColor[riskLevel]} border`}>
            <div className="flex gap-4">
                <div className="text-4xl flex-shrink-0">{iconColor[riskLevel]}</div>
                <div>
                    <h3 className={`text-lg font-bold ${textColor[riskLevel]} mb-2`}>AI Financial Insight</h3>
                    <p className={`${textColor[riskLevel]} leading-relaxed`}>{message}</p>
                </div>
            </div>
        </div>
    );
};

// Action Suggestions Component
const ActionSuggestions = ({ suggestions }) => {
    const priorityColors = {
        critical: 'border-red-300 bg-red-50',
        high: 'border-orange-300 bg-orange-50',
        medium: 'border-yellow-300 bg-yellow-50',
        low: 'border-blue-300 bg-blue-50'
    };

    const priorityTextColors = {
        critical: 'text-red-800',
        high: 'text-orange-800',
        medium: 'text-yellow-800',
        low: 'text-blue-800'
    };

    const priorityBadgeColors = {
        critical: 'bg-red-200 text-red-800',
        high: 'bg-orange-200 text-orange-800',
        medium: 'bg-yellow-200 text-yellow-800',
        low: 'bg-blue-200 text-blue-800'
    };

    return (
        <div className="bg-white rounded-lg shadow mb-8">
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-6 py-4 rounded-t-lg">
                <h2 className="text-xl font-bold text-white">💡 Suggested Actions</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-6">
                {suggestions.map((suggestion, idx) => (
                    <div
                        key={idx}
                        className={`border-2 rounded-lg p-4 transition hover:shadow-md ${priorityColors[suggestion.priority]}`}
                    >
                        <div className="flex items-start gap-3">
                            <span className="text-3xl flex-shrink-0">{suggestion.icon}</span>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h4 className={`font-bold ${priorityTextColors[suggestion.priority]}`}>
                                        {suggestion.action}
                                    </h4>
                                    <span className={`px-2 py-1 rounded text-xs font-semibold ${priorityBadgeColors[suggestion.priority]}`}>
                                        {suggestion.priority}
                                    </span>
                                </div>
                                <p className={`text-sm ${priorityTextColors[suggestion.priority]}`}>
                                    {suggestion.description}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Financial Health Indicator Component
const FinancialHealthIndicator = ({ healthStatus, riskScore, avgDailySales, projectedCash }) => {
    const getHealthIcon = () => {
        if (healthStatus === 'Critical') return '';
        if (healthStatus === 'Caution') return '';
        return '';
    };

    const getHealthTextColor = () => {
        if (healthStatus === 'Critical') return 'text-red-700';
        if (healthStatus === 'Caution') return 'text-yellow-700';
        return 'text-green-700';
    };

    const getHealthBgColor = () => {
        if (healthStatus === 'Critical') return 'bg-red-50 border-red-300';
        if (healthStatus === 'Caution') return 'bg-yellow-50 border-yellow-300';
        return 'bg-green-50 border-green-300';
    };

    const cashBufferDays = avgDailySales > 0 ? Math.ceil(projectedCash / avgDailySales) : 0;

    return (
        <div className={`border-2 rounded-lg p-6 mb-8 ${getHealthBgColor()}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <span className="text-4xl">{getHealthIcon()}</span>
                    <div>
                        <h3 className={`text-2xl font-bold ${getHealthTextColor()}`}>{healthStatus}</h3>
                        <p className="text-sm text-slate-600">Financial Health Status</p>
                    </div>
                </div>
                
                <div className="text-center">
                    <p className="text-sm text-slate-600">Cash Buffer</p>
                    <p className={`text-2xl font-bold ${getHealthTextColor()}`}>
                        {cashBufferDays > 0 ? `${cashBufferDays}d` : '< 1d'}
                    </p>
                </div>
            </div>
        
              
        </div>
    );
};

const PaymentRadar = () => {
    const [radarData, setRadarData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [sendingEmail, setSendingEmail] = useState(false);
    const navigate = useNavigate();

    const fetchPaymentRadar = useCallback(async () => {
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

            const response = await axios.get('http://localhost:5000/api/dashboard/payment-radar', config);
            setRadarData(response.data);
            setError('');
        } catch (err) {
            console.error(err);
            setError('Failed to fetch payment radar data');
            if (err.response && err.response.status === 401) {
                navigate('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [navigate]);

    useEffect(() => {
        fetchPaymentRadar();
    }, [fetchPaymentRadar]);

    const sendEmailReport = async () => {
        try {
            setSendingEmail(true);
            const token = localStorage.getItem('token');
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            };

            const response = await axios.post('http://localhost:5000/api/dashboard/send-payment-radar-email', {}, config);
            
            if (response.data.success) {
                alert('✅ Payment Radar report sent to your email!');
            }
        } catch (err) {
            console.error(err);
            alert('❌ Failed to send email: ' + (err.response?.data?.message || err.message));
        } finally {
            setSendingEmail(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-slate-600 text-lg">Loading Payment Radar...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-red-600 text-lg">{error}</div>
            </div>
        );
    }

    const { financialStatus, analytics, overdueInvoices, upcomingPayments, summary } = radarData;
    const riskColor = {
        HIGH: 'bg-red-50 border-red-300',
        MEDIUM: 'bg-yellow-50 border-yellow-300',
        LOW: 'bg-green-50 border-green-300'
    };

    const riskTextColor = {
        HIGH: 'text-red-700',
        MEDIUM: 'text-yellow-700',
        LOW: 'text-green-700'
    };

    const riskBadgeColor = {
        HIGH: 'bg-red-100 text-red-800',
        MEDIUM: 'bg-yellow-100 text-yellow-800',
        LOW: 'bg-green-100 text-green-800'
    };

    return (
        <div className="min-h-screen bg-white">
            <AppNavbar />

            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-16">
                {/* Financial Summary Section */}
                <FinancialSummary 
                    radarData={radarData} 
                    onSendEmail={sendEmailReport}
                    sendingEmail={sendingEmail}
                />

                {/* AI Explanation Section */}
                <AIExplanation 
                    message={analytics.aiExplanation} 
                    riskLevel={financialStatus.riskLevel}
                />

                {/* Financial Health Indicator */}
                <FinancialHealthIndicator
                    healthStatus={financialStatus.healthStatus}
                    riskScore={analytics.riskScore}
                    avgDailySales={analytics.averageDailySales}
                    projectedCash={financialStatus.projectedCashAfterPayments}
                />

                {/* Risk Score and Key Metrics Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-8">
                    {/* Risk Score - Takes 2 columns */}
                    <div className="lg:col-span-2">
                        <RiskScore 
                            score={analytics.riskScore} 
                            riskLevel={financialStatus.riskLevel}
                        />
                    </div>

                    {/* Key Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Current Cash</h3>
                        <p className="text-3xl font-bold text-blue-600">
                            ₹{financialStatus.currentCash.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Upcoming Payments</h3>
                        <p className="text-3xl font-bold text-orange-600">
                            ₹{financialStatus.upcomingAmount.toLocaleString('en-IN')}
                        </p>
                    </div>

                    <div className={`bg-white p-6 rounded-lg shadow border-l-4 ${financialStatus.riskLevel === 'HIGH' ? 'border-red-500' : (financialStatus.riskLevel === 'MEDIUM' ? 'border-yellow-500' : 'border-green-500')}`}>
                        <h3 className="text-slate-600 text-sm font-semibold uppercase mb-2">Avg Daily Sales</h3>
                        <p className="text-3xl font-bold text-purple-600">
                            ₹{analytics.averageDailySales.toLocaleString('en-IN')}
                        </p>
                    </div>
                </div>

                {/* Action Suggestions */}
                {analytics.actionSuggestions.length > 0 && (
                    <ActionSuggestions suggestions={analytics.actionSuggestions} />
                )}

                {/* Overdue Invoices */}
                <div className="bg-white rounded-lg shadow mb-8">
                    <div className="bg-red-50 border-b border-red-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-red-800">
                             Overdue Invoices ({overdueInvoices.count})
                        </h2>
                        <p className="text-sm text-red-700 mt-1">
                            Total Due: <span className="font-bold">₹{overdueInvoices.totalAmount.toLocaleString('en-IN')}</span>
                        </p>
                    </div>
                    
                    {overdueInvoices.invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Invoice Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Days Overdue</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {overdueInvoices.invoices.map((invoice, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{invoice.title}</td>
                                            <td className="px-6 py-4 font-bold text-red-600">₹{invoice.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-gray-700">{invoice.category}</td>
                                            <td className="px-6 py-4 text-gray-700">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                                    {invoice.daysOverdue} days overdue
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold">
                                                    {invoice.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                            ✓ No overdue invoices - Great job!
                        </div>
                    )}
                </div>

                {/* Upcoming Payments */}
                <div className="bg-white rounded-lg shadow">
                    <div className="bg-yellow-50 border-b border-yellow-200 px-6 py-4">
                        <h2 className="text-xl font-bold text-yellow-800">
                             Upcoming Payments (Next 3 Days) ({upcomingPayments.count})
                        </h2>
                        <p className="text-sm text-yellow-700 mt-1">
                            Total Due: <span className="font-bold">₹{upcomingPayments.totalAmount.toLocaleString('en-IN')}</span>
                        </p>
                    </div>
                    
                    {upcomingPayments.invoices.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Invoice Title</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Amount</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Due Date</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Time Until Due</th>
                                        <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Urgency</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {upcomingPayments.invoices.map((invoice, idx) => (
                                        <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                                            <td className="px-6 py-4 font-semibold text-slate-900">{invoice.title}</td>
                                            <td className="px-6 py-4 font-bold text-orange-600">₹{invoice.amount.toLocaleString('en-IN')}</td>
                                            <td className="px-6 py-4 text-gray-700">{invoice.category}</td>
                                            <td className="px-6 py-4 text-gray-700">{new Date(invoice.dueDate).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-gray-700">{invoice.daysUntilDue} days</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                                    invoice.daysUntilDue === 0 ? 'bg-red-100 text-red-800' :
                                                    invoice.daysUntilDue === 1 ? 'bg-orange-100 text-orange-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {invoice.urgency}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="px-6 py-8 text-center text-gray-500">
                            ✓ No upcoming payments in the next 3 days
                        </div>
                    )}
                </div>

                {/* Summary Section */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-4"> Payment Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <p className="text-gray-700 mb-2">
                                <span className="font-semibold">Total Pending Amount:</span>
                                <span className="ml-2 font-bold text-red-600">₹{summary.totalPendingAmount.toLocaleString('en-IN')}</span>
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Next Payment Due:</span>
                                <span className="ml-2 font-bold">
                                    {summary.nextPaymentDue ? new Date(summary.nextPaymentDue).toLocaleDateString() : 'No upcoming payments'}
                                </span>
                            </p>
                        </div>
                        <div>
                            <p className="text-gray-700 mb-2">
                                <span className="font-semibold">Total Overdue & Upcoming:</span>
                                <span className="ml-2 font-bold text-orange-600">₹{(overdueInvoices.totalAmount + upcomingPayments.totalAmount).toLocaleString('en-IN')}</span>
                            </p>
                            <p className="text-gray-700">
                                <span className="font-semibold">Total Invoices:</span>
                                <span className="ml-2 font-bold">{overdueInvoices.count + upcomingPayments.count}</span>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentRadar;
