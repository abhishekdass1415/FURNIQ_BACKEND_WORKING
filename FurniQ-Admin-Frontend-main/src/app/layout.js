import './globals.css';
import { ProductProvider } from '@/context/ProductContext';
import { InventoryProvider } from '@/context/InventoryContext';
import LayoutWrapper from '@/components/LayoutWrapper';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Manage your products and inventory',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100">
        {/* Providers will handle fetching from backend */}
        <ProductProvider>
          <InventoryProvider>
            <LayoutWrapper>
              {children}
            </LayoutWrapper>
          </InventoryProvider>
        </ProductProvider>
      </body>
    </html>
  );
}
