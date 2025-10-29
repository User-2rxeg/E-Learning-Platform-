'use client';
import { useState } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import Link from 'next/link';

export default function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            {/* Floating Feedback Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
                title="Submit Feedback"
            >
                <MessageSquare className="w-6 h-6" />
            </button>

            {/* Feedback Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Quick Feedback</h3>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <p className="text-gray-600 mb-4">
                            Have feedback about our platform? We'd love to hear from you!
                        </p>

                        <div className="space-y-3">
                            <Link
                                href="/feedback"
                                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center"
                                onClick={() => setIsOpen(false)}
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Submit Detailed Feedback
                            </Link>

                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Maybe Later
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
