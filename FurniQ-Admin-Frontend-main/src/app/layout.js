import './globals.css';
import { ProductProvider } from '@/context/ProductContext';
import { InventoryProvider } from '@/context/InventoryContext';
import { CategoryProvider } from '@/context/CategoryContext';
import { UserProvider } from '@/context/UserContext';
import { AuthProvider } from '@/context/AuthContext'; // 1. Import the new AuthProvider
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your products, categories, inventory, and users',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* AuthProvider should wrap all other providers to manage user sessions globally */}
        <AuthProvider> {/* 2. Wrap EVERYTHING with the AuthProvider */}
          <ProductProvider>
            <InventoryProvider>
              <CategoryProvider>
                <UserProvider>
                  <LayoutWrapper>
                    {children}
                  </LayoutWrapper>
                </UserProvider>
              </CategoryProvider>
            </InventoryProvider>
          </ProductProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

