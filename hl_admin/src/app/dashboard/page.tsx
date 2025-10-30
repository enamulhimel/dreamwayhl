"use client";

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import UserManagement from './components/UserManagement';
import PropertiesManagement from './components/PropertiesManagement';
import LeadsManagement from './components/LeadsManagement';
import BlogManagement from './components/BlogManagement';

type Tab = 'users' | 'properties' | 'leads' | 'blogs';

export default function DashboardPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<Tab>('properties');
    const [userRole, setUserRole] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    useEffect(() => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/login');
            return;
        }
        
        // Fetch user profile to get role
        fetch('/api/user/profile', {
            headers: { 'Authorization': `Bearer ${token}` },
            signal: abortControllerRef.current.signal
        })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch profile');
                }
                return res.json();
            })
            .then(data => {
                setUserRole(data.role);
                setLoading(false);
            })
            .catch((err) => {
                // Only set error if it's not an abort error
                if (err instanceof Error && err.name !== 'AbortError') {
                    console.error('Dashboard error:', err);
                    setError('Failed to load dashboard');
                }
                setUserRole(null);
                setLoading(false);
            });
            
        // Cleanup function to abort ongoing requests
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [router]);

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-center min-h-screen">
                <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 font-medium">Loading dashboard...</p>
                </div>
            </div>
        </div>
    );

    if (error) return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="flex items-center justify-center min-h-screen">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-6 text-red-700 dark:text-red-400">
                    <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>{error}</span>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderTabContent = () => {
        switch (activeTab) {
            case 'users':
                return <UserManagement />;
            case 'properties':
                return <PropertiesManagement />;
            case 'leads':
                return <LeadsManagement />;
            case 'blogs':
                return <BlogManagement />;
            default:
                return null;
        }
    };

    // For Project Managers, only show Properties Management
    if (userRole === 'project_manager') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                            Project Management
                        </h1>
                        <p className="mt-2 text-slate-600 dark:text-slate-400">
                            Manage your property portfolio and project details
                        </p>
                    </div>
                    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50">
                        <PropertiesManagement />
                    </div>
                </div>
            </div>
        );
    }

    // For admins, show all tabs
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                        Admin Dashboard
                    </h1>
                    <p className="mt-2 text-slate-600 dark:text-slate-400">
                        Manage Users, Properties, Blogs and leads from one central location
                    </p>
                </div>

                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                    {/* Modern Tab Navigation */}
                    <div className="border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                        <nav className="flex space-x-1 p-2">
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setActiveTab('users')}
                                    className={`${
                                        activeTab === 'users'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    } px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                                    </svg>
                                    <span>User Management</span>
                                </button>
                            )}
                            <button
                                onClick={() => setActiveTab('properties')}
                                className={`${
                                    activeTab === 'properties'
                                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                } px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2`}
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                                <span>Properties Management</span>
                            </button>
                            {userRole === 'admin' && (
                                <button
                                    onClick={() => setActiveTab('leads')}
                                    className={`${
                                        activeTab === 'leads'
                                            ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg'
                                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
                                    } px-6 py-3 rounded-xl font-medium text-sm transition-all duration-200 flex items-center space-x-2`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <span>Leads Management</span>
                                </button>
                            )}
                        </nav>
                    </div>

                    <div className="p-6">
                        {renderTabContent()}
                    </div>
                </div>
            </div>
        </div>
    );
}