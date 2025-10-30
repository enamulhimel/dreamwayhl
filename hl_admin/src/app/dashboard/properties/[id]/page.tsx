"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Property {
    id: number;
    name: string;
    home_serial: number;
    slug: string;
    img_thub: PropertyImage | null;
    img_hero: PropertyImage | null;
    img1: PropertyImage | null;
    img2: PropertyImage | null;
    img3: PropertyImage | null;
    img4: PropertyImage | null;
    img5: PropertyImage | null;
    video1: string;
    address: string;
    land_area: string;
    flat_size: string;
    building_type: string;
    project_status: string;
    location: string;
    map_src?: string;
    description?: string;
    typical_floor_plan?: PropertyImage | null;
    ground_floor_plan?: PropertyImage | null;
    roof_floor_plan?: PropertyImage | null;
    agent_id?: number;
}

interface Amenity {
    id?: number;
    slug: string;
    [key: string]: number | null | string | undefined;
    beds: number | null;
    baths: number | null;
    balconies: number | null;
    drawing: number | null;
    dining: number | null;
    kitchen: number | null;
    family_living: number | null;
    servant_bed: number | null;
    'Car Parking': number | null;
    'Servant Bed': number | null;
    'Sub-station': number | null;
    Generator: number | null;
    Elevator: number | null;
    'CC Camera': number | null;
    'Conference Room': number | null;
    'Health Club': number | null;
    'Prayer Zone': number | null;
    'BBQ Zone': number | null;
    'Child Corner': number | null;
    Gardening: number | null;
    'Swimming Pool': number | null;
    Fountain: number | null;
}

interface Agent {
    id: number;
    name: string;
    number: number;
    image?: string;
}

interface PropertyImage {
    type: string;
    data: Buffer;
}

