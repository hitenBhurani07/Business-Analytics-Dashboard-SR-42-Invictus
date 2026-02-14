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

        if (!criteria.length) suggestions.push('Add at least 8 characters');
        if (!criteria.uppercase) suggestions.push('Add uppercase letters (A-Z)');
        if (!criteria.lowercase) suggestions.push('Add lowercase letters (a-z)');
        if (!criteria.number) suggestions.push('Add numbers (0-9)');
        if (!criteria.special) suggestions.push('Add special characters (!@#$%^&*)');

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

            // Show success message
            setError('');
            alert('Account created successfully! Please log in with your credentials.');
            
            // Redirect to login page
            navigate('/login');
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ background: '#FFFFFF' }} className="min-h-screen py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 style={{ color: '#2563EB' }} className="text-4xl font-bold mb-2">Vyapaar</h1>
                    <p style={{ color: '#6B7280' }} className="text-lg">Start Your Business Journey</p>
                </div>

                {/* Card */}
                <div style={{ backgroundColor: '#F9FAFB' }} className="rounded-2xl p-8 shadow-lg">
                    <h2 style={{ color: '#111827' }} className="text-2xl font-bold text-center mb-8">Register Your Business</h2>

                    <form className="space-y-5" onSubmit={onSubmit}>
                        {error && (
                            <div style={{ backgroundColor: '#FEE2E2', borderColor: '#EF4444' }} className="border-l-4 p-4 rounded-lg">
                                <p style={{ color: '#991B1B' }} className="font-medium">{error}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Full Name</label>
                                <input
                                    name="name"
                                    type="text"
                                    required
                                    style={{ borderColor: '#E5E7EB' }}
                                    className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    placeholder="John Doe"
                                    value={formData.name}
                                    onChange={onChange}
                                />
                            </div>
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
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                
                                {/* Password Strength Indicator */}
                                {formData.password && (
                                    <div className="mt-3 space-y-2">
                                        {/* Strength Bar */}
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
                                                className="text-xs font-semibold whitespace-nowrap"
                                            >
                                                {passwordStrength.level}
                                            </span>
                                        </div>

                                        {/* Criteria Checklist */}
                                        <div className="text-xs space-y-1 mt-2">
                                            <div
                                                style={{
                                                    color: passwordStrength.criteria.length ? '#10B981' : '#6B7280',
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{passwordStrength.criteria.length ? '✓' : '○'}</span>
                                                <span>At least 8 characters</span>
                                            </div>
                                            <div
                                                style={{
                                                    color: passwordStrength.criteria.uppercase ? '#10B981' : '#6B7280',
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{passwordStrength.criteria.uppercase ? '✓' : '○'}</span>
                                                <span>Uppercase letter (A-Z)</span>
                                            </div>
                                            <div
                                                style={{
                                                    color: passwordStrength.criteria.lowercase ? '#10B981' : '#6B7280',
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{passwordStrength.criteria.lowercase ? '✓' : '○'}</span>
                                                <span>Lowercase letter (a-z)</span>
                                            </div>
                                            <div
                                                style={{
                                                    color: passwordStrength.criteria.number ? '#10B981' : '#6B7280',
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{passwordStrength.criteria.number ? '✓' : '○'}</span>
                                                <span>Number (0-9)</span>
                                            </div>
                                            <div
                                                style={{
                                                    color: passwordStrength.criteria.special ? '#10B981' : '#6B7280',
                                                }}
                                                className="flex items-center gap-2"
                                            >
                                                <span>{passwordStrength.criteria.special ? '✓' : '○'}</span>
                                                <span>Special character (!@#$%^&*)</span>
                                            </div>
                                        </div>

                                        {/* Suggestions */}
                                        {passwordStrength.suggestions.length > 0 && (
                                            <div style={{ backgroundColor: '#FEF3C7', borderColor: '#F59E0B', color: '#92400E' }} className="border-l-4 p-2 rounded text-xs mt-2">
                                                <p style={{ color: '#92400E' }} className="font-semibold mb-1">Suggestions:</p>
                                                <ul className="list-disc list-inside space-y-0.5">
                                                    {passwordStrength.suggestions.map((suggestion, idx) => (
                                                        <li key={idx}>{suggestion}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div>
                                <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Confirm Password</label>
                                <input
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    style={{ borderColor: '#E5E7EB' }}
                                    className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    placeholder="••••••••"
                                    value={formData.confirmPassword}
                                    onChange={onChange}
                                />
                                {formData.password && formData.confirmPassword && formData.password === formData.confirmPassword && (
                                    <p style={{ color: '#10B981' }} className="text-xs mt-2 flex items-center gap-1">
                                        <span>✓</span> Passwords match
                                    </p>
                                )}
                                {formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword && (
                                    <p style={{ color: '#EF4444' }} className="text-xs mt-2 flex items-center gap-1">
                                        <span>✗</span> Passwords do not match
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Business Name</label>
                                <input
                                    name="businessName"
                                    type="text"
                                    required
                                    style={{ borderColor: '#E5E7EB' }}
                                    className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                    placeholder="My Business"
                                    value={formData.businessName}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Business Type</label>
                                <select
                                    name="businessType"
                                    required
                                    style={{ borderColor: '#E5E7EB' }}
                                    className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                    onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                    onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
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
                            <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Starting Cash Balance</label>
                            <input
                                name="startingCash"
                                type="number"
                                required
                                style={{ borderColor: '#E5E7EB' }}
                                className="w-full px-4 py-3 border rounded-lg transition duration-200 focus:outline-none focus:ring-2"
                                onFocus={(e) => e.target.style.borderColor = '#2563EB'}
                                onBlur={(e) => e.target.style.borderColor = '#E5E7EB'}
                                placeholder="50000"
                                value={formData.startingCash}
                                onChange={onChange}
                            />
                        </div>

                        {/* File Uploads */}
                        <div>
                            <h3 style={{ color: '#111827' }} className="text-lg font-semibold mb-4">Upload Data (Optional)</h3>
                            <div className="space-y-4">
                                <div>
                                    <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Inventory CSV</label>
                                    <input
                                        type="file"
                                        name="inventory"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        style={{ borderColor: '#E5E7EB' }}
                                        className="w-full px-4 py-3 border rounded-lg cursor-pointer transition duration-200"
                                    />
                                </div>
                                <div>
                                    <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Sales History CSV</label>
                                    <input
                                        type="file"
                                        name="sales"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        style={{ borderColor: '#E5E7EB' }}
                                        className="w-full px-4 py-3 border rounded-lg cursor-pointer transition duration-200"
                                    />
                                </div>
                                <div>
                                    <label style={{ color: '#111827' }} className="block text-sm font-medium mb-2">Expenses CSV</label>
                                    <input
                                        type="file"
                                        name="expenses"
                                        accept=".csv"
                                        onChange={onFileChange}
                                        style={{ borderColor: '#E5E7EB' }}
                                        className="w-full px-4 py-3 border rounded-lg cursor-pointer transition duration-200"
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ backgroundColor: '#2563EB' }}
                            className="w-full text-white font-semibold py-3 rounded-lg transition duration-300 transform hover:scale-105 active:scale-95 disabled:opacity-50 mt-6"
                        >
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="my-6 flex items-center">
                        <div style={{ backgroundColor: '#E5E7EB' }} className="flex-grow h-px"></div>
                        <span style={{ color: '#6B7280' }} className="px-3 text-sm">Already registered?</span>
                        <div style={{ backgroundColor: '#E5E7EB' }} className="flex-grow h-px"></div>
                    </div>

                    {/* Login Link */}
                    <Link to="/login">
                        <button
                            type="button"
                            style={{ borderColor: '#2563EB', color: '#2563EB' }}
                            className="w-full border-2 font-semibold py-3 rounded-lg transition duration-300 hover:bg-blue-50"
                        >
                            Sign In
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Register;
