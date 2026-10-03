"use client";

import { Button, SVGClient } from "@/components/atoms";
import { InputField, Modal, Table } from "@/components/molecules";
import { useAffiliateStore, useAuthStore } from "@/store";
import { affiliateCodeSchema } from "@/schemas/affiliate.schema";
import { Icon } from "@iconify/react";
import { QRCodeSVG } from "qrcode.react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import SponsorReferralsSkeleton from "./SponsorReferralsSkeleton";

const SHARE_PLATFORMS = [
  { icon: "hugeicons:whatsapp", name: "WhatsApp", color: "#25D366" },
  { icon: "hugeicons:facebook-02", name: "Facebook", color: "#1877F2" },
  { icon: "hugeicons:new-twitter", name: "Twitter/X", color: "#000000" },
  { icon: "hugeicons:instagram", name: "Instagram", color: "#E4405F" },
  { icon: "hugeicons:tiktok", name: "TikTok", color: "#161823" },
];

const SponsorReferrals = () => {
  const { accessToken } = useAuthStore();
  const {
    dashboard,
    referrals,
    referralsTotal,
    referralsPage,
    isLoadingDashboard,
    isLoadingReferrals,
    isUpdatingCode,
    fetchDashboard,
    fetchReferrals,
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

  const affiliateCode = dashboard?.affiliateCode || "";
  const affiliateLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/ref/${affiliateCode}`
      : `https://iexcelo.com/ref/${affiliateCode}`;

  useEffect(() => {
    if (!accessToken) return;
    fetchDashboard();
    fetchReferrals(1, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken]);

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

  const referralsPerPage = 10;
  const referralsTotalPages = Math.ceil(referralsTotal / referralsPerPage);

  if (isLoadingDashboard && !dashboard) return <SponsorReferralsSkeleton />;

  const tableColumns = ["Name", "Status", "Date Joined"];
  const tableData = referrals.map((ref) => [
    `${ref.referredUser.firstName} ${ref.referredUser.lastName}`,
    ref.hasSubscribed ? "Active" : "Pending",
    new Date(ref.createdAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }),
  ]);

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-[600] text-[#171717]">
            Referrals & Invites
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Share your referral link and grow the iExcelo community.
          </p>
        </div>
        <Button onClick={() => setShowShareModal(true)}>
          <Icon icon="hugeicons:gift" className="w-5 h-5" />
          Invite
        </Button>
      </div>

      {/* Hero card — referral link only (no earnings) */}
      <div className="flex mb-6.5 gap-[1rem]">
        <div
          style={{
            background:
              "radial-gradient(71.77% 100% at 50.18% 0%, #5A2958 13.03%, #371D52 41.67%, #061023 87.06%)",
          }}
          className="p-[.9375rem_1.25rem] flex items-center justify-between h-42.5 w-full rounded-[.5rem]"
        >
          <div className="flex h-full justify-between flex-col">
            <div>
              <h2 className="text-[1.25rem] mb-1 font-[600] leading-7 tracking-[-.4px] text-white">
                Share your referral link
              </h2>
              <p className="leading-6 font-[400] text-[1rem] text-[#D0D5DD]">
                Invite friends and colleagues to join iExcelo — help them start
                their learning journey
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="p-2 w-fit border-[#E5E8F8] border-[1.5px] rounded-[.5rem] text-[#E5E8F8] flex items-center gap-[.25rem] leading-5 text-[.875rem] font-[600]"
            >
              {affiliateLink.length > 40
                ? affiliateLink.slice(0, 40) + "..."
                : affiliateLink}
              <Icon
                icon={copied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
                className="w-5 h-5 text-inherit"
              />
            </button>
          </div>
          <SVGClient src="/svg/gift-box.svg" />
        </div>
      </div>

      {/* Invites table */}
      <div
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="max-h-[500px] rounded-[.625rem] overflow-hidden pt-4 mb-6"
      >
        <div className="p-[.5rem_1rem_.375rem_1rem] border-b-[1.5px] border-[#007FFF] flex gap-2 items-center w-fit">
          <span className="text-[1rem] font-[500] text-[#171717] leading-6">
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
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[2rem_1.5rem] flex flex-col items-center"
        >
          <h3 className="text-[1.125rem] font-[500] leading-7 mb-2 self-start">
            QR Code
          </h3>
          <p className="text-[.875rem] text-[#757575] mb-6 self-start">
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
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <h3 className="text-[1.125rem] font-[500] leading-7 mb-2">
            Custom Referral Code
          </h3>
          <p className="text-[.875rem] text-[#757575] mb-6">
            Set a memorable code for your referral link
          </p>

          <div className="mb-4">
            <p className="text-sm text-[#575757] mb-1">Current code</p>
            <p className="text-[1rem] font-[500] text-[#2B2B2B] bg-[#F3F3F3] rounded-lg p-3">
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
              <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
            ) : (
              <Icon icon="hugeicons:edit-02" className="w-5 h-5" />
            )}
            {isUpdatingCode ? "Updating..." : "Update Code"}
          </Button>
        </div>
      </section>

      {/* Share Modal */}
      {showShareModal && (
        <Modal isOpen onClose={() => setShowShareModal(false)} zIndex="z-[1000]" className="rounded-[1rem] p-8 w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[1.25rem] font-[600] text-[#171717]">
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
              Invite friends to join iExcelo using your referral link.
            </p>

            <div className="flex gap-2 mb-8">
              <span className="flex-1 bg-[#F3F3F3] rounded-[.5rem] p-3 text-sm truncate text-[#575757]">
                {affiliateLink}
              </span>
              <Button onClick={handleModalCopy}>
                <Icon
                  icon={modalCopied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
                  className="w-5 h-5"
                />
                {modalCopied ? "Copied!" : "Copy"}
              </Button>
            </div>

            <p className="text-center text-[#757575] text-sm mb-6">
              Or share directly via
            </p>

            <div className="flex justify-center gap-6">
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

export default SponsorReferrals;
