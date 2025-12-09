import { useState, useCallback } from "react";
import axios from "axios";
import { v4 as uuidv4 } from "uuid";

export function useImageUpload() {
  const [uploading, setUploading] = useState(false);

  const compressImage = useCallback(
    async (dataUrl, quality = 0.95, maxWidth = 1920) => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.onload = () => {
          let { width, height } = img;

          // Масштабируем только если изображение больше 1920px
          if (width > maxWidth) {
            height *= maxWidth / width;
            width = maxWidth;
          }

          const canvas = document.createElement("canvas");
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          // Улучшаем качество рендеринга
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = "high";

          ctx.drawImage(img, 0, 0, width, height);

          // Экспортируем с высоким качеством (0.95 для JPEG)
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
        // Используем качество 0.95 и максимальную ширину 1920px
        const blob = await compressImage(src, 0.95, 1920);
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
        const blob = await compressImage(src, 0.95, 1920);
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
