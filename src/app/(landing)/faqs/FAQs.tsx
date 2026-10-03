"use client";

import { CTA } from "@/components/organisms";
import { FadeIn } from "@/components/atoms";
import { Icon } from "@iconify/react";
import { useState } from "react";
import { faqData } from "./data";
import { FAQ_CATEGORIES, slugToTitle } from "@/utils";

const FAQs = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>("general");

  const filteredFAQs = faqData.filter((faq) => faq.category === activeCategory);

  return (
    <main className="bg-white w-[100%] overflow-hidden">
      <section className="bg-[url(/images/background-pattern-3.png)] bg-center bg-cover justify-center flex-col gap-[1rem] flex px-[1rem] items-center h-[100vh]">
        <FadeIn>
          <h2 className="text-[2.75rem] md:text-[3.25rem] text-center leading-[3.5rem] tracking-[-.88px] md:tracking-[-1.04px] font-[600] text-[#101928]">
            Frequently Asked Questions
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-[#98A2B3] text-center font-[500] max-w-[50rem] tracking-[-.36px] md:tracking-[-.4px] md:text-[1.25rem] text-[1.125rem] leading-[1.5rem] md:leading-[1.75rem] mb-[4rem]">
            Everything you need to know about the product and its benefits.
            Can&apos;t find the answer you&apos;re looking for?{" "}
            <a
              href="mailto:platform@iexcelo.com"
              className="text-[#E32E89] underline"
            >
              Please contact our friendly team.
            </a>
          </p>
        </FadeIn>
      </section>
      <section className="py-[6rem] max-w-[1300px] items-start justify-between mx-auto md:w-[90%] w-[100%] px-[1rem] flex flex-col lg:flex-row gap-[4.375rem] lg:gap-[2rem]">
        <FadeIn className="flex lg:sticky top-[3rem] gap-[1.5rem] w-[100%] flex-col max-w-[17.125rem]">
          {FAQ_CATEGORIES.map((category, index) => (
            <button
              className={`pl-[.875rem] transition-colors duration-[.4s] text-left border-l-[2px] ${
                activeCategory === category
                  ? "border-[#007FFF] text-[#007FFF]"
                  : "border-transparent text-[#98A2B3]"
              } py-[.3rem] font-[500] text-[1.25rem] leading-[1.75rem] tracking-[-.4px] cursor-pointer w-full hover:text-[#007FFF]`}
              key={`__button__item__deet__${index}__`}
              onClick={() => {
                setActiveCategory(category);
                setOpenIndex(null);
              }}
            >
              {slugToTitle(category)}
            </button>
          ))}
        </FadeIn>
        <FadeIn
          delay={0.1}
          className="max-w-[51.75rem] w-[100%] flex flex-col gap-[1rem]"
        >
          {filteredFAQs.map((faq, index) => (
            <button
              key={faq.id}
              onClick={() => {
                setOpenIndex(openIndex === index ? null : index);
              }}
              className={`p-[2rem] text-left cursor-pointer transition-colors duration-[.4s] hover:bg-[#F9FAFB] rounded-[1rem] ${
                openIndex === index ? "bg-[#F9FAFB]" : ""
              }`}
            >
              <div className="flex justify-between cursor-pointer items-center w-full">
                <div
                  className={`flex gap-4 border-[#EDEDED] ${
                    openIndex === index ? "text-[#007FFF]" : "text-[#2B2B2B]"
                  } text-[1.125rem] leading-[1.75rem] font-medium pr-4`}
                >
                  <span>{faq.question}</span>
                </div>
                <Icon
                  icon={
                    openIndex === index
                      ? "hugeicons:minus-sign-circle"
                      : "hugeicons:plus-sign-circle"
                  }
                  height="1.625rem"
                  width="1.625rem"
                  color={openIndex === index ? "#007FFF" : "#D6D6D6"}
                  className="flex-shrink-0 transition-all duration-300"
                />
              </div>

              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index
                    ? "max-h-96 opacity-100"
                    : "max-h-0 opacity-0"
                }`}
              >
                <p className="text-[#98A2B3] pt-[.625rem] leading-[1.5rem] font-[400] text-[1rem]">
                  {faq.answer}
                </p>
              </div>
            </button>
          ))}
        </FadeIn>
      </section>

      <CTA />
    </main>
  );
};

export default FAQs;
