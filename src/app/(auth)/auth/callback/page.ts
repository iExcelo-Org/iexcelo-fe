import type { Metadata } from "next";
import AuthCallbackPage from "./Callback";

export const metadata: Metadata = {
  title: "iExcelo - Signing In",
  description: "Completing your iExcelo sign in securely.",
  robots: { index: false, follow: false },
};

export default AuthCallbackPage;
