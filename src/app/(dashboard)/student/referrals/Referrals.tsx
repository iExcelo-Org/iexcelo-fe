"use client";

import { Button, SVGClient } from "@/components/atoms";
import { InputField, Modal, Table } from "@/components/molecules";
import { useAffiliateStore, useAuthStore, useStudentStore } from "@/store";
import { affiliateCodeSchema } from "@/schemas/affiliate.schema";
import { CURRENCY_SYMBOLS } from "@/utils";
import { Icon } from "@iconify/react";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import ReferralsSkeleton from "./ReferralsSkeleton";

const SHARE_PLATFORMS = [
  { icon: "hugeicons:whatsapp", name: "WhatsApp", color: "#25D366" },
  { icon: "hugeicons:facebook-02", name: "Facebook", color: "#1877F2" },
  { icon: "hugeicons:new-twitter", name: "Twitter/X", color: "#000000" },
  { icon: "hugeicons:instagram", name: "Instagram", color: "#E4405F" },
  { icon: "hugeicons:tiktok", name: "TikTok", color: "#161823" },
];

const Referrals = () => {
  const { accessToken } = useAuthStore();
  const { profile } = useStudentStore();
  const {
    dashboard,
    referrals,
    referralsTotal,
    referralsPage,
    isLoadingDashboard,
    isLoadingReferrals,
    isUpdatingCode,
    selectedCurrency,
    setSelectedCurrency,
    earningsByCurrency,
    fetchDashboard,
    fetchReferrals,
    fetchEarningsByCurrency,
    updateAffiliateCode,
    checkCodeAvailability,
  } = useAffiliateStore();

  const [showShareModal, setShowShareModal] = useState(false);
  const [copied, setCopied] = useState(false);
  const [modalCopied, setModalCopied] = useState(false);

  // Code change state
  const [newCode, setNewCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // All students now have an affiliate profile at signup.
  // hasEverSubscribed only gates whether they can EARN — not whether they can refer.
  const hasEverSubscribed = profile?.hasEverSubscribed ?? false;
  const currencySymbol = CURRENCY_SYMBOLS[selectedCurrency] || "₦";

  const affiliateCode = dashboard?.affiliateCode || "";
  const affiliateLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/ref/${affiliateCode}`
      : `https://iexcelo.com/ref/${affiliateCode}`;

  useEffect(() => {
    if (!accessToken) return;
    fetchEarningsByCurrency();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

  // Re-fetch referral data when currency changes
  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    fetchReferrals(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, selectedCurrency]);

  // Cleanup debounce timer
  useEffect(() => {
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, []);

  const checkAvailability = useCallback(
    async (code: string) => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
      if (!code.trim()) {
        setAvailabilityStatus({
          checking: false,
          available: null,
          message: "",
        });
        setCodeError("");
        return;
      }
      try {
        await affiliateCodeSchema.validate({ affiliateCode: code });
        setCodeError("");
      } catch (err) {
        if (err instanceof Error) {
          setCodeError(err.message);
          setAvailabilityStatus({
            checking: false,
            available: false,
            message: err.message,
          });
          return;
        }
      }
      setAvailabilityStatus({
        checking: true,
        available: null,
        message: "Checking availability...",
      });
      debounceTimer.current = setTimeout(async () => {
        try {
          const result = await checkCodeAvailability(code);
          setAvailabilityStatus({
            checking: false,
            available: result.available,
            message: result.message || "",
          });
        } catch {
          setAvailabilityStatus({
            checking: false,
            available: false,
            message: "Error checking availability",
          });
        }
      }, 500);
    },
    [checkCodeAvailability],
  );

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Referral link copied!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleModalCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Referral link copied!");
    setModalCopied(true);
    setTimeout(() => setModalCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const encodedLink = encodeURIComponent(affiliateLink);
    const text = encodeURIComponent(
      "Join iExcelo and start your learning journey! Use my link:",
    );
    let url = "";
    switch (platform) {
      case "WhatsApp":
        url = `https://wa.me/?text=${text}%20${encodedLink}`;
        break;
      case "Facebook":
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
        break;
      case "Twitter/X":
        url = `https://twitter.com/intent/tweet?url=${encodedLink}&text=${text}`;
        break;
      case "Instagram":
      case "TikTok":
        navigator.clipboard.writeText(affiliateLink);
        toast.success(`Link copied! Paste it on ${platform}`);
        return;
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const isCodeButtonDisabled =
    !newCode.trim() ||
    isUpdatingCode ||
    !!codeError ||
    availabilityStatus.checking ||
    availabilityStatus.available !== true;

  const handleCodeUpdate = () => {
    if (!availabilityStatus.available) return;
    updateAffiliateCode(newCode, () => {
      setNewCode("");
      setAvailabilityStatus({ checking: false, available: null, message: "" });
    });
  };

  const referralsPerPage = 10;
  const referralsTotalPages = Math.ceil(referralsTotal / referralsPerPage);

  // Only show skeleton on first load — not on refetches (e.g. after code update)
  if (isLoadingDashboard && !dashboard) return <ReferralsSkeleton />;

  const tableColumns = ["Name", "Status", "Earnings", "Date Joined"];
  const tableData = referrals.map((ref) => [
    `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
    ref.hasSubscribed ? "Active" : "Pending",
    ref.totalRevenueGenerated > 0
      ? `${currencySymbol}${ref.totalRevenueGenerated.toLocaleString()}`
      : "—",
    new Date(ref.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  ]);

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-6 flex flex-row items-start justify-between gap-3">
        <div>
          <h1 className="text-[1.125rem] sm:text-xl md:text-2xl font-[600] text-[#171717]">
            Referrals & Invites
          </h1>
          <p className="text-gray-500 text-[.8125rem] sm:text-sm mt-1">
            Start building your learning circle, send invites and earn
            commissions.
          </p>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
          {earningsByCurrency.length > 1 && (
            <div className="hidden sm:flex items-center gap-1.5 flex-wrap">
              {earningsByCurrency.map((e) => (
                <button
                  key={e.currency}
                  onClick={() => setSelectedCurrency(e.currency)}
                  className={`px-3 py-[.3125rem] rounded-full text-[.75rem] font-[600] border transition-colors whitespace-nowrap ${
                    selectedCurrency === e.currency
                      ? "bg-[#007FFF] border-[#007FFF] text-white"
                      : "border-[#D0D5DD] text-[#344054] hover:bg-[#F9FAFB]"
                  }`}
                >
                  {CURRENCY_SYMBOLS[e.currency] ?? ""} {e.currency}
                </button>
              ))}
            </div>
          )}
          {/* Mobile: icon-only round button */}
          <button
            onClick={() => setShowShareModal(true)}
            className="sm:hidden w-9 h-9 rounded-full bg-[#007FFF] text-white flex items-center justify-center flex-shrink-0"
            aria-label="Invite"
          >
            <Icon icon="hugeicons:gift" className="w-4 h-4" />
          </button>
          {/* sm+: full labelled button */}
          <div className="hidden sm:flex">
            <Button onClick={() => setShowShareModal(true)}>
              <Icon icon="hugeicons:gift" className="w-4 h-4 md:w-5 md:h-5" />
              Invite
            </Button>
          </div>
        </div>
      </div>

      {/* Soft nudge — only shown when student hasn't subscribed yet */}
      {!hasEverSubscribed && (
        <div className="mb-6 flex items-start gap-3 p-3 sm:p-4 bg-[#FFF9ED] border border-[#F3A218] rounded-[.75rem]">
          <Icon
            icon="hugeicons:star-01"
            className="w-4 h-4 sm:w-5 sm:h-5 text-[#F3A218] shrink-0 mt-0.5"
          />
          <p className="text-[.8125rem] sm:text-[.875rem] text-[#2B2B2B]">
            You can invite friends now! Once you{" "}
            <strong>subscribe to any plan</strong>, every successful referral
            starts earning you a 15% commission.
          </p>
        </div>
      )}

      {/* Top row: hero card + balance */}
      <div className="flex flex-col lg:flex-row mb-6 gap-[1rem]">
        <div
          style={{
            background:
              "radial-gradient(71.77% 100% at 50.18% 0%, #5A2958 13.03%, #371D52 41.67%, #061023 87.06%)",
          }}
          className="p-[.75rem_1rem] sm:p-[.9375rem_1.25rem] flex items-center justify-between h-auto lg:h-42.5 w-full lg:w-[70%] rounded-[.5rem]"
        >
          <div className="flex h-full justify-between flex-col gap-3 sm:gap-4">
            <div>
              <h2 className="text-[.9375rem] sm:text-[1.125rem] md:text-[1.25rem] mb-1 font-[600] leading-snug sm:leading-7 tracking-[-.4px] text-white">
                {hasEverSubscribed
                  ? "Refer and earn 15% commission"
                  : "Share your referral link"}
              </h2>
              <p className="leading-5 sm:leading-6 font-[400] text-[.8125rem] sm:text-[.875rem] md:text-[1rem] text-[#D0D5DD]">
                {hasEverSubscribed
                  ? "Earn 15% commission every time someone you refer subscribes to any plan"
                  : "Invite friends to iExcelo — subscribe to any plan to start earning commissions on their payments"}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-1.5 sm:p-2 w-fit border-[#E5E8F8] border-[1.5px] rounded-[.5rem] text-[#E5E8F8] flex items-center gap-[.25rem] leading-5 text-[.75rem] sm:text-[.875rem] font-[600]"
            >
              {affiliateLink.length > 32
                ? affiliateLink.slice(0, 32) + "..."
                : affiliateLink}
              <Icon
                icon={copied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
                className="w-5 h-5 text-inherit"
              />
            </button>
          </div>
          <div className="hidden xl:block">
            <SVGClient src="/svg/gift-box.svg" />
          </div>
        </div>

        {/* Available balance card */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="h-auto lg:h-42.5 w-full lg:w-[30%] flex flex-col justify-between p-4 sm:p-5 rounded-[.5rem]"
        >
          <span className="leading-6 sm:leading-7 font-[400] text-[.875rem] sm:text-[1rem] md:text-[1.125rem] text-[#757575]">
            Available Balance
          </span>
          <span className="text-[1.5rem] sm:text-xl md:text-[1.75rem] tracking-[-.56px] leading-8 sm:leading-9 font-[600] text-[#2B2B2B]">
            {currencySymbol}
            {(dashboard?.pendingBalance ?? 0).toLocaleString()}
          </span>
          <div className="flex gap-[.375rem] sm:gap-[.625rem] items-center flex-wrap">
            <span className="text-[#2B2B2B] font-[400] leading-6 sm:leading-7 text-[.875rem] sm:text-[1rem] md:text-[1.125rem]">
              Total rewards:
            </span>
            <span className="leading-7 text-[#757575] text-[1rem] sm:text-[1.125rem] md:text-[1.25rem] font-[500]">
              {currencySymbol}
              {(dashboard?.totalEarnings ?? 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid mb-6 grid-cols-1 sm:grid-cols-3 gap-[1rem]">
        {[
          { label: "Pending Users", value: String(dashboard?.referredNotSubscribed ?? 0) },
          { label: "Active Users", value: String(dashboard?.totalConversions ?? 0) },
          { label: "Total Earnings", value: `${currencySymbol}${(dashboard?.totalEarnings ?? 0).toLocaleString()}` },
        ].map(({ label, value }) => (
          <div key={label} className="border rounded-[.75rem] py-5 sm:py-6 md:py-8 px-3 sm:px-4 border-[#D6D6D6] flex flex-col gap-2 justify-between">
            <span className="text-[#575757] font-[400] leading-5 text-[.8125rem] sm:text-[.875rem]">
              {label}
            </span>
            <span className="tracking-[-.56px] leading-8 sm:leading-9 text-[#2B2B2B] text-[1.375rem] sm:text-xl md:text-[1.75rem] font-[500]">
              {value}
            </span>
          </div>
        ))}
      </div>

      {/* Referrals table */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="max-h-[500px] rounded-[.625rem] overflow-hidden pt-4 mb-6"
      >
        <div className="p-[.375rem_.75rem_.25rem_.75rem] sm:p-[.5rem_1rem_.375rem_1rem] border-b-[1.5px] border-[#007FFF] flex gap-2 items-center w-fit">
          <span className="text-[.875rem] sm:text-[1rem] font-[500] text-[#171717] leading-6">
            Invites
          </span>
          <span className="p-[.125rem_.375rem] rounded-[999999px] text-[.875rem] font-[500] leading-5 bg-[#E5E8F8]">
            {referralsTotal}
          </span>
        </div>

        {isLoadingReferrals ? (
          <div className="flex items-center justify-center py-12">
            <Icon
              icon="svg-spinners:ring-resize"
              className="w-8 h-8 text-[#007FFF]"
            />
          </div>
        ) : (
          <Table shouldNotHaveBorder columns={tableColumns} data={tableData} />
        )}

        {referralsTotalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-[#EAECF0]">
            <span className="text-sm text-[#757575]">
              Page {referralsPage} of {referralsTotalPages}
            </span>
            <div className="flex gap-2">
              <button
                disabled={referralsPage <= 1}
                onClick={() =>
                  fetchReferrals(referralsPage - 1, referralsPerPage)
                }
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                disabled={referralsPage >= referralsTotalPages}
                onClick={() =>
                  fetchReferrals(referralsPage + 1, referralsPerPage)
                }
                className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code + Custom Referral Code */}
      <section className="flex flex-col xl:flex-row gap-6">
        {/* QR Code */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[1rem_.875rem] sm:p-[1.25rem_1rem] md:p-[2rem_1.5rem] flex flex-col items-center"
        >
          <h3 className="text-[.9375rem] sm:text-[1rem] md:text-[1.125rem] font-[500] leading-7 mb-1 sm:mb-2 self-start">
            QR Code
          </h3>
          <p className="text-[.8125rem] sm:text-[.875rem] text-[#757575] mb-4 sm:mb-6 self-start">
            Scan to open your referral link
          </p>
          {affiliateCode ? (
            <>
              <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] mb-4">
                <QRCodeSVG value={affiliateLink} size={200} />
              </div>
              <p className="text-[.75rem] text-[#A6A6A6] text-center">
                {affiliateLink}
              </p>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Icon
                icon="svg-spinners:ring-resize"
                className="w-8 h-8 text-[#007FFF]"
              />
            </div>
          )}
        </div>

        {/* Custom Referral Code */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[1rem_.875rem] sm:p-[1.25rem_1rem] md:p-[2rem_1.5rem]"
        >
          <h3 className="text-[.9375rem] sm:text-[1rem] md:text-[1.125rem] font-[500] leading-7 mb-1 sm:mb-2">
            Custom Referral Code
          </h3>
          <p className="text-[.8125rem] sm:text-[.875rem] text-[#757575] mb-4 sm:mb-6">
            Set a memorable code for your referral link
          </p>

          <div className="mb-4">
            <p className="text-[.8125rem] sm:text-sm text-[#575757] mb-1">Current code</p>
            <p className="text-[.875rem] md:text-[1rem] font-[500] text-[#2B2B2B] bg-[#F3F3F3] rounded-lg p-2 sm:p-3">
              {affiliateCode || "—"}
            </p>
          </div>

          <InputField
            label="New Referral Code"
            name="affiliateCode"
            placeholder="e.g. johnex"
            value={newCode}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => {
              const value = e.target.value;
              setNewCode(value);
              checkAvailability(value);
            }}
            error={codeError}
          />

          {newCode && !codeError && (
            <div className="mt-2">
              {availabilityStatus.checking ? (
                <p className="text-[.75rem] text-[#757575] flex items-center gap-1">
                  <Icon icon="svg-spinners:ring-resize" className="w-3 h-3" />
                  Checking availability...
                </p>
              ) : availabilityStatus.available === true ? (
                <p className="text-[.75rem] text-[#036B26] flex items-center gap-1">
                  <Icon icon="hugeicons:tick-02" className="w-3 h-3" />
                  {availabilityStatus.message}
                </p>
              ) : availabilityStatus.available === false ? (
                <p className="text-[.75rem] text-red-500 flex items-center gap-1">
                  <Icon icon="hugeicons:cancel-01" className="w-3 h-3" />
                  {availabilityStatus.message}
                </p>
              ) : null}
            </div>
          )}

          <p className="text-[.75rem] text-[#A6A6A6] mt-1 mb-4">
            4-30 characters. Letters, numbers, and hyphens only.
          </p>

          <Button onClick={handleCodeUpdate} disabled={isCodeButtonDisabled}>
            {isUpdatingCode ? (
              <Icon icon="svg-spinners:ring-resize" className="w-4 h-4 md:w-5 md:h-5" />
            ) : (
              <Icon icon="hugeicons:edit-02" className="w-4 h-4 md:w-5 md:h-5" />
            )}
            {isUpdatingCode ? "Updating..." : "Update Code"}
          </Button>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <Modal isOpen onClose={() => setShowShareModal(false)} zIndex="z-[1000]" className="rounded-[1rem] p-4 sm:p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[1.125rem] md:text-[1.25rem] font-[600] text-[#171717]">
                Share Your Referral Link
              </h2>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <Icon
                  icon="hugeicons:cancel-01"
                  className="w-6 h-6 text-[#757575]"
                />
              </button>
            </div>
            <p className="text-[.875rem] text-[#757575] mb-6">
              {hasEverSubscribed
                ? "Earn 15% commission for every friend who subscribes using your link."
                : "Invite friends to join iExcelo. Subscribe to a plan to start earning commissions."}
            </p>

            {/* Link + copy */}
            <div className="flex flex-col sm:flex-row gap-2 mb-6">
              <span className="flex-1 bg-[#F3F3F3] rounded-[.5rem] p-3 text-sm truncate text-[#575757]">
                {affiliateLink}
              </span>
              <Button onClick={handleModalCopy} className="w-full sm:w-auto justify-center">
                <Icon
                  icon={modalCopied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
                  className="w-4 h-4 md:w-5 md:h-5"
                />
                {modalCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-center text-[#757575] text-sm mb-6">
              Or share directly via
            </p>

            <div className="flex flex-wrap justify-center gap-4 sm:gap-6">
              {SHARE_PLATFORMS.map((platform, i) => (
                <button
                  key={i}
                  onClick={() => handleShare(platform.name)}
                  className="flex flex-col items-center gap-2 group"
                  title={`Share on ${platform.name}`}
                >
                  <div
                    className="w-12 h-12 flex items-center justify-center rounded-full transition-transform group-hover:scale-110"
                    style={{ backgroundColor: `${platform.color}18` }}
                  >
                    <Icon
                      icon={platform.icon}
                      className="w-6 h-6"
                      style={{ color: platform.color }}
                    />
                  </div>
                  <span className="text-xs text-[#757575]">
                    {platform.name}
                  </span>
                </button>
              ))}
            </div>
        </Modal>
      )}
    </section>
  );
};

export default Referrals;
