"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Button, SVGClient } from "../atoms";
import { Icon } from "@iconify/react";
import { usePathname, useRouter } from "next/navigation";

const FEATURES = [
  {
    icon: "hugeicons:notebook-01",
    link: "/revisions",
    title: "Exam Revisions",
    description:
      "Thousands of top-tier questions and instant feedback to help you excel in every subject.",
  },
  {
    icon: "hugeicons:healtcare",
    link: "/giveback",
    title: "Give Backs",
    description:
      "Support other students by sponsoring access to quality education and helping more people excel.",
  },
  {
    icon: "hugeicons:affiliate",
    link: "/affiliate",
    title: "Affiliates",
    description:
      "Share iExcelo with friends, schools, or students and get rewarded for every successful referral.",
  },
];

const NAV_LINKS = [
  { title: "About Us", href: "/about" },
  { title: "FAQs", href: "/faqs" },
  { title: "Contact Us", href: "/contact" },
];

const LandingHeader = () => {
  const [isFeaturesOpen, setIsFeaturesOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileFeaturesOpen, setIsMobileFeaturesOpen] = useState(false);

  // Refs for click outside detection
  const featuresDropdownRef = useRef<HTMLLIElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

  const pathname = usePathname();
  const { push } = useRouter();

  // Click outside handler for features dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        featuresDropdownRef.current &&
        !featuresDropdownRef.current.contains(event.target as Node)
      ) {
        setIsFeaturesOpen(false);
      }
    };

    if (isFeaturesOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isFeaturesOpen]);

  // Click outside handler for mobile menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node)
      ) {
        setIsMobileMenuOpen(false);
        setIsMobileFeaturesOpen(false);
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="fixed z-[4] w-full top-[3.25rem] lg:top-[3.25rem] px-[1rem] md:px-[2rem] lg:px-0 md:top-[1.5rem] sm:top-[1rem]">
      <div className="flex backdrop-blur-[40px] mx-auto justify-between items-center max-w-[870px] w-[100%] p-[.625rem] bg-[#00356B] rounded-[6.25rem]">
        <Link href={"/"}>
          <SVGClient src="/svg/logo.svg" />
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden lg:flex items-center text-white gap-[3.25rem]">
          <nav>
            <ul className="flex gap-[1.5rem] items-center">
              <li className="relative" ref={featuresDropdownRef}>
                <button
                  className="font-[600] text-[1rem] cursor-pointer leading-[1.5rem] flex items-center gap-[0.5rem]"
                  onClick={() => setIsFeaturesOpen(!isFeaturesOpen)}
                  onMouseEnter={() => setIsFeaturesOpen(true)}
                >
                  Features
                  <SVGClient
                    className={`${
                      isFeaturesOpen ? "rotate-[180deg]" : "rotate-0"
                    } transition-all duration=[.4s]`}
                    src="/svg/caretdown.svg"
                  />
                </button>

                {isFeaturesOpen && (
                  <div
                    style={{
                      backgroundColor: "rgba(230, 242, 255, 0.90)",
                    }}
                    className="absolute top-[3.1rem] left-1/2 -translate-x-1/2 w-[21rem] rounded-[.75rem] p-[.75rem] border border-[#E6F2FF]"
                    onMouseLeave={() => setIsFeaturesOpen(false)}
                  >
                    <div className="flex flex-col gap-[.25rem]">
                      {FEATURES.map((feature, index) => (
                        <Link
                          key={index}
                          href={feature?.link}
                          className={`flex gap-[1rem] p-[.75rem] items-start hover:bg-[#ffffff] ${
                            pathname === feature?.link ? "bg-[#ffffff]" : ""
                          } rounded-[0.75rem] transition-colors duration-[.4s]`}
                        >
                          <div>
                            <Icon
                              icon={feature?.icon}
                              color="#007FFF"
                              height={"1.5rem"}
                              width={"1.5rem"}
                            />
                          </div>
                          <div className="flex gap-[.25rem] flex-col">
                            <h4 className="text-[#2B2B2B] leading-[1.5rem] font-[600] text-[1rem]">
                              {feature.title}
                            </h4>
                            <p className="text-[#575757] text-[0.875rem] font-[400] leading-[1.25rem]">
                              {feature.description}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </li>

              {NAV_LINKS.map((item, index) => (
                <li key={`__nav__${index}`}>
                  <Link
                    className={`font-[600] hover:underline ${
                      pathname === item?.href ? "underline text-[#007FFF]" : ""
                    } text-[1rem] leading-[1.5rem]`}
                    href={item?.href}
                  >
                    {item?.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="flex gap-[1rem] items-center">
            <button
              onClick={() => push("/login")}
              className="font-[600] text-[1rem] leading-[1.5rem] cursor-pointer"
            >
              Log In
            </button>
            <Button onClick={() => push("/signup")}>Sign Up</Button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="lg:hidden cursor-pointer text-white p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div
          ref={mobileMenuRef}
          className="lg:hidden mt-[1rem] mx-auto w-[100%] md:w-[90%] max-w-[870px] bg-[#00356B] backdrop-blur-[40px] rounded-[1.25rem] p-[1.5rem] text-white"
        >
          <nav className="space-y-[1rem]">
            <div>
              <button
                className="w-full cursor-pointer flex justify-between items-center font-[600] text-[1rem] leading-[1.5rem] py-[0.5rem]"
                onClick={() => setIsMobileFeaturesOpen(!isMobileFeaturesOpen)}
              >
                Features
                <svg
                  className={`w-4 h-4 transition-transform ${
                    isMobileFeaturesOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isMobileFeaturesOpen && (
                <div className="mt-[0.5rem] pl-[1rem] space-y-[1rem] border-l-2 border-white/20">
                  {FEATURES.map((feature, index) => (
                    <Link
                      key={`__feature__${index}`}
                      href={feature?.link}
                      className="block group py-[0.5rem]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <h4
                        className={`font-[600] group-hover:underline ${
                          pathname === feature?.link ? "underline" : ""
                        } text-[0.875rem] mb-[0.25rem]`}
                      >
                        {feature.title}
                      </h4>
                      <p
                        className={`text-white/70 group-hover:underline ${
                          pathname === feature?.link ? "underline" : ""
                        } text-[0.75rem] leading-[1.125rem]`}
                      >
                        {feature.description}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {NAV_LINKS.map((item, index) => (
              <Link
                key={index}
                className={`block hover:underline ${
                  pathname === item?.href ? "underline" : ""
                } font-[600] text-[1rem] leading-[1.5rem] py-[0.5rem]`}
                href={item?.href}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item?.title}
              </Link>
            ))}

            <div className="pt-[1rem] border-t border-white/20 flex flex-col gap-[0.75rem]">
              <button
                onClick={() => push("/login")}
                className="w-fit font-[600] text-[1rem] leading-[1.5rem] p-[.75rem_1.25rem] cursor-pointer text-center"
              >
                Log In
              </button>
              <Button
                onClick={() => push("/signup")}
                style={{ width: "fit-content" }}
              >
                Sign Up
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
};

export { LandingHeader };
