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
        return <div className="text-center mt-10">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
                </div>
            </header>
            <main>
                <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white border border-slate-200 rounded-lg p-6 mb-6">
                            <h2 className="text-2xl font-semibold mb-4">Welcome, {user?.name}!</h2>
                            <p className="text-slate-600 mb-2">Business: {user?.businessName}</p>
                            <p className="text-slate-600 mb-2">Type: {user?.businessType}</p>
                            <p className="text-slate-600 mb-6">Starting Cash: ${user?.startingCash}</p>
                            
                            <div className="space-y-3">
                                <button
                                    onClick={() => navigate('/data-entry')}
                                    className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition text-left"
                                >
                                    Data Entry (Inventory, Sales, Expenses)
                                </button>
                                <button
                                    onClick={() => navigate('/dead-stock-alerts')}
                                    className="w-full px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 font-semibold transition text-left"
                                >
                                    ⚠️ Dead Stock Alerts
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
