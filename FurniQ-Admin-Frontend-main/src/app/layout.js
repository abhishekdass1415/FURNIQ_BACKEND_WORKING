import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider } from "@/context/AuthContext";
// --- Add your other provider imports here ---
import { ProductProvider } from "@/context/ProductContext";
import { CategoryProvider } from "@/context/CategoryContext";
import { UserProvider } from "@/context/UserContext";
import { InventoryProvider } from "@/context/Inventorycontext";

export const metadata = {
  title: "Furniq Furniture Admin",
  description: "Admin panel for Furniq Furniture",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-gray-100 text-gray-900">
        <AuthProvider>
          {/* Nest the rest of your providers here */}
          <UserProvider>
            <ProductProvider>
              <CategoryProvider>
                <InventoryProvider>
                  <LayoutWrapper>{children}</LayoutWrapper>
                </InventoryProvider>
              </CategoryProvider>
            </ProductProvider>
          </UserProvider>
        </AuthProvider>
      </body>
    </html>
  );
}