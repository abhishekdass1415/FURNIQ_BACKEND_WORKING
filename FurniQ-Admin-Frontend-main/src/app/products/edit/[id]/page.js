'use client'

import { useState, useEffect } from 'react';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

// --- Reusable Constants ---
const labelClasses = "block text-sm font-medium text-gray-700";
const inputClasses = "block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3";

export default function EditProduct() {
  // --- State Management ---
  const [productId, setProductId] = useState(null);
  const [product, setProduct] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : '';

  // --- Data Fetching and Initialization ---

  // 1. Get the Product ID from the URL on component mount.
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const pathParts = window.location.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      setProductId(id);
    }
  }, []);

  // 2. Fetch the specific product and all categories once the Product ID is known.
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productRes, categoriesRes] = await Promise.all([
          fetch(new URL(`/api/products/${productId}`, API_BASE_URL)),
          fetch(new URL('/api/categories', API_BASE_URL))
        ]);

        if (!productRes.ok) throw new Error('Failed to fetch product data.');
        if (!categoriesRes.ok) throw new Error('Failed to fetch categories.');

        const productData = await productRes.json();
        const categoriesData = await categoriesRes.json();

        // Format prices for display in the input fields.
        productData.price = formatPriceForInput(productData.price);
        productData.offerPrice = formatPriceForInput(productData.offerPrice);

        setProduct(productData);
        setCategories(categoriesData.filter(c => !c.parentId)); // Use only top-level categories
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchData();
    }
  }, [productId, API_BASE_URL]);

  // --- Helper Functions ---

  // Formats a number into an INR currency string for display.
  const formatPriceForInput = (price) => {
    if (price === null || price === undefined) return "";
    // Temporarily convert to a number to handle potential string values from the API
    const numericPrice = parseFloat(String(price).replace(/[^0-9.]/g, ''));
    if (isNaN(numericPrice)) return "";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(numericPrice);
  };

  // Parses a formatted currency string (e.g., "₹85,000") back into a number for the API.
  const parsePriceForAPI = (priceString) => {
    if (!priceString) return null;
    return parseFloat(priceString.replace(/[^0-9.]/g, ''));
  };

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handlePriceChange = (e, fieldName) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = rawValue ? formatPriceForInput(rawValue) : "";
    setProduct({ ...product, [fieldName]: formattedValue });
  };

  const getSubcategories = () => {
    const selectedCategory = categories.find(c => c.id === product.categoryId);
    return selectedCategory ? (selectedCategory.subcategories || []) : [];
  };

  // --- Form Submission ---
  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Prepare data for the API, converting formatted prices and strings back to numbers.
    const productDataForAPI = {
      ...product,
      price: parsePriceForAPI(product.price),
      offerPrice: parsePriceForAPI(product.offerPrice),
      stock: parseInt(product.stock, 10) || 0,
      lowStock: parseInt(product.lowStock, 10) || 5,
    };

    try {
      const res = await fetch(new URL(`/api/products/${productId}`, API_BASE_URL), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productDataForAPI),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update product");
      }
      // On success, redirect to the product detail page.
      window.location.href = `/products/${productId}`;
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };


  // --- Render Logic ---
  if (loading) return <div className="p-6 text-center">Loading product details...</div>;
  if (error) return <div className="p-6 text-center text-red-500">Error: {error}</div>;
  if (!product) return <div className="p-6 text-center">Product not found.</div>;

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
        <a href={`/products/${productId}`} className="btn-secondary flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to View
        </a>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
            <div className="md:col-span-1"><label htmlFor="name" className={labelClasses}>Product Name *</label><input id="name" name="name" value={product.name || ''} onChange={handleChange} required className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="sku" className={labelClasses}>SKU *</label><input id="sku" name="sku" value={product.sku || ''} onChange={handleChange} required className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="categoryId" className={labelClasses}>Category *</label><select id="categoryId" name="categoryId" value={product.categoryId || ''} onChange={handleChange} required className={inputClasses}><option value="">Select Category</option>{categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
            <div className="md:col-span-1"><label htmlFor="subcategoryId" className={labelClasses}>Subcategory *</label><select id="subcategoryId" name="subcategoryId" value={product.subcategoryId || ''} onChange={handleChange} required disabled={!product.categoryId} className={`${inputClasses} disabled:bg-gray-100`}><option value="">Select Subcategory</option>{getSubcategories().map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
            <div className="md:col-span-1"><label htmlFor="price" className={labelClasses}>Original Price (INR) *</label><input id="price" type="text" name="price" value={product.price || ''} onChange={(e) => handlePriceChange(e, 'price')} required className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="offerPrice" className={labelClasses}>Offer Price (INR)</label><input id="offerPrice" type="text" name="offerPrice" value={product.offerPrice || ''} onChange={(e) => handlePriceChange(e, 'offerPrice')} className={inputClasses} /></div>
            <div className="md:col-span-2"><label htmlFor="availabilityOffer" className={labelClasses}>Availability Offer</label><input id="availabilityOffer" name="availabilityOffer" value={product.availabilityOffer || ''} placeholder="e.g., Free Shipping" onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="stock" className={labelClasses}>Stock Quantity *</label><input id="stock" type="number" name="stock" value={product.stock || ''} onChange={handleChange} required className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="lowStock" className={labelClasses}>Low Stock Threshold</label><input id="lowStock" type="number" name="lowStock" value={product.lowStock || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="brand" className={labelClasses}>Brand</label><input id="brand" name="brand" value={product.brand || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="material" className={labelClasses}>Material</label><input id="material" name="material" value={product.material || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="color" className={labelClasses}>Color</label><input id="color" name="color" value={product.color || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="style" className={labelClasses}>Style</label><input id="style" name="style" value={product.style || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="size" className={labelClasses}>Size</label><input id="size" name="size" value={product.size || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-1"><label htmlFor="warranty" className={labelClasses}>Warranty</label><input id="warranty" name="warranty" value={product.warranty || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-2"><label htmlFor="imageUrl" className={labelClasses}>Image URL</label><input id="imageUrl" name="imageUrl" value={product.imageUrl || ''} onChange={handleChange} className={inputClasses} /></div>
            <div className="md:col-span-2"><label htmlFor="description" className={labelClasses}>Description</label><textarea id="description" name="description" value={product.description || ''} onChange={handleChange} rows={6} className={inputClasses}></textarea></div>
          </div>
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-md text-sm"><strong>Error:</strong> {error}</div>}
          <div className="pt-4 flex justify-end gap-3 border-t">
            <a href={`/products/${productId}`} className="btn-secondary">Cancel</a>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

