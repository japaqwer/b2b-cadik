import { useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

const STEP_MAP = {
  SplashStep: 0,
  EditStep: 1,
  PreviewStep: 2,
};

const STEP_NAMES = Object.entries(STEP_MAP).reduce(
  (acc, [name, idx]) => ({ ...acc, [idx]: name }),
  {}
);

export function useStepNavigation() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const stepParam = searchParams.get("step") || "";
  const [step, _setStep] = useState(() => STEP_MAP[stepParam] ?? 0);

  const setStep = useCallback(
    (newStep) => {
      _setStep(newStep);
      const name = STEP_NAMES[newStep] || "SplashStep";
      router.replace(`?step=${encodeURIComponent(name)}`, { scroll: false });
    },
    [router]
  );

  return { step, setStep };
}
