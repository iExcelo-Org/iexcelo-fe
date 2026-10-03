"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";

interface SwitchProps {
  label?: string;
  labelPosition?: "left" | "right";
  labelClass?: string | null;
  customLabel?: React.ReactNode;
  initialChecked?: boolean;
  value?: boolean;
  onChange?: (checked: boolean) => void;
}

const Switch: React.FC<SwitchProps> = ({
  label,
  labelPosition = "left",
  labelClass = null,
  customLabel,
  initialChecked = false,
  value,
  onChange,
}) => {
  const [isChecked, setIsChecked] = useState<boolean>(value ?? initialChecked);
  const isFirstRender = useRef<boolean>(true); // Track first render to avoid initial onChange emission

  const handleToggle = () => {
    const newChecked = !isChecked;
    if (value !== undefined) onChange?.(!value);
    // if value is provided, it means the parent intends to control the component themselves, so we expect a change from value, instead of doing it ourselves
    else setIsChecked(newChecked);
  };

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;

      return;
    }

    // Emit onChange only when isChecked changes after initial render
    onChange?.(isChecked);
  }, [isChecked]);

  // If value is controlled, update the state when the value prop changes
  useEffect(() => {
    if (value !== undefined && value !== isChecked) {
      setIsChecked(value);
    }
  }, [value]);

  return (
    <div className="flex h-fit items-center">
      {!!customLabel
        ? customLabel
        : !!label && (
            <label
              className={`mr-2 text-[1rem] font-normal ${
                labelPosition === "left" ? "block" : "hidden"
              } text-[#000]`}
            >
              {label}
            </label>
          )}
      <div className="relative h-fit w-fit cursor-pointer">
        <input
          type="checkbox"
          className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
          checked={isChecked}
          onChange={handleToggle}
        />
        <div
          className={`relative h-[1.5rem] w-[3.125rem] overflow-hidden rounded-[1rem] transition duration-200 ease-in-out ${
            isChecked ? "bg-[#007FFF]" : "bg-[#E4E7EC]"
          }`}
          onClick={handleToggle}
        >
          <span
            className={`absolute left-[0.125rem] top-[0.125rem] h-[1.25rem] w-[1.25rem] transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
              isChecked ? "translate-x-[-150%]" : "translate-x-0 delay-150"
            }`}
          />
          <span
            className={`absolute right-[0.125rem] top-[0.125rem] h-[1.25rem] w-[1.25rem] transform rounded-full bg-white transition-transform duration-200 ease-in-out ${
              !isChecked ? "translate-x-[150%]" : "translate-x-0 delay-150"
            }`}
          />
        </div>
      </div>
      {!!customLabel
        ? customLabel
        : !!label && (
            <label
              className={
                labelClass ??
                `ml-2 text-[1rem] font-normal ${
                  labelPosition !== "left" ? "block" : "hidden"
                } text-[#000]`
              }
            >
              {label}
            </label>
          )}
    </div>
  );
};

export { Switch };
