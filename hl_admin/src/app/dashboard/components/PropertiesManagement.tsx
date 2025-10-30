"use client";

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";

interface Property {
    id: number;
    name: string;
    slug: string;
    img_thub: string;
    land_area: string;
    flat_size: string;
    building_type: string;
    project_status: string;
    location: string;
    address: string;
    home_serial: number | null;
}

export default function PropertiesManagement() {
    const router = useRouter();
    const [properties, setProperties] = useState<Property[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [totalProperties, setTotalProperties] = useState(0);
    const [movingPropertyId, setMovingPropertyId] = useState<number | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const fetchProperties = useCallback(async () => {
        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();
        
        setLoading(true);
        setError('');
        try {
            const res = await fetch(`/api/admin/properties?page=${currentPage}&pageSize=${pageSize}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                signal: abortControllerRef.current.signal
            });

            if (!res.ok) {
                if (res.status === 403) {
                    router.push('/profile');
                    return;
                }
                throw new Error('Failed to fetch properties');
            }

            const data = await res.json();
            // Backend now handles sorting, so we don't need to sort here
            setProperties(data.properties);
            setTotalProperties(data.total);
        } catch (err: unknown) {
            // Only set error if it's not an abort error
            if (err instanceof Error && err.name !== 'AbortError') {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    }, [currentPage, pageSize, router]);

    useEffect(() => {
        fetchProperties();
        
        // Cleanup function to abort ongoing requests
        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [fetchProperties]);

    const handleDeleteProperty = async (propertyId: number) => {
        if (!confirm('Are you sure you want to delete this property?')) {
            return;
        }

        try {
            const res = await fetch(`/api/admin/properties/${propertyId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to delete property');
            }

            setSuccess('Property deleted successfully');
            fetchProperties();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleEditProperty = (propertyId: number) => {
        router.push(`/dashboard/properties/${propertyId}`);
    };

    const handleAddProperty = () => {
        router.push('/dashboard/properties/new');
    };

    const handleMoveProperty = async (propertyId: number, direction: 'up' | 'down') => {
        setMovingPropertyId(propertyId);
        const index = properties.findIndex(p => p.id === propertyId);
        if (index === -1) {
            setMovingPropertyId(null);
            return;
        }
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= properties.length) {
            setMovingPropertyId(null);
            return;
        }
        const current = properties[index];
        const target = properties[targetIndex];
        try {
            const updateProperty = async (prop: Property, newSerial: number) => {
                const formData = new FormData();
                formData.append('name', prop.name);
                formData.append('slug', prop.slug);
                formData.append('home_serial', String(newSerial));
                formData.append('land_area', prop.land_area);
                formData.append('flat_size', prop.flat_size);
                formData.append('building_type', prop.building_type);
                formData.append('project_status', prop.project_status);
                formData.append('location', prop.location);
                formData.append('address', prop.address);
                return fetch(`/api/admin/properties/${prop.id}`, {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: formData
                });
            };
            const res1 = await updateProperty(current, target.home_serial!);
            const res2 = await updateProperty(target, current.home_serial!);
            if (!res1.ok || !res2.ok) {
                throw new Error('Failed to update property order');
            }
            setSuccess('Property order updated successfully');
            fetchProperties();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setMovingPropertyId(null);
        }
    };

    const getStatusBadgeColor = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed':
                return 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300';
            case 'ongoing':
                return 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300';
            case 'upcoming':
                return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300';
            default:
                return 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Properties Management</h2>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">
                        Manage your property portfolio and listings
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                    <div className="flex items-center space-x-3">
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
                    </div>
                    <Button 
                        onClick={handleAddProperty} 
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                    >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add New Property
                    </Button>
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
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading properties...</p>
                    </div>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Serial</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Name</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-slate-800 divide-y divide-slate-200 dark:divide-slate-700">
                                {properties.map((property) => (
                                    <tr key={property.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300">
                                                {property.home_serial !== null ? property.home_serial : '-'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm font-medium text-slate-900 dark:text-white">
                                                {property.name}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-slate-600 dark:text-slate-400">
                                                {property.location}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(property.project_status)}`}>
                                                {property.project_status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => handleEditProperty(property.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-blue-500 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteProperty(property.id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-red-500 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
                                                >
                                                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                    Delete
                                                </button>
                                                <button
                                                    onClick={() => handleMoveProperty(property.id, 'up')}
                                                    disabled={movingPropertyId !== null || properties.findIndex(p => p.id === property.id) === 0}
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm transition-all duration-150 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${movingPropertyId === property.id ? 'opacity-50 cursor-wait' : ''}`}
                                                    title="Move Up"
                                                >
                                                    {movingPropertyId === property.id ? (
                                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full align-middle"></span>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
                                                        </svg>
                                                    )}
                                                </button>
                                                <button
                                                    onClick={() => handleMoveProperty(property.id, 'down')}
                                                    disabled={movingPropertyId !== null || properties.findIndex(p => p.id === property.id) === properties.length - 1}
                                                    className={`inline-flex items-center justify-center w-8 h-8 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm transition-all duration-150 hover:bg-blue-100 dark:hover:bg-blue-900/40 focus:outline-none focus:ring-2 focus:ring-blue-400 disabled:opacity-50 disabled:cursor-not-allowed ${movingPropertyId === property.id ? 'opacity-50 cursor-wait' : ''}`}
                                                    title="Move Down"
                                                >
                                                    {movingPropertyId === property.id ? (
                                                        <span className="animate-spin inline-block w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full align-middle"></span>
                                                    ) : (
                                                        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-blue-600 dark:text-blue-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                                        </svg>
                                                    )}
                                                </button>
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
                                Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalProperties)} of {totalProperties} properties
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
                                    disabled={currentPage * pageSize >= totalProperties}
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