import "./globals.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { InventoryProvider } from "@/context/Inventorycontext";
import { ProductProvider } from "@/context/ProductContext"; // added

export const metadata = {
  title: "Furniq Furniture Admin",
  description: "Admin panel for Furniq Furniture",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[var(--light)] text-[var(--dark)]">
        <InventoryProvider>
          <ProductProvider> {/* added */}
            <LayoutWrapper>{children}</LayoutWrapper>
          </ProductProvider>
        </InventoryProvider>
      </body>
    </html>
  );
}
