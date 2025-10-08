'use client'

import { useState, useEffect } from 'react';
import { PencilIcon, TrashIcon, ArrowLeftIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

// A simple modal component for confirmations, included in the same file.
const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{title}</h3>
                <div className="text-sm text-gray-600 mb-6">{children}</div>
                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="btn-secondary">
                        Cancel
                    </button>
                    <button onClick={onConfirm} className="btn-danger">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    );
};


export default function ProductDetailPage() {
    const [productId, setProductId] = useState(null);
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);

    // Effect to safely access window.location and extract the product ID
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const pathParts = window.location.pathname.split('/');
            const id = pathParts[pathParts.length - 1];
            setProductId(id);
        }
    }, []);


    const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            try {
                setLoading(true);
                const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL));
                if (!res.ok) {
                    if (res.status === 404) {
                        throw new Error('Product not found.');
                    }
                    throw new Error('Failed to fetch product data.');
                }
                const data = await res.json();
                setProduct(data);
                setError(null);
            } catch (err) {
                setError(err.message);
                setProduct(null);
            } finally {
                setLoading(false);
            }
        };

        fetchProduct();
    }, [productId, API_BASE_URL]);

    const handleUpdateProduct = async (updatedData) => {
        try {
            const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedData),
            });
            if (!res.ok) throw new Error('Failed to update product.');
            const data = await res.json();
            setProduct(data); // Update state with the response from the server
        } catch (err) {
            console.error("Update Error:", err.message);
            // Optionally set an error state to show in the UI
        }
    };

    const handleTogglePublishedStatus = () => {
        const newStatus = product.publishedStatus === 'live' ? 'draft' : 'live';
        handleUpdateProduct({ publishedStatus: newStatus });
    };

    const handleDelete = async () => {
        try {
            const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to archive product.');
            window.location.href = '/products'; // Redirect after delete
        } catch (err) {
            console.error("Delete Error:", err.message);
        } finally {
            setDeleteModalOpen(false);
        }
    };

    const formatPrice = (price) => {
        if (price === null || price === undefined) return "N/A";
        return new Intl.NumberFormat("en-IN", {
            style: "currency", currency: "INR", maximumFractionDigits: 0
        }).format(price);
    };

    if (loading) {
        return <div className="text-center py-10">Loading product details...</div>;
    }

    if (error || !product || product.isDeleted) {
        return (
            <div className="text-center py-10">
                <h2 className="text-xl font-semibold">{error || 'Product Not Found'}</h2>
                <p className="text-gray-500">This product may have been archived or does not exist.</p>
                <a href="/products" className="mt-4 inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to All Products
                </a>
            </div>
        );
    }

    const isAvailable = product.stock > 0;

    return (
        <div className="max-w-4xl mx-auto">
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Archive Product"
            >
                Are you sure you want to archive this product? It will be hidden but can be recovered later.
            </ConfirmationModal>

            <div className="mb-4">
                <a href="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 font-medium">
                    <ArrowLeftIcon className="w-4 h-4" /> Back to All Products
                </a>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md">
                <div className="flex justify-between items-start mb-4 border-b pb-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleTogglePublishedStatus}
                            className={`btn-secondary flex items-center gap-2 ${product.publishedStatus === 'live' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}
                        >
                            {product.publishedStatus === 'live' ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                            {product.publishedStatus === 'live' ? 'Make Draft' : 'Go Live'}
                        </button>
                        <a href={`/products/edit/${product.id}`} className="btn-secondary flex items-center gap-2">
                            <PencilIcon className="w-4 h-4" /> Edit
                        </a>
                        <button onClick={() => setDeleteModalOpen(true)} className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700">
                            <TrashIcon className="w-4 h-4" /> Archive
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
                    <div className="relative">
                        {product.availabilityOffer && (
                            <div className="absolute top-0 left-0 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-br-lg z-10">
                                {product.availabilityOffer}
                            </div>
                        )}
                        <img src={product.imageUrl || 'https://placehold.co/600x400/E0E7FF/4F46E5?text=No+Image'} alt={product.name} className="w-full h-auto rounded-lg object-cover" />
                    </div>

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${product.publishedStatus === 'live' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                }`}>
                                Website Status: {product.publishedStatus === 'live' ? 'Live' : 'Draft'}
                            </span>
                            <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {isAvailable ? 'Available' : 'Out of Stock'}
                            </span>
                        </div>

                        <div className="mb-4">
                            {product.offerPrice && product.offerPrice < product.price ? (
                                <div className="flex items-baseline gap-3">
                                    <span className="text-3xl font-bold text-red-600">{formatPrice(product.offerPrice)}</span>
                                    <span className="text-xl text-gray-400 line-through">{formatPrice(product.price)}</span>
                                </div>
                            ) : (
                                <span className="text-3xl font-bold text-gray-800">{formatPrice(product.price)}</span>
                            )}
                        </div>

                        <h3 className="text-xl font-semibold mb-2">Details</h3>
                        <ul className="space-y-3 text-gray-700">
                            <li><strong>Stock:</strong> {product.stock} units (Low stock at {product.lowStock})</li>
                            <li><strong>Category:</strong> {product.category || 'N/A'} &gt; {product.subcategory || 'N/A'}</li>
                            <li><strong>Brand:</strong> {product.brand || 'N/A'}</li>
                            <li><strong>Material:</strong> {product.material || 'N/A'}</li>
                            <li><strong>Color:</strong> {product.color || 'N/A'}</li>
                            <li><strong>Size:</strong> {product.size || 'N/A'}</li>
                            <li><strong>Warranty:</strong> {product.warranty || 'N/A'}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}

