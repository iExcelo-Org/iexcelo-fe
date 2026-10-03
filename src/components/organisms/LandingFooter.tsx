import React from "react";
import { SVGClient } from "../atoms";
import Link from "next/link";

const LandingFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#E6F2FF] py-[4rem]">
      <section className="max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
        <div className="flex flex-col gap-[4rem]">
          <div className="flex items-start flex-col lg:flex-row gap-[3.25rem] lg:gap-0 justify-between">
            <div className="flex flex-col gap-[2rem]">
              <Link href={"/"}>
                <SVGClient src="/svg/logo.svg" />
              </Link>
              <ul className="flex gap-[1.5rem]">
                {[
                  { name: "About Us", url: "/about" },
                  { name: "FAQs", url: "/faqs" },
                  { name: "Contact Us", url: "/contact" },
                ]?.map((navItem, index) => (
                  <li key={`__nav__item__${index}`}>
                    <Link
                      className="text-[1rem] leading-[1.5rem] text-[#1D2739] font-[500]"
                      href={navItem?.url}
                    >
                      {navItem?.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex flex-col max-w-[26.7rem] gap-[1.5rem]">
              <div className="flex flex-col gap-[.25rem]">
                <span className="text-[#1D2739] text-[.875rem] font-[500] leading-[1.25rem]">
                  Office Address:
                </span>
                <span className="leading-[1.25rem] font-[400] text-[#667185] text-[.875rem]">
                  Miolive Excel Academy Ltd, 16B Babalola street, Mushin-Itire
                  Road, Ilasamaja, Lagos, Nigeria
                </span>
              </div>
              <div className="flex flex-col gap-[.25rem]">
                <span className="text-[#1D2739] text-[.875rem] font-[500] leading-[1.25rem]">
                  E-mail Address:
                </span>
                <a
                  href="mailto:platform@iexcelo.com"
                  className="leading-[1.25rem] font-[400] text-[#667185] text-[.875rem]"
                >
                  platform@iexcelo.com
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-[#DCDFE4] pt-[2rem]">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2rem]">
              <div className="flex gap-[1.5rem] items-center">
                {[
                  {
                    path: "facebook",
                    url: "https://www.facebook.com/profile.php?id=61572819621643",
                    label: "Facebook",
                  },
                  {
                    path: "twitter",
                    url: "https://x.com/iExcelo1?t=UZEdLQYbaq0ZbGdE4B6bQA&s=09",
                    label: "X (Twitter)",
                  },
                  {
                    path: "instagram",
                    url: "https://www.instagram.com/iexceloofficial",
                    label: "Instagram",
                  },
                ]?.map((item, index) => (
                  <a
                    href={item?.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    key={`__icon__social__${index}`}
                    aria-label={item.label}
                    className="h-[1.5rem] w-[1.5rem] rounded-[50%] bg-[#007FFF] flex items-center justify-center transition-opacity hover:opacity-80"
                  >
                    <SVGClient src={`/svg/${item?.path}.svg`} />
                  </a>
                ))}
              </div>
              <div className="flex gap-[2rem] items-center flex-wrap lg:justify-end">
                {[
                  { title: "Terms of Service", url: "/terms" },
                  { title: "Privacy Policy", url: "/privacy" },
                ]?.map((item, index) => (
                  <Link
                    href={item?.url}
                    className="text-[#667185] leading-[1.25rem] font-[400] text-[.875rem]"
                    key={`__link__${index}`}
                  >
                    {item?.title}
                  </Link>
                ))}
              </div>
              <span className="text-[#667185] leading-[1.25rem] font-[400] text-[.875rem] lg:col-span-2 lg:text-center">
                © Copyright {currentYear} | All rights are reserved by iExcelo
              </span>
            </div>
          </div>
        </div>
      </section>
    </footer>
  );
};

export { LandingFooter };
