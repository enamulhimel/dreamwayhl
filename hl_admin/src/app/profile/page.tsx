"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

export default function ProfilePage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchUserProfile = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.log('No token found, redirecting to login');
                router.push('/login');
                return;
            }

            console.log('Fetching profile with token:', token.substring(0, 20) + '...');

            const res = await fetch('/api/user/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('Profile response status:', res.status);

            if (!res.ok) {
                const errorData = await res.json();
                console.error('Profile fetch error:', errorData);
                
                // If unauthorized or forbidden, clear token and redirect to login
                if (res.status === 401 || res.status === 403) {
                    console.log('Token invalid, clearing and redirecting to login');
                    localStorage.removeItem('token');
                    router.push('/login');
                    return;
                }
                
                throw new Error(errorData.message || 'Failed to fetch profile');
            }

            const data = await res.json();
            console.log('Profile data received:', data);
            
            // Verify that the returned user data matches what we expect
            if (!data || !data.id || !data.name || !data.email) {
                console.error('Invalid user data received:', data);
                throw new Error('Invalid user data received');
            }
            
            setUser(data);
            setName(data.name);
            setEmail(data.email);
        } catch (err: unknown) {
            console.error('Profile fetch error:', err);
            setError(err instanceof Error ? err.message : 'An error occurred');
            if (err instanceof Error && (err.message.includes('Unauthorized') || err.message.includes('Forbidden'))) {
                localStorage.removeItem('token');
                router.push('/login');
            }
        } finally {
            setLoading(false);
        }
    }, [router]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            console.log('No token found on page load, redirecting to login');
            router.push('/login');
            return;
        }

        console.log('Token found on page load, fetching profile');
        fetchUserProfile();
    }, [router, fetchUserProfile]);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }

            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ name, email }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.message || 'Failed to update profile');
            }

            setSuccess('Profile updated successfully');
            fetchUserProfile();
        } catch (err: unknown) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
            <div className="text-lg">Loading profile...</div>
        </div>;
    }

    if (!user) {
        return <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
            <div className="text-lg text-red-600">Failed to load profile</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-white dark:bg-neutral-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white dark:bg-neutral-900 shadow rounded-lg p-8">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-3xl font-bold">Profile</h1>
                        <Button
                            onClick={handleLogout}
                            variant="outline"
                            className="text-red-600 border-red-600 hover:bg-red-50"
                        >
                            Logout
                        </Button>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md mb-4">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="p-3 bg-green-100 text-green-700 rounded-md mb-4">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleUpdateProfile} className="space-y-6">
                        <div>
                            <Label htmlFor="name">Full Name</Label>
                            <Input
                                id="name"
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                            />
                        </div>

                        <div>
                            <Label>Role</Label>
                            <div className="mt-1 text-gray-600 dark:text-gray-400">
                                {user.role === 'admin' ? 'Administrator' :
                                 user.role === 'project_manager' ? 'Project Manager' :
                                 user.role === 'sales' ? 'Sales' : 'User'}
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full py-6 text-lg font-semibold"
                        >
                            Update Profile
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
} 