/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Icon } from "@iconify/react";
import { Button } from "../atoms";
import { usePublicStore } from "@/store/public.store";

const SkeletonPulse = ({ className }: { className: string }) => (
  <div className={`animate-pulse bg-[#E6F2FF] rounded-[.5rem] ${className}`} />
);

const TestimonialSkeleton = () => (
  <div
    style={{
      boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
    }}
    className="bg-[#fff] border-[.833px] max-w-[90%] md:max-w-[100%] mx-auto border-[#DCDFE4] rounded-[1rem] p-[2.5rem_.75rem] md:p-[5rem_2.4375rem] flex-1"
  >
    <SkeletonPulse className="h-[2.25rem] w-[80%] mb-[1rem]" />
    <SkeletonPulse className="h-[2.25rem] w-[60%] mb-[1rem]" />
    <SkeletonPulse className="h-[2.25rem] w-[45%] mb-[2.5rem]" />
    <span className="block h-[1px] bg-[#DCDFE4] w-full my-[2.5rem]" />
    <div className="flex gap-[0.9375rem] items-center">
      <div className="animate-pulse bg-[#E6F2FF] rounded-full h-[4rem] w-[4rem] flex-shrink-0" />
      <div className="flex flex-col gap-[.5rem] flex-1">
        <SkeletonPulse className="h-[1.5rem] w-[8rem]" />
        <SkeletonPulse className="h-[1.25rem] w-[6rem]" />
      </div>
    </div>
  </div>
);

const EmptyState = () => (
  <div
    style={{
      boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
    }}
    className="bg-[#fff] border-[.833px] max-w-[90%] md:max-w-[100%] mx-auto border-[#DCDFE4] rounded-[1rem] p-[4rem_2.4375rem] flex-1 flex flex-col items-center justify-center gap-[1rem]"
  >
    <span className="flex items-center justify-center w-[4rem] h-[4rem] rounded-full bg-[#E6F2FF]">
      <Icon icon="hugeicons:megaphone-02" width="1.75rem" height="1.75rem" color="#007FFF" />
    </span>
    <h4 className="text-[1.25rem] font-[600] text-[#101928] tracking-[-.4px]">
      No testimonials yet
    </h4>
    <p className="text-[#98A2B3] text-[1rem] leading-[1.5rem] text-center max-w-[20rem]">
      Check back soon — students are already making their mark.
    </p>
  </div>
);

const variants = {
  enter: { opacity: 0, y: 10 },
  center: { opacity: 1, y: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as const } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.25 } },
};

const Testimonial = () => {
  const { testimonials, testimonialsLoading, fetchTestimonials } = usePublicStore();
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    if (testimonials.length < 2) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length, currentIndex]);

  const handlePrev = () =>
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  const handleNext = () =>
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);

  const current = testimonials[currentIndex];
  const showNav = !testimonialsLoading && testimonials.length > 1;

  const NavBtn = ({ dir, className = "" }: { dir: "prev" | "next"; className?: string }) => (
    <Button
      className={className}
      style={{ borderRadius: "50%", aspectRatio: "1/1" }}
      onClick={dir === "prev" ? handlePrev : handleNext}
    >
      <Icon
        icon={dir === "prev" ? "hugeicons:arrow-left-02" : "hugeicons:arrow-right-02"}
        width="1.5rem"
        height="1.5rem"
        color="#fff"
      />
    </Button>
  );

  return (
    <section className="flex lg:gap-[5.25rem] md:gap-[2rem] gap-[1rem] flex-col lg:flex-row my-[.375rem] items-center">
      {showNav && <NavBtn dir="prev" className="lg:block hidden" />}

      <div className="relative z-[1] flex-1 w-full">
        {testimonialsLoading ? (
          <TestimonialSkeleton />
        ) : !testimonials.length ? (
          <EmptyState />
        ) : (
          <div
            style={{
              boxShadow: "0 0 0 1px rgba(0,0,0,0.06), 0 5px 22px 0 rgba(0,0,0,0.04)",
            }}
            className="bg-[#fff] border-[.833px] max-w-[90%] md:max-w-[100%] mx-auto border-[#DCDFE4] rounded-[1rem] p-[2.5rem_.75rem] md:p-[5rem_2.4375rem] overflow-hidden relative"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
              >
                <h3 className="md:text-[2.25rem] text-[2rem] font-[600] text-[#101928] tracking-[-.64px] md:tracking-[-.72px] leading-[2.5rem] md:leading-[2.75rem]">
                  &ldquo;{current.content}&rdquo;
                </h3>
                <span className="block h-[1px] bg-[#DCDFE4] w-full my-[2.5rem]" />
                <div className="flex gap-[0.9375rem] items-center">
                  <div className="h-[4rem] w-[4rem] rounded-full bg-[#E6F2FF] flex items-center justify-center flex-shrink-0">
                    <Icon icon="hugeicons:user-circle" width="2rem" height="2rem" color="#007FFF" />
                  </div>
                  <div className="flex flex-col gap-[.25rem]">
                    <span className="leading-[2rem] font-[500] text-[1.5rem] tracking-[-.48px]">
                      {current.name}
                    </span>
                    {current.role && (
                      <span className="leading-[1.75rem] tracking-[-.4px] text-[#98A2B3] font-[500] text-[1.25rem]">
                        {current.role}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="absolute bg-[#E6F2FF] testimonial-box border border-[#39F] md:left-[-2.25rem] left-0 top-[2rem] z-[-1] rounded-[.84375rem]" />
          </div>
        )}
      </div>

      {showNav && <NavBtn dir="next" className="lg:block hidden" />}

      {showNav && (
        <div className="flex items-center justify-between md:w-[12rem] w-[8.5rem] lg:hidden">
          <NavBtn dir="prev" />
          <NavBtn dir="next" />
        </div>
      )}
    </section>
  );
};

export { Testimonial };
