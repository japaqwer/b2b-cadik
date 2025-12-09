// KonvaCanvas.jsx
"use client";
import { Stage, Layer, Image, Transformer } from "react-konva";
import { useRef, useEffect, useState } from "react";

export default function KonvaCanvas({
  stageRef,
  imageRef,
  transformerRef,
  bgImage,
  userImage,
  coverImage,
  selectedId,
  setSelectedId,
  onTransformEnd,
  shouldRenderCover = true,
}) {
  const [loadedBgImage, setLoadedBgImage] = useState(null);
  const [loadedCoverImage, setLoadedCoverImage] = useState(null);

  const lastCenter = useRef(null);
  const lastDist = useRef(0);
  const isPinching = useRef(false);

  // Загружаем фоновую картинку из URL
  useEffect(() => {
    if (!bgImage) {
      setLoadedBgImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedBgImage(img);
    };
    img.onerror = (err) => {
      console.error("Ошибка загрузки фона:", err);
      setLoadedBgImage(null);
    };
    img.src = bgImage;
  }, [bgImage]);

  // Загружаем картинку обложки из URL
  useEffect(() => {
    if (!coverImage) {
      setLoadedCoverImage(null);
      return;
    }

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setLoadedCoverImage(img);
    };
    img.onerror = (err) => {
      console.error("Ошибка загрузки обложки:", err);
      setLoadedCoverImage(null);
    };
    img.src = coverImage;
  }, [coverImage]);

  useEffect(() => {
    if (userImage && imageRef.current) {
      const stage = stageRef.current;
      const stageWidth = stage.width();
      const stageHeight = stage.height();

      const imgWidth = userImage.width;
      const imgHeight = userImage.height;

      const scale = Math.min(
        (stageWidth * 0.8) / imgWidth,
        (stageHeight * 0.8) / imgHeight
      );

      const x = (stageWidth - imgWidth * scale) / 2;
      const y = (stageHeight - imgHeight * scale) / 2;

      imageRef.current.setAttrs({
        x,
        y,
        scaleX: scale,
        scaleY: scale,
        width: imgWidth,
        height: imgHeight,
      });

      stage.batchDraw();
    }
  }, [userImage, stageRef, imageRef]);

  const handleStageClick = (e) => {
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      setSelectedId(null);
    }
  };

  const handleWheel = (e) => {
    e.evt.preventDefault();

    if (!imageRef.current) return;

    const scaleBy = 1.05;
    const stage = stageRef.current;
    const oldScale = imageRef.current.scaleX();
    const pointer = stage.getPointerPosition();

    const mousePointTo = {
      x: (pointer.x - imageRef.current.x()) / oldScale,
      y: (pointer.y - imageRef.current.y()) / oldScale,
    };

    const newScale = e.evt.deltaY < 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(newScale, 10));

    imageRef.current.to({
      scaleX: clampedScale,
      scaleY: clampedScale,
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
      duration: 0.05,
    });
  };

  const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
  };

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchStart = (e) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2) {
      isPinching.current = true;
      e.evt.preventDefault();

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      lastCenter.current = getCenter(p1, p2);
      lastDist.current = getDistance(p1, p2);

      if (imageRef.current) {
        imageRef.current.draggable(false);
      }
    } else {
      isPinching.current = false;
      if (imageRef.current) {
        imageRef.current.draggable(true);
      }
      handleStageClick(e);
    }
  };

  const handleTouchMove = (e) => {
    const touch1 = e.evt.touches[0];
    const touch2 = e.evt.touches[1];

    if (touch1 && touch2 && imageRef.current && isPinching.current) {
      e.evt.preventDefault();

      const stage = stageRef.current;

      const p1 = { x: touch1.clientX, y: touch1.clientY };
      const p2 = { x: touch2.clientX, y: touch2.clientY };

      const newCenter = getCenter(p1, p2);
      const dist = getDistance(p1, p2);

      if (!lastCenter.current || !lastDist.current) {
        lastCenter.current = newCenter;
        lastDist.current = dist;
        return;
      }

      const pointTo = {
        x: (newCenter.x - imageRef.current.x()) / imageRef.current.scaleX(),
        y: (newCenter.y - imageRef.current.y()) / imageRef.current.scaleX(),
      };

      const scale = imageRef.current.scaleX() * (dist / lastDist.current);
      const clampedScale = Math.max(0.1, Math.min(scale, 10));

      imageRef.current.scaleX(clampedScale);
      imageRef.current.scaleY(clampedScale);

      const dx = newCenter.x - lastCenter.current.x;
      const dy = newCenter.y - lastCenter.current.y;

      imageRef.current.position({
        x: newCenter.x - pointTo.x * clampedScale + dx,
        y: newCenter.y - pointTo.y * clampedScale + dy,
      });

      lastDist.current = dist;
      lastCenter.current = newCenter;

      stage.batchDraw();
    }
  };

  const handleTouchEnd = () => {
    isPinching.current = false;
    lastCenter.current = null;
    lastDist.current = 0;

    if (imageRef.current) {
      imageRef.current.draggable(true);
    }
  };

  return (
    <Stage
      ref={stageRef}
      width={360}
      height={360}
      onMouseDown={handleStageClick}
      onTouchStart={handleTouchStart}
      onWheel={handleWheel}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <Layer>
        {userImage && (
          <Image
            ref={imageRef}
            image={userImage}
            draggable
            onClick={() => setSelectedId("user-image")}
            onTap={() => setSelectedId("user-image")}
            onTransformEnd={onTransformEnd}
            perfectDrawEnabled={false}
          />
        )}
        {loadedBgImage && (
          <Image
            image={loadedBgImage}
            width={360}
            height={360}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}

        {selectedId && (
          <Transformer
            ref={transformerRef}
            boundBoxFunc={(oldBox, newBox) => {
              if (newBox.width < 50 || newBox.height < 50) {
                return oldBox;
              }
              return newBox;
            }}
            enabledAnchors={[
              "top-left",
              "top-right",
              "bottom-left",
              "bottom-right",
            ]}
            rotateEnabled={true}
            keepRatio={true}
          />
        )}

        {shouldRenderCover && loadedCoverImage && (
          <Image
            image={loadedCoverImage}
            width={360}
            height={360}
            listening={false}
            perfectDrawEnabled={false}
          />
        )}
      </Layer>
    </Stage>
  );
}
