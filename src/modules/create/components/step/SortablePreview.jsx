import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

export default function SortablePreview({ id, item, onRemove, onClick }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    cursor: "grab",
    position: "relative",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <div
        style={{
          width: 110,
          height: 110,
          border: "2px solid #ddd",
          borderRadius: 8,
          overflow: "hidden",
          position: "relative",
          backgroundColor: "#f0f0f0",
        }}
      >
        <img
          src={item.url}
          alt="preview"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            pointerEvents: "none",
          }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          style={{
            position: "absolute",
            top: 4,
            right: 4,
            width: 24,
            height: 24,
            borderRadius: "50%",
            border: "none",
            backgroundColor: "rgba(255, 0, 0, 0.8)",
            color: "white",
            cursor: "pointer",
            fontSize: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 0,
          }}
        >
          ×
        </button>
        <div
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          style={{
            position: "absolute",
            inset: 0,
            cursor: "pointer",
          }}
        />
      </div>
    </div>
  );
}
