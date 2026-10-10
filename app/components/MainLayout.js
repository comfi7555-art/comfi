"use client";

import React from 'react';
import { usePathname } from 'next/navigation';

export default function MainLayout({ children }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  return (
    <main className={`flex-grow ${isAdmin ? 'pt-0' : 'pt-28'}`}>
      {children}
    </main>
  );
}
