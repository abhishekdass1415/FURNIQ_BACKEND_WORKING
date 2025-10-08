'use client'

import { useState, useEffect } from 'react';
import Header from './Header'; // Ensure this path is correct for your project structure

// A list of routes where the main layout (Header, etc.) should NOT be displayed.
const noLayoutRoutes = ['/login', '/register', '/reset-password'];

export default function LayoutWrapper({ children }) {
  // We use state to hold the pathname. It starts empty on the server.
  const [pathname, setPathname] = useState('');

  // This useEffect hook runs only on the client-side after the component mounts.
  useEffect(() => {
    // We safely access window.location.pathname here, which is guaranteed to be available.
    // This replaces the usePathname() hook and resolves the Vercel compatibility issue.
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  // If the current path is one of the auth pages, we render only the page content.
  if (noLayoutRoutes.includes(pathname)) {
    return <>{children}</>;
  }

  // For all other pages, we render the full layout with the Header.
  return (
    <>
      <Header />
      
      {/* This is the main content area for your application.
        The top padding (pt-20) ensures content is not hidden behind the fixed Header.
      */}
      <main className="pt-20 p-6 bg-gray-100 min-h-screen">
        {children}
      </main>
    </>
  );
}

