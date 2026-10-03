import { Button, Chip, FadeIn } from "@/components/atoms";
import { CTA } from "@/components/organisms";
import Features from "@/components/organisms/Features";
import { Icon } from "@iconify/react";
import React from "react";

const Revisions = () => {
  return (
    <main className="bg-white">
      <section className="bg-[url(/images/background-pattern-3.png)] relative overflow-hidden bg-center gap-[3.25rem] md:gap-0 bg-cover flex flex-col md:flex-row items-center pt-[8rem] md:pt-0 md:justify-center min-h-[100vh] px-[1rem]">
        <FadeIn className="flex flex-col relative z-[2] gap-[1rem] items-center">
          <Chip name="iExcelo Exam Revision" />
          <h1 className="text-[2.75rem] md:text-[3.25rem] font-[600] leading-[3rem] md:leading-[3.5rem] text-[#101928] tracking-[-.88px] md:tracking-[-1.04px] max-w-[40rem] mx-auto text-center">
            Your Smart Companion for Exam Success
          </h1>
          <div className="flex flex-col gap-[1.5rem]">
            <p className="md:text-[1.25rem] text-[1.125rem] font-[500] leading-[1.5rem] md:leading-[1.75rem] tracking-[-.36px] md:tracking-[-.4px] max-w-[40rem] mx-auto text-center text-[#98A2B3]">
              Master every topic, one question at a time. iExcelo&apos;s Exam
              Revision feature gives you access to expertly curated past
              questions, smart explanations, and topic summaries, everything you
              need to prepare confidently and excel in any exam.
            </p>
            <Button href="/signup" className="w-fit mx-auto">
              Start Revising Now
              <Icon
                icon="hugeicons:arrow-right-02"
                height={"1.5rem"}
                width={"1.5rem"}
              />
            </Button>
          </div>
        </FadeIn>
        <div className="md:absolute inset-0 w-full h-[22rem] md:h-full flex items-center justify-center">
          <FadeIn
            delay={0.1}
            className="h-full md:hidden lg:block w-full lg:w-[70%] bg-[url(/images/hero-img-6-sm.png)] md:bg-[url(/images/hero-img-6.png)] bg-center bg-contain bg-no-repeat"
          />
        </div>
      </section>

      <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
        <FadeIn>
          <h2 className="md:text-[2.75rem] text-[2.25rem] text-center leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] font-[600] text-[#101928] mb-[.5rem]">
            Everything You Need to Excel All in One Place
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-[#667185] text-center font-[400] text-[1.125rem] leading-[1.75rem] mb-[2rem]">
            Designed to help you learn smarter and achieve more, iExcelo makes
            exam preparation seamless, engaging, and effective, so you can focus
            on what truly matters: excelling.
          </p>
        </FadeIn>
        <FadeIn delay={0.14}>
          <Button href="/signup" className="mx-auto">
            Get Started
            <Icon
              icon="hugeicons:arrow-right-02"
              height={"1.5rem"}
              width={"1.5rem"}
            />
          </Button>
        </FadeIn>
        <div className="mt-[4rem] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[2rem] md:[&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:mx-auto md:[&>*:last-child:nth-child(odd)]:max-w-[calc(50%-1rem)] lg:[&>*:last-child:nth-child(odd)]:col-span-1 lg:[&>*:last-child:nth-child(odd)]:mx-0 lg:[&>*:last-child:nth-child(odd)]:max-w-none">
          {[
            {
              icon: "hugeicons:book-01",
              title: "Revise What Matters",
              content:
                "Thousands of carefully selected revision and practice questions, taken from a variety of past exams, with a focus on the most frequently asked questions.",
            },
            {
              icon: "hugeicons:computer-check",
              title: "Answers You Can Trust",
              content:
                "Expert explanations to every answer, ensuring that you have access to the most accurate and reliable information.",
            },
            {
              icon: "hugeicons:book-open-02",
              title: "Learn Smarter, Not Harder",
              content:
                "Summaries of every topic addressed by each question in every subject, enabling you to quickly identify areas of strength and weakness.",
            },
            {
              icon: "hugeicons:chart-increase",
              title: "Track Your Growth",
              content:
                "Real-time performance and progression scores, giving you peace of mind and assurance of your readiness for the exam.",
            },
            {
              icon: "hugeicons:user-group-03",
              title: "See Where You Stand",
              content:
                "Comparison of your performance with other candidates sitting for the same exam, which can motivate you to do even better.",
            },
            {
              icon: "hugeicons:idea-01",
              title: "Study with Precision",
              content:
                "The ability to select and revise questions based on specific topics, allowing you to focus on areas of weakness one at a time.",
            },
            {
              icon: "hugeicons:library",
              title: "Choose How You Practice",
              content:
                "Thousands of carefully selected revision and practice questions, taken from a variety of past exams, with a focus on the most frequently asked questions.",
            },
            {
              icon: "hugeicons:internet-antenna-01",
              title: "Save Data, Study More",
              content: `With iExcelo's in-built data saver technology, you can keep learning without worrying about high data costs.`,
            },
            {
              icon: "hugeicons:online-learning-01",
              title: "Learn Anytime, Anywhere",
              content: `24/7 access to our platform from any device, anywhere you are. Study at your own pace, whenever and wherever inspiration strikes.`,
            },
          ]?.map((item, index) => (
            <FadeIn
              style={{
                boxShadow:
                  "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
              }}
              key={`__item__${index}`}
              delay={index * 0.04}
              className="h-[18.375rem] bg-[url(/images/background-pattern-5.png)] bg-center bg-cover p-[1.375rem_1.5rem] outline rounded-[1.5rem] outline-offset-[4px]"
            >
              <div className="flex flex-col w-fit items-center mb-[1px]">
                <span
                  style={{
                    boxShadow:
                      "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                  }}
                  className="border-[2px] p-[.75rem] h-fit w-fit flex items-center justify-center border-[#DBEDFF] rounded-[.5rem] bg-[#007FFF]"
                >
                  <Icon
                    icon={item?.icon}
                    height={"1rem"}
                    width={"1rem"}
                    color="#fff"
                  />
                </span>
                <span
                  style={{
                    background:
                      "linear-gradient(180deg, #0063AD 25.72%, rgba(176, 215, 255, 0.00) 97.26%)",
                  }}
                  className="w-[1px] h-[4.5625rem]"
                ></span>
              </div>
              <h3 className="tracking-[-.4px] leading-[1.75rem] font-[500] text-[1.25rem] text-[#101928] mb-[1rem]">
                {item?.title}
              </h3>
              <p className="text-[#667185] leading-[1.25rem] text-[.875rem] font-[400]">
                {item?.content}
              </p>
            </FadeIn>
          ))}
        </div>
      </section>

      <Features />

      <CTA />
    </main>
  );
};

export default Revisions;
