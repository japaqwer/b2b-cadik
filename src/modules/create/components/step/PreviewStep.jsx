import React, { useEffect, useState, useRef } from "react";
import { DndContext, closestCenter } from "@dnd-kit/core";
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { useRouter } from "next/navigation";
import SortablePreview from "./SortablePreview";
import s from "../MultiStepEditor.module.scss";

export default function PreviewStep({
  sensors,
  setStep,
  cyclic,
  handleSend,
  setCyclic,
  result,
  setCurrentFile, // Добавляем этот проп
}) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [localStorageImages, setLocalStorageImages] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const storedBackgrounds = localStorage.getItem("uploadedBackgrounds");
      if (storedBackgrounds) {
        const parsed = JSON.parse(storedBackgrounds);
        const images = parsed.map((url, index) => ({
          id: `image-${index}`,
          url: url.trim(),
        }));
        setLocalStorageImages(images);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    }
  }, []);

  useEffect(() => {
    if (result?.order_code) {
      router.push(`/order/${result.order_code}`);
    }
  }, [result, router]);

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setLocalStorageImages((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      if (oldIndex === -1 || newIndex === -1) return items;

      const newArray = arrayMove(items, oldIndex, newIndex);

      const updatedUrls = newArray.map((img) => img.url);
      localStorage.setItem("uploadedBackgrounds", JSON.stringify(updatedUrls));

      return newArray;
    });
  };

  const handleRemoveImage = (imageId) => {
    const updatedImages = localStorageImages.filter(
      (img) => img.id !== imageId
    );

    const updatedUrls = updatedImages.map((img) => img.url);
    localStorage.setItem("uploadedBackgrounds", JSON.stringify(updatedUrls));

    setLocalStorageImages(updatedImages);
    setSelectedItem(null);
  };

  // Обработчик для выбора файла
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentFile(file);
      setStep(3); // Переходим на этап редактирования
    }
  };

  // Обработчик для кнопки "Добавить фото"
  const handleAddPhoto = () => {
    setStep(1);
    // fileInputRef.current?.click();
  };

  const handleCreateOrder = async () => {
    if (localStorageImages.length === 0) {
      alert("Добавьте хотя бы одно фото");
      return;
    }

    setIsCreating(true);
    try {
      await handleSend();
    } catch (error) {
      console.error("Error creating order:", error);
      setIsCreating(false);
    }
  };

  const showCyclicControls =
    localStorageImages.length >= 2 && localStorageImages.length <= 12;

  return (
    <div className="center" style={{ touchAction: "none", marginTop: -30 }}>
      <h2 className={s.h2}>Предпросмотр</h2>
      <h3 className={s.h3}>
        Вы загрузили {localStorageImages.length} фото из 36
      </h3>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={localStorageImages.map((item) => item.id)}
          strategy={rectSortingStrategy}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 110px)",
              gap: 8,
              overflowY: "auto",
              maxHeight: "40vh",
              padding: "4px",
            }}
          >
            {localStorageImages.map((item) => (
              <SortablePreview
                key={item.id}
                id={item.id}
                item={item}
                onRemove={() => handleRemoveImage(item.id)}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      {showCyclicControls && (
        <div className="center" style={{ marginTop: 16 }}>
          <p className={s.h411}>
            {cyclic ? "Фото будут повторяться" : "Фото не будут повторяться"}
          </p>
          <button
            className="button"
            onClick={() => setCyclic(!cyclic)}
            style={{ padding: "8px 16px", fontSize: "14px", marginTop: 8 }}
          >
            {cyclic ? "Отключить повтор" : "Включить повтор"}
          </button>
        </div>
      )}

      {selectedItem && (
        <div className={s.modalOverlay} onClick={() => setSelectedItem(null)}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={s.modalClose}
              onClick={() => setSelectedItem(null)}
            >
              ×
            </button>
            <img
              src={selectedItem.url}
              alt="preview"
              className={s.modalImage}
            />
            <div className={s.flex}>
              <button
                className="button"
                onClick={() => handleRemoveImage(selectedItem.id)}
              >
                Удалить
              </button>
              <button
                className="buttongreen"
                onClick={() => setSelectedItem(null)}
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Скрытый input для выбора файла */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className={s.flex} style={{ marginTop: 16 }}>
        <button className="button" onClick={handleAddPhoto}>
          ДОБАВИТЬ ЕЩЕ ФОТО
        </button>
        <button
          className="buttongreen"
          onClick={handleCreateOrder}
          disabled={isCreating || localStorageImages.length === 0}
          style={{
            marginLeft: 10,
            opacity: isCreating || localStorageImages.length === 0 ? 0.5 : 1,
          }}
        >
          {isCreating ? "СОЗДАЕТСЯ..." : "СОЗДАТЬ ОТКРЫТКУ"}
        </button>
      </div>

      {isCreating && (
        <div style={{ marginTop: 10 }}>
          <p>Идет создание заказа...</p>
        </div>
      )}
    </div>
  );
}
