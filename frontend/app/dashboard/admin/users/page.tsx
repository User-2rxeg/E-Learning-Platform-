'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';


import {
    Users,
    Search,
    Filter,
    Download,
    Upload,
    UserPlus,
    MoreVertical,
    Edit,
    Lock,
    Unlock,
    Shield,
    Mail,
    Calendar,
    Activity,
    ChevronLeft,
    ChevronRight,
    Eye,
    Trash2,
    UserCheck,
    UserX,
    AlertCircle,
    CheckCircle,
    XCircle
} from 'lucide-react';
import {useAuth} from "../../../../contexts/AuthContext";
import { adminService, UserRole } from "../../../../services";



interface User {
    _id: string;
    name: string;
    email: string;
    role: string;
    isEmailVerified: boolean;
    mfaEnabled: boolean;
    createdAt: string;
    lastLogin?: string;
    deletedAt?: string;
    profilePicture?: string;
}

export default function UsersManagementPage() {
    const router = useRouter();
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState<UserRole | ''>('');
    const [verifiedFilter, setVerifiedFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showBulkActions, setShowBulkActions] = useState(false);

    // Create user form state
    const [newUser, setNewUser] = useState<{
        name: string;
        email: string;
        password: string;
        role: UserRole;
    }>({
        name: '',
        email: '',
        password: '',
        role: UserRole.STUDENT
    });

    useEffect(() => {
        fetchUsers();
    }, [currentPage, roleFilter, verifiedFilter, searchQuery]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await adminService.listUsers({
                page: currentPage,
                limit: 10,
                q: searchQuery || undefined,
                role: roleFilter || undefined,
                verified: verifiedFilter as 'true' | 'false' | undefined
            });
            setUsers(response.items);
            setTotalPages(response.pages);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async () => {
        try {
            await adminService.createUser(newUser);
            setShowUserModal(false);
            setNewUser({ name: '', email: '', password: '', role: UserRole.STUDENT });
            fetchUsers();
            alert('user created successfully');
        } catch (error) {
            console.error('Error creating user:', error);
            alert('Failed to create user');
        }
    };

    const handleUpdateUser = async (userId: string, updates: Partial<User>) => {
        try {
            await adminService.updateUser(userId, updates);
            fetchUsers();
            alert('user updated successfully');
        } catch (error) {
            console.error('Error updating user:', error);
            alert('Failed to update user');
        }
    };

    const handleLockUser = async (userId: string) => {
        try {
            await adminService.lockUser(userId);
            fetchUsers();
            alert('user locked successfully');
        } catch (error) {
            console.error('Error locking user:', error);
            alert('Failed to lock user');
        }
    };

    const handleUnlockUser = async (userId: string) => {
        try {
            await adminService.unlockUser(userId);
            fetchUsers();
            alert('user unlocked successfully');
        } catch (error) {
            console.error('Error unlocking user:', error);
            alert('Failed to unlock user');
        }
    };

    const handleExportUsers = async () => {
        try {
            const result = await adminService.exportUsersCSV();
            alert(`Users exported to: ${result}`);
        } catch (error) {
            console.error('Error exporting users:', error);
            alert('Failed to export users');
        }
    };

    const handleBulkAction = async (action: 'lock' | 'unlock' | 'delete' | 'email') => {
        if (selectedUsers.length === 0) {
            alert('Please select users first');
            return;
        }

        try {
            for (const userId of selectedUsers) {
                if (action === 'lock') {
                    await adminService.lockUser(userId);
                } else if (action === 'unlock') {
                    await adminService.unlockUser(userId);
                }
            }
            setSelectedUsers([]);
            fetchUsers();
            alert(`Bulk ${action} completed successfully`);
        } catch (error) {
            console.error(`Error performing bulk ${action}:`, error);
            alert(`Failed to perform bulk ${action}`);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">User Management</h1>
                <p className="text-gray-600">Manage platform users, roles, and permissions</p>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{users.length}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Verified Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {users.filter(u => u.isEmailVerified).length}
                            </p>
                        </div>
                        <UserCheck className="w-8 h-8 text-green-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">MFA Enabled</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {users.filter(u => u.mfaEnabled).length}
                            </p>
                        </div>
                        <Shield className="w-8 h-8 text-purple-600" />
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Locked Users</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">
                                {users.filter(u => u.deletedAt).length}
                            </p>
                        </div>
                        <Lock className="w-8 h-8 text-red-600" />
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 border border-gray-100">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search users..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg w-full sm:w-64"
                            />
                        </div>

                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value as UserRole | '')}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">All Roles</option>
                            <option value="student">Students</option>
                            <option value="instructor">Instructors</option>
                            <option value="admin">Admins</option>
                        </select>

                        <select
                            value={verifiedFilter}
                            onChange={(e) => setVerifiedFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="">All Status</option>
                            <option value="true">Verified</option>
                            <option value="false">Unverified</option>
                        </select>
                    </div>

                    <div className="flex gap-3">
                        {selectedUsers.length > 0 && (
                            <button
                                onClick={() => setShowBulkActions(!showBulkActions)}
                                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 flex items-center"
                            >
                                Bulk Actions ({selectedUsers.length})
                            </button>
                        )}

                        <button
                            onClick={handleExportUsers}
                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 flex items-center"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Export
                        </button>

                        <button
                            onClick={() => setShowUserModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
                        >
                            <UserPlus className="w-4 h-4 mr-2" />
                            Add User
                        </button>
                    </div>
                </div>

                {showBulkActions && selectedUsers.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                        <button
                            onClick={() => handleBulkAction('lock')}
                            className="px-3 py-1 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 text-sm"
                        >
                            Lock Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('unlock')}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm"
                        >
                            Unlock Selected
                        </button>
                        <button
                            onClick={() => handleBulkAction('email')}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm"
                        >
                            Send Email
                        </button>
                    </div>
                )}
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left">
                                    <input
                                        type="checkbox"
                                        onChange={(e) => {
                                            if (e.target.checked) {
                                                setSelectedUsers(users.map(u => u._id));
                                            } else {
                                                setSelectedUsers([]);
                                            }
                                        }}
                                        className="rounded border-gray-300"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                            {users.map((user) => (
                                <tr key={user._id} className={user.deletedAt ? 'bg-gray-50' : ''}>
                                    <td className="px-6 py-4">
                                        <input
                                            type="checkbox"
                                            checked={selectedUsers.includes(user._id)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedUsers([...selectedUsers, user._id]);
                                                } else {
                                                    setSelectedUsers(selectedUsers.filter(id => id !== user._id));
                                                }
                                            }}
                                            className="rounded border-gray-300"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold mr-3">
                                                {user.name.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                <p className="text-xs text-gray-500">{user.email}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={(e) => handleUpdateUser(user._id, { role: e.target.value })}
                                            className="text-sm border border-gray-300 rounded px-2 py-1"
                                            disabled={user._id === currentUser?._id}
                                        >
                                            <option value="student">Student</option>
                                            <option value="instructor">Instructor</option>
                                            <option value="admin">Admin</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {user.deletedAt ? (
                                                <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">Locked</span>
                                            ) : user.isEmailVerified ? (
                                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">Verified</span>
                                            ) : (
                                                <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">Unverified</span>
                                            )}
                                            {user.mfaEnabled && (
                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">MFA</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {formatDate(user.createdAt)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {user.lastLogin ? formatDate(user.lastLogin) : 'Never'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => router.push(`/dashboard/admin/users/${user._id}`)}
                                                className="text-gray-400 hover:text-gray-600"
                                                title="View Details"
                                            >
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            {user.deletedAt ? (
                                                <button
                                                    onClick={() => handleUnlockUser(user._id)}
                                                    className="text-green-400 hover:text-green-600"
                                                    title="Unlock User"
                                                >
                                                    <Unlock className="w-4 h-4" />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleLockUser(user._id)}
                                                    className="text-red-400 hover:text-red-600"
                                                    title="Lock User"
                                                    disabled={user._id === currentUser?._id}
                                                >
                                                    <Lock className="w-4 h-4" />
                                                </button>
                                            )}
                                            <button className="text-gray-400 hover:text-gray-600">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
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
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Create user Modal */}
            {showUserModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New User</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={newUser.name}
                                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter name"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newUser.email}
                                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter email"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                                <input
                                    type="password"
                                    value={newUser.password}
                                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                    placeholder="Enter password"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserRole })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                                >
                                    <option value="student">Student</option>
                                    <option value="instructor">Instructor</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setNewUser({ name: '', email: '', password: '', role: UserRole.STUDENT });
                                }}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleCreateUser}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Create User
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

