/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store";

interface ExamTypeOption {
  id: string;
  name: string;
}

interface CurrencyOption {
  code: string;
  name: string;
}

interface ProfileDropdownProps {
  name: string;
  email: string;
  initials: string;
  picture?: string | null;
  examTypes?: ExamTypeOption[];
  activeExamTypeId?: string | null;
  onExamTypeChange?: (examTypeId: string) => void;
  currencies?: CurrencyOption[];
  activeCurrency?: string | null;
  onCurrencyChange?: (currency: string) => void;
}

export function ProfileDropdown({
  name,
  email,
  initials,
  picture,
  examTypes,
  activeExamTypeId,
  onExamTypeChange,
  currencies,
  activeCurrency,
  onCurrencyChange,
}: ProfileDropdownProps) {
  const router = useRouter();
  const { logout, user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);

  const settingsBase =
    user?.role === "sponsor"
      ? "/sponsor/settings"
      : user?.role === "affiliate"
        ? "/affiliates/settings"
        : "/student/settings";
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    router.push("/login");
  };

  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        {picture ? (
          <img src={picture} alt={name} className="w-full h-full object-cover" />
        ) : (
          initials
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-12 w-64 bg-white rounded-xl shadow-lg border border-gray-100 py-3 z-50">
          <div className="px-4 pb-3 border-b border-gray-100">
            <p className="font-semibold text-gray-900">{name}</p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>

          {examTypes && !!examTypes.length && (
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Exam Type</p>
              <div className="flex flex-wrap gap-2">
                {examTypes.map((examType) => (
                  <button
                    key={examType.id}
                    disabled={activeExamTypeId === examType.id}
                    onClick={() => {
                      onExamTypeChange?.(examType.id);
                      setIsOpen(false);
                    }}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      activeExamTypeId === examType.id
                        ? "bg-[#A12161] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {examType.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {currencies && !!currencies.length && (
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-xs text-gray-500 mb-2">Currency</p>
              <div className="flex flex-wrap gap-2">
                {currencies.map((currency) => (
                  <button
                    key={currency.code}
                    disabled={activeCurrency === currency.code}
                    onClick={() => {
                      onCurrencyChange?.(currency.code);
                      setIsOpen(false);
                    }}
                    className={`text-xs px-3 py-1 rounded-full transition-colors ${
                      activeCurrency === currency.code
                        ? "bg-[#3399FF] text-white"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {currency.code}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="py-2">
            <Link
              href={`${settingsBase}/account`}
              className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors"
              onClick={() => setIsOpen(false)}
            >
              <Icon icon="hugeicons:settings-02" className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </Link>
          </div>

          <div className="border-t border-gray-100 pt-2">
            <button
              className="flex items-center gap-3 px-4 py-2 w-full text-left text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              <Icon
                icon={
                  isLoggingOut
                    ? "svg-spinners:ring-resize"
                    : "hugeicons:logout-02"
                }
                className="w-5 h-5"
              />
              <span className="text-sm">Log out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
