"use client";

import { AOSInit } from "./AOSInit";
import { Toaster } from "sonner";

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <AOSInit />
      {children}
      <Toaster
        toastOptions={{
          classNames: {
            toast:
              "bg-white! border-[#007FFF]/30! shadow-lg! text-xs! md:text-sm! text-black! backdrop-blur-md!",
            description: "text-[#6B7280]!",
            actionButton: "bg-[#007FFF]! text-white!",
            cancelButton: "bg-gray-100! text-gray-600!",
            closeButton: "bg-white! border-[#007FFF]/20! text-[#007FFF]!",
            success: "border-l-4! border-l-green-500!",
            error: "border-l-4! border-l-red-500!",
            warning: "border-l-4! border-l-yellow-500!",
            info: "border-l-4! border-l-[#007FFF]!",
          },
          className: "md:max-w-[450px]! min-w-fit! whitespace-nowrap!",
        }}
        position="bottom-right"
        duration={6000}
      />
    </>
  );
}
