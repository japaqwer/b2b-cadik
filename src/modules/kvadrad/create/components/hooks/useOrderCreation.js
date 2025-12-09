import { useState, useCallback } from "react";
import axios from "axios";

export function useOrderCreation() {
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const createOrder = useCallback(
    async ({ template, cyclic, appliedPromo, introSrc, edited }) => {
      setSending(true);
      setError(null);

      try {
        let finalIntro = "";
        try {
          const storedIntro = localStorage.getItem("uploadedIntro");
          if (storedIntro) {
            const introUrl = JSON.parse(storedIntro);
            finalIntro = Array.isArray(introUrl)
              ? introUrl[0]?.trim() || ""
              : typeof introUrl === "string"
              ? introUrl.trim()
              : "";
          }
        } catch (e) {
          console.error("Error parsing uploadedIntro:", e);
        }

        if (!finalIntro && introSrc) {
          finalIntro =
            typeof introSrc === "string" ? introSrc.trim() : introSrc;
        }

        // Берем ТОЛЬКО то, что есть в localStorage
        let storedBackgrounds = [];
        try {
          storedBackgrounds = JSON.parse(
            localStorage.getItem("uploadedBackgrounds") || "[]"
          );
        } catch (e) {
          console.error("Error parsing uploadedBackgrounds:", e);
        }

        // Очищаем от пустых строк и дублей
        const allBackgrounds = Array.from(
          new Set(
            storedBackgrounds
              .map((url) => (typeof url === "string" ? url.trim() : ""))
              .filter((url) => url.length > 0)
          )
        );

        const requestData = {
          backgrounds: allBackgrounds.length > 0 ? allBackgrounds : [""],
          intro: finalIntro || "",
        };

        const params = { template_id: template.id, cyclic, referral: "b2b" };
        if (appliedPromo) params.promo_code = appliedPromo;

        const res = await axios.post(
          "https://api-workhub.site/api/v1/base/order/create-generate",
          requestData,
          { params, headers: { "Content-Type": "application/json" } }
        );

        const data = res.data.data;
        setResult(data);
        return data;
      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message;
        setError(errorMessage);
        console.error("Send error:", err.response?.data || err.message);
        throw err;
      } finally {
        setSending(false);
      }
    },
    []
  );

  return { createOrder, sending, result, error };
}
