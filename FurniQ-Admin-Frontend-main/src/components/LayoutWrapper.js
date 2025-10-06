// src/components/LayoutWrapper.js
"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const hideLayout = pathname === "/login" || pathname === "/register" || pathname === "/reset-password";

  // Session timeout: 5 hours
  const SESSION_TIMEOUT = 5 * 60 * 60 * 1000;

  useEffect(() => {
    if (hideLayout) return;

    const ensureAuthAndTimeout = () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (!token) {
        router.replace('/login');
        return;
      }
      const last = typeof window !== 'undefined' ? localStorage.getItem('lastActivity') : null;
      if (last) {
        const elapsed = Date.now() - parseInt(last);
        if (elapsed > SESSION_TIMEOUT) {
          localStorage.removeItem('authToken');
          localStorage.removeItem('userData');
          localStorage.removeItem('lastActivity');
          router.replace('/login');
          return;
        }
      }
    };

    const updateLast = () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastActivity', Date.now().toString());
      }
    };

    ensureAuthAndTimeout();
    const events = ['mousedown','mousemove','keypress','scroll','touchstart','click'];
    events.forEach(e => document.addEventListener(e, updateLast, true));
    const interval = setInterval(ensureAuthAndTimeout, 60000);
    return () => {
      events.forEach(e => document.removeEventListener(e, updateLast, true));
      clearInterval(interval);
    };
  }, [hideLayout, router]);

  if (hideLayout) return <>{children}</>;

  return (
    <div className="flex">
      <Sidebar />
      <div className="flex flex-col flex-1 min-h-screen">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto pt-16 md:pt-0">
          <div className="p-4 md:p-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