export default function PropertyEditPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    const [property, setProperty] = useState<Property | null>(null);
    const [amenitiesData, setAmenitiesData] = useState<Amenity | null>(null);
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [imageFiles, setImageFiles] = useState<{ [key: string]: File | null }>({});
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string }>({});
    const [deletedImages, setDeletedImages] = useState<Set<string>>(new Set());
    const [homeSerial, setHomeSerial] = useState<string>('');
    const [id, setId] = useState<string>('');

    const numericAmenities = ['beds', 'baths', 'balconies'];
    const toggleAmenities = [
        'drawing', 'dining', 'kitchen', 'family_living', 'servant_bed',
        'Car Parking', 'Servant Bed', 'Sub-station', 'Generator', 'Elevator', 'CC Camera',
        'Conference Room', 'Health Club', 'Prayer Zone', 'BBQ Zone', 'Child Corner', 'Gardening',
        'Swimming Pool', 'Fountain'
    ];

    const isNewProperty = id === 'new';

    const fetchAgents = useCallback(async () => {
        try {
            const res = await fetch('/api/admin/agents', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                throw new Error('Failed to fetch agents');
            }

            const data = await res.json();
            setAgents(data);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }, []);

    const fetchAmenities = useCallback(async (amenityId: number) => {
        try {
            const res = await fetch(`/api/admin/amenities/${amenityId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setAmenitiesData(null); // No amenities found for this property
                    return;
                }
                throw new Error('Failed to fetch amenities');
            }

            const data = await res.json();
            // Coerce all amenity values to 0, 1, or null
            const toggleAmenitiesList = [
                'drawing', 'dining', 'kitchen', 'family_living', 'servant_bed',
                'Car Parking', 'Servant Bed', 'Sub-station', 'Generator', 'Elevator', 'CC Camera',
                'Conference Room', 'Health Club', 'Prayer Zone', 'BBQ Zone', 'Child Corner', 'Gardening',
                'Swimming Pool', 'Fountain'
            ];
            const coerced: Amenity = { ...data };
            Object.keys(coerced).forEach(key => {
                if (key !== 'id' && key !== 'slug') {
                    if (toggleAmenitiesList.includes(key)) {
                        // 0 means Yes, 1 or null means No
                        if (coerced[key as keyof Amenity] === null || coerced[key as keyof Amenity] === undefined || coerced[key as keyof Amenity] === '') {
                            coerced[key as keyof Amenity] = null;
                        } else {
                            coerced[key as keyof Amenity] = Number(coerced[key as keyof Amenity]);
                        }
                    } else if (coerced[key as keyof Amenity] !== null && coerced[key as keyof Amenity] !== undefined && coerced[key as keyof Amenity] !== '') {
                        coerced[key as keyof Amenity] = Number(coerced[key as keyof Amenity]);
                    } else if (coerced[key as keyof Amenity] === '' || coerced[key as keyof Amenity] === undefined) {
                        coerced[key as keyof Amenity] = null;
                    }
                }
            });
            setAmenitiesData(coerced);
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    }, []);

    useEffect(() => {
        let isMounted = true;
        
        const initializePage = async () => {
            console.log('Initializing page...');
            const resolvedParams = await params;
            const propertyId = resolvedParams.id;
            console.log('Property ID:', propertyId);
            
            if (!isMounted) return;
            setId(propertyId);
            
            if (propertyId !== 'new') {
                console.log('Fetching property data...');
                // Call fetchProperty directly with the resolved id
                try {
                    const res = await fetch(`/api/admin/properties/${propertyId}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (!isMounted) return;

                    if (!res.ok) {
                        if (res.status === 403) {
                            router.push('/profile');
                            return;
                        }
                        throw new Error('Failed to fetch property');
                    }

                    const data = await res.json();
                    console.log('Property data received:', data);
                    
                    if (!isMounted) return;
                    setProperty(data);
                    setHomeSerial(data.home_serial ?? '');
                    
                    // Set image previews for existing images
                    const previews: { [key: string]: string } = {};
                    const imageFields = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
                    imageFields.forEach(field => {
                        if (data[field]?.data) {
                            const base64 = Buffer.from(data[field].data).toString('base64');
                            previews[field] = `data:${data[field].type};base64,${base64}`;
                        }
                    });
                    console.log('Image previews set:', Object.keys(previews));
                    
                    if (!isMounted) return;
                    setImagePreviews(previews);

                    // Now fetch amenities using the property's id
                    if (data.id) {
                        console.log('Fetching amenities for property ID:', data.id);
                        fetchAmenities(data.id);
                    } else {
                        setAmenitiesData(null); // No id, so no amenities to fetch
                    }

                } catch (err: unknown) {
                    console.error('Error fetching property:', err);
                    if (isMounted) {
                        setError(err instanceof Error ? err.message : 'An error occurred');
                    }
                } finally {
                    console.log('Setting loading to false');
                    if (isMounted) {
                        setLoading(false);
                    }
                }
            } else {
                console.log('New property, setting loading to false');
                if (isMounted) {
                    setLoading(false);
                }
            }
        };
        
        initializePage();
        fetchAgents();
        
        // Cleanup function
        return () => {
            isMounted = false;
        };
    }, [params, fetchAgents, fetchAmenities, router]);

    const handleImageChange = (field: string, file: File | null) => {
        setImageFiles(prev => ({ ...prev, [field]: file }));
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviews(prev => ({ ...prev, [field]: reader.result as string }));
            };
            reader.readAsDataURL(file);
        } else {
            setImagePreviews(prev => {
                const newPreviews = { ...prev };
                delete newPreviews[field];
                return newPreviews;
            });
        }
    };

    const handleDeleteImage = (field: string) => {
        setImageFiles(prev => ({ ...prev, [field]: null }));
        setImagePreviews(prev => {
            const newPreviews = { ...prev };
            delete newPreviews[field];
            return newPreviews;
        });
        // Add to deleted images set
        setDeletedImages(prev => new Set([...prev, field]));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const formData = new FormData(e.target as HTMLFormElement);
        
        // Add image files to formData
        Object.entries(imageFiles).forEach(([field, file]) => {
            if (file) {
                formData.append(field, file);
            }
        });

        // Add delete flags for deleted images
        deletedImages.forEach(field => {
            formData.append(`${field}_delete`, 'true');
        });

        // Get selected agent
        const selectedAgentId = formData.get('agent_id');
        if (selectedAgentId) {
            const selectedAgent = agents.find(a => a.id === Number(selectedAgentId));
            if (selectedAgent) {
                formData.set('agent_name', selectedAgent.name);
                formData.set('agent_number', String(selectedAgent.number));
            }
        }

        // Add home_serial to formData (for properties table)
        formData.set('home_serial', String(homeSerial));

        // Prepare amenities data for separate submission
        const newAmenitiesData: Amenity = {
            slug: formData.get('slug') as string || property?.slug || '',
            beds: null, baths: null, balconies: null,
            drawing: null, dining: null, kitchen: null,
            family_living: null, servant_bed: null,
            'Car Parking': null, 'Servant Bed': null, 'Sub-station': null,
            Generator: null, Elevator: null, 'CC Camera': null,
            'Conference Room': null, 'Health Club': null, 'Prayer Zone': null,
            'BBQ Zone': null, 'Child Corner': null, Gardening: null,
            'Swimming Pool': null, Fountain: null,
        };

        // If this is an existing property, keep the ID
        if (amenitiesData?.id) {
            newAmenitiesData.id = amenitiesData.id;
        }

        // Define a type for amenity keys that can be number | null
        type AmenityNumericNullableKeys = keyof Omit<Amenity, 'id' | 'slug'>;

        // Handle numeric amenities
        numericAmenities.forEach(amenity => {
            const amenityKey = amenity as AmenityNumericNullableKeys;
            const value = formData.get(String(amenityKey));
            if (value === null || value === '') {
                newAmenitiesData[amenityKey] = null;
            } else {
                newAmenitiesData[amenityKey] = Number(value);
            }
        });

        // Handle toggle amenities
        toggleAmenities.forEach(amenity => {
            const amenityKey = amenity as AmenityNumericNullableKeys;
            // For toggle amenities, we use the current state from amenitiesData
            if (amenitiesData && amenitiesData[amenityKey] !== undefined) {
                newAmenitiesData[amenityKey] = amenitiesData[amenityKey];
            }
        });

        try {
            // Submit property data
            const propertyRes = await fetch(`/api/admin/properties${isNewProperty ? '' : `/${id}`}`, {
                method: isNewProperty ? 'POST' : 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData,
            });

            if (!propertyRes.ok) {
                throw new Error(`Failed to ${isNewProperty ? 'create' : 'update'} property`);
            }

            const propertyResult = await propertyRes.json();

            // Submit amenities data for both new and existing properties
            if (propertyResult.id) {
                const amenityMethod = amenitiesData?.id ? 'PUT' : 'POST';
                const amenityTargetId = amenitiesData?.id || propertyResult.id;
                const amenityRes = await fetch(`/api/admin/amenities/${amenityTargetId}`, {
                    method: amenityMethod,
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    },
                    body: JSON.stringify(newAmenitiesData),
                });

                if (!amenityRes.ok) {
                    throw new Error(`Failed to ${amenityMethod === 'POST' ? 'create' : 'update'} amenities`);
                }
            }

            setSuccess(`Property ${isNewProperty ? 'created' : 'updated'} successfully`);
            if (isNewProperty) {
                router.push('/dashboard');
            } else {
                // Refresh the property data after successful update
                try {
                    const refreshRes = await fetch(`/api/admin/properties/${id}`, {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    });

                    if (refreshRes.ok) {
                        const refreshData = await refreshRes.json();
                        setProperty(refreshData);
                        
                        // Update image previews
                        const previews: { [key: string]: string } = {};
                        const imageFields = ['img_thub', 'img_hero', 'img1', 'img2', 'img3', 'img4', 'img5', 'typical_floor_plan', 'ground_floor_plan', 'roof_floor_plan'];
                        imageFields.forEach(field => {
                            if (refreshData[field]?.data) {
                                const base64 = Buffer.from(refreshData[field].data).toString('base64');
                                previews[field] = `data:${refreshData[field].type};base64,${base64}`;
                            }
                        });
                        setImagePreviews(previews);
                    }
                } catch (err) {
                    console.error('Failed to refresh property data:', err);
                }
                
                // Clear form state
                setImageFiles({});
                setDeletedImages(new Set());
                
                fetchAmenities(propertyResult.id); // Refresh amenities data using the actual id
            }
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const renderImageField = (field: string, label: string, required: boolean = false) => (
        <div>
            <Label htmlFor={field} className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</Label>
            <div className="mt-2 space-y-3">
                {imagePreviews[field] && (
                    <div className="relative">
                        <Image
                            src={imagePreviews[field]}
                            alt={label}
                            width={400}
                            height={192}
                            className="w-full h-48 object-cover rounded-lg border border-slate-200 dark:border-slate-600"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white"
                            onClick={() => handleDeleteImage(field)}
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </Button>
                    </div>
                )}
                <Input
                    id={field}
                    name={field}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageChange(field, e.target.files?.[0] || null)}
                    required={required && !imagePreviews[field]}
                    className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
                <div className="flex items-center justify-center min-h-screen">
                    <div className="flex flex-col items-center space-y-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-t-blue-400 rounded-full animate-spin" style={{ animationDelay: '0.5s' }}></div>
                        </div>
                        <p className="text-slate-600 dark:text-slate-400 font-medium">Loading property...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 py-8">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 dark:border-slate-700/50 overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-6 border-b border-slate-200/50 dark:border-slate-700/50 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                                    {isNewProperty ? 'Add New Property' : 'Edit Property'}
                                </h1>
                                <p className="text-slate-600 dark:text-slate-400 mt-1">
                                    {isNewProperty ? 'Create a new property listing' : 'Update property details and amenities'}
                                </p>
                            </div>
                            <Button
                                onClick={() => router.push('/dashboard')}
                                variant="outline"
                                className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            >
                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                </svg>
                                Back to Dashboard
                            </Button>
                        </div>
                    </div>

                    {/* Alerts */}
                    {error && (
                        <div className="mx-6 mt-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                            <div className="flex items-center space-x-2">
                                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-red-700 dark:text-red-400">{error}</span>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <div className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* Basic Information */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Basic Information
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <Label htmlFor="name" className="text-sm font-medium text-slate-700 dark:text-slate-300">Property Name</Label>
                                        <Input
                                            id="name"
                                            name="name"
                                            defaultValue={property?.name}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="slug" className="text-sm font-medium text-slate-700 dark:text-slate-300">Slug</Label>
                                        <Input
                                            id="slug"
                                            name="slug"
                                            defaultValue={property?.slug}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="land_area" className="text-sm font-medium text-slate-700 dark:text-slate-300">Land Area</Label>
                                        <Input
                                            id="land_area"
                                            name="land_area"
                                            defaultValue={property?.land_area}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="flat_size" className="text-sm font-medium text-slate-700 dark:text-slate-300">Flat Size</Label>
                                        <Input
                                            id="flat_size"
                                            name="flat_size"
                                            defaultValue={property?.flat_size}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="building_type" className="text-sm font-medium text-slate-700 dark:text-slate-300">Building Type</Label>
                                        <Input
                                            id="building_type"
                                            name="building_type"
                                            defaultValue={property?.building_type}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="project_status" className="text-sm font-medium text-slate-700 dark:text-slate-300">Project Status</Label>
                                        <Input
                                            id="project_status"
                                            name="project_status"
                                            defaultValue={property?.project_status}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="location" className="text-sm font-medium text-slate-700 dark:text-slate-300">Location</Label>
                                        <Input
                                            id="location"
                                            name="location"
                                            defaultValue={property?.location}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="address" className="text-sm font-medium text-slate-700 dark:text-slate-300">Address</Label>
                                        <Input
                                            id="address"
                                            name="address"
                                            defaultValue={property?.address}
                                            required
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="map_src" className="text-sm font-medium text-slate-700 dark:text-slate-300">Map Source</Label>
                                        <Input
                                            id="map_src"
                                            name="map_src"
                                            defaultValue={property?.map_src}
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="video1" className="text-sm font-medium text-slate-700 dark:text-slate-300">Video 1 URL</Label>
                                        <Input
                                            id="video1"
                                            name="video1"
                                            defaultValue={property?.video1}
                                            className="mt-2 border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="agent_id" className="text-sm font-medium text-slate-700 dark:text-slate-300">Agent</Label>
                                        <select
                                            id="agent_id"
                                            name="agent_id"
                                            defaultValue={property?.agent_id}
                                            className="mt-2 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select an agent</option>
                                            {agents.map(agent => (
                                                <option key={agent.id} value={agent.id}>
                                                    {agent.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div>
                                        <Label htmlFor="home_serial" className="text-sm font-medium text-slate-700 dark:text-slate-300">Home Serial</Label>
                                        <div className="flex items-center gap-2 mt-2">
                                            <Input
                                                id="home_serial"
                                                name="home_serial"
                                                value={homeSerial}
                                                onChange={e => setHomeSerial(e.target.value as string)}
                                                className="border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                            <Button 
                                                type="button" 
                                                variant="destructive" 
                                                size="sm" 
                                                onClick={() => setHomeSerial('')}
                                                className="px-3 py-2"
                                            >
                                                Clear
                                            </Button>
                                        </div>
                                    </div>

                                    <div className="md:col-span-2">
                                        <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                                        <textarea
                                            id="description"
                                            name="description"
                                            defaultValue={property?.description}
                                            className="mt-2 block w-full rounded-lg border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            rows={4}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Images Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Images & Media
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {renderImageField('img_thub', 'Thumbnail Image', true)}
                                    {renderImageField('img_hero', 'Hero Image')}
                                    {renderImageField('img1', 'Image 1')}
                                    {renderImageField('img2', 'Image 2')}
                                    {renderImageField('img3', 'Image 3')}
                                    {renderImageField('img4', 'Image 4')}
                                    {renderImageField('img5', 'Image 5')}
                                    {renderImageField('typical_floor_plan', 'Typical Floor Plan')}
                                    {renderImageField('ground_floor_plan', 'Ground Floor Plan')}
                                    {renderImageField('roof_floor_plan', 'Roof Floor Plan')}
                                </div>
                            </div>

                            {/* Amenities Section */}
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                                <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-6 flex items-center">
                                    <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                                    </svg>
                                    Amenities
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {['beds', 'baths', 'balconies', 'drawing', 'dining', 'kitchen', 'family_living', 'servant_bed', 'Car Parking', 'Servant Bed', 'Sub-station', 'Generator', 'Elevator', 'CC Camera', 'Conference Room', 'Health Club', 'Prayer Zone', 'BBQ Zone', 'Child Corner', 'Gardening', 'Swimming Pool', 'Fountain'].map((amenity) => (
                                        <div key={amenity} className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                                            <Label htmlFor={amenity} className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                                {amenity.charAt(0).toUpperCase() + amenity.slice(1)}
                                            </Label>
                                            {numericAmenities.includes(amenity) ? (
                                                <div className="flex justify-end">
                                                    <Input
                                                        id={amenity}
                                                        name={amenity}
                                                        type="number"
                                                        value={String(amenitiesData?.[amenity] ?? '')}
                                                        onChange={e => setAmenitiesData(prev => ({
                                                            ...(prev || {
                                                                id: undefined,
                                                                slug: property?.slug || '',
                                                                beds: null, baths: null, balconies: null,
                                                                drawing: null, dining: null, kitchen: null,
                                                                family_living: null, servant_bed: null,
                                                                'Car Parking': null, 'Servant Bed': null, 'Sub-station': null,
                                                                Generator: null, Elevator: null, 'CC Camera': null,
                                                                'Conference Room': null, 'Health Club': null, 'Prayer Zone': null,
                                                                'BBQ Zone': null, 'Child Corner': null, Gardening: null,
                                                                'Swimming Pool': null, Fountain: null,
                                                            }),
                                                            [amenity]: e.target.value === '' ? null : Number(e.target.value),
                                                        }))}
                                                        className="max-w-[100px] text-right border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    />
                                                </div>
                                            ) : (
                                                <div className="flex rounded-lg shadow-sm justify-end overflow-hidden">
                                                    <Button
                                                        type="button"
                                                        className={
                                                            amenitiesData?.[amenity] === 0
                                                                ? 'bg-green-600 text-white hover:bg-green-700 rounded-r-none border-0'
                                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-r-none border-0 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                                                        }
                                                        onClick={() => setAmenitiesData(prev => ({
                                                            ...(prev || {
                                                                id: undefined,
                                                                slug: property?.slug || '',
                                                                beds: null, baths: null, balconies: null,
                                                                drawing: null, dining: null, kitchen: null,
                                                                family_living: null, servant_bed: null,
                                                                'Car Parking': null, 'Servant Bed': null, 'Sub-station': null,
                                                                Generator: null, Elevator: null, 'CC Camera': null,
                                                                'Conference Room': null, 'Health Club': null, 'Prayer Zone': null,
                                                                'BBQ Zone': null, 'Child Corner': null, Gardening: null,
                                                                'Swimming Pool': null, Fountain: null,
                                                            }),
                                                            [amenity]: 0
                                                        }))}
                                                    >
                                                        Yes
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        className={
                                                            (amenitiesData?.[amenity] === 1 || amenitiesData?.[amenity] === null)
                                                                ? 'bg-red-600 text-white hover:bg-red-700 rounded-l-none border-0'
                                                                : 'bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-l-none border-0 dark:bg-slate-600 dark:text-slate-300 dark:hover:bg-slate-500'
                                                        }
                                                        onClick={() => setAmenitiesData(prev => ({
                                                            ...(prev || {
                                                                id: undefined,
                                                                slug: property?.slug || '',
                                                                beds: null, baths: null, balconies: null,
                                                                drawing: null, dining: null, kitchen: null,
                                                                family_living: null, servant_bed: null,
                                                                'Car Parking': null, 'Servant Bed': null, 'Sub-station': null,
                                                                Generator: null, Elevator: null, 'CC Camera': null,
                                                                'Conference Room': null, 'Health Club': null, 'Prayer Zone': null,
                                                                'BBQ Zone': null, 'Child Corner': null, Gardening: null,
                                                                'Swimming Pool': null, Fountain: null,
                                                            }),
                                                            [amenity]: 1
                                                        }))}
                                                    >
                                                        No
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Form Actions */}
                            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
                                {success && (
                                    <div className="flex-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4 mb-4 sm:mb-0">
                                        <div className="flex items-center space-x-2">
                                            <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span className="text-green-700 dark:text-green-400">{success}</span>
                                        </div>
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => router.push('/dashboard')}
                                    className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                                >
                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                    {isNewProperty ? 'Create Property' : 'Update Property'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
} 