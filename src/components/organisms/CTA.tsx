import React from "react";
import { Button, ScaleIn, FadeIn } from "../atoms";
import { Icon } from "@iconify/react";

const CTA = ({
  title = "Your Journey to Excellence Starts Now",
  content = "Revise smarter, support others through giveback, and unlock new opportunities with our affiliate program",
}: {
  title?: string;
  content?: string;
}) => {
  return (
    <section className="py-[6rem] max-w-[1300px] mx-auto md:w-[90%] w-[100%] px-[1rem]">
      <ScaleIn className="bg-[url(/images/background-pattern-2.png)] bg-cover px-[1.25rem] md:px-0 rounded-[2rem] bg-center">
        <div className="py-[5.5rem] flex flex-col items-center mx-auto md:w-[80%] lg:w-[70%] text-white">
          <FadeIn delay={0.05} className="mb-[.5rem] w-full text-center">
            <h3 className="leading-[3rem] text-center tracking-[-.8px] font-[600] text-[2.5rem]">
              {title}
            </h3>
          </FadeIn>
          <FadeIn delay={0.12} className="mb-[2rem] w-full text-center">
            <p className="leading-[1.75rem] text-center text-[1.125rem] font-[400]">
              {content}
            </p>
          </FadeIn>
          <FadeIn delay={0.18}>
            <Button href="/signup">
              Join Now
              <Icon
                icon="hugeicons:arrow-right-02"
                height={"1.5rem"}
                width={"1.5rem"}
              />
            </Button>
          </FadeIn>
        </div>
      </ScaleIn>
    </section>
  );
};

export { CTA };
