import React from "react";
import Link from "next/link";
import s from "../MultiStepEditor.module.scss";
import { IoLogoWhatsapp } from "react-icons/io";
import { BsTelegram } from "react-icons/bs";
import FAQ from "../../../module/components/home/FAQ";
import SocialSection from "../../../module/components/home/SocialSection";

export default function SendStep({
  orderI,
  sending,
  result,
  setStep,
  handleSend,
}) {
  return (
    <div className="center">
      {sending && <h2 className={s.h21}>Отлично, почти всё готово!</h2>}

      {!sending && <h3 className={s.h22}>Куда вы хотите получить открытку?</h3>}
      {/* {sending && (
        <h3 className={s.h22}>
          Сейчас у вас создается видео открытка пожалуйста не закрывайте вкладку
        </h3>
      )} */}

      {!orderI && (
        <div className={s.flex}>
          <button
            onClick={() => setStep(4)}
            className="button"
            disabled={sending}
          >
            Назад
          </button>
          <button
            onClick={() => handleSend()}
            className="buttongreen"
            disabled={sending}
          >
            Создать открытку
          </button>
        </div>
      )}

      {orderI && (
        <div className="center">
          <div className={s.flex}>
            <Link
              className="buttongreen"
              target="_blank"
              href={`https://t.me/muzOkkk?text=Мой заказ #${result}`}
            >
              Получить в <BsTelegram size={24} color="#fff" />
            </Link>
            <Link
              className="buttongreen"
              target="_blank"
              href={`https://wa.me/79151353547?text=${encodeURIComponent(
                `Мой заказ #${result}`,
              )}`}
            >
              Получить в <IoLogoWhatsapp size={24} color="#fff" />
            </Link>
          </div>
          <button
            onClick={() => setStep(4)}
            className="button"
            disabled={sending}
          >
            Назад
          </button>
        </div>
      )}
    </div>
  );
}
