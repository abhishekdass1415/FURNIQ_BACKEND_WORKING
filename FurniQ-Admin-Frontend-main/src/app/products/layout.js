import ProductSidebar from './components/ProductSidebar';

export default function ProductsLayout({ children }) {
  return (
    <div className="flex h-full w-full bg-white rounded-lg shadow-md overflow-hidden">
      <ProductSidebar />
      <div className="flex-grow p-6 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}