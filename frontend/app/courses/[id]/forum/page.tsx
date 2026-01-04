'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../contexts/AuthContext';

import {
    MessageSquare,
    Plus,
    ThumbsUp,
    Reply,
    Search,
    Users,
    Clock,
    Edit,
    Trash2,
    ChevronRight,
    ArrowLeft
} from 'lucide-react';
import apiClient from "../../../../services/api-client";
interface Post {
    _id: string;
    content: string;
    author: any;
    timestamp: string;
    likes: string[];
}
interface Thread {
    _id: string;
    title: string;
    createdBy: any;
    createdAt: string;
    posts: Post[];
}
interface Forum {
    _id: string;
    courseId: string;
    threads: Thread[];
}
export default function CourseForum() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const courseId = params.id as string;
    const [forum, setForum] = useState<Forum | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [replyingTo, setReplyingTo] = useState<string | null>(null);
    useEffect(() => {
        fetchForum();
    }, [courseId]);
    const fetchForum = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get(`/forums/course/${courseId}`);
            setForum(response.data);
        } catch (error) {
            console.error('Error fetching forum:', error);
// Create forum if doesn't exist
            if ((error as any).response?.status === 404) {
                try {
                    const createResponse = await apiClient.post('/forums', {
                        courseId,
                        threads: []
                    });
                    setForum(createResponse.data);
                } catch (createError) {
                    console.error('Error creating forum:', createError);
                }
            }
        } finally {
            setLoading(false);
        }
    };
    const createThread = async () => {
        if (!newThreadTitle.trim() || !forum) return;
        try {
            await apiClient.post(`/forums/${forum._id}/threads`, {
                title: newThreadTitle
            });
            setNewThreadTitle('');
            setShowNewThreadModal(false);
            await fetchForum();
        } catch (error) {
            console.error('Error creating thread:', error);
        }
    };
    const createPost = async (threadId: string) => {
        if (!newPostContent.trim() || !forum) return;
        try {
            await apiClient.post(`/forums/${forum._id}/threads/${threadId}/posts`, {
                content: newPostContent
            });
            setNewPostContent('');
            setReplyingTo(null);
            await fetchForum();
        } catch (error) {
            console.error('Error creating post:', error);
        }
    };
    const likePost = async (threadId: string, postId: string) => {
        if (!forum) return;
        try {
            await apiClient.patch(`/forums/${forum._id}/threads/${threadId}/posts/${postId}/like`);
            await fetchForum();
        } catch (error) {
            console.error('Error liking post:', error);
        }
    };
    const deleteThread = async (threadId: string) => {
        if (!forum || !confirm('Are you sure you want to delete this thread?')) return;
        try {
            await apiClient.delete(`/forums/${forum._id}/threads/${threadId}`);
            setSelectedThread(null);
            await fetchForum();
        } catch (error) {
            console.error('Error deleting thread:', error);
        }
    };
    const deletePost = async (threadId: string, postId: string) => {
        if (!confirm('Are you sure you want to delete this post?')) return;
        try {
            await apiClient.delete(`/forums/course/${courseId}/threads/${threadId}/posts/${postId}`);
            await fetchForum();
        } catch (error) {
            console.error('Error deleting post:', error);
        }
    };
    const formatTimeAgo = (timestamp: string) => {
        const now = new Date().getTime();
        const time = new Date(timestamp).getTime();
        const diff = now - time;
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes} minutes ago`;
        if (hours < 24) return `${hours} hours ago`;
        return `${days} days ago`;
    };
    const filteredThreads = forum?.threads.filter(thread =>
        thread.title.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }
    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push(`/courses/${courseId}`)}
                        className="flex items-center text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Course
                    </button>
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold text-gray-900">Course Forum</h1>
                        <button
                            onClick={() => setShowNewThreadModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Thread
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Thread List */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                            <div className="p-4 border-b border-gray-200">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                    <input
                                        type="text"
                                        placeholder="Search threads..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm"
                                    />
                                </div>
                            </div>

                            <div className="divide-y divide-gray-200 max-h-[600px] overflow-y-auto">
                                {filteredThreads.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-gray-500">No threads yet</p>
                                        <button
                                            onClick={() => setShowNewThreadModal(true)}
                                            className="mt-4 text-blue-600 hover:text-blue-700 text-sm"
                                        >
                                            Start the first discussion
                                        </button>
                                    </div>
                                ) : (
                                    filteredThreads.map(thread => (
                                        <button
                                            key={thread._id}
                                            onClick={() => setSelectedThread(thread)}
                                            className={`w-full p-4 hover:bg-gray-50 text-left transition-colors ${
                                                selectedThread?._id === thread._id ? 'bg-blue-50' : ''
                                            }`}
                                        >
                                            <h3 className="font-medium text-gray-900 mb-1">{thread.title}</h3>
                                            <div className="flex items-center text-xs text-gray-500">
                                                <Users className="w-3 h-3 mr-1" />
                                                <span>{thread.posts.length} replies</span>
                                                <span className="mx-2">•</span>
                                                <Clock className="w-3 h-3 mr-1" />
                                                <span>{formatTimeAgo(thread.createdAt)}</span>
                                            </div>
                                        </button>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Thread Content */}
                    <div className="lg:col-span-2">
                        {selectedThread ? (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Thread Header */}
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-900 mb-2">
                                                {selectedThread.title}
                                            </h2>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <span>Started by {selectedThread.createdBy?.name || 'Unknown'}</span>
                                                <span className="mx-2">•</span>
                                                <span>{formatTimeAgo(selectedThread.createdAt)}</span>
                                            </div>
                                        </div>
                                        {selectedThread.createdBy?._id === user?.id && (
                                            <button
                                                onClick={() => deleteThread(selectedThread._id)}
                                                className="text-red-600 hover:text-red-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Posts */}
                                <div className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
                                    {selectedThread.posts.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <p className="text-gray-500">No replies yet. Be the first to respond!</p>
                                        </div>
                                    ) : (
                                        selectedThread.posts.map(post => (
                                            <div key={post._id} className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center mb-2">
                                                            <div className="w-8 h-8 bg-gray-300 rounded-full mr-3"></div>
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">
                                                                    {post.author?.name || 'Unknown user'}
                                                                </p>
                                                                <p className="text-xs text-gray-500">{formatTimeAgo(post.timestamp)}</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-gray-700 ml-11">{post.content}</p>
                                                        <div className="flex items-center gap-4 mt-3 ml-11">
                                                            <button
                                                                onClick={() => likePost(selectedThread._id, post._id)}
                                                                className={`flex items-center text-sm ${
                                                                    post.likes.includes(user?.id || '')
                                                                        ? 'text-blue-600'
                                                                        : 'text-gray-500 hover:text-gray-700'
                                                                }`}
                                                            >
                                                                <ThumbsUp className="w-4 h-4 mr-1" />
                                                                {post.likes.length}
                                                            </button>
                                                            <button
                                                                onClick={() => setReplyingTo(post._id)}
                                                                className="flex items-center text-sm text-gray-500 hover:text-gray-700"
                                                            >
                                                                <Reply className="w-4 h-4 mr-1" />
                                                                Reply
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {post.author?._id === user?.id && (
                                                        <button
                                                            onClick={() => deletePost(selectedThread._id, post._id)}
                                                            className="text-gray-400 hover:text-red-600"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                {/* Reply Box */}
                                <div className="p-4 border-t border-gray-200">
                                    <div className="flex gap-3">
                <textarea
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Write your reply..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                />
                                        <button
                                            onClick={() => createPost(selectedThread._id)}
                                            disabled={!newPostContent.trim()}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            Post Reply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a thread</h3>
                                <p className="text-gray-500">Choose a discussion thread to view and participate</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* New Thread Modal */}
            {showNewThreadModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Start New Discussion</h3>
                        <input
                            type="text"
                            value={newThreadTitle}
                            onChange={(e) => setNewThreadTitle(e.target.value)}
                            placeholder="Thread title..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
                            autoFocus
                        />
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowNewThreadModal(false);
                                    setNewThreadTitle('');
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={createThread}
                                disabled={!newThreadTitle.trim()}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                Create Thread
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}