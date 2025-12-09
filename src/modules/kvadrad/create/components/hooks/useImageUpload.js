import { useState, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const compressImage = useCallback(
    async (dataUrl, quality = 0.7, maxWidth = 800) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }
          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => resolve(blob), "image/jpeg", quality);
        };
        img.src = dataUrl;
      });
    },
    []
  );

  const uploadImage = useCallback(
    async (src) => {
      if (!src) return { id: uuidv4(), url: null, blob: null };

      setUploading(true);

      try {
        const blob = await compressImage(src, 0.7, 800);
        const url = URL.createObjectURL(blob);
        const formData = new FormData();
        formData.append("backgrounds", blob, `bg_${Date.now()}.jpg`);

        const response = await axios.post(
          "https://api-workhub.site/api/v1/base/order/upload-files",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const uploadedUrls = response.data.data.backgrounds_urls.map((url) =>
          url.trim()
        );

        // Сохраняем в localStorage
        const existingBackgrounds = JSON.parse(
          localStorage.getItem("uploadedBackgrounds") || "[]"
        );
        const updatedBackgrounds = [...existingBackgrounds, ...uploadedUrls];
        localStorage.setItem(
          "uploadedBackgrounds",
          JSON.stringify(updatedBackgrounds)
        );

        return { id: uuidv4(), url, blob, uploadedUrls };
      } catch (error) {
        console.error("Failed to upload image:", error);
        const blob = await compressImage(src, 0.7, 800);
        const url = URL.createObjectURL(blob);
        return { id: uuidv4(), url, blob };
      } finally {
        setUploading(false);
      }
    },
    [compressImage]
  );

  return { uploadImage, uploading, compressImage };
}
