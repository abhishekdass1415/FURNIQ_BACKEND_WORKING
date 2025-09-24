// src/components/LayoutWrapper.js
"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Header from "@/components/Header";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const hideLayout = pathname === "/login" || pathname === "/register" || pathname === "/reset-password";

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
