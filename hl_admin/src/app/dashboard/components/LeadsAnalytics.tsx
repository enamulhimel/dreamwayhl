"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";

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

interface AnalyticsData {
    leads: Lead[];
    total: number;
    propertyStats: { [key: string]: number };
    monthlyStats: { [key: string]: number };
    weeklyStats: { [key: string]: number };
    conversionRates: { [key: string]: number };
}

type FilterType = 'all' | 'month' | 'week' | 'custom';
type ChartType = 'bar' | 'pie' | 'venn' | 'line';

interface LeadsAnalyticsProps {
    onBack: () => void;
}

export default function LeadsAnalytics({ onBack }: LeadsAnalyticsProps) {
    const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filterType, setFilterType] = useState<FilterType>('all');
    const [chartType, setChartType] = useState<ChartType>('bar');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchAnalytics = useCallback(async () => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError('');
        try {
            let url = '/api/admin/visits/analytics?';
            
            if (filterType === 'month') {
                url += `month=${selectedMonth + 1}&year=${selectedYear}`;
            } else if (filterType === 'week') {
                const now = new Date();
                const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
                const weekEnd = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                url += `startDate=${weekStart.toISOString().split('T')[0]}&endDate=${weekEnd.toISOString().split('T')[0]}`;
            } else if (filterType === 'custom') {
                url += `startDate=${startDate}&endDate=${endDate}`;
            }

            const res = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                signal: abortControllerRef.current.signal
            });
            
            if (!res.ok) throw new Error('Failed to fetch analytics');
            const data = await res.json();
            setAnalyticsData(data);
        } catch (err) {
            // Only set error if it's not an abort error
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err.message);
            }
        } finally {
            setLoading(false);
        }
    }, [filterType, selectedMonth, selectedYear, startDate, endDate]);

    useEffect(() => {
        fetchAnalytics();
        
        // Cleanup function to abort ongoing requests
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchAnalytics]);

    const renderBarChart = () => {
        if (!analyticsData) return null;
        
        const properties = Object.keys(analyticsData.propertyStats);
        const maxValue = Math.max(...Object.values(analyticsData.propertyStats));
        
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Leads by Property</h3>
                <div className="space-y-3">
                    {properties.map((property) => {
                        const value = analyticsData.propertyStats[property];
                        const percentage = (value / maxValue) * 100;
                        return (
                            <div key={property} className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="font-medium text-slate-700 dark:text-slate-300">{property}</span>
                                    <span className="text-slate-600 dark:text-slate-400">{value} leads</span>
                                </div>
                                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-3">
                                    <div 
                                        className="bg-gradient-to-r from-blue-500 to-indigo-600 h-3 rounded-full transition-all duration-500"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    const renderPieChart = () => {
        if (!analyticsData) return null;
        
        const properties = Object.keys(analyticsData.propertyStats);
        const total = Object.values(analyticsData.propertyStats).reduce((a, b) => a + b, 0);
        const colors = ['#3B82F6', '#8B5CF6', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];
        
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Distribution</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative w-48 h-48 mx-auto">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            {properties.map((property, index) => {
                                const value = analyticsData.propertyStats[property];
                                const percentage = (value / total) * 100;
                                const angle = (percentage / 100) * 360;
                                const startAngle = properties.slice(0, index).reduce((acc, _, i) => {
                                    const val = analyticsData.propertyStats[properties[i]];
                                    return acc + (val / total) * 360;
                                }, 0);
                                
                                const x1 = 50 + 40 * Math.cos((startAngle * Math.PI) / 180);
                                const y1 = 50 + 40 * Math.sin((startAngle * Math.PI) / 180);
                                const x2 = 50 + 40 * Math.cos(((startAngle + angle) * Math.PI) / 180);
                                const y2 = 50 + 40 * Math.sin(((startAngle + angle) * Math.PI) / 180);
                                
                                const largeArcFlag = angle > 180 ? 1 : 0;
                                
                                return (
                                    <path
                                        key={property}
                                        d={`M 50 50 L ${x1} ${y1} A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                                        fill={colors[index % colors.length]}
                                        className="transition-all duration-300 hover:opacity-80"
                                    />
                                );
                            })}
                        </svg>
                    </div>
                    <div className="space-y-2">
                        {properties.map((property, index) => {
                            const value = analyticsData.propertyStats[property];
                            const percentage = ((value / total) * 100).toFixed(1);
                            return (
                                <div key={property} className="flex items-center space-x-3">
                                    <div 
                                        className="w-4 h-4 rounded-full"
                                        style={{ backgroundColor: colors[index % colors.length] }}
                                    ></div>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{property}</span>
                                    <span className="text-sm text-slate-600 dark:text-slate-400">{percentage}%</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    const renderVennDiagram = () => {
        if (!analyticsData) return null;
        
        const properties = Object.keys(analyticsData.propertyStats).slice(0, 3); // Limit to 3 for Venn
        const values = properties.map(p => analyticsData.propertyStats[p]);
        const total = values.reduce((a, b) => a + b, 0);
        
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Lead Overlap Analysis</h3>
                <div className="relative w-80 h-80 mx-auto">
                    <svg className="w-full h-full" viewBox="0 0 200 200">
                        {/* Property 1 Circle */}
                        <circle
                            cx="80"
                            cy="100"
                            r="60"
                            fill="rgba(59, 130, 246, 0.3)"
                            stroke="#3B82F6"
                            strokeWidth="2"
                        />
                        <text x="80" y="105" textAnchor="middle" className="text-xs font-medium fill-slate-700 dark:fill-slate-300">
                            {properties[0] || 'Property A'}
                        </text>
                        <text x="80" y="120" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">
                            {values[0] || 0} leads
                        </text>
                        
                        {/* Property 2 Circle */}
                        <circle
                            cx="120"
                            cy="100"
                            r="60"
                            fill="rgba(139, 92, 246, 0.3)"
                            stroke="#8B5CF6"
                            strokeWidth="2"
                        />
                        <text x="120" y="105" textAnchor="middle" className="text-xs font-medium fill-slate-700 dark:fill-slate-300">
                            {properties[1] || 'Property B'}
                        </text>
                        <text x="120" y="120" textAnchor="middle" className="text-xs fill-slate-600 dark:fill-slate-400">
                            {values[1] || 0} leads
                        </text>
                        
                        {/* Property 3 Circle (if exists) */}
                        {properties[2] && (
                            <circle
                                cx="100"
                                cy="80"
                                r="50"
                                fill="rgba(16, 185, 129, 0.3)"
                                stroke="#10B981"
                                strokeWidth="2"
                            />
                        )}
                        
                        {/* Center overlap indicator */}
                        <circle
                            cx="100"
                            cy="100"
                            r="8"
                            fill="rgba(59, 130, 246, 0.6)"
                            className="animate-pulse"
                        />
                        <text x="100" y="105" textAnchor="middle" className="text-xs font-bold fill-white">
                            {Math.round(total * 0.15)}
                        </text>
                    </svg>
                </div>
                <div className="text-center text-sm text-slate-600 dark:text-slate-400">
                    Overlap represents leads interested in multiple properties
                </div>
            </div>
        );
    };

    const renderLineChart = () => {
        if (!analyticsData) return null;
        
        const months = Object.keys(analyticsData.monthlyStats).sort();
        const maxValue = Math.max(...Object.values(analyticsData.monthlyStats));
        
        // Handle case when there's only one month or no months
        if (months.length <= 1) {
            return (
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Lead Trends</h3>
                    <div className="relative h-64 bg-slate-50 dark:bg-slate-800 rounded-lg p-4 flex items-center justify-center">
                        <p className="text-slate-600 dark:text-slate-400">
                            {months.length === 0 ? 'No data available' : 'Insufficient data for line chart (need at least 2 months)'}
                        </p>
                    </div>
                </div>
            );
        }
        
        return (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Monthly Lead Trends</h3>
                <div className="relative h-64 bg-slate-50 dark:bg-slate-800 rounded-lg p-4">
                    <svg className="w-full h-full" viewBox="0 0 400 200">
                        {/* Grid lines */}
                        {[0, 1, 2, 3, 4].map(i => (
                            <line
                                key={i}
                                x1="0"
                                y1={40 + i * 32}
                                x2="400"
                                y2={40 + i * 32}
                                stroke="rgba(148, 163, 184, 0.2)"
                                strokeWidth="1"
                            />
                        ))}
                        
                        {/* Line chart */}
                        <polyline
                            points={months.map((month, index) => {
                                const value = analyticsData.monthlyStats[month];
                                const x = (index / (months.length - 1)) * 360 + 20;
                                const y = 200 - ((value / maxValue) * 160) - 20;
                                return `${x},${y}`;
                            }).join(' ')}
                            fill="none"
                            stroke="#3B82F6"
                            strokeWidth="3"
                            className="transition-all duration-500"
                        />
                        
                        {/* Data points */}
                        {months.map((month, index) => {
                            const value = analyticsData.monthlyStats[month];
                            const x = (index / (months.length - 1)) * 360 + 20;
                            const y = 200 - ((value / maxValue) * 160) - 20;
                            return (
                                <circle
                                    key={month}
                                    cx={x}
                                    cy={y}
                                    r="4"
                                    fill="#3B82F6"
                                    className="transition-all duration-300 hover:r-6"
                                />
                            );
                        })}
                        
                        {/* X-axis labels */}
                        {months.map((month, index) => {
                            const x = (index / (months.length - 1)) * 360 + 20;
                            return (
                                <text
                                    key={month}
                                    x={x}
                                    y="195"
                                    textAnchor="middle"
                                    className="text-xs fill-slate-600 dark:fill-slate-400"
                                >
                                    {new Date(month).toLocaleDateString('en-US', { month: 'short' })}
                                </text>
                            );
                        })}
                    </svg>
                </div>
            </div>
        );
    };

    const renderChart = () => {
        switch (chartType) {
            case 'bar':
                return renderBarChart();
            case 'pie':
                return renderPieChart();
            case 'venn':
                return renderVennDiagram();
            case 'line':
                return renderLineChart();
            default:
                return renderBarChart();
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                </div>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Loading analytics...</p>
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
                <div className="flex items-center space-x-4">
                    <Button
                        onClick={onBack}
                        variant="outline"
                        className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back to Leads
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Leads Analytics</h2>
                        <p className="text-slate-600 dark:text-slate-400 mt-1">
                            Analyze lead distribution and trends across properties
                        </p>
                    </div>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-xl">
                        <span className="text-blue-700 dark:text-blue-300 font-semibold">
                            {analyticsData?.total || 0}
                        </span>
                        <span className="text-blue-600 dark:text-blue-400 ml-1">Total Leads</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Filter Type */}
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            Filter Period
                        </label>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as FilterType)}
                            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Time</option>
                            <option value="month">This Month</option>
                            <option value="week">This Week</option>
                            <option value="custom">Custom Range</option>
                        </select>
                    </div>

                    {/* Month/Year Selector */}
                    {filterType === 'month' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Month
                                </label>
                                <select
                                    value={selectedMonth}
                                    onChange={(e) => setSelectedMonth(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Array.from({ length: 12 }, (_, i) => (
                                        <option key={i} value={i}>
                                            {new Date(2024, i).toLocaleDateString('en-US', { month: 'long' })}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Year
                                </label>
                                <select
                                    value={selectedYear}
                                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                                        <option key={year} value={year}>{year}</option>
                                    ))}
                                </select>
                            </div>
                        </>
                    )}

                    {/* Custom Date Range */}
                    {filterType === 'custom' && (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </>
                    )}
                </div>

                {/* Chart Type Selector */}
                <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        Chart Type
                    </label>
                    <div className="flex space-x-2">
                        {(['bar', 'pie', 'venn', 'line'] as ChartType[]).map((type) => (
                            <Button
                                key={type}
                                onClick={() => setChartType(type)}
                                variant={chartType === type ? "default" : "outline"}
                                size="sm"
                                className="capitalize"
                            >
                                {type === 'bar' && 'Bar Chart'}
                                {type === 'pie' && 'Pie Chart'}
                                {type === 'venn' && 'Venn Diagram'}
                                {type === 'line' && 'Line Chart'}
                            </Button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Analytics Content */}
            {analyticsData && (
                <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    {renderChart()}
                </div>
            )}

            {/* Summary Stats */}
            {analyticsData && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-blue-100">Total Leads</p>
                                <p className="text-2xl font-bold">{analyticsData.total}</p>
                            </div>
                            <svg className="w-8 h-8 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-purple-100">Properties</p>
                                <p className="text-2xl font-bold">{Object.keys(analyticsData.propertyStats).length}</p>
                            </div>
                            <svg className="w-8 h-8 text-purple-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-green-100">Avg. Conversion</p>
                                <p className="text-2xl font-bold">
                                    {Object.values(analyticsData.conversionRates).length > 0 
                                        ? `${(Object.values(analyticsData.conversionRates).reduce((a, b) => a + b, 0) / Object.values(analyticsData.conversionRates).length).toFixed(1)}%`
                                        : '0%'
                                    }
                                </p>
                            </div>
                            <svg className="w-8 h-8 text-green-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
} 