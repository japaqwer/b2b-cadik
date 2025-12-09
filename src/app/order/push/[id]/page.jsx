"use client";

import React from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

import s from "./OrderPush.module.scss";

export default function OrderPushPage() {
  const params = useParams();
  const orderCode = params.id;

  const telegramText = `Мой заказ ${orderCode}`;

  const handleCopy = () => {
    const textToCopy = `Мой заказ ${orderCode}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Номер заказа успешно скопирован!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      })
      .catch((err) => {
        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        toast.success("Номер заказа успешно скопирован!", {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      });
  };

  return (
    <div className={s.center}>
      <div className={s.infoCard}>
        <p className={s.infoParagraph}>
          <strong>Ваш заказ №</strong>
        </p>
        <div
          className={s.orderCode}
          onClick={handleCopy}
          title="Нажмите для копирования"
          style={{ cursor: "pointer" }}
        >
          <span className={s.orderCodeText}>{orderCode}</span>
        </div>

        <p className={s.h3}>
          Нажмите на номер заказа, чтобы <br /> его скопировать и отправить в
          Телеграм
        </p>
      </div>
      <div className={s.flex}>
        <Link
          href={`https://t.me/muzOkkk?text=${encodeURIComponent(telegramText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={s.buttonBlue}
        >
          Отправить заказ в Телеграм
        </Link>
      </div>
    </div>
  );
}
