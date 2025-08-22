// src/app/dashboard/admin/users/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { DataTable } from '../../../../components/dashboard/common/DataTable';
import { useAuth } from '../../../../contexts/AuthContext';

interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    status: 'active' | 'inactive' | 'suspended';
    joinedAt: Date;
    lastActive: Date;
}

export default function AdminUsersPage() {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRole, setSelectedRole] = useState<string>('all');
    const [selectedStatus, setSelectedStatus] = useState<string>('all');

    useEffect(() => {
        fetchUsers();
    }, [selectedRole, selectedStatus]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            // const response = await adminService.getUsers({ role: selectedRole, status: selectedStatus });

            // Mock data
            setUsers([
                {
                    id: '1',
                    name: 'John Doe',
                    email: 'john.doe@example.com',
                    role: 'student',
                    status: 'active',
                    joinedAt: new Date('2024-01-10'),
                    lastActive: new Date()
                },
                {
                    id: '2',
                    name: 'Jane Smith',
                    email: 'jane.smith@example.com',
                    role: 'instructor',
                    status: 'active',
                    joinedAt: new Date('2023-12-15'),
                    lastActive: new Date()
                },
                {
                    id: '3',
                    name: 'Mike Johnson',
                    email: 'mike.j@example.com',
                    role: 'student',
                    status: 'suspended',
                    joinedAt: new Date('2023-11-20'),
                    lastActive: new Date('2024-01-15')
                }
            ]);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            // await adminService.updateUserRole(userId, newRole);
            console.log(`Changing role for user ${userId} to ${newRole}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user role:', error);
        }
    };

    const handleStatusChange = async (userId: string, newStatus: string) => {
        try {
            // await adminService.updateUserStatus(userId, newStatus);
            console.log(`Changing status for user ${userId} to ${newStatus}`);
            fetchUsers();
        } catch (error) {
            console.error('Failed to update user status:', error);
        }
    };

    const columns = [
        {
            key: 'name' as keyof User,
            label: 'Name',
            sortable: true,
            render: (value: string, item: User) => (
                <div>
                    <p className="text-white font-medium">{value}</p>
                    <p className="text-text-secondary text-xs">{item.email}</p>
                </div>
            )
        },
        {
            key: 'role' as keyof User,
            label: 'Role',
            sortable: true,
            render: (value: string, item: User) => (
                <select
                    value={value}
                    onChange={(e) => handleRoleChange(item.id, e.target.value)}
                    className="px-2 py-1 bg-primary border border-gray-700 rounded text-white text-sm"
                    onClick={(e) => e.stopPropagation()}
                >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                    <option value="admin">Admin</option>
                </select>
            )
        },
        {
            key: 'status' as keyof User,
            label: 'Status',
            sortable: true,
            render: (value: string, item: User) => {
                const statusStyles = {
                    active: 'bg-green-500/10 text-green-400',
                    inactive: 'bg-gray-500/10 text-gray-400',
                    suspended: 'bg-red-500/10 text-red-400'
                };
                return (
                    <select
                        value={value}
                        onChange={(e) => handleStatusChange(item.id, e.target.value)}
                        className={`px-2 py-1 rounded text-sm ${statusStyles[value as keyof typeof statusStyles]}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                );
            }
        },
        {
            key: 'joinedAt' as keyof User,
            label: 'Joined',
            sortable: true,
            render: (value: Date) => (
                <span className="text-text-secondary text-sm">
          {new Date(value).toLocaleDateString()}
        </span>
            )
        },
        {
            key: 'lastActive' as keyof User,
            label: 'Last Active',
            sortable: true,
            render: (value: Date) => (
                <span className="text-text-secondary text-sm">
          {formatTimeAgo(new Date(value))}
        </span>
            )
        }
    ];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">User Management</h1>
                    <p className="text-text-secondary mt-1">Manage platform users and permissions</p>
                </div>
                <button className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium
          rounded-lg transition-colors">
                    + Add User
                </button>
            </div>

            {/* Filters */}
            <div className="flex space-x-4">
                <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="px-4 py-2 bg-primary-light border border-gray-700 rounded-lg text-white"
                >
                    <option value="all">All Roles</option>
                    <option value="student">Students</option>
                    <option value="instructor">Instructors</option>
                    <option value="admin">Admins</option>
                </select>
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="px-4 py-2 bg-primary-light border border-gray-700 rounded-lg text-white"
                >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                </select>
            </div>

            {/* Users Table */}
            <DataTable
                data={users}
                columns={columns}
                loading={loading}
                emptyMessage="No users found"
            />
        </div>
    );
}
// Helper function
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