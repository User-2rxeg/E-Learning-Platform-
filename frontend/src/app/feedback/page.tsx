'use client';
import { useState } from 'react';

import {
    MessageSquare,
    Send,
    CheckCircle,
    AlertCircle,
    Star,
    Bug,
    Eye,
    Zap,
    Shield,
    HelpCircle,
    FileText,
    User,
    Mail,
    Tag,
    ArrowLeft,
    Home
} from 'lucide-react';
import Link from 'next/link';
import {useAuth} from "../../contexts/AuthContext";
import {feedbackService} from "../../lib/services/feedback-api";


export default function FeedbackPage() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        message: '',
        contactEmail: user?.email || '',
        category: 'general'
    });

    const categories = [
        { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-gray-600' },
        { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-600' },
        { value: 'feature', label: 'Feature Request', icon: Star, color: 'text-blue-600' },
        { value: 'ui', label: 'UI/UX Issue', icon: Eye, color: 'text-purple-600' },
        { value: 'performance', label: 'performance Issue', icon: Zap, color: 'text-yellow-600' },
        { value: 'security', label: 'Security Concern', icon: Shield, color: 'text-orange-600' },
        { value: 'support', label: 'Support Request', icon: HelpCircle, color: 'text-green-600' },
        { value: 'other', label: 'Other', icon: FileText, color: 'text-gray-600' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.message.trim()) {
            setError('Please enter your feedback message');
            return;
        }

        if (formData.message.length < 10) {
            setError('Please provide more detailed feedback (at least 10 characters)');
            return;
        }

        try {
            setLoading(true);
            setError('');

            await feedbackService.submitFeedback({
                message: formData.message,
                contactEmail: formData.contactEmail || undefined,
                category: formData.category
            });

            setSubmitted(true);
        } catch (error) {
            console.error('Error submitting feedback:', error);
            setError('Failed to submit feedback. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
        if (error) setError('');
    };

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="max-w-md w-full bg-white rounded-xl shadow-sm p-8 text-center">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h1>
                    <p className="text-gray-600 mb-6">
                        Your feedback has been submitted successfully. We appreciate you taking the time to help us improve our platform.
                    </p>
                    <div className="space-y-3">
                        <Link
                            href="/"
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                        >
                            <Home className="w-4 h-4 mr-2" />
                            Return Home
                        </Link>
                        <button
                            onClick={() => {
                                setSubmitted(false);
                                setFormData({
                                    message: '',
                                    contactEmail: user?.email || '',
                                    category: 'general'
                                });
                            }}
                            className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                        >
                            Submit Another
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <Link href="/" className="flex items-center text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-5 h-5 mr-2" />
                                Back to Home
                            </Link>
                        </div>
                        <div className="flex items-center">
                            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-xl font-bold text-gray-900">Submit Feedback</h1>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="bg-white rounded-xl shadow-sm p-8">
                    <div className="text-center mb-8">
                        <h2 className="text-3xl font-bold text-gray-900 mb-2">We Value Your Feedback</h2>
                        <p className="text-gray-600">
                            Help us improve our platform by sharing your thoughts, reporting bugs, or suggesting new features.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Category Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3">
                                What type of feedback is this?
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                                {categories.map((category) => (
                                    <label
                                        key={category.value}
                                        className={`relative flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                                            formData.category === category.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="category"
                                            value={category.value}
                                            checked={formData.category === category.value}
                                            onChange={(e) => handleInputChange('category', e.target.value)}
                                            className="sr-only"
                                        />
                                        <div className="flex flex-col items-center text-center">
                                            <category.icon className={`w-6 h-6 mb-2 ${category.color}`} />
                                            <span className="text-sm font-medium text-gray-900">
                                                {category.label}
                                            </span>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        </div>

                        {/* Contact Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email (Optional)
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="email"
                                    value={formData.contactEmail}
                                    onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="your.email@example.com"
                                />
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                                We'll use this to follow up if needed. Your email will not be shared.
                            </p>
                        </div>

                        {/* Message */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Your Feedback
                            </label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => handleInputChange('message', e.target.value)}
                                rows={8}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                                placeholder="Please describe your feedback in detail. Include steps to reproduce if reporting a bug, or explain your feature request clearly..."
                                required
                            />
                            <div className="flex justify-between items-center mt-2">
                                <p className="text-sm text-gray-500">
                                    Minimum 10 characters. Be as detailed as possible.
                                </p>
                                <p className="text-sm text-gray-400">
                                    {formData.message.length} characters
                                </p>
                            </div>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600 mr-3" />
                                <p className="text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <div className="flex justify-end">
                            <button
                                type="submit"
                                disabled={loading || !formData.message.trim()}
                                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4 mr-2" />
                                        Submit Feedback
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Additional Info */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-medium text-gray-900 mb-3">What happens next?</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <MessageSquare className="w-6 h-6 text-blue-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">We Review</h4>
                                <p className="text-sm text-gray-600">Our team carefully reviews all feedback</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle className="w-6 h-6 text-green-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">We Prioritize</h4>
                                <p className="text-sm text-gray-600">We prioritize based on impact and feasibility</p>
                            </div>
                            <div className="text-center">
                                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Star className="w-6 h-6 text-purple-600" />
                                </div>
                                <h4 className="font-medium text-gray-900 mb-1">We Improve</h4>
                                <p className="text-sm text-gray-600">We implement changes to make the platform better</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
