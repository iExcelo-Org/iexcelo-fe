/* eslint-disable @next/next/no-img-element */
import { Button, Chip, FadeIn, FadeInImg, ScaleIn, SVGClient } from "@/components/atoms";
import { CTA } from "@/components/organisms";
import { Icon } from "@iconify/react";
import React, { Fragment } from "react";

const About = () => {
  return (
    <main className="bg-white w-[100%] overflow-hidden">
      <section className="bg-[url(/images/background-pattern-3.png)] bg-center bg-cover flex items-center pt-[8rem] lg:h-[100vh]">
        <div className="max-w-[1300px] md:w-[90%] w-[100%] px-[1rem] flex flex-col lg:flex-row gap-[3.25rem] lg:items-center justify-between lg:gap-[2.3125rem] mx-auto">
          <FadeIn className="lg:w-[50%]">
            <Chip name="About Us" />
            <h1 className="my-[1rem] text-[2.75rem] md:text-[3.25rem] font-[600] tracking-[-.88px] md:tracking-[-1.04px] text-[#101928] leading-[3rem] md:leading-[3.5rem]">
              The Journey <br /> Behind iExeclo
            </h1>
            <p className="mb-[1.5rem] md:text-[1.25rem] text-[1.125rem] max-w-[33rem] leading-[1.5rem] md:leading-[1.75rem] tracking-[-.36px] md:tracking-[-.4px] text-[#98A2B3] font-[500]">
              At iExcelo, we&apos;re bridging the gap between preparation and
              opportunity. Our platform gives you access to curated past
              questions, and expert-backed explanations that simplify learning.
              Beyond academics, our Giveback and Affiliate programs empower
              students to contribute, collaborate, and grow while supporting
              others on their journey to success.
            </p>
            <Button href="/contact">
              Contact Us
              <Icon icon="hugeicons:call" height={"1.5rem"} width={"1.5rem"} />
            </Button>
          </FadeIn>
          <FadeInImg
            src={"/images/hero-img-3.png"}
            alt="Hero Image 3"
            className="lg:w-[50%] h-[19.125rem] md:h-[34.5rem]"
            loading="lazy"
            delay={0.1}
          />
        </div>
      </section>

      <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem] flex flex-col gap-[2rem] justify-end">
        <div className="flex lg:items-center flex-col lg:flex-row justify-between gap-[5.125rem]">
          <div className="lg:w-[48%] flex flex-col gap-[1rem]">
            {[
              {
                title: "Exam Revision Platform",
                icon: "exam",
                content: `At iExcelo, we're dedicated to helping students excel in their exams. Our Exam Revision Platform offers interactive study materials, practice questions, and expertly provided answers with clear explanations to help you fully understand each topic. Each question comes with a concise summary of the topic it addresses, ensuring you grasp key concepts and are ready for your exams. With 24/7 access, students can study at their own pace, boosting confidence and improving performance. Whether you're preparing for high school exams or entrance assessments, iExcelo provides the tools to help you not only pass but excel.`,
              },
              {
                title: "Give Back Program",
                content: `iExcelo GiveBack connects generous sponsors with students in need, offering access to exam revision subscriptions, educational materials, and capital projects for schools. Whether sponsoring a student's revision or funding school improvements, your support makes a lasting impact on education. Sponsors can track progress and send encouraging messages to their beneficiaries directly through their dashboard. We believe this will encourage and motivate them to strive and become successful like you. By contributing, you're not only helping students excel but also transforming the future of education.`,
                icon: "handheart",
              },
            ]?.map((item, index) => (
              <Fragment key={`__item__${index}`}>
                <FadeIn
                  className="flex flex-col gap-[.75rem]"
                  delay={index * 0.1}
                >
                  <span className="flex text-[#007FFF] text-[1.75rem] md:text-[2rem] leading-[2.25rem] md:leading-[2.5rem] font-[500] tracking-[-.56px] md:tracking-[-.64px] gap-[.5rem] items-center">
                    <SVGClient src={`/svg/${item?.icon}.svg`} />
                    {item?.title}
                  </span>
                  <p className="font-[400] text-[#667185] text-[1rem] md:text-[1.125rem] leading-[1.5rem] md:leading-[1.75rem]">
                    {item?.content}
                  </p>
                </FadeIn>

                {index === 0 && <div className="h-[1px] bg-[#EDEDED] w-full" />}
              </Fragment>
            ))}
          </div>
          <FadeInImg
            src={"/images/about-img-1.png"}
            alt="About Image 1"
            className="lg:w-[45%] h-[21.25rem] md:h-[34.5rem]"
            loading="lazy"
            delay={0.1}
          />
        </div>
      </section>

      <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
        <FadeIn className="w-fit mx-auto mb-[2rem]">
          <Chip name="Our Team" />
        </FadeIn>
        <FadeIn>
          <h2 className="md:text-[2.75rem] text-[2.25rem] text-center leading-[2.75rem] md:leading-[3rem] tracking-[-.72px] md:tracking-[-.88px] font-[600] text-[#101928] mb-[.5rem]">
            Our Dedicated Team
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-[#667185] text-center font-[400] text-[1.125rem] leading-[1.75rem] mb-[4rem]">
            Meet the passionate individuals driving iExcelo&apos;s mission.
          </p>
        </FadeIn>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-[2rem] mx-auto sm:[&>*:last-child:nth-child(odd)]:col-span-2 sm:[&>*:last-child:nth-child(odd)]:mx-auto sm:[&>*:last-child:nth-child(odd)]:max-w-[calc(50%-1rem)] lg:[&>*:last-child:nth-child(odd)]:col-span-2 lg:[&>*:last-child:nth-child(odd)]:mx-0 lg:[&>*:last-child:nth-child(odd)]:max-w-none lg:[&>*:nth-child(-n+3)]:col-span-2 lg:[&>*:nth-child(4)]:col-span-2 lg:[&>*:nth-child(4)]:col-start-2 lg:[&>*:nth-child(5)]:col-span-2 lg:[&>*:nth-child(5)]:col-start-4">
          {[
            {
              name: "Iranlowo J. M",
              office: "Founder & CEO",
              qualifications: "MBBS, MRCGP, Digital Entrepreneur",
              href: "https://johnex.com",
            },
            {
              name: "Funmilola C. O",
              office: "Chief Operating Officer",
              qualifications: "B.Sc. Biochemistry, PMP Certified",
              href: "https://johnex.com",
            },
            {
              name: "Kennedy C. O",
              office: "Project and Content Manager",
              qualifications: "B.Sc. Biology",
              href: "https://johnex.com",
            },
            {
              name: "Samson O. S",
              office: "Chief Editor",
              qualifications: "HND Industrial Maintenance Engineering",
              href: "https://johnex.com",
            },
            {
              name: "Ajiboye B. O",
              office: "Academic Director",
              qualifications: "B.Sc. Anatony, MSc. Anatomy",
              href: "https://johnex.com",
            },
          ]?.map((teamDeets, index) => (
            <FadeIn
              key={`___team__deets__${index}`}
              delay={index * 0.07}
              style={{
                backgroundImage: `url(/images/team-member-${index + 1}.png)`,
              }}
              className="rounded-[1rem] overflow-hidden bg-center bg-cover relative w-full h-[30rem]"
            >
              <div className="absolute p-[0_1rem_1.5rem_1rem] bottom-0 left-0 w-full">
                <div className="backdrop-blur-[12px] text-white p-[1.5rem_1.25rem] bg-[rgba(255,_255,_255,_0.30)] border border-[rgba(255,_255,_255,_0.50)]">
                  <div className="flex items-center justify-between mb-[1rem]">
                    <h6 className="text-[1.75rem] font-[600] tracking-[-.56px] leading-[2.25rem]">
                      {teamDeets?.name}
                    </h6>
                    <a target="_blank" href={teamDeets?.href}>
                      <Icon
                        icon={`hugeicons:arrow-up-right-01`}
                        height={`1.5rem`}
                        width={`1.5rem`}
                      />
                    </a>
                  </div>
                  <p className="text-[1.125rem] font-[600] leading-[1.75rem] mb-[.25rem]">
                    {teamDeets?.office}
                  </p>
                  <p className="text-[1rem] font-[400] leading-[1.5rem]">
                    {teamDeets?.qualifications}
                  </p>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </section>

      <section className="py-[6rem] bg-[url(/images/background-pattern-4.png)] bg-cover bg-center">
        <div className="flex flex-col lg:flex-row gap-[4rem] lg:gap-[2rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem] justify-between lg:items-center">
          <ScaleIn className="lg:w-[42%] w-full aspect-square flex relative items-center justify-center">
            <img
              src={"/images/about-img-2-inner.png"}
              alt="About Image 2"
              className="w-[60%]"
              loading="lazy"
            />
            <div className="absolute block inset-0 lg:h-full w-[90%] aspect-square mx-auto my-auto lg:w-full animate-spin animation-duration-[20s] rounded-[50%] object-cover outline-[3.042px] outline-dashed outline-[#007FFF]">
              <div className="relative w-full h-full">
                {[
                  "lg:h-[4rem] md:h-[3rem] h-[2.875rem] md:w-[3rem] lg:w-[4rem] w-[2.875rem] md:right-[1.6rem] right-[1rem] lg:right-0 md:top-[7.5rem] top-[1.2rem]",
                  "lg:h-[4rem] md:h-[3rem] h-[2.875rem] md:w-[3rem] lg:w-[4rem] w-[2.875rem] md:right-[1rem] right-[1rem] bottom-[2.1rem] lg:right-0 md:bottom-[8.5rem] lg:bottom-[7.5rem]",
                  "lg:h-[4rem] md:h-[3rem] h-[2.875rem] md:w-[3rem] lg:w-[4rem] w-[2.875rem] right-[50%] translate-x-1/2 translate-y-1/2 bottom-0",
                  "lg:h-[4rem] md:h-[3rem] h-[2.875rem] md:w-[3rem] lg:w-[4rem] w-[2.875rem] md:left-[.5rem] bottom-[3rem] md:bottom-[10rem] lg:left-0 lg:bottom-[8rem]",
                  "lg:h-[4rem] md:h-[3rem] h-[2.875rem] md:w-[3rem] lg:w-[4rem] w-[2.875rem] lg:left-0 left-[1rem] top-[1.1rem] md:left-[3rem] md:top-[6rem]",
                ]?.map((imageClass, index) => (
                  <img
                    className={`absolute ${imageClass}`}
                    src={`/images/avatar-${index + 2}.png`}
                    key={`___image__${index}__${imageClass}`}
                    alt={`Avatar Image ${index + 1}`}
                  />
                ))}
                {[
                  {
                    path: "book-03",
                    class:
                      "lg:bottom-[3.21rem] bottom-[4.5rem] hidden md:block left-[5.5rem] lg:left-[5rem]",
                  },
                  {
                    path: "knowledge-02",
                    class:
                      "lg:top-[1rem] top-[2.5rem] hidden md:block right-[8rem]",
                  },
                ]?.map((svgDeets, index) => (
                  <SVGClient
                    className={`absolute ${svgDeets?.class}`}
                    key={`___image__${index}__${svgDeets?.path}`}
                    src={`/svg/${svgDeets?.path}.svg`}
                  />
                ))}
              </div>
            </div>
          </ScaleIn>
          <div className="lg:w-[45%] flex flex-col gap-[2rem]">
            {[
              {
                title: "Our Mission",
                icon: "target",
                content: `We're on a mission to make quality exam preparation accessible, engaging, and meaningful. iExcelo bridges smart learning with social impact helping students achieve excellence while empowering others through our GiveBack initiative.`,
              },
              {
                title: "Our Values",
                content: `We believe education should inspire, not intimidate. Our values center on excellence, empathy, and empowerment combining technology, knowledge, and community to help every learner rise and give others the chance to do the same.`,
                icon: "binoculars",
              },
            ]?.map((item, index) => (
              <Fragment key={`__item__${index}`}>
                <FadeIn
                  className="flex flex-col gap-[.75rem]"
                  delay={index * 0.1}
                >
                  <span className="flex text-[#007FFF] text-[2rem] leading-[2.5rem] font-[500] tracking-[-.64px] gap-[.5rem] items-center">
                    <SVGClient src={`/svg/${item?.icon}.svg`} />
                    {item?.title}
                  </span>
                  <p className="font-[400] text-[#667185] text-[1.125rem] leading-[1.75rem]">
                    {item?.content}
                  </p>
                </FadeIn>

                {index === 0 && <div className="h-[1px] bg-[#EDEDED] w-full" />}
              </Fragment>
            ))}
          </div>
        </div>
      </section>
      <CTA />
    </main>
  );
};

export default About;
