import React, { useState, useEffect } from "react";
import axios from "axios";
import s from "../MultiStepEditor.module.scss";

const PROMO_STORAGE_KEY = "appliedPromoCode";

export default function PromoStep({ onPromoResult, template }) {
  const [promoCode, setPromoCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(300);
  const [promoApplied, setPromoApplied] = useState(false);
  const [showPromoInput, setShowPromoInput] = useState(false);

  useEffect(() => {
    const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
    if (savedPromo) {
      setPromoCode(savedPromo);
      setPromoApplied(true);
      verifyAndSetPrice(savedPromo);
    }
  }, []);

  const transformPromoCode = (code) => {
    return code.toUpperCase() === "DT100"
      ? code[1] + code[0] + code.slice(2)
      : code;
  };

  const verifyAndSetPrice = async (code) => {
    try {
      const transformedCode = transformPromoCode(code.trim());
      const res = await axios.get(
        `https://api-workhub.site/api/v1/base/promo-code/by-code`,
        {
          params: {
            code: transformedCode,
            template_id: template.id,
          },
        }
      );

      const data = res.data.data;
      if (data?.is_active) {
        setPrice(data.price || 0);
      } else {
        // Если промокод неактивен, удаляем из localStorage
        localStorage.removeItem(PROMO_STORAGE_KEY);
        setPromoApplied(false);
        setPromoCode("");
      }
    } catch (e) {
      // Если ошибка при проверке, удаляем из localStorage
      localStorage.removeItem(PROMO_STORAGE_KEY);
      setPromoApplied(false);
      setPromoCode("");
    }
  };

  const handleApply = async () => {
    if (!promoCode.trim()) {
      setError("Введите промокод");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const transformedCode = transformPromoCode(promoCode.trim());
      const res = await axios.get(
        `https://api-workhub.site/api/v1/base/promo-code/by-code`,
        {
          params: {
            code: transformedCode,
            template_id: template.id,
          },
        }
      );

      const data = res.data.data;
      if (data?.is_active) {
        setPrice(data.price || 0);
        setPromoApplied(true);
        // Сохраняем промокод в localStorage
        localStorage.setItem(PROMO_STORAGE_KEY, promoCode.trim());
      } else {
        setError("Промокод неактивен");
      }
    } catch (e) {
      setError("Ошибка проверки промокода");
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    const transformedCode = promoApplied
      ? transformPromoCode(promoCode.trim())
      : null;
    onPromoResult(transformedCode);
  };

  const handleSkip = () => {
    // Очищаем localStorage если пропускаем промокод
    localStorage.removeItem(PROMO_STORAGE_KEY);
    onPromoResult(null);
  };

  return (
    <div className={s.promoPage}>
      <h2 className={s.h2}>
        {price === 0 ? (
          "Услуга бесплатная"
        ) : (
          <>
            Услуга платная: <br />
            <p className={s.pricepromo}>{price}₽</p>
            <p className={s.pricefact}>оплата по факту готовности</p>
          </>
        )}
      </h2>

      {!showPromoInput ? (
        <>
          <button className="button" onClick={handleContinue}>
            Продолжить
          </button>
          <button className="button" onClick={() => setShowPromoInput(true)}>
            Есть промокод
          </button>
        </>
      ) : (
        <div className={s.promoInput}>
          <input
            type="text"
            placeholder="Введите промокод"
            value={promoCode}
            onChange={(e) => {
              setPromoCode(e.target.value);
              setError("");
            }}
            className={s.input}
            disabled={promoApplied || loading}
          />
          {error && <p className={s.error}>{error}</p>}

          <div className={s.flex} style={{ marginTop: 10 }}>
            <button
              className="button"
              onClick={promoApplied ? handleContinue : handleApply}
              disabled={loading}
            >
              {loading
                ? "Проверка..."
                : promoApplied
                ? "Продолжить"
                : "Применить"}
            </button>

            {!promoApplied && (
              <button
                className="button"
                onClick={handleSkip}
                disabled={loading}
                style={{ marginLeft: 8 }}
              >
                Пропустить
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
