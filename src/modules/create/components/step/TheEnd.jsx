import React from "react";
import Link from "next/link";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import s from "../MultiStepEditor.module.scss";
import SocialSection from "../../../module/components/home/SocialSection";

export default function TheEnd({ result }) {
  const telegramText = `Мой заказ ${result?.order_code}`;

  const handleCopy = () => {
    const textToCopy = `Мой заказ ${result?.order_code}`;
    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        toast.success("Текст скопирован в буфер обмена!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      })
      .catch((err) => {
        console.error("Ошибка при копировании:", err);

        const textarea = document.createElement("textarea");
        textarea.value = textToCopy;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);

        toast.success("Текст скопирован в буфер обмена!", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        });
      });
  };

  return (
    <div className="center">
      <ToastContainer />
      <span className={s.war} style={{ marginTop: "20px" }}>
        ВНИМАНИЕ!
      </span>
      <h4 className={s.h22} style={{ padding: "10px" }}>
        Для получения открытки пришлите нам номер заказа в тот мессенджер, где
        вам удобно получить готовый результат.
      </h4>

      <h3
        className={s.h212}
        onClick={handleCopy}
        style={{ cursor: "pointer", textDecoration: "underline" }}
      >
        № {result?.order_code}
      </h3>
      <h3
        className={s.h3}
        onClick={handleCopy}
        style={{ cursor: "pointer", textDecoration: "underline" }}
      >
        нажмите, чтобы скопировать
      </h3>
      <div className={s.flex}>
        <Link
          className="buttonblue"
          href={`https://t.me/muzOkkk?text=${encodeURIComponent(telegramText)}`}
          target="_blank"
        >
          В Телеграм
        </Link>
        <Link
          className="buttongreen"
          href={`https://wa.me/79151340402?text=${encodeURIComponent(
            `Мой заказ ${result.order_code}`,
          )}`}
          target="_blank"
        >
          На Whatsapp
        </Link>
      </div>
      <SocialSection />
    </div>
  );
}
