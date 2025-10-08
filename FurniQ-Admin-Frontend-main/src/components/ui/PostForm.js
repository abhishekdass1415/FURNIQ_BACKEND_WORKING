"use client";

import { useState } from "react";
import { uploadImageToSupabase } from "@/lib/uploadImage";
import { Card, CardHeader, CardTitle, CardContent } from "./Card"; // Using your own UI components
import { PhotoIcon, CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/24/outline';


export default function PostForm() {
  // State for form inputs
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState(null);

  // State for UI feedback
  const [preview, setPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError("");
    setSuccess("");

    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        setError("Please select a valid image file (PNG, JPG, etc.).");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size exceeds the 5MB limit.");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // This single function now handles both image upload and post submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!title.trim() || !content.trim()) {
      setError("Title and content are required.");
      return;
    }

    if (!file) {
      setError("An image is required to create a post.");
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Upload the image to Supabase first.
      const imageUrl = await uploadImageToSupabase(file);
      if (!imageUrl) {
        throw new Error("Image upload failed. Please try again.");
      }

      // Step 2: If image upload is successful, submit the post to your API.
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          desc: content,
          img: imageUrl, // Use the URL returned from Supabase
          slug: title.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, ''),
          catSlug: "style", // Example category
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to publish the post.");
      }

      // Success! Clear the form and show a success message.
      setSuccess("Post published successfully!");
      setTitle("");
      setContent("");
      setFile(null);
      setPreview(null);

    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Create a New Post</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Cover Image</label>
            <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
              {preview ? (
                <div className="text-center">
                  <img src={preview} alt="Image preview" className="mx-auto h-48 w-auto rounded-md" />
                  <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-red-600 hover:text-red-500 mt-2">
                    Remove Image
                  </button>
                </div>
              ) : (
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer rounded-md bg-white font-semibold text-indigo-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-600 focus-within:ring-offset-2 hover:text-indigo-500">
                      <span>Upload a file</span>
                      <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
            </div>
          </div>

          {/* Text Inputs */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
            <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="input-style" placeholder="Your Post Title" required />
          </div>

          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">Content</label>
            <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows="6" className="input-style" placeholder="Write your post content here..." required />
          </div>

          {/* Feedback Messages */}
          {error && (
            <div className="flex items-center gap-x-2 rounded-md bg-red-50 p-3 text-sm text-red-600">
              <ExclamationCircleIcon className="h-5 w-5" />
              {error}
            </div>
          )}
          {success && (
            <div className="flex items-center gap-x-2 rounded-md bg-green-50 p-3 text-sm text-green-600">
              <CheckCircleIcon className="h-5 w-5" />
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4 border-t">
            <button type="submit" className="btn-primary w-full" disabled={isLoading}>
              {isLoading ? 'Publishing...' : 'Publish Post'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
