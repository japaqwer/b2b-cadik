import { useState, useCallback } from "react";

export function useImageManager() {
  const [edited, setEdited] = useState([]);
  const [currentFile, setCurrentFile] = useState(null);

  const addImage = useCallback((imageData) => {
    setEdited((prev) => [...prev, imageData]);
  }, []);

  const removeImage = useCallback((id) => {
    setEdited((prev) => {
      const toRemove = prev.find((x) => x.id === id);
      if (toRemove?.url) URL.revokeObjectURL(toRemove.url);
      return prev.filter((x) => x.id !== id);
    });
  }, []);

  const clearImages = useCallback(() => {
    edited.forEach((item) => {
      if (item.url) URL.revokeObjectURL(item.url);
    });
    setEdited([]);
  }, [edited]);

  return {
    edited,
    setEdited,
    currentFile,
    setCurrentFile,
    addImage,
    removeImage,
    clearImages,
  };
}
