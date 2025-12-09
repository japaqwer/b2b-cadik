"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import MultiStepEditorGeneryKvadrat from "@/modules/kvadrad/create/components/MultiStepEditorGeneryKvadrat";

const API_BASE = "https://api-workhub.site/api/v1/base";

// Создаем axios instance с настройками timeout
const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10000, // 10 секунд timeout
});

async function getTemplateData(templateId) {
  try {
    const response = await apiClient.get(`/template/${templateId}`);
    return response.data?.data || null;
  } catch (error) {
    if (error.code === "ECONNABORTED") {
      console.error("Timeout - API слишком долго отвечает:", error.message);
      throw new Error("Время ожидания истекло. Попробуйте позже.");
    } else if (error.response?.status === 404) {
      console.error("Шаблон не найден");
      throw new Error("Шаблон не найден");
    } else if (error.response?.status === 500) {
      console.error("Ошибка сервера");
      throw new Error("Ошибка сервера. Попробуйте позже.");
    } else {
      console.error("Error fetching template:", error.message);
      throw new Error("Ошибка загрузки данных");
    }
  }
}

export default function DetailPageId() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  const [template, setTemplate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) {
      setLoading(false);
      return;
    }

    let isMounted = true; // Проверка, смонтирован ли компонент

    const fetchTemplate = async () => {
      try {
        setLoading(true);
        setError(null);

        const data = await getTemplateData(id);

        if (!isMounted) return; // Не обновляем, если компонент размонтирован

        if (!data) {
          setError("Шаблон не найден");
          setTimeout(() => {
            if (isMounted) router.push("/");
          }, 2000);
          return;
        }

        setTemplate(data);
        setError(null);
      } catch (err) {
        if (!isMounted) return;

        console.error("Error:", err.message);
        setError(err.message || "Ошибка загрузки шаблона");
        setTemplate(null);

        setTimeout(() => {
          if (isMounted) router.push("/");
        }, 3000);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchTemplate();

    // Cleanup функция
    return () => {
      isMounted = false;
    };
  }, [id, router]);

  // Состояние загрузки
  if (loading) {
    return (
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "20px",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              border: "4px solid rgba(255, 153, 34, 0.2)",
              borderTopColor: "#ff9922",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
          <p style={{ fontSize: "16px", color: "#666", fontWeight: "500" }}>
            ⏳ Загрузка шаблона...
          </p>
          <style>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "16px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "20px",
              color: "#ff3333",
              fontWeight: "600",
              margin: "0",
            }}
          >
            ❌ {error}
          </p>
          <p
            style={{
              fontSize: "14px",
              color: "#999",
              margin: "0",
            }}
          >
            Перенаправление на главную...
          </p>
        </div>
      </div>
    );
  }

  // Шаблон не найден
  if (!template) {
    return (
      <div className="container">
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "400px",
            gap: "16px",
            padding: "20px",
          }}
        >
          <p
            style={{
              fontSize: "18px",
              color: "#666",
              fontWeight: "500",
              margin: "0",
            }}
          >
            ❌ Шаблон не найден
          </p>
          <button
            onClick={() => router.push("/")}
            style={{
              marginTop: "10px",
              padding: "10px 24px",
              background: "linear-gradient(135deg, #ff9922 0%, #ff8800 100%)",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
            }}
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  // Успешная загрузка
  return (
    <div className="container">
      <MultiStepEditorGeneryKvadrat template={template} />
    </div>
  );
}
