"use client";

import React, { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";
import s from "./Order.module.scss";

export default function OrderIdPage() {
  const params = useParams();
  const router = useRouter();
  const orderCode = params.id;
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [videoError, setVideoError] = useState(false);
  const [showGetCardButton, setShowGetCardButton] = useState(false);
  const intervalRef = useRef(null);
  const videoRef = useRef(null);

  // Блокировка полноэкранного режима
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleFullscreenChange = () => {
      if (document.fullscreenElement === video) {
        document.exitFullscreen?.();
      }
    };

    const handleFullscreenError = () => {
      console.warn("Fullscreen attempt blocked");
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("fullscreenerror", handleFullscreenError);

    video.requestFullscreen = () => Promise.reject(new Error("Disabled"));
    video.webkitRequestFullscreen = () => {};
    video.webkitEnterFullscreen = () => {};

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener("fullscreenerror", handleFullscreenError);
    };
  }, []);

  // Получение статуса заказа
  useEffect(() => {
    const fetchOrderStatus = async () => {
      if (!orderCode) return;

      try {
        const response = await axios.get(
          `https://api-workhub.site/api/v1/base/order/order-status`,
          {
            params: { code: orderCode },
            timeout: 10000,
          }
        );

        setOrderData(response.data.data);

        if (response.data.data.video_url) {
          setLoading(false);
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
        }
      } catch (err) {
        const errorMessage =
          err.response?.data?.message || err.message || "Ошибка загрузки";
        setError(errorMessage);
        console.error("Error fetching order status:", err);
        setLoading(false);

        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }
    };

    fetchOrderStatus();

    if (!orderData?.video_url) {
      intervalRef.current = setInterval(fetchOrderStatus, 20000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [orderCode, orderData?.video_url]);

  const handleEdit = () => {
    router.back();
  };

  // Состояние загрузки
  if (loading || (orderData && !orderData.video_url)) {
    return (
      <div className={s.center}>
        <h2 className={s.h21}>
          Не закрывайте сайт
          <br />
          идёт создание вашей открытки
        </h2>
        <div className={s.status}>
          <img src="/assets/images/ждем-ждем-без-текста.gif" alt="Загрузка" />
        </div>
      </div>
    );
  }

  // Состояние ошибки
  if (error) {
    return (
      <div className={s.center}>
        <div className={s.errorContainer}>
          <h2 className={s.h21}>❌ Ошибка</h2>
          <p>{error}</p>
          <button className={s.button} onClick={() => router.back()}>
            Вернуться назад
          </button>
        </div>
      </div>
    );
  }

  // Видео готово
  if (orderData?.video_url) {
    return (
      <div className={s.center}>
        <h2 className={s.h21}>Ура! ваша открытка готова</h2>

        <div className={s.videoContainer}>
          {videoError ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "360px",
                background: "#000",
                color: "#fff",
                fontSize: "14px",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <p>⚠️ Не удалось загрузить видео для воспроизведения</p>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                controls
                autoPlay
                playsInline
                controlsList="nodownload nofullscreen noremoteplayback"
                disablePictureInPicture
                onContextMenu={(e) => e.preventDefault()}
                onError={() => {
                  console.error("Video playback error");
                  setVideoError(true);
                }}
                onLoadedData={() => setShowGetCardButton(true)}
              >
                <source src={orderData.video_url} type="video/mp4" />
                Ваш браузер не поддерживает видео.
              </video>
              {/* <div className={s.watermarkOverlay}>
                <span className={`${s.watermarkText} ${s.watermarkTopLeft}`}>
                  НЕ ОПЛАЧЕНО
                </span>
                <span
                  className={`${s.watermarkText} ${s.watermarkBottomRight}`}
                >
                  НЕ ОПЛАЧЕНО
                </span>
              </div> */}
            </>
          )}
        </div>

        {showGetCardButton && (
          <div className={s.buttonContainer}>
            <button className={s.button} onClick={handleEdit}>
              Переделать
            </button>
            <Link href={`/order/push/${orderCode}`}>
              <button className={s.buttonGreen}>Получить</button>
            </Link>
          </div>
        )}
      </div>
    );
  }

  // Обработка заказа
  return (
    <div className={s.center}>
      <h2 className={s.h21}>⏳ Заказ обрабатывается</h2>
      <p style={{ color: "#999", marginBottom: "24px" }}>
        Ваше видео скоро будет готово...
      </p>
      <div className={s.status}>
        <img src="/assets/images/ждем-ждем-без-текста.gif" alt="Загрузка" />
      </div>
    </div>
  );
}
