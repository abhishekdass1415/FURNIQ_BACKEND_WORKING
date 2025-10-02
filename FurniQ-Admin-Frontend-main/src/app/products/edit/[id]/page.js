'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useProducts } from '@/context/ProductContext'
import { useCategories } from '@/context/CategoryContext' // Import category context
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

const labelClasses = "block text-sm font-medium text-gray-700";
const inputClasses = "block w-full mt-1 border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-4 py-3";

export default function EditProduct() {
  const router = useRouter();
  const params = useParams();
  const { products, updateProduct } = useProducts();
  const { categories } = useCategories(); // Get dynamic categories
  const productId = parseInt(params.id);
  const [product, setProduct] = useState(null);

  useEffect(() => {
    const productData = products.find(p => p.id === productId);
    if (productData) setProduct({ ...productData });
  }, [productId, products]);

  if (!product) return <div className="p-6 text-center">Loading...</div>;

  const handleChange = (e) => setProduct({ ...product, [e.target.name]: e.target.value });

  const handlePriceChange = (e, fieldName = 'price') => {
    const rawValue = e.target.value.replace(/[^0-9]/g, '');
    const formattedValue = rawValue ? new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(rawValue) : "";
    setProduct({ ...product, [fieldName]: formattedValue });
  };

  const handleUpdate = (e) => {
    e.preventDefault();
    updateProduct(productId, product);
    router.push(`/products/${productId}`);
  };

  const getSubcategories = () => categories.find(c => c.name === product.category)?.subcategories || [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Edit Product</h1>
        <Link href={`/products/${productId}`} className="btn-secondary flex items-center gap-2">
          <ArrowLeftIcon className="w-4 h-4" /> Back to View
        </Link>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <form onSubmit={handleUpdate} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">

            <div className="md:col-span-1">
              <label htmlFor="name" className={labelClasses}>Product Name *</label>
              <input id="name" name="name" value={product.name || ''} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="sku" className={labelClasses}>SKU *</label>
              <input id="sku" name="sku" value={product.sku || ''} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="category" className={labelClasses}>Category *</label>
              <select id="category" name="category" value={product.category || ''} onChange={handleChange} required className={inputClasses}>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="subcategory" className={labelClasses}>Subcategory *</label>
              <select id="subcategory" name="subcategory" value={product.subcategory || ''} onChange={handleChange} required disabled={!product.category} className={`${inputClasses} disabled:bg-gray-100`}>
                <option value="">Select Subcategory</option>
                {getSubcategories().map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
              </select>
            </div>

            <div className="md:col-span-1">
              <label htmlFor="price" className={labelClasses}>Original Price (INR) *</label>
              <input id="price" type="text" name="price" value={product.price || ''} onChange={(e) => handlePriceChange(e, 'price')} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="offerPrice" className={labelClasses}>Offer Price (INR)</label>
              <input id="offerPrice" type="text" name="offerPrice" value={product.offerPrice || ''} onChange={(e) => handlePriceChange(e, 'offerPrice')} className={inputClasses} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="availabilityOffer" className={labelClasses}>Availability Offer</label>
              <input id="availabilityOffer" name="availabilityOffer" value={product.availabilityOffer || ''} placeholder="e.g., Free Shipping, Next Day Delivery" onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="stock" className={labelClasses}>Stock Quantity *</label>
              <input id="stock" type="number" name="stock" value={product.stock || ''} onChange={handleChange} required className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="lowStock" className={labelClasses}>Low Stock Threshold</label>
              <input id="lowStock" type="number" name="lowStock" value={product.lowStock || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="brand" className={labelClasses}>Brand</label>
              <input id="brand" name="brand" value={product.brand || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="material" className={labelClasses}>Material</label>
              <input id="material" name="material" value={product.material || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="color" className={labelClasses}>Color</label>
              <input id="color" name="color" value={product.color || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="style" className={labelClasses}>Style</label>
              <input id="style" name="style" value={product.style || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="size" className={labelClasses}>Size</label>
              <input id="size" name="size" value={product.size || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-1">
              <label htmlFor="warranty" className={labelClasses}>Warranty</label>
              <input id="warranty" name="warranty" value={product.warranty || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="imageUrl" className={labelClasses}>Image URL</label>
              <input id="imageUrl" name="imageUrl" value={product.imageUrl || ''} onChange={handleChange} className={inputClasses} />
            </div>

            <div className="md:col-span-2">
              <label htmlFor="description" className={labelClasses}>Description</label>
              <textarea id="description" name="description" value={product.description || ''} onChange={handleChange} rows={6} className={inputClasses}></textarea>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3 border-t">
            <Link href={`/products/${productId}`} className="btn-secondary">Cancel</Link>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}