"use client";
import React, { useState, useRef, useEffect } from "react";
import dynamic from "next/dynamic";
import s from "./EditorCanvas.module.scss";

const KonvaCanvas = dynamic(() => import("./KonvaCanvas"), {
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
  const fileInputRef = useRef(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Автоматически открываем диалог выбора файла, если нет изображения
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

  useEffect(() => {
    if (selectedId && transformerRef.current && imageRef.current) {
      transformerRef.current.nodes([imageRef.current]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId]);

  const handleExport = async () => {
    if (!stageRef.current || !userImage) return null;

    setSelectedId(null);
    setIsExporting(true);

    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const stageWidth = stageRef.current.width();
      const stageHeight = stageRef.current.height();

      // Создаем финальный canvas с белым фоном
      const finalCanvas = document.createElement("canvas");
      finalCanvas.width = stageWidth * 2; // pixelRatio 2
      finalCanvas.height = stageHeight * 2;

      const finalCtx = finalCanvas.getContext("2d");

      // Заполняем белым фоном сразу
      finalCtx.fillStyle = "#FFFFFF";
      finalCtx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);

      // Масштабируем для pixelRatio
      finalCtx.scale(2, 2);

      // Рисуем все слои на белый фон
      const layers = stageRef.current.getLayers();
      layers.forEach((layer) => {
        const layerCanvas = layer.getCanvas();
        if (layerCanvas && layerCanvas._canvas) {
          finalCtx.drawImage(
            layerCanvas._canvas,
            0,
            0,
            stageWidth,
            stageHeight
          );
        }
      });

      const dataUrl = finalCanvas.toDataURL("image/png");

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
    const node = imageRef.current;
    if (!node) return;

    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    node.width(Math.max(5, node.width() * scaleX));
    node.height(Math.max(5, node.height() * scaleY));
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
        <KonvaCanvas
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
        <h4 className={s.h6} style={{ textAlign: "center", marginBottom: 10 }}>
          Измените размер фото и его положение привычными движениями пальцев или
          мышки
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
