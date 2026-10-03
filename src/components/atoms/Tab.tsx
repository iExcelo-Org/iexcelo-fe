"use client";

import { cn } from "@/lib/utils";
import {
  ButtonHTMLAttributes,
  FC,
  HTMLAttributes,
  MutableRefObject,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";

type IBtnProps = {
  onClick: () => void;
  ref: MutableRefObject<HTMLButtonElement | null> | null;
};

interface ITabProps {
  tabs: (
    | string
    | ((active: boolean, key: string, btnProps: IBtnProps) => ReactNode)
  )[];
  tabChildren: ReactNode[];
  contentProps?: HTMLAttributes<HTMLDivElement>;
  buttonProps?: ButtonHTMLAttributes<HTMLButtonElement>;
  buttonContainerProps?: HTMLAttributes<HTMLDivElement>;
  activeLineProps?: HTMLAttributes<HTMLDivElement>;
  shouldAnimate?: boolean;
}

const Tab: FC<ITabProps> = ({
  tabs,
  tabChildren,
  contentProps,
  buttonProps,
  buttonContainerProps,
  activeLineProps,
  shouldAnimate,
}) => {
  const [activeNumber, setActiveNumber] = useState(0);
  const activeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [activeLineStyle, setActiveLineStyle] = useState<{
    left: string;
    width: string;
  }>({ left: "0px", width: "0px" });

  useEffect(() => {
    if (activeButtonRef.current) {
      const { offsetLeft, offsetWidth } = activeButtonRef.current;
      setActiveLineStyle({
        left: `${offsetLeft}px`,
        width: `${offsetWidth}px`,
      });
    }
  }, [activeNumber]);

  return (
    <section className="min-h-fit w-full">
      <div
        {...buttonContainerProps}
        className={cn(
          `relative flex items-center border-b border-[#E4E7EC] `,
          buttonContainerProps?.className
            ? buttonContainerProps?.className
            : "",
        )}
      >
        {tabs?.map((tab, index) =>
          typeof tab === "string" ? (
            <button
              key={`tab__button__${index}`}
              ref={index === activeNumber ? activeButtonRef : null}
              onClick={() => setActiveNumber(index)}
              {...buttonProps}
              className={`p-[.5rem_1rem_.375rem_1rem] text-[1rem] font-[500] ${index === activeNumber ? "text-[#007FFF]" : "text-[#667185]"} leading-6 transition-all duration-[.4s] ${buttonProps?.className || ""}`}
            >
              {tab}
            </button>
          ) : (
            tab?.(index === activeNumber, `tab__button__${index}`, {
              onClick: () => setActiveNumber(index),
              ref: index === activeNumber ? activeButtonRef : null,
            })
          ),
        )}
        <div
          {...activeLineProps}
          className={`absolute bottom-0 h-[1px] translate-y-[100%] bg-[#007FFF] transition-all duration-[.4s] ${activeLineProps?.className || ""}`}
          style={activeLineStyle}
        ></div>
      </div>
      {tabChildren?.length &&
        tabChildren?.map((tabChild, index) => (
          <div
            key={`tab__content__${index}`}
            {...contentProps}
            className={`${activeNumber === index ? `${shouldAnimate ? "move-in" : ""} block` : "hidden"} ${contentProps?.className}`}
          >
            {tabChild}
          </div>
        ))}
    </section>
  );
};

export { Tab };
