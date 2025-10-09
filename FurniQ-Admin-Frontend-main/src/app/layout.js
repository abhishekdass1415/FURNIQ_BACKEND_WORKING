import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/context/AuthContext"; // 1. Import the AuthProvider

export const metadata = {
  title: "Furniq Furniture Admin",
  description: "Admin panel for Furniq Furniture",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        {/* 2. Wrap the entire application with the AuthProvider */}
        <AuthProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}

