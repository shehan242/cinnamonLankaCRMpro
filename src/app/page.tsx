
'use client';

import { useAppStore } from '@/lib/store';
import { redirect } from 'next/navigation';
import { useEffect, use } from 'react';

export default function Home(props: { 
  params: Promise<any>; 
  searchParams: Promise<any>; 
}) {
  // Explicitly unwrapping Promise-based props to satisfy Next.js 15 requirements
  use(props.params);
  use(props.searchParams);

  const { currentUser } = useAppStore();

  useEffect(() => {
    if (currentUser) {
      redirect('/dashboard');
    } else {
      redirect('/login');
    }
  }, [currentUser]);

  return null;
}
