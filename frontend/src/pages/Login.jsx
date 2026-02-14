import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const onChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', formData);

            localStorage.setItem('token', res.data.token);
            setIsAuthenticated(true);
            navigate('/dashboard');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#FFFFFF' }} className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                {/* Header */}
                <div className="text-center">
                    <h1 style={{ color: '#2563EB' }} className="text-4xl font-bold mb-2">Vyapaar</h1>
                    <p style={{ color: '#6B7280' }} className="text-lg">Manage Your Business</p>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-2xl p-8 shadow-lg">
                    <h2 style={{ color: '#111827' }} className="text-2xl font-bold text-center mb-8">Sign In</h2>

                    <form className="space-y-5" onSubmit={onSubmit}>
                        {error && (
                            <div style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444' }} className="border-l-4 p-4 rounded-lg">
                                <p style={{ color: '#991B1B' }} className="font-medium">{error}</p>
                            </div>
                        )}

                        <div>
                            <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Email Address</label>
                            <input
                                name="email"
                                type="email"
                                required
                                style={{ borderColor: '#E5E7EB' }}
                                className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                placeholder="you@example.com"
                                value={formData.email}
                                onChange={onChange}
                            />
                        </div>

                        <div>
                            <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Password</label>
                            <input
                                name="password"
                                type="password"
                                required
                                style={{ borderColor: '#E5E7EB' }}
                                className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={onChange}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: '#2563EB' }}
                            className="w-full text-white font-semibold py-3 rounded-lg transition duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 mt-6"
                        >
                            {loading ? 'Signing In...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div style={{ backgroundColor: '#E5E7EB' }} className="flex-grow h-px"></div>
                        <span style={{ color: '#6B7280' }} className="px-3 text-sm">New user?</span>
                        <div style={{ backgroundColor: '#E5E7EB' }} className="flex-grow h-px"></div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                        <button
                            type="button"
                            style={{ borderColor: '#2563EB', color: '#2563EB' }}
                            className="w-full border-2 font-semibold py-3 rounded-lg transition duration-300 hover:bg-blue-50"
                        >
                            Create Account
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Login;
