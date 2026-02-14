import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get('http://localhost:5000/api/auth/me', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUser(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, []);

    if (loading) {
        return <div style={{ color: '#111827' }} className="text-center mt-10">Loading...</div>;
    }

    return (
        <div style={{ backgroundColor: '#F9FAFB' }} className="min-h-screen">
            {/* Header */}
            <header style={{ backgroundColor: '#FFFFFF', borderBottom: '1px solid #E5E7EB' }}>
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <div>
                        <h1 style={{ color: '#111827' }} className="text-3xl font-bold">Dashboard</h1>
                        <p style={{ color: '#6B7280' }} className="text-sm mt-1">Welcome back, {user?.name}</p>
                    </div>
                    <button
                        onClick={() => {
                            localStorage.removeItem('token');
                            navigate('/login');
                        }}
                        style={{ color: '#6B7280' }}
                        className="px-4 py-2 rounded-lg hover:bg-gray-100 transition duration-200"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main>
                <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                    {/* Business Info Card */}
                    <div style={{ backgroundColor: '#FFFFFF' }} className="rounded-2xl p-8 mb-8 shadow-sm border border-gray-200 hover:shadow-md transition duration-300">
                        <h2 style={{ color: '#2563EB' }} className="text-2xl font-bold mb-6">Business Overview</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-xl p-6">
                                <p style={{ color: '#6B7280' }} className="text-sm font-medium mb-2">Business Name</p>
                                <p style={{ color: '#111827' }} className="text-lg font-semibold">{user?.businessName}</p>
                            </div>
                            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-xl p-6">
                                <p style={{ color: '#6B7280' }} className="text-sm font-medium mb-2">Business Type</p>
                                <p style={{ color: '#111827' }} className="text-lg font-semibold">{user?.businessType}</p>
                            </div>
                            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-xl p-6">
                                <p style={{ color: '#6B7280' }} className="text-sm font-medium mb-2">Starting Cash</p>
                                <p style={{ color: '#10B981' }} className="text-lg font-semibold">${user?.startingCash?.toLocaleString()}</p>
                            </div>
                            <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-xl p-6">
                                <p style={{ color: '#6B7280' }} className="text-sm font-medium mb-2">Account Status</p>
                                <p style={{ color: '#10B981' }} className="text-lg font-semibold">✓ Active</p>
                            </div>
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div>
                        <h3 style={{ color: '#111827' }} className="text-2xl font-bold mb-6">Quick Actions</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Data Entry Card */}
                            <div
                                onClick={() => navigate('/data-entry')}
                                style={{ backgroundColor: '#FFFFFF' }}
                                className="rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div style={{ backgroundColor: '#EFF6FF' }} className="p-4 rounded-xl group-hover:bg-blue-100 transition duration-300">
                                        <span className="text-3xl">📊</span>
                                    </div>
                                    <svg className="w-6 h-6" style={{ color: '#2563EB' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <h4 style={{ color: '#111827' }} className="text-xl font-bold mb-2">Data Entry</h4>
                                <p style={{ color: '#6B7280' }} className="text-sm mb-4">Manage inventory, sales, and expenses with voice input</p>
                                <div style={{ color: '#2563EB' }} className="font-semibold text-sm">Get Started →</div>
                            </div>

                            {/* Dead Stock Alerts Card */}
                            <div
                                onClick={() => navigate('/dead-stock-alerts')}
                                style={{ backgroundColor: '#FFFFFF' }}
                                className="rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-lg hover:scale-105 transition duration-300 cursor-pointer group"
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div style={{ backgroundColor: '#FEF3C7' }} className="p-4 rounded-xl group-hover:bg-amber-100 transition duration-300">
                                        <span className="text-3xl">⚠️</span>
                                    </div>
                                    <svg className="w-6 h-6" style={{ color: '#F59E0B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                                <h4 style={{ color: '#111827' }} className="text-xl font-bold mb-2">Dead Stock Alerts</h4>
                                <p style={{ color: '#6B7280' }} className="text-sm mb-4">AI-powered analysis to identify slow-moving inventory</p>
                                <div style={{ color: '#F59E0B' }} className="font-semibold text-sm">Analyze Now →</div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
