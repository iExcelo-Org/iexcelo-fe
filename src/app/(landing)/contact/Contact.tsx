import { CTA } from "@/components/organisms";
import { FadeIn } from "@/components/atoms";
import { Icon } from "@iconify/react";
import React from "react";

const Contact = () => {
  return (
    <main className="bg-white overflow-hidden w-[100%]">
      <section className="bg-[url(/images/background-pattern-3.png)] bg-center bg-cover justify-center flex-col gap-[1rem] px-[1rem] flex items-center h-[100vh]">
        <FadeIn>
          <h2 className="text-[2.75rem] md:text-[3.25rem] text-center leading-[3rem] md:leading-[3.5rem] tracking-[-.88px] md:tracking-[-1.04px] font-[600] text-[#101928]">
            Get in Touch
          </h2>
        </FadeIn>
        <FadeIn delay={0.08}>
          <p className="text-[#98A2B3] text-center font-[500] tracking-[-.36px] md:tracking-[-.4px] md:text-[1.25rem] text-[1.125rem] leading-[1.5rem] md:leading-[1.75rem] mb-[4rem]">
            We&apos;d love to hear from you. Our friendly team is here to help
          </p>
        </FadeIn>
      </section>
      <section className="py-[6rem] max-w-[1300px] justify-between mx-auto md:w-[90%] w-[100%] px-[1rem] grid grid-cols-1 md:grid-cols-2 md:[&>*:last-child:nth-child(odd)]:col-span-2 md:[&>*:last-child:nth-child(odd)]:mx-auto md:[&>*:last-child:nth-child(odd)]:max-w-[calc(50%-1rem)] lg:[&>*:last-child:nth-child(odd)]:col-span-1 lg:[&>*:last-child:nth-child(odd)]:mx-0 lg:[&>*:last-child:nth-child(odd)]:max-w-none lg:grid-cols-3 gap-[2rem]">
        {[
          {
            icon: "hugeicons:mail-01",
            name: "Email",
            content: "Our friendly team is here to help.",
            moreInfo: "platform@iexcelo.com",
            url: "mailto:platform@iexcelo.com",
          },
          {
            icon: "hugeicons:location-06",
            name: "Office",
            content: "Come say hello at our office HQ.",
            moreInfo:
              "Miolive Excel Academy Ltd, 16B Babalola street, Mushin-Itire Road, Ilasamaja, Lagos, Nigeria",
          },
          {
            icon: "hugeicons:call-02",
            name: "Phone",
            content: "Mon-Fri from 8am to 5pm.",
            moreInfo: "+234 812 483 2720",
          },
        ]?.map((item, index) => (
          <FadeIn
            key={`__item__${index}`}
            delay={index * 0.08}
            className="flex items-center justify-center gap-[1.25rem] flex-col"
          >
            <div className="flex items-center justify-center border-[8px] border-[#E6F2FF] rounded-[50%] bg-[#B0D7FF] h-[3.5rem] w-[3.5rem]">
              <Icon
                icon={item?.icon}
                color="#007FFF"
                height={"1.5rem"}
                width={"1.5rem"}
              />
            </div>
            <div className="flex flex-col items-center justify-center gap-[.5rem]">
              <span className="text-[#101928] text-center tracking-[-.4px] font-[700] leading-[1.75rem] text-[1.25rem]">
                {item?.name}
              </span>
              <span className="text-[#475467] text-center text-[1rem] leading-[1.5rem] font-[400]">
                {item?.content}
              </span>
            </div>
            {item?.url ? (
              <a
                href={item?.url}
                className="text-[#007FFF] text-center leading-[1.5rem] font-[600] text-[1rem]"
              >
                {item?.moreInfo}
              </a>
            ) : (
              <p className="text-[#007FFF] text-center leading-[1.5rem] font-[600] text-[1rem]">
                {item?.moreInfo}
              </p>
            )}
          </FadeIn>
        ))}
      </section>

      <CTA />
    </main>
  );
};

export default Contact;
