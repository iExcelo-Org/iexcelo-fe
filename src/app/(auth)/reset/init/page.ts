import type { Metadata } from "next";
import PasswordResetInit from "./PasswordResetInit";

export const metadata: Metadata = {
  title: "iExcelo - Forgot Password",
  description: "Reset your iExcelo password. Enter your email address and we will send you a reset link.",
  robots: { index: false, follow: false },
};

export default PasswordResetInit;
