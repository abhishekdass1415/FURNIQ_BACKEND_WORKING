"use client";

import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { createClient } from "@supabase/supabase-js";
import { ArrowUpOnSquareIcon } from '@heroicons/react/24/outline';

// --- Supabase Image Upload Logic ---
// Initialize the Supabase client. Your URL and anon key should be in your .env file.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * A helper function to upload an image to a Supabase bucket.
 * @param {File} file - The image file to upload.
 * @param {function} setLoading - The state setter for loading status.
 * @returns {string|null} The public URL of the uploaded image or null on failure.
 */
async function uploadImageToSupabase(file, setLoading) {
  if (!file) return null;

  setLoading(true);
  try {
    const fileName = `${Date.now()}_${file.name}`;
    const { data, error } = await supabase.storage
      .from("images") // IMPORTANT: Make sure you have a bucket named "images" in Supabase.
      .upload(fileName, file);

    if (error) {
      throw error;
    }

    // Get the public URL of the uploaded file
    const { data: publicURLData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);
      
    return publicURLData.publicUrl;
  } catch (error) {
    console.error("Error uploading image to Supabase:", error.message);
    return null;
  } finally {
    setLoading(false);
  }
}


// --- Main Component ---
export default function UploadPost() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    setSuccess('');

    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (PNG, JPG, etc.).");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size cannot exceed 5MB.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  /**
   * This single function handles the entire submission process:
   * 1. Uploads the image to Supabase.
   * 2. If successful, it submits the post data to your backend API.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }
    if (!file) {
      setError("An image is required for the post.");
      return;
    }

    setIsLoading(true);

    // 1. Upload image to Supabase first
    const imageUrl = await uploadImageToSupabase(file, setIsLoading);

    if (!imageUrl) {
      setError("Image upload failed. Please try again.");
      setIsLoading(false);
      return;
    }

    // 2. If image upload is successful, create the post
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          desc: content,
          img: imageUrl, // Use the URL from Supabase
          slug: title.toLowerCase().replace(/\s+/g, "-"),
          catSlug: "style", // This can be dynamic in a real app
        }),
      });

      if (res.ok) {
        setSuccess("Post published successfully!");
        // Reset form
        setTitle('');
        setContent('');
        setFile(null);
        setPreview(null);
      } else {
        const data = await res.json();
        throw new Error(data.error || "Failed to publish post.");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Create New Post</h1>
        <Card>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Error and Success Messages */}
                    {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
                    {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">{success}</div>}
                    
                    <div>
                        <label htmlFor="title" className="label-style">Post Title</label>
                        <input id="title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="input-style" placeholder="Enter a catchy title" required />
                    </div>

                    <div>
                        <label htmlFor="content" className="label-style">Content</label>
                        <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} className="input-style" rows="8" placeholder="Write your post content here..." required></textarea>
                    </div>

                    <div>
                        <label className="label-style">Featured Image</label>
                        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                            <div className="space-y-1 text-center">
                                {preview ? (
                                    <img src={preview} alt="Image preview" className="mx-auto h-48 w-auto rounded-md object-cover" />
                                ) : (
                                    <>
                                        <ArrowUpOnSquareIcon className="mx-auto h-12 w-12 text-gray-400" />
                                        <p className="text-sm text-gray-600">Drag and drop or click to upload</p>
                                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                                    </>
                                )}
                                <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-indigo-500">
                                    <span>{preview ? 'Change image' : 'Select an image'}</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    
                    <div className="text-right">
                        <button type="submit" className="btn-primary" disabled={isLoading}>
                            {isLoading ? "Publishing..." : "Publish Post"}
                        </button>
                    </div>
                </form>
            </CardContent>
        </Card>
    </div>
  );
}