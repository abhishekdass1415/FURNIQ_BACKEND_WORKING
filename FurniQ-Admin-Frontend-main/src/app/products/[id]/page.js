'use client'

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PencilIcon, TrashIcon, ArrowLeftIcon, XMarkIcon } from '@heroicons/react/24/outline';

// You can also fetch categories dynamically, but keeping static for now
const allCategories = [
  { id: 1, name: 'Furniture', subcategories: [{ id: 101, name: 'Sofas' }, { id: 102, name: 'Tables' }, { id: 103, name: 'Bed' }] },
  { id: 2, name: 'Kitchen & Dining', subcategories: [{ id: 201, name: 'Dining Sets' }, { id: 202, name: 'Cookware' }] },
  { id: 3, name: 'Home Decor', subcategories: [{ id: 301, name: 'Lighting' }, { id: 302, name: 'Wall Art' }] },
  { id: 4, name: 'Home Furnishing', subcategories: [{ id: 401, name: 'Cushions' }, { id: 402, name: 'Carpets' }] },
];

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState({ cat: '', subcat: '' });

  // ✅ Fetch product from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`);
        if (!res.ok) throw new Error('Failed to fetch product');
        const data = await res.json();
        setProduct(data);
        setNewCategory({ cat: data.category, subcat: data.subcategory });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    if (productId) fetchProduct();
  }, [productId]);

  // ✅ Update product category/subcategory
  const handleCategorySave = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category: newCategory.cat, subcategory: newCategory.subcat }),
      });
      if (!res.ok) throw new Error("Failed to update category");
      const updated = await res.json();
      setProduct(updated);
      setIsCategoryModalOpen(false);
    } catch (error) {
      console.error(error);
      alert("Error updating category");
    }
  };

  // ✅ Delete product
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to archive this product?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete product");
      router.push("/products");
    } catch (error) {
      console.error(error);
      alert("Error deleting product");
    }
  };

  const formatPrice = (price) => {
    if (!price) return "N/A";
    const numeric = parseInt(price.toString().replace(/\D/g, '')) || 0;
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }).format(numeric);
  };

  if (loading) return <div className="text-center py-10">Loading product...</div>;

  if (!product || product.status === 'archived') {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">Product Not Found</h2>
        <p className="text-gray-500">This product may have been archived or does not exist.</p>
        <Link href="/products" className="mt-4 inline-block btn-primary">
          Back to Products
        </Link>
      </div>
    );
  }

  const isAvailable = product.stock > 0;

  // ✅ Category Change Modal
  const CategoryChangeModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Change Category for "{product.name}"</h3>
          <button onClick={() => setIsCategoryModalOpen(false)}><XMarkIcon className="w-6 h-6" /></button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label-style">New Category</label>
            <select
              value={newCategory.cat}
              onChange={(e) => setNewCategory({ cat: e.target.value, subcat: '' })}
              className="input-style"
            >
              <option value="">Select category</option>
              {allCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label-style">New Subcategory</label>
            <select
              value={newCategory.subcat}
              onChange={(e) => setNewCategory({ ...newCategory, subcat: e.target.value })}
              className="input-style"
              disabled={!newCategory.cat}
            >
              <option value="">Select subcategory</option>
              {allCategories.find(c => c.name === newCategory.cat)?.subcategories.map(s => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <button type="button" className="btn-secondary" onClick={() => setIsCategoryModalOpen(false)}>Cancel</button>
          <button type="button" className="btn-primary" onClick={handleCategorySave} disabled={!newCategory.subcat}>Save</button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      {isCategoryModalOpen && <CategoryChangeModal />}

      <div className="mb-4">
        <Link href="/products" className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium">
          <ArrowLeftIcon className="w-4 h-4" /> Back to All Products
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-start mb-4 border-b pb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">{product.name}</h1>
            <p className="text-sm text-gray-500 mt-1">SKU: {product.sku}</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/products/edit/${product.id}`} className="btn-secondary flex items-center gap-2">
              <PencilIcon className="w-4 h-4" /> Edit
            </Link>
            <button onClick={handleDelete} className="btn-primary flex items-center gap-2 bg-red-600 hover:bg-red-700 focus:ring-red-500">
              <TrashIcon className="w-4 h-4" /> Delete
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
            <img src={product.imageUrl} alt={product.name} className="w-full h-auto rounded-lg object-cover" />
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-sm font-semibold px-3 py-1 rounded-full ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {isAvailable ? 'Available' : 'Not Available'}
              </span>
            </div>

            <div className="mb-4">
              {product.offerPrice && product.offerPrice !== product.price ? (
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
              <li className="flex justify-between items-center border-b pb-2">
                <strong>Category:</strong>
                <div className="flex items-center gap-2">
                  <span>{product.category} &gt; {product.subcategory}</span>
                  <button onClick={() => setIsCategoryModalOpen(true)} className="text-indigo-600 hover:underline text-xs font-semibold">(Change)</button>
                </div>
              </li>
              <li className="flex justify-between border-b pb-2"><strong>Stock:</strong> <span>{product.stock} units</span></li>
              <li className="flex justify-between border-b pb-2"><strong>Brand:</strong> <span>{product.brand || 'N/A'}</span></li>
              <li className="flex justify-between border-b pb-2"><strong>Style:</strong> <span>{product.style || 'N/A'}</span></li>
              <li className="flex justify-between border-b pb-2"><strong>Size:</strong> <span>{product.size || 'N/A'}</span></li>
              <li className="flex justify-between pb-2"><strong>Warranty:</strong> <span>{product.warranty || 'N/A'}</span></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
