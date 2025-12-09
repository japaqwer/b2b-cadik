// PinturaEditor.jsx
"use client";
import { useRef, useEffect, useState } from "react";
import {
  openEditor,
  createDefaultImageReader,
  createDefaultImageWriter,
  setPlugins,
  plugin_crop,
  plugin_filter,
  plugin_finetune,
  markup_editor_defaults,
  markup_editor_locale_en_gb,
} from "@pqina/pintura";
import "@pqina/pintura/pintura.css";

export default function PinturaEditor({ userImage, bgImage, onImageUpdate }) {
  const editorRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 640, height: 360 });

  useEffect(() => {
    const updateDimensions = () => {
      const windowWidth = window.innerWidth;
      if (windowWidth <= 500) {
        const width = Math.min(windowWidth - 40, 640);
        setDimensions({ width, height: (width * 9) / 16 });
      } else if (windowWidth <= 768) {
        const width = Math.min(windowWidth - 60, 640);
        setDimensions({ width, height: (width * 9) / 16 });
      } else {
        setDimensions({ width: 640, height: 360 });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  useEffect(() => {
    if (!userImage || !editorRef.current) return;

    setPlugins(plugin_crop, plugin_filter, plugin_finetune);

    const editor = openEditor({
      src: userImage.src || userImage,
      imageReader: createDefaultImageReader(),
      imageWriter: createDefaultImageWriter(),
      ...markup_editor_defaults,
      locale: markup_editor_locale_en_gb,

      utils: ["crop", "filter", "finetune", "resize"],

      enableButtonExport: false,
      enableNavigateHistory: true,
      enableToolbar: true,
      enableUtils: true,

      imageCropAspectRatio: 16 / 9,

      willRenderCanvas: (shapes, state) => {
        const { utilVisibility, selectionRect, backgroundColor } = state;

        if (bgImage && utilVisibility.crop > 0) {
          return {
            ...state,
            backgroundImage: bgImage,
          };
        }

        return state;
      },
    });

    editorRef.current.appendChild(editor);

    editor.on("process", (imageState) => {
      if (onImageUpdate) {
        onImageUpdate(imageState.dest);
      }
    });

    return () => {
      if (editor) {
        editor.destroy();
      }
    };
  }, [userImage, bgImage]);

  return (
    <div
      ref={editorRef}
      style={{
        width: dimensions.width,
        height: dimensions.height,
        maxWidth: "100%",
      }}
    />
  );
}
