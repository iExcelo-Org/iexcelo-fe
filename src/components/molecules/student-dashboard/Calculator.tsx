"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { safeEval } from "@/utils";

const CALC_OPERATORS = ["+", "-", "*", "/"];

const calcButtonDefs = [
  { symbol: "%", className: "col-span-1 text-[#090909] bg-[#A0A0A0]" },
  { symbol: "AC", className: "col-span-1 text-[#090909] bg-[#A0A0A0]" },
  { symbol: "+/-", className: "col-span-1 text-[#090909] bg-[#A0A0A0]" },
  { symbol: "/", className: "col-span-1 text-white bg-[#F69906]" },
  { symbol: "-", className: "col-span-1 text-white bg-[#F69906]" },
  { symbol: "+", className: "col-span-1 text-white bg-[#F69906]" },
  { symbol: "CE", className: "col-span-1 text-white bg-[#F69906]" },
  { symbol: "4", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "5", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "6", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "7", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "8", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "9", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "*", className: "col-span-1 text-white bg-[#F69906]" },
  { symbol: "1", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "2", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "3", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: "0", className: "col-span-1 text-white bg-[#313131]" },
  { symbol: ".", className: "col-span-1 text-white bg-[#313131]" },
  {
    symbol: "=",
    className:
      "col-span-2 w-full rounded-[1.25rem] text-white aspect-[unset] bg-[#313131]",
  },
];

function CalcExpression({ expr }: { expr: string }) {
  if (!expr) return <span className="text-[#818181]">0</span>;
  const parts = expr.split(/([+\-*/])/);
  return (
    <>
      {parts.map((part, i) =>
        CALC_OPERATORS.includes(part) ? (
          <span key={i} className="text-[#109DFF]">
            {part}
          </span>
        ) : (
          <span key={i} className="text-[#818181]">
            {part}
          </span>
        ),
      )}
    </>
  );
}

export function Calculator() {
  const [showCalculator, setShowCalculator] = useState(true);
  const [calcExpr, setCalcExpr] = useState("");
  const [calcDisplay, setCalcDisplay] = useState("0");
  const [calcJustEvaluated, setCalcJustEvaluated] = useState(false);

  const handleInput = (symbol: string) => {
    if (symbol === "AC") {
      setCalcExpr("");
      setCalcDisplay("0");
      setCalcJustEvaluated(false);
      return;
    }

    if (symbol === "CE") {
      const newExpr = calcExpr.slice(0, -1);
      setCalcExpr(newExpr);
      setCalcJustEvaluated(false);
      const result = safeEval(newExpr);
      setCalcDisplay(
        result !== null ? String(parseFloat(result.toPrecision(10))) : "0",
      );
      return;
    }

    if (symbol === "=") {
      const result = safeEval(calcExpr);
      if (result !== null) {
        const str = String(parseFloat(result.toPrecision(10)));
        setCalcDisplay(str);
        setCalcExpr(str);
        setCalcJustEvaluated(true);
      } else {
        setCalcDisplay("Error");
        setCalcExpr("");
        setCalcJustEvaluated(false);
      }
      return;
    }

    if (symbol === "%") {
      const result = safeEval(calcExpr);
      if (result !== null) {
        const str = String(parseFloat((result / 100).toPrecision(10)));
        setCalcDisplay(str);
        setCalcExpr(str);
        setCalcJustEvaluated(true);
      }
      return;
    }

    if (symbol === "+/-") {
      const result = safeEval(calcExpr);
      if (result !== null) {
        const str = String(parseFloat((-result).toPrecision(10)));
        setCalcExpr(str);
        setCalcDisplay(str);
        setCalcJustEvaluated(false);
      }
      return;
    }

    const isOp = CALC_OPERATORS.includes(symbol);
    let newExpr: string;

    if (symbol === ".") {
      const lastNum = calcExpr.split(/[+\-*/]/).pop() ?? "";
      if (lastNum.includes(".")) return;
      newExpr = calcExpr ? calcExpr + "." : "0.";
      setCalcJustEvaluated(false);
    } else if (isOp) {
      if (!calcExpr) return;
      if (CALC_OPERATORS.includes(calcExpr.slice(-1))) {
        newExpr = calcExpr.slice(0, -1) + symbol;
      } else {
        newExpr = calcExpr + symbol;
      }
      setCalcJustEvaluated(false);
    } else {
      newExpr = calcJustEvaluated ? symbol : calcExpr + symbol;
      setCalcJustEvaluated(false);
    }

    setCalcExpr(newExpr);
    if (!isOp && symbol !== ".") {
      const result = safeEval(newExpr);
      if (result !== null)
        setCalcDisplay(String(parseFloat(result.toPrecision(10))));
    }
  };

  return (
    <div className="mt-8">
      <button
        onClick={() => setShowCalculator((prev) => !prev)}
        className="hidden lg:block text-[#E32E89] text-[1rem] leading-6 font-[600] underline"
      >
        {showCalculator ? "Hide Calculator" : "Use Calculator"}
      </button>

      {showCalculator && (
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="mt-3 p-[2.5rem_1.125rem] rounded-[2rem]"
        >
          <div className="flex flex-col items-end mb-8">
            <span className="text-[1.5rem] leading-8 font-[500] tracking-[-.48px] max-w-full text-right break-all">
              <CalcExpression expr={calcExpr} />
            </span>
            <span className="text-black tracking-[-.72px] leading-11 font-[600] text-[2.25rem]">
              {calcDisplay}
            </span>
          </div>

          <div className="grid gap-[1.25rem_.25rem] grid-cols-7">
            {calcButtonDefs.map((item, index) => (
              <button
                key={`calc__${index}`}
                onClick={() => handleInput(item.symbol)}
                className={cn(
                  "aspect-square font-[500] flex justify-center items-center rounded-[50%]",
                  item.className,
                )}
              >
                {item.symbol}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
