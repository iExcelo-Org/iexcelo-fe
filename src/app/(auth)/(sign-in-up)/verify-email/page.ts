import type { Metadata } from "next";
import VerifyEmailPage from "./VerifyEmail";

export const metadata: Metadata = {
  title: "iExcelo - Verify Email",
  description: "Check your inbox and verify your email address to activate your iExcelo account.",
  robots: { index: false, follow: false },
};

export default VerifyEmailPage;
