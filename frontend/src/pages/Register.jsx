import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = ({ setIsAuthenticated }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        businessName: '',
        businessType: 'Retail',
        startingCash: '',
    });

    const [files, setFiles] = useState({
        inventory: null,
        sales: null,
        expenses: null,
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [passwordStrength, setPasswordStrength] = useState({
        score: 0,
        level: 'Weak',
        suggestions: [],
        criteria: {
            length: false,
            uppercase: false,
            lowercase: false,
            number: false,
            special: false,
        },
    });
    const navigate = useNavigate();

    const checkPasswordStrength = (pwd) => {
        const criteria = {
            length: pwd.length >= 8,
            uppercase: /[A-Z]/.test(pwd),
            lowercase: /[a-z]/.test(pwd),
            number: /\d/.test(pwd),
            special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
        };

        const score = Object.values(criteria).filter(Boolean).length;
        const suggestions = [];

        if (!criteria.length) suggestions.push('At least 8 characters');
        if (!criteria.uppercase) suggestions.push('Uppercase letters (A-Z)');
        if (!criteria.lowercase) suggestions.push('Lowercase letters (a-z)');
        if (!criteria.number) suggestions.push('Numbers (0-9)');
        if (!criteria.special) suggestions.push('Special characters (!@#$%^&*)');

        let level = 'Weak';
        if (score === 5) level = 'Strong';
        else if (score === 4) level = 'Good';
        else if (score === 3) level = 'Fair';

        setPasswordStrength({
            score,
            level,
            suggestions,
            criteria,
        });
    };

    const onChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        if (e.target.name === 'password') {
            checkPasswordStrength(e.target.value);
        }
    };

    const onFileChange = (e) => {
        setFiles({ ...files, [e.target.name]: e.target.files[0] });
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        const data = new FormData();
        data.append('name', formData.name);
        data.append('email', formData.email);
        data.append('password', formData.password);
        data.append('businessName', formData.businessName);
        data.append('businessType', formData.businessType);
        data.append('startingCash', formData.startingCash);

        if (files.inventory) data.append('inventory', files.inventory);
        if (files.sales) data.append('sales', files.sales);
        if (files.expenses) data.append('expenses', files.expenses);

        try {
            const res = await axios.post('http://localhost:5000/api/auth/register', data, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setError('');
            alert('Account created successfully! Please log in with your credentials.');
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8 animate-fade-in">
                    <h1 className="text-4xl sm:text-5xl font-bold text-textMain mb-2">VyapaarSathi</h1>
                    <p className="text-lg text-textLight">Start Your Business Journey</p>
                </div>

                {/* Registration Card */}
                <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 w-full hover:shadow-xl transition-shadow duration-300 animate-slide-up">
                    <h2 className="text-2xl sm:text-3xl font-bold text-textMain text-center mb-8">Create Your Account</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 animate-shake">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide text-gray-600">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Full Name</label>
                                    <input
                                        name="name"
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Email Address</label>
                                    <input
                                        name="email"
                                        type="email"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={onChange}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4 pt-2 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide text-gray-600">Security</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Password</label>
                                    <input
                                        name="password"
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={onChange}
                                    />
                                    
                                    {/* Password Strength Indicator */}
                                    {formData.password && (
                                        <div className="mt-3 space-y-2">
                                            <div className="flex items-center gap-2">
                                                <div className="flex-grow h-2 bg-gray-200 rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full transition-all duration-300"
                                                        style={{
                                                            width: `${(passwordStrength.score / 5) * 100}%`,
                                                            backgroundColor:
                                                                passwordStrength.level === 'Strong'
                                                                    ? '#10B981'
                                                                    : passwordStrength.level === 'Good'
                                                                        ? '#3B82F6'
                                                                        : passwordStrength.level === 'Fair'
                                                                            ? '#F59E0B'
                                                                            : '#EF4444',
                                                        }}
                                                    ></div>
                                                </div>
                                                <span
                                                    className="text-xs font-semibold whitespace-nowrap"
                                                    style={{
                                                        color:
                                                            passwordStrength.level === 'Strong'
                                                                ? '#10B981'
                                                                : passwordStrength.level === 'Good'
                                                                    ? '#3B82F6'
                                                                    : passwordStrength.level === 'Fair'
                                                                        ? '#F59E0B'
                                                                        : '#EF4444',
                                                    }}
                                                >
                                                    {passwordStrength.level}
                                                </span>
                                            </div>

                                            {/* Criteria Checklist */}
                                            <div className="text-xs space-y-1 mt-2">
                                                {Object.entries(passwordStrength.criteria).map(([key, met]) => (
                                                    <div
                                                        key={key}
                                                        style={{ color: met ? '#10B981' : '#6B7280' }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <span>{met ? '✓' : '·'}</span>
                                                        <span>
                                                            {key === 'length' && 'At least 8 characters'}
                                                            {key === 'uppercase' && 'Uppercase letters (A-Z)'}
                                                            {key === 'lowercase' && 'Lowercase letters (a-z)'}
                                                            {key === 'number' && 'Numbers (0-9)'}
                                                            {key === 'special' && 'Special characters'}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Confirm Password</label>
                                    <input
                                        name="confirmPassword"
                                        type="password"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={onChange}
                                    />
                                    {formData.password && formData.confirmPassword && (
                                        <p className={`text-xs mt-2 font-medium ${formData.password === formData.confirmPassword ? 'text-green-600' : 'text-red-600'}`}>
                                            {formData.password === formData.confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Business Information */}
                        <div className="space-y-4 pt-2 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide text-gray-600">Business Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Business Name</label>
                                    <input
                                        name="businessName"
                                        type="text"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        placeholder="My Business"
                                        value={formData.businessName}
                                        onChange={onChange}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-textMain mb-2">Business Type</label>
                                    <select
                                        name="businessType"
                                        required
                                        className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                        value={formData.businessType}
                                        onChange={onChange}
                                    >
                                        <option value="Retail">Retail</option>
                                        <option value="Service">Service</option>
                                        <option value="Manufacturing">Manufacturing</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-textMain mb-2">Starting Cash Balance</label>
                                <input
                                    name="startingCash"
                                    type="number"
                                    required
                                    className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:border-primary focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all duration-200"
                                    placeholder="50000"
                                    value={formData.startingCash}
                                    onChange={onChange}
                                />
                            </div>
                        </div>

                        {/* File Uploads */}
                        <div className="space-y-4 pt-2 border-t border-gray-200">
                            <h3 className="text-sm font-semibold text-textMain uppercase tracking-wide text-gray-600">Import Data (Optional)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-textMain mb-2">Inventory CSV</label>
                                    <input
                                        type="file"
                                        name="inventory"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        className="w-full text-sm text-textLight file:px-3 file:py-2 file:rounded file:border-0 file:font-medium file:bg-blue-100 file:text-primary hover:file:bg-blue-200 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textMain mb-2">Sales History CSV</label>
                                    <input
                                        type="file"
                                        name="sales"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        className="w-full text-sm text-textLight file:px-3 file:py-2 file:rounded file:border-0 file:font-medium file:bg-blue-100 file:text-primary hover:file:bg-blue-200 transition-colors"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-textMain mb-2">Expenses CSV</label>
                                    <input
                                        type="file"
                                        name="expenses"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        className="w-full text-sm text-textLight file:px-3 file:py-2 file:rounded file:border-0 file:font-medium file:bg-blue-100 file:text-primary hover:file:bg-blue-200 transition-colors"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-8 flex items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="px-3 text-sm text-textLight">Already have an account?</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    {/* Login Link */}
                    <Link to="/login">
                        <button
                            type="button"
                            className="w-full py-3 px-4 border-2 border-primary text-primary font-semibold rounded-lg hover:bg-blue-50 transform hover:scale-105 active:scale-95 transition-all duration-200"
                        >
                            Sign In Instead
                        </button>
                    </Link>
                </div>
            </div>

            {/* CSS Animations */}
            <style>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                @keyframes shake {
                    0%, 100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }

                .animate-fade-in {
                    animation: fadeIn 0.5s ease-out;
                }

                .animate-slide-up {
                    animation: slideUp 0.6s ease-out;
                }

                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
};

export default Register;
