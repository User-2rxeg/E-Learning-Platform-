'use client';
import { useState, useEffect } from 'react';

import {
    MessageSquare,
    Search,
    Filter,
    Download,
    Trash2,
    Eye,
    Mail,
    Calendar,
    User,
    Tag,
    ChevronDown,
    ChevronUp,
    RefreshCw,
    AlertCircle,
    CheckCircle,
    Clock,
    Star,
    ThumbsUp,
    ThumbsDown,
    Reply,
    Archive,
    Flag,
    MoreVertical,
    Plus,
    Send,
    FileText,
    X
} from 'lucide-react';
import { Feedback, feedbackService } from "../../../../services";
import {useAuth} from "../../../../contexts/AuthContext";

interface FeedbackStats {
    total: number;
    byCategory: Record<string, number>;
    recent: number;
    unread: number;
}

export default function AdminFeedback() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [feedback, setFeedback] = useState<Feedback[]>([]);
    const [stats, setStats] = useState<FeedbackStats | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedFeedback, setSelectedFeedback] = useState<Feedback | null>(null);
    const [showFeedbackModal, setShowFeedbackModal] = useState(false);
    const [expandedFeedback, setExpandedFeedback] = useState<Set<string>>(new Set());

    const categories = [
        'general',
        'bug',
        'feature',
        'ui',
        'performance',
        'security',
        'support',
        'other'
    ];

    useEffect(() => {
        fetchFeedback();
    }, [currentPage, categoryFilter, searchQuery]);

    const fetchFeedback = async () => {
        try {
            setLoading(true);
            const response = await feedbackService.listFeedback({
                q: searchQuery,
                category: categoryFilter,
                page: currentPage,
                limit: 20
            });
            setFeedback(response.items);
            setTotalPages(response.pages);
        } catch (error) {
            console.error('Error fetching feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteFeedback = async (feedbackId: string) => {
        if (confirm('Are you sure you want to delete this feedback?')) {
            try {
                await feedbackService.deleteFeedback(feedbackId);
                await fetchFeedback();
                alert('Feedback deleted successfully');
            } catch (error) {
                console.error('Error deleting feedback:', error);
                alert('Failed to delete feedback');
            }
        }
    };

    const toggleFeedbackExpansion = (feedbackId: string) => {
        const newExpanded = new Set(expandedFeedback);
        if (newExpanded.has(feedbackId)) {
            newExpanded.delete(feedbackId);
        } else {
            newExpanded.add(feedbackId);
        }
        setExpandedFeedback(newExpanded);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'bug':
                return 'bg-red-100 text-red-800';
            case 'feature':
                return 'bg-blue-100 text-blue-800';
            case 'ui':
                return 'bg-purple-100 text-purple-800';
            case 'performance':
                return 'bg-yellow-100 text-yellow-800';
            case 'security':
                return 'bg-orange-100 text-orange-800';
            case 'support':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'bug':
                return <AlertCircle className="w-4 h-4" />;
            case 'feature':
                return <Star className="w-4 h-4" />;
            case 'ui':
                return <Eye className="w-4 h-4" />;
            case 'performance':
                return <Clock className="w-4 h-4" />;
            case 'security':
                return <Flag className="w-4 h-4" />;
            case 'support':
                return <Reply className="w-4 h-4" />;
            default:
                return <FileText className="w-4 h-4" />;
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading feedback...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center">
                            <MessageSquare className="w-6 h-6 text-blue-600 mr-2" />
                            <h1 className="text-2xl font-bold text-gray-900">User Feedback</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchFeedback}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Refresh
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Feedback</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">{feedback.length}</p>
                            </div>
                            <div className="p-3 bg-blue-50 rounded-lg">
                                <MessageSquare className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Bug Reports</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {feedback.filter(f => f.category === 'bug').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-50 rounded-lg">
                                <AlertCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Feature Requests</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {feedback.filter(f => f.category === 'feature').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <Star className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">This Month</p>
                                <p className="text-3xl font-bold text-gray-900 mt-1">
                                    {feedback.filter(f => {
                                        const feedbackDate = new Date(f.createdAt);
                                        const now = new Date();
                                        return feedbackDate.getMonth() === now.getMonth() &&
                                            feedbackDate.getFullYear() === now.getFullYear();
                                    }).length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-50 rounded-lg">
                                <Calendar className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters and Search */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                        <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search feedback..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
                                />
                            </div>

                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="px-4 py-2 border border-gray-300 rounded-lg"
                            >
                                <option value="">All Categories</option>
                                {categories.map(category => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex gap-3">
                            <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center">
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </button>
                        </div>
                    </div>
                </div>

                {/* Feedback List */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {feedback.length === 0 ? (
                        <div className="p-8 text-center">
                            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No feedback found</h3>
                            <p className="text-gray-500">No feedback matches your current filters.</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-200">
                            {feedback.map((item) => (
                                <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center space-x-3 mb-3">
                                                <span className={`px-2 py-1 text-xs rounded-full flex items-center ${getCategoryColor(item.category)}`}>
                                                    {getCategoryIcon(item.category)}
                                                    <span className="ml-1 capitalize">{item.category}</span>
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {formatDate(item.createdAt)}
                                                </span>
                                                {item.contactEmail && (
                                                    <span className="text-sm text-gray-500 flex items-center">
                                                        <Mail className="w-4 h-4 mr-1" />
                                                        {item.contactEmail}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="mb-3">
                                                <p className={`text-gray-900 ${expandedFeedback.has(item._id) ? '' : 'line-clamp-3'}`}>
                                                    {item.message}
                                                </p>
                                                {item.message.length > 200 && (
                                                    <button
                                                        onClick={() => toggleFeedbackExpansion(item._id)}
                                                        className="text-blue-600 hover:text-blue-700 text-sm mt-2"
                                                    >
                                                        {expandedFeedback.has(item._id) ? 'Show less' : 'Show more'}
                                                    </button>
                                                )}
                                            </div>

                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                {item.userId && (
                                                    <span className="flex items-center">
                                                        <User className="w-4 h-4 mr-1" />
                                                        User ID: {item.userId}
                                                    </span>
                                                )}
                                                <span className="flex items-center">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    {formatDate(item.createdAt)}
                                                </span>
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-2 ml-4">
                                            <button
                                                onClick={() => {
                                                    setSelectedFeedback(item);
                                                    setShowFeedbackModal(true);
                                                }}
                                                className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteFeedback(item._id)}
                                                className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50"
                                                title="Delete Feedback"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                            <p className="text-sm text-gray-700">
                                Showing page {currentPage} of {totalPages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Feedback Detail Modal */}
            {showFeedbackModal && selectedFeedback && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-semibold text-gray-900">Feedback Details</h3>
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                <span className={`px-3 py-1 text-sm rounded-full inline-flex items-center ${getCategoryColor(selectedFeedback.category)}`}>
                                    {getCategoryIcon(selectedFeedback.category)}
                                    <span className="ml-2 capitalize">{selectedFeedback.category}</span>
                                </span>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <p className="text-gray-900 whitespace-pre-wrap">{selectedFeedback.message}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Contact Email</label>
                                    <p className="text-gray-900">{selectedFeedback.contactEmail || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">User ID</label>
                                    <p className="text-gray-900">{selectedFeedback.userId || 'Anonymous'}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Submitted</label>
                                    <p className="text-gray-900">{formatDate(selectedFeedback.createdAt)}</p>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Updated</label>
                                    <p className="text-gray-900">{formatDate(selectedFeedback.updatedAt)}</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => setShowFeedbackModal(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => {
                                    handleDeleteFeedback(selectedFeedback._id);
                                    setShowFeedbackModal(false);
                                }}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

