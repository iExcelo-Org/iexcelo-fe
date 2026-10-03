/* eslint-disable @next/next/no-img-element */

import React, { ReactNode } from "react";

const SignInUpLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="flex items-center max-w-[1300px] px-[1rem] md:w-[90%] w-[100%] mx-auto gap-[7.25rem]">
      <figure className="flex-1 lg:block hidden h-[32.875rem] relative">
        <img
          alt="Auth Image"
          className="w-[80%]"
          src={"/images/auth-img-1.png"}
        />
        {[
          "w-[19.375rem] top-[1.25rem] animate-bounce animation-duration-[8s] right-[-1.1rem]",
          "w-[14.875rem] bottom-[4.7125rem] animate-bounce animation-duration-[8s] right-[2.025rem]",
          "w-[17.0625rem] bottom-0 left-0",
        ]?.map((imageClass, index) => (
          <img
            key={`__floating__image__${index}`}
            alt={`Auth Image ${index + 2}`}
            className={`absolute ${imageClass}`}
            src={`/images/auth-img-${index + 2}.png`}
          />
        ))}
      </figure>
      <div className="flex-1 min-w-0">{children}</div>
    </section>
  );
};

export default SignInUpLayout;
