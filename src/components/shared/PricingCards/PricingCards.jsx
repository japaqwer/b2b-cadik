"use client";
import React from "react";
import s from "./Pricingcards.module.scss";
import Link from "next/link";
import { BsPlayFill } from "react-icons/bs";

const pricingPlans = [
  {
    id: 1,
    name: "СТАНДАРТ",
    price: "300₽",
    title: "",
    duration: "Продолжительность 1 минута 16 секунд",
    image:
      "https://s3.eu-north-1.amazonaws.com/exclusivenedbucket/a47b466b-8bd1-459a-9df3-6fd1ef85b0b8.png",
    demoUrl: "https://kinescope.io/embed/23QBdNEg7huhR6h7tGkrL2",
    href: "/kvadrat/323248d0-5136-41f2-bf64-c2c32446a59a",
  },
  {
    id: 2,
    name: "СТАНДАРТ ПЛЮС",
    price: "600₽",
    title: "",
    duration: "Продолжительность 2:20 минуты",
    image:
      "https://s3.eu-north-1.amazonaws.com/exclusivenedbucket/502b48de-e500-438e-8ee7-35afbfe8a434.png",
    demoUrl: "https://kinescope.io/embed/vN9xb1wUGnGk75D83nj5Tj",
    // featured: true,
    href: "/detail/f5c43f0d-47b8-4222-afaf-b63bb94895df",
  },
  {
    id: 3,
    name: "ПРЕМИУМ от",
    price: "1500₽",
    title: "",
    duration: "Продолжительность индивидуально",
    image:
      "https://s3.eu-north-1.amazonaws.com/exclusivenedbucket/5fd2e1c8-4dca-4c11-b379-2f2a3cf33155.jpg",
    demoUrl: "https://kinescope.io/embed/7vgMJydBP6KF7voc7iJPiA",
    // featured: true,
    href: "https://t.me/multfamilyoficial",
  },
];

export default function PricingCards() {
  const [selectedCard, setSelectedCard] = React.useState(null);

  const handleCardClick = (card) => {
    setSelectedCard(card);
  };

  const handleClear = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("uploadedBackgrounds");
      localStorage.removeItem("uploadedIntro");
      localStorage.removeItem("appliedPromoCode");
    }
  };
  const handleCloseModal = () => {
    setSelectedCard(null);
  };

  const getAutoplayVideoUrl = (demoUrl) => {
    if (!demoUrl) return "";
    if (demoUrl.includes("?")) {
      return `${demoUrl}&autoplay=1&muted=0`;
    }
    return `${demoUrl}?autoplay=1&muted=0`;
  };

  React.useEffect(() => {
    if (selectedCard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedCard]);

  React.useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && selectedCard) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [selectedCard]);

  return (
    <div className={s.container}>
      <div className={s.grid}>
        {pricingPlans.map((plan) => (
          <div
            key={plan.id}
            className={`${s.card} ${plan.featured ? s.featured : ""}`}
          >
            <div className={s.cardImage} onClick={() => handleCardClick(plan)}>
              <img src={plan.image} alt={plan.name} />
              <button className={s.playButton} title="Смотреть демо">
                <BsPlayFill size={32} />
              </button>
            </div>

            <div className={s.cardContent}>
              <h3 className={s.planName}>
                {plan.name} <span className={s.price}>{plan.price}</span>
              </h3>
              <p className={s.planTitle}>{plan.title}</p>
              {plan.duration && (
                <p className={s.planDuration}>{plan.duration}</p>
              )}
              <Link
                href={plan.href}
                onClick={handleClear}
                className={s.createButton}
              >
                Создать поздравление
              </Link>
            </div>
          </div>
        ))}
      </div>

      {selectedCard && (
        <div className={s.modal} onClick={handleCloseModal}>
          <div className={s.modalContent} onClick={(e) => e.stopPropagation()}>
            <button className={s.closeButton} onClick={handleCloseModal}>
              ✕
            </button>

            <div className={s.videoContainer}>
              <iframe
                key={selectedCard.id}
                src={getAutoplayVideoUrl(selectedCard.demoUrl)}
                frameBorder="0"
                allowFullScreen
                allow="autoplay; encrypted-media; fullscreen"
                className={s.videoFrame}
                title={selectedCard.name}
                loading="eager"
              />
            </div>

            <div className={s.modalFooter}>
              <h2>Демонстрация шаблона</h2>
              <Link href={selectedCard.href} onClick={handleClear}>
                <button className={s.modalCreateButton}>
                  Создать поздравление
                </button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
