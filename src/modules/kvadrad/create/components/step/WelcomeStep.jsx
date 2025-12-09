import React from "react";
import s from "./WelcomeStep.module.scss";

export default function WelcomeStep({ template, onNext }) {
  const desc = `
    Для создания музыкальной открытки вам
    просто нужно вписать текст заставки
    и загрузить от 1 до 30 фото.
    Когда открытка будет готова, вы сможете
    ее скачать, отправив себе
    на Вотсап или в Телеграм`;
  return (
    <div className={s.container}>
      <div className={s.flex}>
        {/* <h2 className={s.title}>{template.name}</h2> */}
        <div className={s.videoContainer}>
          <iframe
            src={template?.demo}
            allow="autoplay; fullscreen"
            allowFullScreen
            className={s.video}
          />
        </div>
        <button onClick={onNext} className="link button">
          <p style={{ color: "#FFF" }}>СОЗДАТЬ ОТКРЫТКУ</p>
        </button>
      </div>
    </div>
  );
}
