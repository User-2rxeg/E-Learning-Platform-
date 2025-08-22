// src/components/communication/ChatInterface.tsx
'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { io, Socket } from 'socket.io-client';


interface Message {
    id: string;
    sender: string;
    senderName?: string;
    content: string;
    attachmentUrl?: string;
    timestamp: Date;
    isOwn?: boolean;
}

interface ChatRoom {
    id: string;
    participants: Array<{
        _id: string;
        name: string;
        email: string;
        role: string;
    }>;
    isGroup: boolean;
    groupName?: string;
    lastMessage?: string;
    lastMessageAt?: Date;
    unreadCount?: number;
}

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

export default function ChatInterface() {
    const { user, token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [rooms, setRooms] = useState<ChatRoom[]>([]);
    const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [roomsLoading, setRoomsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [showNewRoomModal, setShowNewRoomModal] = useState(false);
    const [searchUsers, setSearchUsers] = useState('');
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [selectedParticipants, setSelectedParticipants] = useState<string[]>([]);
    const [groupName, setGroupName] = useState('');

    // Initialize WebSocket connection
    useEffect(() => {
        if (!token) return;

        const socketInstance = io(`${process.env.NEXT_PUBLIC_BACKEND_URL}/ws/chat`, {
            auth: { token },
            transports: ['websocket'],
        });

        socketInstance.on('connect', () => {
            console.log('Connected to chat');
        });

        socketInstance.on('chat:newMessage', (data) => {
            if (selectedRoom?.id === data.chatId) {
                setMessages(prev => [...prev, {
                    id: data.message.id,
                    sender: data.message.sender,
                    content: data.message.content,
                    attachmentUrl: data.message.attachmentUrl,
                    timestamp: new Date(data.message.timestamp),
                    isOwn: data.message.sender === user?.id
                }]);
            }

            // Update room list to show new message
            setRooms(prev => prev.map(room =>
                room.id === data.chatId
                    ? { ...room, lastMessage: data.message.content, lastMessageAt: new Date(data.message.timestamp) }
                    : room
            ));
        });

        socketInstance.on('chat:poke', (data) => {
            // Refresh rooms list when there's activity
            fetchRooms();
        });

        setSocket(socketInstance);

        return () => {
            socketInstance.disconnect();
        };
    }, [token, user?.id, selectedRoom?.id]);

    // Fetch chat rooms
    const fetchRooms = async () => {
        try {
            setRoomsLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/rooms`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setRooms(data.items || []);
        } catch (error) {
            console.error('Failed to fetch rooms:', error);
        } finally {
            setRoomsLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchRooms();
        }
    }, [token]);

    // Fetch messages for selected room
    const fetchMessages = async (roomId: string) => {
        try {
            setLoading(true);
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${roomId}/history`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();

            const formattedMessages = (data.items || []).map((msg: any) => ({
                id: msg._id,
                sender: msg.sender,
                content: msg.content,
                attachmentUrl: msg.attachmentUrl,
                timestamp: new Date(msg.createdAt),
                isOwn: msg.sender === user?.id
            }));

            setMessages(formattedMessages);

            // Join room via socket
            if (socket) {
                socket.emit('chat:join', roomId);
            }

            // Mark as read
            markAsRead(roomId);
        } catch (error) {
            console.error('Failed to fetch messages:', error);
        } finally {
            setLoading(false);
        }
    };

    // Select a chat room
    const selectRoom = (room: ChatRoom) => {
        if (selectedRoom?.id !== room.id) {
            if (selectedRoom && socket) {
                socket.emit('chat:leave', selectedRoom.id);
            }
            setSelectedRoom(room);
            fetchMessages(room.id);
        }
    };

    // Send message
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedRoom) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${selectedRoom.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ content: newMessage }),
            });

            if (response.ok) {
                setNewMessage('');
            }
        } catch (error) {
            console.error('Failed to send message:', error);
        }
    };

    // Mark messages as read
    const markAsRead = async (roomId: string) => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/${roomId}/read`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
        } catch (error) {
            console.error('Failed to mark as read:', error);
        }
    };

    // Search users for new chat
    const searchForUsers = async (query: string) => {
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/users/search?q=${query}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            const data = await response.json();
            setSearchResults(data.items || []);
        } catch (error) {
            console.error('Failed to search users:', error);
        }
    };

    // Create new chat room
    const createNewRoom = async () => {
        try {
            const isGroup = selectedParticipants.length > 1;
            const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/chat/rooms`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    participants: selectedParticipants,
                    isGroup,
                    groupName: isGroup ? groupName : undefined,
                }),
            });

            if (response.ok) {
                const newRoom = await response.json();
                setShowNewRoomModal(false);
                setSelectedParticipants([]);
                setGroupName('');
                setSearchUsers('');
                fetchRooms();
            }
        } catch (error) {
            console.error('Failed to create room:', error);
        }
    };

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    return (
        <div className="flex h-[calc(100vh-200px)] bg-primary-dark rounded-xl overflow-hidden border border-gray-800">
            {/* Rooms List */}
            <div className="w-80 bg-primary-light border-r border-gray-800 flex flex-col">
                <div className="p-4 border-b border-gray-800">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-white">Messages</h2>
                        <button
                            onClick={() => setShowNewRoomModal(true)}
                            className="p-2 bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                            title="New Chat"
                        >
                            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>

                    <input
                        type="text"
                        placeholder="Search conversations..."
                        className="w-full px-3 py-2 bg-primary border border-gray-700 rounded-lg text-white
              placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent text-sm"
                    />
                </div>

                <div className="flex-1 overflow-y-auto">
                    {roomsLoading ? (
                        <div className="p-4 space-y-3">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="flex space-x-3">
                                        <div className="w-12 h-12 bg-primary rounded-full"></div>
                                        <div className="flex-1">
                                            <div className="h-4 bg-primary w-3/4 rounded mb-2"></div>
                                            <div className="h-3 bg-primary w-1/2 rounded"></div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : rooms.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-text-secondary">No conversations yet</p>
                            <button
                                onClick={() => setShowNewRoomModal(true)}
                                className="mt-4 text-accent hover:text-accent-hover text-sm"
                            >
                                Start a conversation →
                            </button>
                        </div>
                    ) : (
                        rooms.map((room) => (
                            <div
                                key={room.id}
                                onClick={() => selectRoom(room)}
                                className={`p-4 hover:bg-primary/50 cursor-pointer transition-colors border-b border-gray-800
                  ${selectedRoom?.id === room.id ? 'bg-primary/50 border-l-2 border-accent' : ''}`}
                            >
                                <div className="flex items-start space-x-3">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent to-blue-500
                    flex items-center justify-center text-white font-bold flex-shrink-0">
                                        {room.isGroup ? 'G' : (room.participants[0]?.name?.[0] || '?')}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="text-white font-medium truncate">
                                                {room.groupName || room.participants.find(p => p._id !== user?.id)?.name || 'Chat'}
                                            </p>
                                            {room.lastMessageAt && (
                                                <span className="text-text-secondary text-xs">
                          {formatTimeAgo(room.lastMessageAt)}
                        </span>
                                            )}
                                        </div>
                                        {room.lastMessage && (
                                            <p className="text-text-secondary text-sm truncate mt-1">
                                                {room.lastMessage}
                                            </p>
                                        )}
                                        {room.unreadCount && room.unreadCount > 0 && (
                                            <span className="inline-block mt-1 px-2 py-0.5 bg-accent rounded-full text-xs text-white">
                        {room.unreadCount}
                      </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            {selectedRoom ? (
                <div className="flex-1 flex flex-col">
                    {/* Chat Header */}
                    <div className="p-4 bg-primary-light border-b border-gray-800">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent to-blue-500
                  flex items-center justify-center text-white font-bold">
                                    {selectedRoom.isGroup ? 'G' : (selectedRoom.participants[0]?.name?.[0] || '?')}
                                </div>
                                <div>
                                    <p className="text-white font-medium">
                                        {selectedRoom.groupName || selectedRoom.participants.find(p => p._id !== user?.id)?.name || 'Chat'}
                                    </p>
                                    {selectedRoom.isGroup && (
                                        <p className="text-text-secondary text-xs">
                                            {selectedRoom.participants.length} participants
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button className="p-2 hover:bg-primary rounded-lg transition-colors">
                                <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {loading ? (
                            <div className="flex justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-text-secondary">No messages yet. Start the conversation!</p>
                            </div>
                        ) : (
                            messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex ${message.isOwn ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[70%] ${message.isOwn ? 'order-2' : 'order-1'}`}>
                                        <div className={`px-4 py-2 rounded-lg ${
                                            message.isOwn
                                                ? 'bg-accent text-white'
                                                : 'bg-primary border border-gray-700 text-white'
                                        }`}>
                                            <p className="break-words">{message.content}</p>
                                            {message.attachmentUrl && (
                                                <a
                                                    href={message.attachmentUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="block mt-2 text-sm underline opacity-80 hover:opacity-100"
                                                >
                                                    📎 Attachment
                                                </a>
                                            )}
                                        </div>
                                        <p className="text-text-secondary text-xs mt-1 px-1">
                                            {formatTimeAgo(message.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input */}
                    <form onSubmit={sendMessage} className="p-4 bg-primary-light border-t border-gray-800">
                        <div className="flex space-x-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-4 py-2 bg-primary border border-gray-700 rounded-lg text-white
                  placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                            <button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="px-6 py-2 bg-accent hover:bg-accent-hover text-white rounded-lg
                  transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-light flex items-center justify-center">
                            <svg className="w-12 h-12 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <p className="text-text-secondary">Select a conversation to start messaging</p>
                    </div>
                </div>
            )}

            {/* New Room Modal */}
            {showNewRoomModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="bg-primary-light rounded-xl p-6 w-96 max-h-[80vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold text-white mb-4">New Conversation</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-text-secondary mb-2">Search Users</label>
                                <input
                                    type="text"
                                    value={searchUsers}
                                    onChange={(e) => {
                                        setSearchUsers(e.target.value);
                                        searchForUsers(e.target.value);
                                    }}
                                    placeholder="Search by name or email..."
                                    className="w-full px-3 py-2 bg-primary border border-gray-700 rounded-lg text-white
                    placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                                />
                            </div>

                            {searchResults.length > 0 && (
                                <div className="max-h-40 overflow-y-auto border border-gray-700 rounded-lg">
                                    {searchResults.map((user) => (
                                        <div
                                            key={user._id}
                                            onClick={() => {
                                                if (!selectedParticipants.includes(user._id)) {
                                                    setSelectedParticipants([...selectedParticipants, user._id]);
                                                }
                                                setSearchUsers('');
                                                setSearchResults([]);
                                            }}
                                            className="p-3 hover:bg-primary cursor-pointer transition-colors"
                                        >
                                            <p className="text-white">{user.name}</p>
                                            <p className="text-text-secondary text-sm">{user.email}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {selectedParticipants.length > 0 && (
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">Selected Users</label>
                                    <div className="space-y-2">
                                        {selectedParticipants.map((id) => (
                                            <div key={id} className="flex items-center justify-between p-2 bg-primary rounded">
                                                <span className="text-white text-sm">{id}</span>
                                                <button
                                                    onClick={() => setSelectedParticipants(selectedParticipants.filter(p => p !== id))}
                                                    className="text-red-400 hover:text-red-300"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {selectedParticipants.length > 1 && (
                                <div>
                                    <label className="block text-sm text-text-secondary mb-2">Group Name</label>
                                    <input
                                        type="text"
                                        value={groupName}
                                        onChange={(e) => setGroupName(e.target.value)}
                                        placeholder="Enter group name..."
                                        className="w-full px-3 py-2 bg-primary border border-gray-700 rounded-lg text-white
                      placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-accent"
                                    />
                                </div>
                            )}

                            <div className="flex space-x-3 pt-4">
                                <button
                                    onClick={() => {
                                        setShowNewRoomModal(false);
                                        setSelectedParticipants([]);
                                        setGroupName('');
                                        setSearchUsers('');
                                        setSearchResults([]);
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-700 text-text-secondary
                    hover:text-white rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={createNewRoom}
                                    disabled={selectedParticipants.length === 0}
                                    className="flex-1 px-4 py-2 bg-accent hover:bg-accent-hover text-white
                    rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}