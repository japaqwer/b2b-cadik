"use client";

import React, { useRef, useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import html2canvas from "html2canvas";
import s from "./SplashEditor.module.scss";
import axios from "axios";

export function SplashEditor({ template, onCreate }) {
  const wrapperRef = useRef(null);
  const textRef = useRef(null);
  const measureContext = useRef(null);

  const [texts, setTexts] = useState([]);
  const [editingTextId, setEditingTextId] = useState(null);
  const [editingTextValue, setEditingTextValue] = useState(
    `${template.title}` || ""
  );
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    measureContext.current = document.createElement("canvas").getContext("2d");

    if (template.title) {
      const wrap = wrapperRef.current;
      const fs = 32;
      const { width, height } = measureTextSize(`${template.title}`, fs);
      const id = Date.now();
      setTexts([
        {
          id,
          text: `${template.title}`,
          x: (wrap.clientWidth - width) / 2,
          y: (wrap.clientHeight - height) / 2,
          fontSize: fs,
          width,
          height,
        },
      ]);
      setEditingTextId(id);
    }
  }, [template.title]);

  const measureTextSize = (text, fontSize) => {
    const ctx = measureContext.current;
    ctx.font = `bold ${fontSize}px sans-serif`;
    const lines = text.split("\n");
    const widths = lines.map((line) => ctx.measureText(line).width + 16);
    const maxWidth = Math.max(...widths);
    const height = fontSize * lines.length + 8 * lines.length;
    return { width: maxWidth, height };
  };

  const handleEditingChange = (e) => {
    const val = e.target.value;
    setEditingTextValue(val);

    const wrap = wrapperRef.current;
    const fs = 32;
    const { width, height } = measureTextSize(val, fs);

    if (editingTextId == null) {
      const id = Date.now();
      setTexts([
        {
          id,
          text: val,
          x: (wrap.clientWidth - width) / 2,
          y: (wrap.clientHeight - height) / 2,
          fontSize: fs,
          width,
          height,
        },
      ]);
      setEditingTextId(id);
    } else {
      setTexts((prev) =>
        prev.map((t) => {
          if (t.id !== editingTextId) return t;
          return {
            ...t,
            text: val,
            fontSize: fs,
            width,
            height,
            x: (wrap.clientWidth - width) / 2,
            y: (wrap.clientHeight - height) / 2,
          };
        })
      );
    }
  };

  const captureText = async () => {
    if (!textRef.current) return null;
    const canvas = await html2canvas(textRef.current, {
      useCORS: true,
      backgroundColor: null,
      scale: 3,
    });
    return canvas.toDataURL("image/png");
  };
  function dataURLtoFile(dataurl, filename) {
    const [header, b64] = dataurl.split(",");
    const mime = header.match(/:(.*?);/)[1];
    const bin = atob(b64);
    const arr = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
    return new File([arr], filename, { type: mime });
  }

  const handleCreate = async () => {
    if (!isConfirmed) {
      setIsConfirmed(true);
      return;
    }

    const dataUrl = await captureText();
    if (dataUrl) {
      try {
        const formData = new FormData();

        const introFile = dataURLtoFile(dataUrl, "intro.png");
        formData.append("intro", introFile);

        const response = await axios.post(
          "https://api-workhub.site/api/v1/base/order/upload-files",
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        const uploadedIntro = response.data.data.intro_file_name;
        localStorage.setItem("uploadedIntro", JSON.stringify(uploadedIntro));

        onCreate(dataUrl);
      } catch (error) {
        console.error("Failed to upload intro:", error);
        onCreate(dataUrl);
      }
    }
  };

  const handleEdit = () => {
    setIsConfirmed(false);
  };

  return (
    <div className="center">
      <div
        ref={wrapperRef}
        style={{
          position: "relative",
          width: 360,
          height: 360,
          border: "1px solid #333",
          overflow: "hidden",
          userSelect: "none",
        }}
      >
        <img
          src={template?.intro}
          alt="background"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          ref={textRef}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          {texts.map((item) => (
            <Rnd
              key={item.id}
              bounds="parent"
              position={{ x: item.x, y: item.y }}
              size={{ width: item.width, height: item.height }}
              enableResizing={false}
              dragAxis="none"
              style={{ zIndex: 100 }}
            >
              <div className={s.divqwe}>
                <div
                  className={s.textspan}
                  style={{ fontSize: item.fontSize, whiteSpace: "pre-wrap" }}
                >
                  {item.text}
                </div>
              </div>
            </Rnd>
          ))}
        </div>
      </div>
      <h2 className={s.h21} style={{ color: "#000" }}>
        Можно изменить текст заставки
      </h2>
      <div className="center">
        {!isConfirmed ? (
          <>
            <textarea
              className={s.inputName}
              value={editingTextValue}
              onChange={handleEditingChange}
              placeholder="Введите текст заставки"
              rows={2}
            />
            <button
              className="buttongreen"
              style={{ marginTop: -10 }}
              onClick={handleCreate}
            >
              Далее
            </button>
          </>
        ) : (
          <>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="button" onClick={handleEdit}>
                Нет
              </button>
              <button className="buttongreen" onClick={handleCreate}>
                Да
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
