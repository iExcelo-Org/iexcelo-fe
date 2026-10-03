/* eslint-disable @next/next/no-img-element */
import { Button, Chip, FadeIn, FadeInImg, SVGClient } from "@/components/atoms";
import {
  CTA,
  FaqV1,
  LandingFooter,
  LandingHeader,
  Testimonial,
} from "@/components/organisms";
import { Icon } from "@iconify/react";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <LandingHeader />
      <main className="bg-white w-[100%] overflow-hidden">
        <section className="bg-[url(/images/background-pattern.png)] bg-center bg-cover flex justify-end pt-[8rem] md:pt-[10rem]">
          <div className="max-w-[1300px] flex flex-col md:gap-[3rem] gap-[2rem] lg:gap-[2rem] justify-end md:w-[90%] w-[100%] px-[1rem] mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-[2rem] md:gap-[3rem] lg:gap-0 justify-between">
              <FadeIn className="max-w-[40rem]">
                <h1 className="mb-[1rem] text-[2.75rem] text-center lg:text-left md:text-[3.25rem] font-[600] md:tracking-[-1.04px] tracking-[-.88px] text-[#101928] leading-[3rem] md:leading-[3.5rem]">
                  Revise Smarter, Practice Harder and{" "}
                  <span className="text-[#E32E89] z-[3] relative">
                    Excel{" "}
                    <SVGClient
                      className="absolute top-0 left-0 translate-x-[20%] translate-y-[10%] z-[-1]"
                      src="/svg/hand-drawn-accents.svg"
                    />
                  </span>
                  <br /> in every Exam!
                </h1>
                <p className="mb-[1.5rem] text-center lg:text-left text-[1.125rem] md:text-[1.5rem] lg:ml-0 mx-auto max-w-[33rem] leading-[1.5rem] md:leading-[2rem] tracking-[-.36px] md:tracking-[-.48px] text-[#667185] font-[500]">
                  Modern online revision that makes exam prep simpler and
                  smarter
                </p>
                <Button href="/signup" className="w-fit mx-auto lg:ml-0">
                  Get Started
                  <Icon
                    icon="hugeicons:arrow-right-02"
                    height={"1.5rem"}
                    width={"1.5rem"}
                  />
                </Button>
              </FadeIn>
              <FadeInImg
                src={"/images/hero-img-1.png"}
                alt="Hero Image 1"
                className="max-w-[36.625rem] w-[100%] md:h-[34.5rem]"
                loading="lazy"
                delay={0.1}
              />
            </div>
            <FadeInImg
              src={"/images/hero-img-2.png"}
              alt="Hero Image 2"
              loading="lazy"
              delay={0.18}
            />
          </div>
        </section>

        <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
          <FadeIn className="w-fit">
            <Chip name="Our Benefits" iconPath="hugeicons:star" />
          </FadeIn>
          <div className="mt-[2rem] flex flex-col lg:flex-row gap-[3.5625rem] lg:gap-0 justify-between lg:items-center">
            <div className="lg:w-[47%]">
              <FadeIn>
                <h2 className="md:text-[2.75rem] text-[2.25rem] leading-[2.75rem] md:leading-[3rem] w-[90%] tracking-[-.72px] md:tracking-[-.88px] font-[600] text-[#101928] mb-[.5rem]">
                  Why Students Choose Us to Excel.
                </h2>
              </FadeIn>
              <FadeIn delay={0.08}>
                <p className="text-[#667185] font-[400] text-[1.125rem] leading-[1.75rem] mb-[2.5rem]">
                  From top-level exam questions to smart revision tools, we make
                  preparation simpler, faster, and more effective.
                </p>
              </FadeIn>
              <div className="md:gap-[1.5rem_1rem] gap-[1rem] grid grid-cols-1 md:grid-cols-2">
                {[
                  {
                    title: "Practice with the Best",
                    content: `From top-level exam questions to smart revision tools, we make preparation simpler, faster, and more effective.`,
                    icon: "hugeicons:notebook-01",
                  },
                  {
                    title: "Learn with Confidence",
                    content: `Every answer comes with expert explanations, giving you reliable insights and a deeper understanding of each concept.`,
                    icon: "hugeicons:book-open-02",
                  },
                  {
                    title: "Know Where You Stand",
                    content: `Topic-based summaries help you identify what you've mastered and where you need more practice fast.`,
                    icon: "hugeicons:board-math",
                  },
                  {
                    title: "Revise Smarter, Not Harder",
                    content: `Structured study support ensures you focus on the right questions, saving time while boosting exam performance.`,
                    icon: "hugeicons:brain",
                  },
                ]?.map((item, index) => (
                  <FadeIn
                    key={`__box__item__${index}`}
                    delay={index * 0.07}
                    style={{
                      boxShadow:
                        "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                    }}
                    className="p-[1rem] flex flex-col gap-[1rem] bg-white rounded-[.75rem] overflow-hidden"
                  >
                    <span className="p-[.75rem] w-fit bg-[#E6F2FF] rounded-[.5rem]">
                      <Icon
                        icon={item?.icon}
                        height={"1.05rem"}
                        width={"1.05rem"}
                        color="#007FFF"
                      />
                    </span>
                    <h4 className="text-[#101928] text-[1.25rem] leading-[1.75rem] font-[500] tracking-[-.4px]">
                      {item?.title}
                    </h4>
                    <p className="leading-[1.25rem] text-[#667185] w-[90%] font-[400] text-[.875rem]">
                      {item?.content}
                    </p>
                  </FadeIn>
                ))}
              </div>
            </div>
            <FadeInImg
              src={`/images/landing-img-1.png`}
              alt="Landing Image 1"
              className="lg:w-[47%]"
              delay={0.1}
            />
          </div>
        </section>

        <section className="py-[3.25rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
          <div className="w-fit mx-auto mb-[2rem]">
            <Chip name="Our Exam Offerings" iconPath="hugeicons:library" />
          </div>

          <h2 className="font-semibold text-[#101928] text-[1.75rem] md:text-[2.25rem] lg:text-[2.75rem] text-center leading-[2.25rem] md:leading-[2.75rem] lg:leading-[3rem] tracking-[-0.56px] md:tracking-[-0.72px] lg:tracking-[-0.88px] mb-2">
            Whatever the Exam, You&apos;re Covered.
          </h2>
          <p className="text-[#667185] text-center font-normal text-[0.875rem] md:text-[1rem] lg:text-[1.125rem] leading-[1.5rem] md:leading-[1.75rem] mb-10">
            iExcelo brings together revision, practice, and mock exams for
            multiple exam types, helping students prepare better, faster, and
            with confidence.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-6 lg:grid-cols-4 gap-6 lg:gap-10 justify-items-center">
            {["waec-v2", "jamb-v2", "neco-v2", "sat-v2"].map((item, index) => (
              <span
                key={`___${index}__`}
                className={`md:col-span-2 lg:col-span-1${index === 3 ? " md:col-start-4 lg:col-start-auto" : ""} w-[9rem] h-[9rem] sm:w-[10rem] sm:h-[10rem] lg:w-43.25 lg:h-43.25 flex items-center justify-center rounded-[50%]`}
                style={{
                  boxShadow: `0 0 0 0.613px rgba(0, 0, 0, 0.06), 0 3.067px 13.496px 0 rgba(0, 0, 0, 0.04)`,
                }}
              >
                <SVGClient src={`/svg/${item}.svg`} />
              </span>
            ))}
          </div>
        </section>

        <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
          <FadeIn className="w-fit mx-auto mb-[2rem]">
            <Chip name="Our Features" iconPath="hugeicons:sparkles" />
          </FadeIn>
          <FadeIn>
            <h2 className="text-[2.25rem] md:text-[2.75rem] text-center leading-[2.75rem] md:leading-[3rem] md:tracking-[-.88px] tracking-[-.72px] font-[600] text-[#101928] mb-[.5rem]">
              Where Success Meets Innovation.
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="text-[#667185] font-[400] text-[1.125rem] text-center leading-[1.75rem] mb-[2.5rem]">
              Revise smarter, support others through giveback, and unlock new
              opportunities with our affiliate program
            </p>
          </FadeIn>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-[1rem]">
            {[
              {
                title: "Master Every Question",
                icon: "hugeicons:book-open-02",
                content: `Access curated past exam questions designed to help you practice smarter and build confidence for the real test.`,
                href: "/revisions",
              },
              {
                title: "Support Students",
                icon: "hugeicons:healtcare",
                content: `Our Giveback program connects sponsors and learners to make education accessible for everyone.`,
                href: "/giveback",
              },
              {
                title: "Earn as You Share",
                icon: "hugeicons:affiliate",
                content: `Our affiliate program gives you a simple way to earn by sharing the power of smart learning.`,
                href: "/affiliate",
              },
            ]?.map((item, index) => (
              <FadeIn
                key={`__item__${item?.title}__${index}`}
                delay={index * 0.08}
                className="rounded-[.75rem] overflow-hidden md:last:col-span-2 md:last:max-w-[50%] md:last:mx-auto lg:last:col-span-1 lg:last:max-w-none"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
                }}
              >
                <figure className="h-[15.25rem] overflow-hidden">
                  <img
                    src={`/images/landing-img-${index + 2}.png`}
                    alt={`Landing image ${index + 2}`}
                  />
                </figure>
                <div className="p-[1.25rem_1.25rem_1.25rem_2rem]">
                  <div className="flex items-center mb-[.75rem] gap-[.5rem]">
                    <Icon
                      icon={item?.icon}
                      height={"1.25rem"}
                      width={"1.25rem"}
                      color="#00356B"
                    />
                    <span className="leading-[1.75rem] text-[1.25rem] font-[600] tracking-[-.4px] text-[#00356B]">
                      {item?.title}
                    </span>
                  </div>
                  <p className="text-[#667185] font-[400] text-[1.125rem] leading-[1.75rem] mb-[.5rem]">
                    {item?.content}
                  </p>
                  <Link
                    className="block text-[#E32E89] w-fit text-[.75rem] font-[600] leading-[1.25rem]"
                    href={item?.href}
                  >
                    Learn More
                  </Link>
                </div>
              </FadeIn>
            ))}
          </div>
        </section>

        <section className="py-[4rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
          <FadeIn className="w-fit mx-auto mb-[2rem]">
            <Chip name="Testimonials" iconPath="hugeicons:megaphone-02" />
          </FadeIn>
          <FadeIn>
            <h2 className="md:text-[2.75rem] text-[2.25rem] text-center leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] font-[600] text-[#101928] mb-[.5rem]">
              What Our Users Say
            </h2>
          </FadeIn>
          <FadeIn delay={0.08}>
            <p className="text-[#667185] font-[400] text-[1.125rem] text-center leading-[1.75rem] mb-[2.5rem]">
              Used by thousands of students, parents and partners
            </p>
          </FadeIn>

          <Testimonial />
        </section>

        <FaqV1 />

        <CTA />
      </main>
      <LandingFooter />
    </>
  );
}
