import type { Metadata } from "next";
import ConfirmedPage from "./ConfirmedPage";

export const metadata: Metadata = {
  title: "iExcelo - Subscription Confirmed",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default ConfirmedPage;
