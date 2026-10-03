"use client";

import { Button } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { useAffiliateStore } from "@/store";
import { affiliateCodeSchema } from "@/schemas/affiliate.schema";
import { Icon } from "@iconify/react";
import React, { useState, useCallback, useRef, useEffect } from "react";
import { toast } from "sonner";
import { QRCodeSVG } from "qrcode.react";
import {
  SHARE_PLATFORMS,
  buildShareUrl,
  buildAffiliateLink,
} from "@/utils";

const Links = () => {
  const {
    profile,
    isUpdatingCode,
    updateAffiliateCode,
    checkCodeAvailability,
  } = useAffiliateStore();

  const [newCode, setNewCode] = useState("");
  const [codeError, setCodeError] = useState("");
  const [copied, setCopied] = useState(false);
  const [availabilityStatus, setAvailabilityStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({ checking: false, available: null, message: "" });

  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Debounced code availability check
  const checkAvailability = useCallback(
    async (code: string) => {
      // Clear any existing timer
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }

      // Reset if empty
      if (!code.trim()) {
        setAvailabilityStatus({
          checking: false,
          available: null,
          message: "",
        });
        setCodeError("");
        return;
      }

      // Check Yup validation first
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

      // Set checking state
      setAvailabilityStatus({
        checking: true,
        available: null,
        message: "Checking availability...",
      });

      // Debounce the API call
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

  const affiliateCode = profile?.affiliateCode || "";
  const affiliateLink = buildAffiliateLink(affiliateCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(affiliateLink);
    toast.success("Link copied to clipboard!");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    if (platform === "TikTok" || platform === "Instagram") {
      navigator.clipboard.writeText(affiliateLink);
      toast.success("Link copied! Paste it on " + platform);
      return;
    }
    const url = buildShareUrl(platform, affiliateLink);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCodeUpdate = async () => {
    // Only allow update if code is available
    if (!availabilityStatus.available) {
      return;
    }

    updateAffiliateCode(newCode, () => {
      setNewCode("");
      setAvailabilityStatus({ checking: false, available: null, message: "" });
    });
  };

  // Button should be disabled if:
  // - No code entered
  // - Currently updating
  // - Yup validation failed
  // - Code is not available (checking or unavailable)
  const isButtonDisabled =
    !newCode.trim() ||
    isUpdatingCode ||
    !!codeError ||
    availabilityStatus.checking ||
    availabilityStatus.available !== true;

  return (
    <section className="xl:px-[2rem] px-[.875rem] py-[1.25rem] mx-auto">
      <section className="mb-8">
        <h1 className="text-2xl font-[600] text-[#171717]">Affiliate Links</h1>
        <p className="text-gray-500 text-sm mt-1">
          Manage and share your unique affiliate link
        </p>
      </section>

      {/* Affiliate Link Banner */}
      <section
        style={{
          boxShadow:
            "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
        }}
        className="bg-[#E5E8F8] border-[#39F] border rounded-[1rem] p-[2rem_1.5rem_1.5rem_1.5rem]"
      >
        <div className="flex gap-[1rem] mb-7 items-center">
          <div
            style={{ boxShadow: "0 3px 14px 0 rgba(0, 0, 0, 0.08)" }}
            className="w-10 flex items-center justify-center rounded-[50%] bg-[#E5E8F8] h-10"
          >
            <Icon
              className="w-6 h-6 text-[#007FFF]"
              icon={"hugeicons:link-01"}
            />
          </div>
          <div className="flex flex-col gap-[.25rem]">
            <span className="text-[#2B2B2B] text-[1.125rem] font-[500] leading-7 block">
              Your Unique Affiliate Link
            </span>
            <span className="leading-5 font-[400] text-[.875rem] text-[#757575]">
              Share this link to start earning commissions
            </span>
          </div>
        </div>

        <div className="flex gap-[.5rem] items-stretch">
          <span className="flex-1 bg-[#FAFAFA] h-full rounded-[1.5rem] p-[.75rem_1rem] border border-[#D6D6D6] text-[.875rem] truncate">
            {affiliateLink}
          </span>
          <Button onClick={handleCopy}>
            <Icon
              className="w-5 h-5"
              icon={copied ? "hugeicons:tick-01" : "hugeicons:copy-01"}
            />
            {copied ? "Copied!" : "Copy Link"}
          </Button>
        </div>

        <div className="flex gap-13 w-fit mx-auto mt-6 items-center">
          {SHARE_PLATFORMS.map((social, index) => (
            <button
              key={`__social__icon__${index}__`}
              onClick={() => handleShare(social.name)}
              title={`Share on ${social.name}`}
            >
              <Icon className="w-8 h-8" icon={social.icon} />
            </button>
          ))}
        </div>
      </section>

      {/* QR Code + Custom Code Section */}
      <section className="flex flex-col xl:flex-row mt-6 gap-6">
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
            Scan to open your affiliate link
          </p>
          <div className="bg-white p-4 rounded-xl border border-[#D6D6D6] mb-4">
            <QRCodeSVG value={affiliateLink} size={200} />
          </div>
          <p className="text-[.75rem] text-[#A6A6A6] text-center">
            {affiliateLink}
          </p>
        </div>

        {/* Custom Affiliate Code */}
        <div
          style={{
            boxShadow:
              "0 0 0 1px rgba(0, 0, 0, 0.06), 0 5px 22px 0 rgba(0, 0, 0, 0.04)",
          }}
          className="xl:w-[50%] w-full bg-white rounded-[.75rem] p-[2rem_1.5rem]"
        >
          <h3 className="text-[1.125rem] font-[500] leading-7 mb-2">
            Custom Affiliate Code
          </h3>
          <p className="text-[.875rem] text-[#757575] mb-6">
            Set a memorable code for your affiliate link
          </p>

          <div className="mb-4">
            <p className="text-sm text-[#575757] mb-1">Current code</p>
            <p className="text-[1rem] font-[500] text-[#2B2B2B] bg-[#F3F3F3] rounded-lg p-3">
              {affiliateCode || "—"}
            </p>
          </div>

          <InputField
            label="New Affiliate Code"
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

          {/* Availability status */}
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

          <Button onClick={handleCodeUpdate} disabled={isButtonDisabled}>
            {isUpdatingCode ? (
              <Icon icon="svg-spinners:ring-resize" className="w-5 h-5" />
            ) : (
              <Icon icon="hugeicons:edit-02" className="w-5 h-5" />
            )}
            {isUpdatingCode ? "Updating..." : "Update Code"}
          </Button>
        </div>
      </section>
    </section>
  );
};

export default Links;
