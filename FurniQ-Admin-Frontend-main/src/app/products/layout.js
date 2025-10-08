'use client'

import { useState, useEffect } from 'react';

// To fix the compilation error, the ProductSidebar component is now defined 
// directly inside the layout file, removing the need for a separate import.
function ProductSidebar() {
    const [activeProducts, setActiveProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPath, setCurrentPath] = useState('');

    // This ensures API calls work correctly in any environment (local or deployed).
    const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

    useEffect(() => {
        // Get the current URL to highlight the active product link in the sidebar.
        if (typeof window !== 'undefined') {
            setCurrentPath(window.location.pathname);
        }

        const fetchActiveProducts = async () => {
            try {
                setLoading(true);
                const res = await fetch(new URL('/api/products', API_BASE_URL));
                if (!res.ok) throw new Error('Failed to fetch products for sidebar');

                const allProducts = await res.json();

                // Filter the list to show only non-archived products.
                const active = allProducts.filter(product => !product.isDeleted);
                setActiveProducts(active);
            } catch (error) {
                console.error("Sidebar Fetch Error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchActiveProducts();
    }, [API_BASE_URL]);

    if (loading) {
        return (
            <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4">
                <h3 className="text-lg font-semibold mb-4 text-gray-800">All Products</h3>
                <div className="text-sm text-gray-500">Loading...</div>
            </aside>
        );
    }

    return (
        <aside className="w-64 flex-shrink-0 bg-gray-50 border-r border-gray-200 p-4 overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">All Products ({activeProducts.length})</h3>
            <nav>
                <ul className="space-y-2">
                    {activeProducts.map(product => {
                        const href = `/products/${product.id}`;
                        const isActive = currentPath === href;

                        return (
                            <li key={product.id}>
                                <a
                                    href={href}
                                    className={`flex flex-col items-center text-center p-3 rounded-md transition-colors ${isActive
                                            ? 'bg-indigo-100 text-indigo-700 font-semibold'
                                            : 'text-gray-600 hover:bg-gray-100'
                                        }`}
                                >
                                    <img
                                        src={product.imageUrl || 'https://placehold.co/80x80/E0E7FF/4F46E5?text=Img'}
                                        alt={product.name}
                                        className="w-20 h-20 object-cover rounded-md flex-shrink-0 shadow-sm"
                                    />
                                    <span className="mt-2 text-sm">
                                        {product.name}
                                    </span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>
        </aside>
    );
}

// The main layout component that wraps all your product pages.
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

