"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import s from "./EditorCanvas.module.scss";

const SimplePhotoEditor = dynamic(() => import("./SimplePhotoEditor"), {
  ssr: false,
  loading: () => <div className={s.loadingContainer}>Загрузка...</div>,
});

export function EditorCanvas({ inputSrc, onCreate, template }) {
  const [mounted, setMounted] = useState(false);
  const [userImage, setUserImage] = useState(null);
  const [selectedId, setSelectedId] = useState(null);
  const [isExporting, setIsExporting] = useState(false);

  const stageRef = useRef(null);
  const imageRef = useRef(null);
  const transformerRef = useRef(null);
  const editorRef = useRef(null);
  const fileInputRef = useRef(null);

  const EXPORT_WIDTH = 1920;
  const EXPORT_HEIGHT = 1080;

  useEffect(() => {
    setMounted(true);
  }, []);

  // useEffect(() => {
  //   if (mounted && !inputSrc && !userImage) {
  //     const timer = setTimeout(() => {
  //       fileInputRef.current?.click();
  //     }, 300);
  //     return () => clearTimeout(timer);
  //   }
  // }, [mounted, inputSrc, userImage]);

  useEffect(() => {
    if (!inputSrc) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    img.onload = () => setUserImage(img);
    img.onerror = () => console.error("Ошибка загрузки изображения");

    if (typeof inputSrc === "string") {
      img.src = inputSrc;
    } else if (inputSrc instanceof File) {
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = () => console.error("Ошибка чтения файла");
      reader.readAsDataURL(inputSrc);
    }
  }, [inputSrc]);

  const handleExport = async () => {
    if (!editorRef.current || !userImage) return null;

    setSelectedId(null);
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const dataUrl = await editorRef.current.exportHighRes();
      setIsExporting(false);
      return dataUrl;
    } catch (error) {
      console.error("Ошибка при экспорте:", error);
      setIsExporting(false);
      return null;
    }
  };

  const handleAddPhoto = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";

    const reader = new FileReader();
    reader.onload = (event) => {
      img.src = event.target.result;
      img.onload = () => setUserImage(img);
    };
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (userImage) {
      const dataUrl = await handleExport();
      onCreate(dataUrl);
    } else {
      onCreate(null);
    }
  };

  const handleTransformEnd = () => {
    // Callback для трансформации
  };

  if (!mounted) {
    return (
      <div className="center">
        <div className={s.loadingContainer}>Загрузка...</div>
      </div>
    );
  }

  return (
    <div className="center">
      <div className={s.canvasWrapper}>
        <SimplePhotoEditor
          ref={editorRef}
          stageRef={stageRef}
          imageRef={imageRef}
          transformerRef={transformerRef}
          bgImage={template?.background}
          userImage={userImage}
          coverImage={template?.cover}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          shouldRenderCover={!isExporting}
          onTransformEnd={handleTransformEnd}
        />
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        style={{ display: "none" }}
      />

      <div className="center" style={{ marginTop: 10 }}>
        <h4 className={s.h7} style={{ textAlign: "center" }}>
          Измените размер фото и его положение привычными движениями пальцев
        </h4>
        <h4 className={s.h8} style={{ textAlign: "center" }}>
          Измените размер фото и его положение в рамке открытки привычными
          движениями мышки
        </h4>

        <div className={s.flex} style={{ gap: 20 }}>
          {!userImage && (
            <button className="button" onClick={handleAddPhoto}>
              Добавить фото
            </button>
          )}
          <button className="buttongreen" onClick={handleCreate}>
            Далее
          </button>
        </div>
      </div>
    </div>
  );
}
