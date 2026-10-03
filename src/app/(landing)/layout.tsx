import { LandingFooter, LandingHeader } from "@/components/organisms";
import React, { ReactNode } from "react";

const LandingLayout = ({ children }: { children: ReactNode }) => {
  return (
    <>
      <LandingHeader />
      {children}
      <LandingFooter />
    </>
  );
};

export default LandingLayout;
