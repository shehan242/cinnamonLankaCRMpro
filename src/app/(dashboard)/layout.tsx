
'use client';

import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header';
import { useAppStore } from '@/lib/store';
import { redirect } from 'next/navigation';
import { useEffect, useState, use } from 'react';

export default function DashboardLayout(props: { 
  children: React.ReactNode;
  params: Promise<any>;
}) {
  // In Next.js 15, params and searchParams are Promises. We avoid destructuring props 
  // in the function signature to prevent "params are being enumerated" errors.
  // We unwrap params with use() to satisfy Next.js requirements.
  use(props.params);
  const children = props.children;

  const { currentUser } = useAppStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !currentUser) {
      redirect('/login');
    }
  }, [currentUser, mounted]);

  // Ensure we only render the dashboard content after the component has mounted
  // to avoid hydration mismatches with the persisted zustand store.
  if (!mounted || !currentUser) return null;

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside className="w-64 flex-shrink-0">
        <Sidebar />
      </aside>
      <main className="flex-1 flex flex-col min-w-0">
        <Header />
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
