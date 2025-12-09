"use client";
import React, { useState, useEffect } from "react";
import { useStepNavigation } from "./hooks/useStepNavigation";
import { useImageUpload } from "./hooks/useImageUpload";
import { useOrderCreation } from "./hooks/useOrderCreation";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useImageManager } from "./hooks/useImageManager";
import { SplashEditor } from "./SplashEditor";
import EditStep from "./step/EditStep";
import PreviewStep from "./step/PreviewStep";

const PROMO_STORAGE_KEY = "appliedPromoCode";

export default function MultiStepEditorGenery({ template }) {
  const { step, setStep } = useStepNavigation();
  const { uploadImage, uploading } = useImageUpload();
  const { createOrder, sending, result } = useOrderCreation();
  const { sensors, handleDragEnd } = useDragAndDrop();
  const {
    edited,
    setEdited,
    currentFile,
    setCurrentFile,
    addImage,
    removeImage,
  } = useImageManager();

  const [introSrc, setIntroSrc] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [appliedPromo, setAppliedPromo] = useState(null);
  const [cyclic, setCyclic] = useState(false);

  useEffect(() => {
    const savedPromo = localStorage.getItem(PROMO_STORAGE_KEY);
    if (savedPromo) {
      setAppliedPromo(savedPromo);
    }
  }, []);

  const hasIntro = Boolean(
    template?.intro &&
      typeof template.intro === "string" &&
      template.intro.trim()
  );

  const onCreate = async (src) => {
    const imageData = await uploadImage(src);
    addImage(imageData);
    setCurrentFile(null);
    setStep(2);
  };

  const handleSend = async () => {
    const currentPromo = localStorage.getItem(PROMO_STORAGE_KEY);

    await createOrder({
      template,
      cyclic,
      appliedPromo: currentPromo || appliedPromo,
      introSrc,
      edited,
    });
  };

  // Шаг 0: SplashEditor (если есть intro)
  if (step === 0 && hasIntro) {
    return (
      <SplashEditor
        template={template}
        onCreate={(src) => {
          setIntroSrc(src);
          setStep(1);
        }}
      />
    );
  }

  // Шаг 1: EditStep
  if (step === 1) {
    return (
      <EditStep
        template={template}
        currentFile={currentFile}
        onCreate={onCreate}
        uploading={uploading}
      />
    );
  }

  // Шаг 2: PreviewStep
  if (step === 2) {
    return (
      <PreviewStep
        sensors={sensors}
        handleDragEnd={handleDragEnd(edited, setEdited)}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        removeImage={removeImage}
        setCurrentFile={setCurrentFile}
        setStep={setStep}
        cyclic={cyclic}
        handleSend={handleSend}
        setCyclic={setCyclic}
        result={result}
        sending={sending}
      />
    );
  }

  return null;
}
