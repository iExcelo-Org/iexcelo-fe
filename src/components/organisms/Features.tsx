"use client";

import React, { useState, useEffect, useRef } from "react";
import { Icon } from "@iconify/react";
import { Chip, FadeIn } from "../atoms";

const contentData = [
  {
    icon: "hugeicons:books-01",
    title: "Self-Testing Phase",
    description:
      "Start your journey by taking a mock test that mirrors your real exam, same subjects, same number of questions. This first attempt isn't about the score; it's about setting your baseline. Skip the explanations for now and just go for it! You'll see where you stand, compare with others, and later measure how far you've come before the real exam.",
    number: "1",
    gradient:
      "radial-gradient(137.05% 100% at 50% 0%, #ECFCFF 44.79%, #FFF 100%)",
  },
  {
    icon: "hugeicons:notebook-01",
    title: "Revision Phase",
    description:
      "Switch to Revision Mode and choose your subject and number of questions to tackle. Begin small, then increase as you grow more confident. Take your time to read every explanation and topic summary—no skipping, even if it feels familiar. Keep revising until you've gone through every question in each subject at least three times for solid mastery.",
    number: "2",
    gradient:
      "radial-gradient(137.05% 100% at 50% 0%, #FFF4EC 44.79%, #FFF 100%)",
  },
  {
    icon: "hugeicons:brain",
    title: "Brain-Testing Phase",
    description:
      "Begin your fourth round of practice by recalling explanations and topic summaries from memory. If something doesn't come to mind, quickly review it or cross-check in a trusted textbook. Repeat this process twice for each subject, a proven way to boost retention, strengthen understanding, and improve recall when it matters most.",
    number: "3",
    gradient:
      "radial-gradient(137.05% 100% at 50% 0%, #F4ECFF 44.79%, #FFF 100%)",
  },
  {
    icon: "hugeicons:timer-01",
    title: "Time-Beating Phase",
    description:
      "Now, take it up a notch with timed practice. Choose a subject, race against the clock, and aim for accuracy under pressure. This step helps you build speed, sharpen focus, and master exam timing. Repeat it five times per subject and for an extra boost, take a weekly mock test while revising to track your progress.",
    number: "4",
    gradient:
      "radial-gradient(137.05% 100% at 50% 0%, #ECFFF4 44.79%, #FFF 100%)",
  },
  {
    icon: "hugeicons:desk",
    title: "Examination Phase",
    description:
      "Whether this is your first attempt or you've faced setbacks before, iExcelo is built to help you turn things around. Stay consistent, follow each step with focus, and trust the process. With dedication and the right preparation, you'll not only pass, you'll excel with confidence and brilliance in a single attempt.",
    number: "5",
    gradient:
      "radial-gradient(137.05% 100% at 50% 0%, #FFF0EC 44.79%, #FFF 100%)",
  },
];

const Features = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [opacity, setOpacity] = useState(1);
  const sectionRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);

  useEffect(() => {
    const handleScroll = () => {
      if (!sectionRef.current || isScrollingRef.current) return;

      const section = sectionRef.current;
      const rect = section.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (rect.top <= windowHeight * 0.3 && rect.bottom >= windowHeight * 0.3) {
        const sectionHeight = rect.height;
        const scrollProgress =
          (windowHeight * 0.3 - rect.top) / (sectionHeight * 0.8);
        const clampedProgress = Math.max(0, Math.min(1, scrollProgress));

        const totalSteps = contentData.length;
        const currentStep = clampedProgress * totalSteps;
        const newIndex = Math.min(Math.floor(currentStep), totalSteps - 1);

        const stepProgress = currentStep - newIndex;
        const fadeOpacity = 1 - Math.abs(stepProgress - 0.5) * 2;

        if (newIndex !== activeIndex) {
          setActiveIndex(newIndex);
        }

        setOpacity(
          newIndex === 0 || newIndex === 4 ? 1 : Math.max(0.3, fadeOpacity),
        );
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeIndex]);

  const currentContent = contentData[activeIndex];

  return (
    <section className="pb-[3rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
      <FadeIn className="mb-[2rem] md:hidden w-fit mx-auto">
        <Chip name="How It Works" />
      </FadeIn>
      <FadeIn className="md:hidden">
        <h2 className="md:text-[2.75rem] text-[2.25rem] leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] text-center font-[600] text-[#101928] mb-[.5rem]">
          Your Pathway to Exam Excellence
        </h2>
      </FadeIn>
      <FadeIn delay={0.08} className="md:hidden">
        <p className="text-[#667185] font-[400] text-[1.125rem] text-center leading-[1.75rem] mb-[4rem]">
          A step-by-step journey that turns preparation into mastery — helping you
          build confidence, improve speed, and excel with ease.
        </p>
      </FadeIn>

      <div ref={sectionRef} style={{ minHeight: "400vh" }}>
        <div className="sticky top-[15vh] md:top-[15vh]">
          <FadeIn className="mb-[2rem] hidden md:block w-fit mx-auto">
            <Chip name="How It Works" />
          </FadeIn>
          <FadeIn className="hidden md:block">
            <h2 className="md:text-[2.75rem] text-[2.25rem] leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] text-center font-[600] text-[#101928] mb-[.5rem]">
              Your Pathway to Exam Excellence
            </h2>
          </FadeIn>
          <FadeIn delay={0.08} className="hidden md:block">
            <p className="text-[#667185] font-[400] text-[1.125rem] text-center leading-[1.75rem] mb-[4rem]">
              A step-by-step journey that turns preparation into mastery — helping
              you build confidence, improve speed, and excel with ease.
            </p>
          </FadeIn>

          <div
            style={{
              boxShadow:
                "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
              background: currentContent.gradient,
              transition: "background 0.5s ease-out",
              opacity: opacity,
              transform: `scale(${0.95 + opacity * 0.05})`,
              willChange: "opacity, transform",
            }}
            className="lg:max-w-[53.875rem] md:w-[95%] relative overflow-hidden md:h-[25.6875rem] flex justify-between flex-col md:p-[3rem_1.8125rem_3.4375rem_1.8125rem] p-[3rem_1.875rem_3rem_.875rem] gap-[6rem] rounded-[1rem] mx-auto"
          >
            <span
              style={{
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                transition: "all 0.5s ease-out",
              }}
              className="border-[2px] p-[.875rem] h-fit w-fit flex items-center justify-center border-[#DBEDFF] rounded-[.5rem] bg-[#007FFF]"
            >
              <Icon
                icon={currentContent.icon}
                height={"1.25rem"}
                width={"1.25rem"}
                color="#fff"
              />
            </span>

            <div
              className="flex flex-col gap-[.5rem]"
              style={{ transition: "opacity 0.5s ease-out" }}
            >
              <h3 className="text-[#101928] leading-[2rem] font-[500] text-[1.5rem] tracking-[-.48px]">
                {currentContent.title}
              </h3>
              <p className="max-w-[36rem] w-[90%] text-[1rem] font-[400] leading-[1.5rem] text-[#667185]">
                {currentContent.description}
              </p>
            </div>

            <h3
              style={{
                background:
                  "linear-gradient(180deg, #B0D7FF 0%, rgba(138, 196, 255, 0.00) 62.69%)",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
              className="absolute bottom-[-8.5625rem] hidden md:block right-[.5rem] font-[500] text-[18.75rem] bg-clip-text"
            >
              {currentContent.number}
            </h3>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Features;
