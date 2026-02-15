import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiMail, FiLock, FiArrowRight, FiAlertCircle } from 'react-icons/fi';
import axios from 'axios';
import { useTheme } from '../context/ThemeContext';

const Login = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { isDark } = useTheme();
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
        <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            {/* Background Gradient */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 right-0 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>
            </div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-12 animate-slideUp">
                    {/* Logo */}
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-6 shadow-lg shadow-blue-500/20">
                        <span className="text-2xl font-bold text-white">VS</span>
                    </div>
                    
                    <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
                        VyapaarSathi
                    </h1>
                    <p className="text-lg text-slate-600">Welcome back to your business dashboard</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 border border-slate-200 animate-slideUp" style={{ animationDelay: '0.1s' }}>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 text-center mb-8">Sign In</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 animate-slideDown">
                            <FiAlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <form className="space-y-5" onSubmit={onSubmit}>
                        {/* Email Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-slate-700 mb-2.5">Email Address</label>
                            <div className="relative">
                                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors duration-300" />
                                <input
                                    name="email"
                                    type="email"
                                    required
                                    className="input-field pl-12 bg-slate-50 focus:bg-white"
                                    placeholder="you@example.com"
                                    value={formData.email}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {/* Password Field */}
                        <div className="group">
                            <label className="block text-sm font-semibold text-slate-700 mb-2.5">Password</label>
                            <div className="relative">
                                <FiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-600 transition-colors duration-300" />
                                <input
                                    name="password"
                                    type="password"
                                    required
                                    className="input-field pl-12 bg-slate-50 focus:bg-white"
                                    placeholder="••••••••"
                                    value={formData.password}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 mt-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Signing In...
                                </>
                            ) : (
                                <>
                                    Sign In
                                    <FiArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-slate-200"></div>
                        <span className="px-3 text-sm text-slate-500">New to VyapaarSathi?</span>
                        <div className="flex-grow border-t border-slate-200"></div>
                    </div>

                    {/* Register Link */}
                    <Link to="/register">
                        <button
                            type="button"
                            className="w-full py-3 px-4 border-2 border-blue-600 text-blue-600 font-semibold rounded-xl hover:bg-blue-50 transition-all duration-300 flex items-center justify-center gap-2"
                        >
                            Create Account
                            <FiArrowRight className="w-4 h-4" />
                        </button>
                    </Link>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-slate-600 mt-8">
                    By signing in, you agree to our{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                        Terms
                    </a>
                    {' '}and{' '}
                    <a href="#" className="text-blue-600 hover:underline font-medium">
                        Privacy Policy
                    </a>
                </p>
            </div>
        </div>
    );
};

export default Login;
