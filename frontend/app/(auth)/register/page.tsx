'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { sessionManager } from '../../../server/session-manager';
import { Eye, EyeOff, Loader2, Check, X, AlertCircle, GraduationCap, UserCog, Shield } from 'lucide-react';

const calculatePasswordStrength = (password: string): { score: number; message: string; color: string } => {
    let score = 0;
    const checks = {
        length: password.length >= 8,
        lowercase: /[a-z]/.test(password),
        uppercase: /[A-Z]/.test(password),
        numbers: /\d/.test(password),
        special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };
    Object.values(checks).forEach(passed => { if (passed) score++; });

    const strengthLevels = [
        { min: 0, message: 'Very Weak', color: 'bg-red-500' },
        { min: 1, message: 'Weak', color: 'bg-orange-500' },
        { min: 2, message: 'Fair', color: 'bg-yellow-500' },
        { min: 3, message: 'Good', color: 'bg-lime-500' },
        { min: 4, message: 'Strong', color: 'bg-green-500' },
        { min: 5, message: 'Very Strong', color: 'bg-emerald-500' },
    ];

    const level = strengthLevels.reverse().find(l => score >= l.min) || strengthLevels[0];
    return { score: (score / 5) * 100, message: level.message, color: level.color };
};

const roleOptions = [
    {
        value: 'student',
        title: 'Student',
        description: 'Learn and grow',
        icon: GraduationCap,
    },
    {
        value: 'instructor',
        title: 'Instructor',
        description: 'Teach and inspire',
        icon: UserCog,
    },
];

type UserRole = 'student' | 'instructor';

