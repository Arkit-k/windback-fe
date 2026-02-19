"use client";

import { useEffect } from "react";
import { useRive, useStateMachineInput, Layout, Fit, Alignment } from "@rive-app/react-canvas";

interface RiveLoginCharacterProps {
  emailInputRef?: React.RefObject<HTMLInputElement | null>;
  isPasswordFocused?: boolean;
  triggerSuccess?: boolean;
  triggerFail?: boolean;
  className?: string;
}

const STATE_MACHINE = "Login Machine";

export function RiveLoginCharacter({
  emailInputRef,
  isPasswordFocused = false,
  triggerSuccess = false,
  triggerFail = false,
  className,
}: RiveLoginCharacterProps) {
  const { rive, RiveComponent } = useRive({
    src: "/rive/login-character.riv",
    stateMachines: STATE_MACHINE,
    autoplay: true,
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });

  const isChecking = useStateMachineInput(rive, STATE_MACHINE, "isChecking");
  const isHandsUp = useStateMachineInput(rive, STATE_MACHINE, "isHandsUp");
  const numLook = useStateMachineInput(rive, STATE_MACHINE, "numLook");
  const trigSuccess = useStateMachineInput(rive, STATE_MACHINE, "trigSuccess");
  const trigFail = useStateMachineInput(rive, STATE_MACHINE, "trigFail");

  // Track email input cursor for eye movement
  useEffect(() => {
    if (!emailInputRef?.current || !numLook || !isChecking) return;

    const input = emailInputRef.current;

    const handleFocus = () => {
      isChecking.value = true;
    };

    const handleBlur = () => {
      if (!isPasswordFocused) {
        isChecking.value = false;
      }
    };

    const handleInput = () => {
      const len = input.value.length;
      const maxLen = 40;
      numLook.value = Math.min((len / maxLen) * 100, 100);
    };

    input.addEventListener("focus", handleFocus);
    input.addEventListener("blur", handleBlur);
    input.addEventListener("input", handleInput);

    return () => {
      input.removeEventListener("focus", handleFocus);
      input.removeEventListener("blur", handleBlur);
      input.removeEventListener("input", handleInput);
    };
  }, [emailInputRef, numLook, isChecking, isPasswordFocused]);

  // Cover eyes when password is focused
  useEffect(() => {
    if (isHandsUp) {
      isHandsUp.value = isPasswordFocused;
    }
    if (isChecking && isPasswordFocused) {
      isChecking.value = false;
    }
  }, [isPasswordFocused, isHandsUp, isChecking]);

  // Trigger success
  useEffect(() => {
    if (triggerSuccess && trigSuccess) {
      trigSuccess.fire();
    }
  }, [triggerSuccess, trigSuccess]);

  // Trigger fail
  useEffect(() => {
    if (triggerFail && trigFail) {
      trigFail.fire();
    }
  }, [triggerFail, trigFail]);

  return (
    <div
      className={`pointer-events-none select-none ${className ?? ""}`}
      style={{
        background: "transparent",
        borderRadius: "50%",
        overflow: "hidden",
      }}
    >
      <RiveComponent
        style={{ background: "transparent" }}
      />
    </div>
  );
}
