// lib/uploadImage.js
import { supabase } from "./supabaseClient";

export const uploadImageToSupabase = async (file, setIsUploading) => {
  try {
    setIsUploading(true);
    const fileName = `${Date.now()}_${file.name}`;

    const { data, error } = await supabase.storage
      .from("images")
      .upload(fileName, file);

    if (error) {
      console.error("Upload failed:", error.message);
      setIsUploading(false);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from("images")
      .getPublicUrl(fileName);

    setIsUploading(false);
    return urlData.publicUrl;
  } catch (error) {
    console.error("Error uploading image:", error);
    setIsUploading(false);
    return null;
  }
};