export default function RegisterPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'student' as UserRole,
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState({ score: 0, message: '', color: '' });
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
    const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [agreedToTerms, setAgreedToTerms] = useState(false);

    const { register } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (formData.password) {
            setPasswordStrength(calculatePasswordStrength(formData.password));
        }
    }, [formData.password]);

    const validateField = (name: string, value: string): string => {
        switch (name) {
            case 'name':
                if (!value.trim()) return 'Name is required';
                if (value.length < 2) return 'Name must be at least 2 characters';
                if (value.length > 50) return 'Name is too long';
                return '';
            case 'email':
                if (!value.trim()) return 'Email is required';
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format';
                return '';
            case 'password':
                if (!value) return 'Password is required';
                if (value.length < 8) return 'Password must be at least 8 characters';
                if (!/[a-z]/.test(value)) return 'Password must include lowercase letter';
                if (!/[A-Z]/.test(value)) return 'Password must include uppercase letter';
                if (!/\d/.test(value)) return 'Password must include a number';
                return '';
            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== formData.password) return 'Passwords do not match';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (name: string, value: string) => {
        setFormData(prev => ({ ...prev, [name]: value }));
        if (touchedFields.has(name)) {
            setFieldErrors(prev => ({ ...prev, [name]: validateField(name, value) }));
        }
        // Also revalidate confirm password when password changes
        if (name === 'password' && touchedFields.has('confirmPassword')) {
            setFieldErrors(prev => ({
                ...prev,
                confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : ''
            }));
        }
    };

    const handleBlur = (name: string) => {
        setTouchedFields(prev => new Set(prev).add(name));
        setFieldErrors(prev => ({ ...prev, [name]: validateField(name, formData[name as keyof typeof formData]) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validate all fields
        const errors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const err = validateField(key, formData[key as keyof typeof formData]);
            if (err) errors[key] = err;
        });

        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (Object.keys(errors).length > 0) {
            setFieldErrors(errors);
            setTouchedFields(new Set(Object.keys(formData)));
            return;
        }

        setLoading(true);

        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            });

            if (!result.success) {
                setError(result.error || 'Registration failed');
                return;
            }

            // Store email for OTP verification
            sessionManager.setPendingEmail(formData.email);
            router.push('/verify-otp');
        } catch (err) {
            console.error('Registration error:', err);
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const passwordChecks = [
        { label: 'At least 8 characters', met: formData.password.length >= 8 },
        { label: 'Lowercase letter', met: /[a-z]/.test(formData.password) },
        { label: 'Uppercase letter', met: /[A-Z]/.test(formData.password) },
        { label: 'Number', met: /\d/.test(formData.password) },
        { label: 'Special character', met: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password) },
    ];

    return (
        <div className="p-8">
            <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Create your account
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Start your learning journey today
                </p>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-sm text-red-700 dark:text-red-400">{error}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Role Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        I want to
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                        {roleOptions.map((option) => {
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setFormData(prev => ({ ...prev, role: option.value as UserRole }))}
                                    className={`p-3 rounded-lg border-2 transition-all text-left ${
                                        formData.role === option.value
                                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                                    }`}
                                >
                                    <Icon className={`w-5 h-5 mb-1 ${
                                        formData.role === option.value
                                            ? 'text-blue-600 dark:text-blue-400'
                                            : 'text-gray-400'
                                    }`} />
                                    <div className={`font-medium text-sm ${
                                        formData.role === option.value
                                            ? 'text-blue-900 dark:text-blue-100'
                                            : 'text-gray-700 dark:text-gray-300'
                                    }`}>
                                        {option.title}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-400">
                                        {option.description}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Name */}
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full name
                    </label>
                    <input
                        id="name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        onBlur={() => handleBlur('name')}
                        placeholder="John Doe"
                        autoComplete="name"
                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.name && touchedFields.has('name')
                                ? 'border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                        }`}
                    />
                    {fieldErrors.name && touchedFields.has('name') && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email address
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        onBlur={() => handleBlur('email')}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                            fieldErrors.email && touchedFields.has('email')
                                ? 'border-red-500'
                                : 'border-gray-300 dark:border-gray-600'
                        }`}
                    />
                    {fieldErrors.email && touchedFields.has('email') && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                    )}
                </div>

                {/* Password */}
                <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Password
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            value={formData.password}
                            onChange={(e) => handleChange('password', e.target.value)}
                            onBlur={() => handleBlur('password')}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                fieldErrors.password && touchedFields.has('password')
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Password Strength */}
                    {formData.password && (
                        <div className="mt-2">
                            <div className="flex items-center gap-2 mb-1">
                                <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full ${passwordStrength.color} transition-all duration-300`}
                                        style={{ width: `${passwordStrength.score}%` }}
                                    />
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 w-20">
                                    {passwordStrength.message}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-xs">
                                {passwordChecks.map((check, i) => (
                                    <div key={i} className="flex items-center gap-1">
                                        {check.met ? (
                                            <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <X className="w-3 h-3 text-gray-300" />
                                        )}
                                        <span className={check.met ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}>
                                            {check.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Confirm Password */}
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Confirm password
                    </label>
                    <div className="relative">
                        <input
                            id="confirmPassword"
                            type={showConfirmPassword ? 'text' : 'password'}
                            value={formData.confirmPassword}
                            onChange={(e) => handleChange('confirmPassword', e.target.value)}
                            onBlur={() => handleBlur('confirmPassword')}
                            placeholder="••••••••"
                            autoComplete="new-password"
                            className={`w-full px-4 py-3 pr-12 rounded-lg border bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all ${
                                fieldErrors.confirmPassword && touchedFields.has('confirmPassword')
                                    ? 'border-red-500'
                                    : 'border-gray-300 dark:border-gray-600'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {fieldErrors.confirmPassword && touchedFields.has('confirmPassword') && (
                        <p className="mt-1 text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                    )}
                </div>

                {/* Terms */}
                <div>
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={agreedToTerms}
                            onChange={(e) => setAgreedToTerms(e.target.checked)}
                            className="w-4 h-4 mt-0.5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                            I agree to the{' '}
                            <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link>
                            {' '}and{' '}
                            <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>
                        </span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Creating account...
                        </>
                    ) : (
                        'Create account'
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Already have an account?{' '}
                    <Link
                        href="/login"
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                    >
                        Sign in
                    </Link>
                </p>
            </div>
        </div>
    );
}

