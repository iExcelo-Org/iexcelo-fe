"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Chip, FadeIn } from "../atoms";

const FaqV1 = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      id: 1,
      question: "What is iExcelo?",
      answer:
        "iExcelo is an all-in-one digital learning and impact platform that helps students prepare for exams through interactive revision tools and connects sponsors to learners in need through transparent donations.",
    },
    {
      id: 2,
      question: "What is the iExcelo Giveback Program?",
      answer:
        "It's a transparent platform that allows individuals and organizations to sponsor students' education by funding their access to quality learning materials on iExcelo.",
    },
    {
      id: 3,
      question: "How often is content updated?",
      answer:
        "Our content team regularly updates questions, explanations, and summaries to align with current exam formats and trends.",
    },
    {
      id: 4,
      question: "How does sponsorship work?",
      answer:
        "You choose how many students you'd like to support, make your donation, and get a dashboard where you can see their progress in real time.",
    },
    {
      id: 5,
      question: "Is my donation safe?",
      answer:
        "Absolutely. All donations are processed through secure payment systems, and we maintain full transparency on fund allocation.",
    },
    {
      id: 6,
      question: "How are students selected for the Giveback Program?",
      answer:
        "We partner with schools, NGOs, and verified local institutions to identify deserving students from low-income backgrounds.",
    },
    {
      id: 7,
      question: "What is the iExcelo Affiliate Program?",
      answer:
        "It's an opportunity for you to earn money by referring others to iExcelo's learning or Giveback programs.",
    },
  ];

  return (
    <section className="py-20 max-w-[1300px] flex flex-col lg:flex-row justify-between items-start mx-auto w-[90%] bg-white gap-[2rem] lg:gap-12">
      <FadeIn className="lg:w-[40%] lg:sticky top-12">
        <Chip name="FAQs" iconPath="hugeicons:bubble-chat-question" />
        <h2 className="md:text-[2.75rem] text-[2.25rem] mt-[1.875rem] leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] font-semibold text-[#101928] mb-2">
          Got Questions? We&apos;ve Got Answers
        </h2>
        <p className="text-[#667185] font-[400] text-[1.125rem] leading-[1.75rem]">
          If you have any additional questions or need further clarifications,
          don&apos;t hesitate to get in touch with us. We&apos;re here to help
          you!
        </p>
      </FadeIn>

      <FadeIn
        delay={0.1}
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="border border-[#DCDFE4] py-1 rounded-[2rem] lg:w-[53%] overflow-hidden"
      >
        {faqs.map((faq, index) => (
          <div
            key={faq.id}
            className="border-b border-[#DCDFE4] last:border-b-0"
          >
            <button
              onClick={() => {
                setOpenIndex(openIndex === index ? null : index);
              }}
              className="flex justify-between cursor-pointer items-center w-full py-7 px-6 text-left hover:bg-[#F9FAFB] transition-colors duration-200"
            >
              <div
                className={`flex gap-4 ${
                  openIndex === index ? "border-b" : ""
                } border-[#EDEDED] -mb-7 pb-7 ${
                  openIndex === index ? "text-[#007FFF]" : "text-[#2B2B2B]"
                } text-[1.25rem] leading-[1.75rem] font-medium pr-4`}
              >
                <span>{String(faq.id).padStart(2, "0")}</span>
                <span>{faq.question}</span>
              </div>
              <Icon
                icon={
                  openIndex === index
                    ? "hugeicons:minus-sign-circle"
                    : "hugeicons:plus-sign-circle"
                }
                height="2rem"
                width="2rem"
                color={openIndex === index ? "#007FFF" : "#D6D6D6"}
                className="flex-shrink-0 transition-all duration-300"
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 ease-in-out ${
                openIndex === index
                  ? "max-h-96 opacity-100"
                  : "max-h-0 opacity-0"
              }`}
            >
              <p className="text-[#757575] p-[1rem_1.5rem_1.5rem_1.5rem] leading-[1.75rem] font-[400] text-[1.125rem]">
                {faq.answer}
              </p>
            </div>
          </div>
        ))}
      </FadeIn>
    </section>
  );
};

export { FaqV1 };
