"use client";
import { useState } from "react";
import { uploadImageToSupabase } from "@/lib/uploadImage";

export default function UploadPost() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [media, setMedia] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith("image/")) {
        alert("Please select an image file");
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (file) {
      const uploadedUrl = await uploadImageToSupabase(file, setIsUploading);
      setMedia(uploadedUrl);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      alert("Title and content are required!");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/posts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          desc: content,
          img: media,
          slug: title.toLowerCase().replace(/ /g, "-"),
          catSlug: "style",
        }),
      });

      if (res.ok) {
        const data = await res.json();
        console.log("Post created:", data);
      } else {
        alert("Failed to publish post");
      }
    } catch (error) {
      console.error("Error publishing post:", error);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleFileChange} />
      {preview && <img src={preview} alt="Preview" width={150} />}
      <button onClick={handleUpload} disabled={isUploading}>
        {isUploading ? "Uploading..." : "Upload Image"}
      </button>
      <button onClick={handleSubmit}>Submit Post</button>
    </div>
  );
}
