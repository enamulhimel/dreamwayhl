"use client";

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Cancel any ongoing request
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        
        // Create new abort controller
        abortControllerRef.current = new AbortController();

        try {
            console.log('Submitting login for email:', email);
            console.log('Password',password);
            
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
                signal: abortControllerRef.current.signal
            });

            const data = await res.json();
            console.log(data)
            console.log('Login response:', { status: res.status, data });

            if (!res.ok) {
                throw new Error(data.message || 'Login failed');
            }

            // Store token in localStorage
            console.log('Storing token in localStorage');
            // Clear any existing token first
            localStorage.removeItem('token');
            localStorage.setItem('token', data.token);
            
            // Add a small delay to ensure token is stored
            timeoutRef.current = setTimeout(() => {
                console.log('Redirecting based on role:', data.role);
                // Redirect based on user role
                if (data.role === 'admin' || data.role === 'project_manager') {
                    router.push('/dashboard');
                } else {
                    router.push('/profile');
                }
            }, 100);
        } catch (err: unknown) {
            // Only set error if it's not an abort error
            if (err instanceof Error && err.name !== 'AbortError') {
                console.error('Login error:', err);
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    // Cleanup function for component unmount
    const cleanup = () => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current);
        }
    };

    // Add cleanup on unmount
    if (typeof window !== 'undefined') {
        window.addEventListener('beforeunload', cleanup);
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white dark:bg-neutral-950">
            <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-neutral-900 rounded-xl shadow-lg">
                <div className="text-center">
                    <h1 className="text-3xl font-bold">Login</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        Welcome back to Dreamway Holdings Ltd
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-100 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="mt-1"
                                placeholder="Enter your email"
                                disabled={loading}
                            />
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="mt-1"
                                placeholder="Enter your password"
                                disabled={loading}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full py-6 text-lg font-semibold"
                        disabled={loading}
                    >
                        {loading ? 'Logging in...' : 'Login'}
                    </Button>

                    <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                        Don&apos;t have an account?{' '}
                        <Link href="/signup" className="text-blue-600 hover:text-blue-500">
                            Sign up
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    );
} 