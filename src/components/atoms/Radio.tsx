"use client";

import { useState, useEffect, forwardRef, ReactNode } from "react";

interface RadioProps {
  label?: string;
  customLabel?: ReactNode;
  value?: boolean;
  name: string;
  onChange?: (selected: boolean) => void;
  /** When provided, overrides the blue default colours:
   *  - "correct"   → green border + green dot (always filled)
   *  - "incorrect" → red border   + red dot   (always filled)
   */
  state?: "correct" | "incorrect";
}

const Radio = forwardRef<HTMLLabelElement, RadioProps>(
  ({ label, customLabel, value, name, onChange, state }, ref) => {
    const [internalChecked, setInternalChecked] = useState(false);

    const isControlled = value !== undefined;

    const handleSelect = () => {
      if (!isControlled) {
        setInternalChecked(true);
      }
      onChange?.(true);
    };

    useEffect(() => {
      if (isControlled) {
        setInternalChecked(value);
      }
    }, [value, isControlled]);

    const isChecked = isControlled ? value : internalChecked;

    // When a result state is set, always show the dot (answer was submitted)
    const showDot = state === "correct" || state === "incorrect" || isChecked;

    const borderColor =
      state === "correct"
        ? "border-green-500"
        : state === "incorrect"
          ? "border-red-500"
          : isChecked
            ? "border-[#007FFF]"
            : "border-[#D6D6D6]";

    const dotColor =
      state === "correct"
        ? "bg-green-500"
        : state === "incorrect"
          ? "bg-red-500"
          : "bg-[#39F]";

    return (
      <label ref={ref} className="relative flex w-fit cursor-pointer items-center">
        {/* Hidden Radio */}
        <input
          type="radio"
          name={name}
          checked={isChecked}
          onChange={handleSelect}
          className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none"
        />
        {/* Styled Radio */}
        <div
          className={`flex h-[1.25rem] w-[1.25rem] sm:h-[1.5rem] sm:w-[1.5rem] items-center justify-center rounded-full border-[1.5px] bg-white transition-colors duration-[.4s] ${borderColor}`}
        >
          {showDot && (
            <span
              className={`aspect-square h-[.5rem] w-[.5rem] sm:h-[.625rem] sm:w-[.625rem] rounded-[50%] ${dotColor}`}
            />
          )}
        </div>
        {/* Label */}
        {customLabel ? (
          customLabel
        ) : label ? (
          <span className="ml-2 text-[0.875rem] font-[400] text-black">
            {label}
          </span>
        ) : null}
      </label>
    );
  },
);

Radio.displayName = "Radio";

export { Radio };
