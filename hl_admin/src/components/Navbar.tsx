'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Simple JWT decode (no validation, just base64 decode)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setRole(payload.role);
      } catch {
        setRole(null);
      }
    } else {
      setRole(null);
    }
  }, []);

  const navItems = [
    ...(role === 'admin' || role === 'sales' || role === 'project_manager'
      ? [{ name: role === 'project_manager' ? 'Project Management' : 'Dashboard', href: '/dashboard' }] : []),
    { name: 'Profile', href: '/profile' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/login');
  };

  return (
    <nav className="border-b">
      <div className="flex h-16 items-center px-4">
        <div className="flex items-center space-x-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors hover:text-primary',
                pathname === item.href
                  ? 'text-black dark:text-white'
                  : 'text-muted-foreground'
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="ml-auto flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
} 