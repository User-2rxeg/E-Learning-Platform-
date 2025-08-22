// src/components/communication/ForumInterface.tsx
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';

function formatTimeAgo(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'just now';
}

interface Post {
    _id: string;
    content: string;
    author: {
        _id: string;
        name: string;
    };
    timestamp: Date;
    likes: string[];
}

interface Thread {
    _id: string;
    title: string;
    createdBy: {
        _id: string;
        name: string;
    };
    createdAt: Date;
    posts: Post[];
}

interface ForumInterfaceProps {
    courseId: string;
}

export default function ForumInterface({ courseId }: ForumInterfaceProps) {
    const { user, token } = useAuth();
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThread, setSelectedThread] = useState<Thread | null>(null);
    const [loading, setLoading] = useState(true);
    const [newThreadTitle, setNewThreadTitle] = useState('');
    const [newPostContent, setNewPostContent] = useState('');
    const [showNewThreadModal, setShowNewThreadModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [forumId, setForumId] = useState<string | null>(null);

    useEffect(() => {
        fetchForum();
    }, [courseId]);

    const fetchForum = async () => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/course/${courseId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setForumId(data._id);
                setThreads(data.threads || []);
            }
        } catch (error) {
            console.error('Failed to fetch forum:', error);
        } finally {
            setLoading(false);
        }
    };

    const createThread = async () => {
        if (!newThreadTitle.trim() || !forumId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forumId}/threads`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ title: newThreadTitle }),
            });

            if (response.ok) {
                setNewThreadTitle('');
                setShowNewThreadModal(false);
                fetchForum();
            }
        } catch (error) {
            console.error('Failed to create thread:', error);
        }
    };

    const addPost = async (threadId: string) => {
        if (!newPostContent.trim() || !forumId) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forumId}/threads/${threadId}/posts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newPostContent }),
            });

            if (response.ok) {
                setNewPostContent('');
                fetchForum();
            }
        } catch (error) {
            console.error('Failed to add post:', error);
        }
    };

    const toggleLike = async (threadId: string, postId: string) => {
        if (!forumId) return;

        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forumId}/threads/${threadId}/posts/${postId}/like`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.ok) {
                fetchForum();
            }
        } catch (error) {
            console.error('Failed to toggle like:', error);
        }
    };

    const deleteThread = async (threadId: string) => {
        if (!forumId || !confirm('Are you sure you want to delete this thread?')) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/forums/${forumId}/threads/${threadId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.ok) {
                setSelectedThread(null);
                fetchForum();
            }
        } catch (error) {
            console.error('Failed to delete thread:', error);
        }
    };

    const filteredThreads = threads.filter(thread =>
        thread.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="bg-primary-light rounded-xl border border-gray-800">
            <div className="p-6 border-b border-gray-800">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-bold text-white">Course Forum</h2>
                    <button
                        onClick={() => setShowNewThreadModal(true)}
                        className="px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors"
                    >
                        + New Thread
                    </button>
                </div>

                <input
                    type="text"
                    placeholder="Search threads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 bg-primary border border-gray-700 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                />
            </div>

            {loading ? (
                <div className="p-8 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent mx-auto"></div>
                </div>
            ) : (
                <div className="flex h-[600px]">
                    <div className="w-1/3 border-r border-gray-800 overflow-y-auto">
                        {filteredThreads.length === 0 ? (
                            <div className="p-8 text-center">
                                <p className="text-text-secondary">No threads yet</p>
                                <button
                                    onClick={() => setShowNewThreadModal(true)}
                                    className="mt-4 text-accent hover:text-accent-hover text-sm"
                                >
                                    Start the first discussion →
                                </button>
                            </div>
                        ) : (
                            filteredThreads.map((thread) => (
                                <div
                                    key={thread._id}
                                    onClick={() => setSelectedThread(thread)}
                                    className={`p-4 hover:bg-primary/50 cursor-pointer transition-colors border-b border-gray-800 ${
                                        selectedThread?._id === thread._id ? 'bg-primary/50 border-l-2 border-accent' : ''
                                    }`}
                                >
                                    <h3 className="text-white font-medium mb-1">{thread.title}</h3>
                                    <div className="flex items-center justify-between text-xs text-text-secondary">
                                        <span>by {thread.createdBy?.name || 'Unknown'}</span>
                                        <span>{formatTimeAgo(new Date(thread.createdAt))}</span>
                                    </div>
                                    <p className="text-text-secondary text-sm mt-2">
                                        {thread.posts?.length || 0} replies
                                    </p>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedThread ? (
                        <div className="flex-1 flex flex-col">
                            <div className="p-4 border-b border-gray-800">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h3 className="text-xl font-semibold text-white">{selectedThread.title}</h3>
                                        <p className="text-text-secondary text-sm mt-1">
                                            Started by {selectedThread.createdBy?.name} • {formatTimeAgo(new Date(selectedThread.createdAt))}
                                        </p>
                                    </div>
                                    {selectedThread.createdBy?._id === user?.id && (
                                        <button
                                            onClick={() => deleteThread(selectedThread._id)}
                                            className="p-2 text-red-400 hover:text-red-300 transition-colors"
                                            title="Delete Thread"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                                />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {selectedThread.posts?.length === 0 ? (
                                    <p className="text-text-secondary text-center py-8">No replies yet. Be the first to respond!</p>
                                ) : (
                                    selectedThread.posts?.map((post) => (
                                        <div key={post._id} className="bg-primary rounded-lg p-4">
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex items-center space-x-2">
                                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-blue-500 flex items-center justify-center text-white text-sm font-bold">
                                                        {post.author?.name?.[0] || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-medium text-sm">{post.author?.name || 'Unknown'}</p>
                                                        <p className="text-text-secondary text-xs">{formatTimeAgo(new Date(post.timestamp))}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <p className="text-white mb-3">{post.content}</p>

                                            <div className="flex items-center space-x-4">
                                                <button
                                                    onClick={() => toggleLike(selectedThread._id, post._id)}
                                                    className={`flex items-center space-x-1 text-sm transition-colors ${
                                                        post.likes?.includes(user?.id || '') ? 'text-accent' : 'text-text-secondary hover:text-white'
                                                    }`}
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        fill={post.likes?.includes(user?.id || '') ? 'currentColor' : 'none'}
                                                        stroke="currentColor"
                                                        viewBox="0 0 24 24"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                                                        />
                                                    </svg>
                                                    <span>{post.likes?.length || 0}</span>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            <div className="p-4 border-t border-gray-800">
                                <div className="flex space-x-2">
                                    <input
                                        type="text"
                                        value={newPostContent}
                                        onChange={(e) => setNewPostContent(e.target.value)}
                                        placeholder="Write a reply..."
                                        className="flex-1 px-4 py-2 bg-primary border border-gray-700 rounded-lg text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                    <button
                                        onClick={() => addPost(selectedThread._id)}
                                        disabled={!newPostContent.trim()}
                                        className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Reply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary flex items-center justify-center">
                                    <svg
                                        className="w-12 h-12 text-text-secondary"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                                        />
                                    </svg>
                                </div>
                                <p className="text-text-secondary">Select a thread to view discussion</p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}