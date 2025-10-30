"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function UserManagement() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const successTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/users', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                if (res.status === 403) {
                    router.push('/profile');
                    return;
                }
                throw new Error('Failed to fetch users');
            }

            const data = await res.json();
            setUsers(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }, [router]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Cleanup timeouts on unmount
    useEffect(() => {
        return () => {
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
        };
    }, []);

    const handleRoleChange = async (userId: number, newRole: string) => {
        try {
            const res = await fetch(`/api/admin/users/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({ role: newRole }),
            });

            if (!res.ok) {
                throw new Error('Failed to update user');
            }

            setUsers(prevUsers => 
                prevUsers.map(user => 
                    user.id === userId 
                        ? { ...user, role: newRole }
                        : user
                )
            );

            setSuccess('User updated successfully');
            
            // Clear existing timeout before setting new one
            if (successTimeoutRef.current) {
                clearTimeout(successTimeoutRef.current);
            }
            successTimeoutRef.current = setTimeout(() => setSuccess(''), 3000);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            
            // Clear existing timeout before setting new one
            if (errorTimeoutRef.current) {
                clearTimeout(errorTimeoutRef.current);
            }
            errorTimeoutRef.current = setTimeout(() => setError(''), 5000);
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300';
            case 'project_manager':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'sales':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            default:
                return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">User Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage user accounts and permissions
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                        <span className="text-blue-700 dark:text-blue-300 font-semibold">{users.length}</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-1">Total Users</span>
                    </div>
                </div>
            </div>

            {/* Alerts */}
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-red-700 dark:text-red-400">{error}</span>
                    </div>
                </div>
            )}

            {success && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-green-700 dark:text-green-400">{success}</span>
                    </div>
                </div>
            )}

            {/* Content */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                        <thead className="bg-slate-50 dark:bg-slate-700/50">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Role</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                            {users.map((user) => (
                                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                            #{user.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                                            {user.name}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-slate-600 dark:text-slate-400">
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={user.role}
                                            onChange={e => handleRoleChange(user.id, e.target.value)}
                                            className="block w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                                        >
                                            <option value="admin">Administrator</option>
                                            <option value="project_manager">Project Manager</option>
                                            <option value="sales">Sales</option>
                                            <option value="user">User</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
} 