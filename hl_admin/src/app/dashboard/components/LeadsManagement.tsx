"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import LeadsAnalytics from './LeadsAnalytics';

interface Lead {
    id: number;
    property_name: string;
    name: string;
    email: string;
    phone: string;
    date: string;
    time: string;
    message: string;
    created_at: string;
}

export default function LeadsManagement() {
    const [leads, setLeads] = useState<Lead[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalLeads, setTotalLeads] = useState(0);
    const [showAnalytics, setShowAnalytics] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchLeads = useCallback(async () => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/visits?page=${currentPage}&pageSize=${pageSize}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                signal: abortControllerRef.current.signal
            });
            if (!res.ok) throw new Error('Failed to fetch leads');
            const data = await res.json();
            setLeads(data.leads);
            setTotalLeads(data.total);
        } catch (err) {
            // Only set error if it's not an abort error
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize]);

    useEffect(() => {
        if (!showAnalytics) {
            fetchLeads();
        }
        
        // Cleanup function to abort ongoing requests
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchLeads, showAnalytics]);

    if (showAnalytics) {
        return <LeadsAnalytics onBack={() => setShowAnalytics(false)} />;
    }

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading leads...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 text-red-700 dark:text-red-400">
            <div className="flex items-center space-x-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage and track property inquiries and visit requests
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <Button
                        onClick={() => setShowAnalytics(true)}
                        className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                        <span>View Analytics</span>
                    </Button>
                    <label htmlFor="pageSize" className="text-sm font-medium text-slate-700 dark:text-slate-300">Show</label>
                    <select
                        id="pageSize"
                        value={pageSize}
                        onChange={e => setPageSize(Number(e.target.value))}
                        className="block px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:focus:ring-blue-400 dark:focus:border-blue-400 transition-colors"
                    >
                        <option value={10}>10</option>
                        <option value={25}>25</option>
                        <option value={50}>50</option>
                    </select>
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                        <span className="text-blue-700 dark:text-blue-300 font-semibold">{totalLeads}</span>
                        <span className="text-blue-600 dark:text-blue-400 ml-1">Total Leads</span>
                    </div>
                </div>
            </div>

            {/* Content */}
            {!leads.length ? (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-12 text-center">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No leads found</h3>
                    <p className="text-slate-600 dark:text-slate-400">When visitors submit inquiries, they will appear here.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">ID</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Property</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Contact</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Created</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Visit Schedule</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Message</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {leads.map((lead) => (
                                    <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">
                                                #{lead.id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {lead.property_name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {lead.name}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {lead.email}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {lead.phone}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    {new Date(lead.created_at).toLocaleDateString()}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    {new Date(lead.created_at).toLocaleTimeString()}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Date:</span>
                                                    <br />
                                                    {new Date(lead.date).toLocaleDateString('en-US', { 
                                                        year: 'numeric', 
                                                        month: 'short', 
                                                        day: 'numeric' 
                                                    })}
                                                </div>
                                                <div className="text-sm text-slate-600 dark:text-slate-400">
                                                    <span className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">Time:</span>
                                                    <br />
                                                    {new Date(`1970-01-01T${lead.time}Z`).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-400 max-w-xs truncate">
                                                {lead.message}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="px-6 py-4 bg-slate-50 dark:bg-slate-700/50 border-t border-slate-200 dark:border-slate-700">
                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalLeads)} of {totalLeads} leads
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    variant="outline"
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Previous
                                </Button>
                                <Button
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    disabled={currentPage * pageSize >= totalLeads}
                                    variant="outline"
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Next
                                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 