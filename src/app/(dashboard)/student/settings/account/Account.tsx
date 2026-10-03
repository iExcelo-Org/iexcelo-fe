/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Icon } from "@iconify/react";
import { Button } from "@/components/atoms";
import { InputField } from "@/components/molecules";
import { Modal } from "@/components/molecules/Modal";
import { useAuthStore, useSettingsStore, useUtilsStore } from "@/store";
import { accountSchema, AccountFormData } from "@/schemas";
import { CARD_SHADOW } from "@/utils";
import { defaultCountries, parseCountry } from "react-international-phone";

// ── helpers ───────────────────────────────────────────────────────────────────

function buildInitialPhone(countryCode?: string | null, phoneNumber?: string | null): string {
  if (!phoneNumber) return "";
  // Already a full E.164 value
  if (phoneNumber.startsWith("+")) return phoneNumber;
  // Combine stored countryCode (e.g. "+234" or "234") with national number
  if (countryCode) {
    const code = countryCode.startsWith("+") ? countryCode : `+${countryCode}`;
    return `${code}${phoneNumber}`;
  }
  return phoneNumber;
}

function splitPhone(combined: string): { countryCode: string; phoneNumber: string } {
  if (!combined || !combined.startsWith("+")) return { countryCode: "", phoneNumber: combined };
  const options = defaultCountries.map((raw) => {
    const { iso2, dialCode } = parseCountry(raw);
    return { iso2, dialCode };
  });
  const match = options.find((c) => combined.startsWith(`+${c.dialCode}`));
  if (!match) return { countryCode: "", phoneNumber: combined };
  return {
    countryCode: `+${match.dialCode}`,
    phoneNumber: combined.slice(match.dialCode.length + 1),
  };
}

// ── sub-components ────────────────────────────────────────────────────────────

function SectionCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ boxShadow: CARD_SHADOW }} className="rounded-[.75rem] bg-white p-[1.5rem]">
      <div className="mb-[1.25rem]">
        <h2 className="text-[1rem] font-[600] text-[#101828]">{title}</h2>
        {description && <p className="text-[.875rem] text-[#667085] mt-[.25rem]">{description}</p>}
      </div>
      {children}
    </div>
  );
}

// ── main ──────────────────────────────────────────────────────────────────────

export default function Account() {
  const { user } = useAuthStore();
  const { updateProfile, updatingProfile, deleteAccount, deletingAccount } = useSettingsStore();
  const { uploadImage, isUploadingImage } = useUtilsStore();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<AccountFormData>({
    resolver: yupResolver(accountSchema) as any,
    mode: "onChange",
  });

  useEffect(() => {
    if (!user) return;
    reset({
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      phone: buildInitialPhone(user.countryCode, user.phoneNumber),
    });
  }, [user?.firstName, user?.lastName, user?.phoneNumber, user?.countryCode]);

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = await uploadImage(file, "pfps");
    if (url) await updateProfile({ picture: url });
    e.target.value = "";
  };

  const onSubmit = async (data: AccountFormData) => {
    const { countryCode, phoneNumber } = splitPhone(data.phone ?? "");
    await updateProfile({
      firstName: data.firstName,
      lastName: data.lastName,
      ...(phoneNumber && { phoneNumber, countryCode }),
    });
  };

  const handleDeleteAccount = async () => {
    await deleteAccount(() => setShowDeleteModal(false));
  };

  const initials =
    `${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() || "?";

  return (
    <div className="flex flex-col gap-5">
      {/* Profile Photo */}
      <SectionCard title="Profile Photo" description="Update your profile picture">
        <div className="flex items-center gap-4">
          <div className="relative w-[4.5rem] h-[4.5rem] shrink-0">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="w-full h-full rounded-full bg-[#007FFF] flex items-center justify-center text-white text-[1.25rem] font-[600]">
                {initials}
              </div>
            )}
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingImage}
              className="absolute bottom-0 right-0 w-6 h-6 bg-white rounded-full border border-[#D0D5DD] flex items-center justify-center shadow-sm hover:bg-[#F9FAFB] transition-colors disabled:opacity-50"
            >
              {isUploadingImage ? (
                <Icon icon="hugeicons:loading-03" className="w-3 h-3 text-[#667085] animate-spin" />
              ) : (
                <Icon icon="hugeicons:camera-01" className="w-3 h-3 text-[#667085]" />
              )}
            </button>
          </div>
          <div>
            <button
              onClick={handleAvatarClick}
              disabled={isUploadingImage}
              className="text-[.875rem] font-[500] text-[#007FFF] hover:underline disabled:opacity-50"
            >
              {isUploadingImage ? "Uploading..." : "Change photo"}
            </button>
            <p className="text-[.75rem] text-[#667085] mt-[.125rem]">JPG, PNG or GIF — max 5 MB</p>
          </div>
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="hidden"
          onChange={handleFileChange}
        />
      </SectionCard>

      {/* Personal Info */}
      <SectionCard title="Personal Information" description="Update your name and phone number">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputField
              label="First Name"
              placeholder="Enter first name"
              error={errors.firstName?.message}
              {...register("firstName")}
            />
            <InputField
              label="Last Name"
              placeholder="Enter last name"
              error={errors.lastName?.message}
              {...register("lastName")}
            />
          </div>

          <InputField
            type="tel"
            label="Phone Number"
            placeholder="801 234 5678"
            value={watch("phone") ?? ""}
            onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValue("phone", e.target.value, { shouldDirty: true })}
            error={errors.phone?.message}
          />

          <InputField
            label="Email Address"
            value={user?.email ?? ""}
            readOnly
            disabled
          />

          {user?.studentProfile?.defaultExamTypeId && (
            <InputField
              label="Exam Type"
              value={user?.examType?.name ?? "—"}
              readOnly
              disabled
            />
          )}

          <div className="flex justify-end mt-2">
            <Button type="submit" loading={updatingProfile} disabled={!isDirty || updatingProfile}>
              Save Changes
            </Button>
          </div>
        </form>
      </SectionCard>

      {/* Referral Code */}
      {user?.referralCode && (
        <SectionCard title="Referral Code" description="Share this code to earn rewards when friends sign up">
          <div className="flex items-center gap-3">
            <div className="flex-1 px-[.875rem] py-[.625rem] bg-[#F9FAFB] border border-[#D0D5DD] rounded-[.5rem] text-[.875rem] font-[600] text-[#344054] tracking-wider">
              {user.referralCode}
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(user.referralCode)}
              className="flex items-center gap-2 px-3 py-[.625rem] rounded-[.5rem] border border-[#D0D5DD] text-[.875rem] font-[500] text-[#344054] hover:bg-[#F9FAFB] transition-colors"
            >
              <Icon icon="hugeicons:copy-01" className="w-4 h-4" />
              Copy
            </button>
          </div>
        </SectionCard>
      )}

      {/* Danger Zone */}
      <SectionCard title="Danger Zone">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[.875rem] font-[500] text-[#344054]">Delete Account</p>
            <p className="text-[.8125rem] text-[#667085] mt-[.25rem]">
              Permanently delete your account and all data. This cannot be undone.
            </p>
          </div>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="shrink-0 px-4 py-2 rounded-[.5rem] text-[.875rem] font-[500] text-[#D42620] bg-[#FEF3F2] border border-[#FECDCA] hover:bg-[#FEE4E2] hover:border-[#F97066] focus:outline-none focus:ring-2 focus:ring-[#FDA29B] transition-colors"
          >
            Delete Account
          </button>
        </div>
      </SectionCard>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !deletingAccount && setShowDeleteModal(false)}
        className="w-full max-w-[28rem] rounded-[1rem] p-6"
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="w-10 h-10 rounded-full bg-[#FEF3F2] flex items-center justify-center shrink-0">
            <Icon icon="hugeicons:delete-02" className="w-5 h-5 text-[#D42620]" />
          </div>
          <div>
            <h3 className="text-[1rem] font-[600] text-[#101828]">Delete Account</h3>
            <p className="text-[.875rem] text-[#667085] mt-1">
              Are you sure you want to delete your account? All your data — exam history, progress, and
              subscriptions — will be permanently removed. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            onClick={() => setShowDeleteModal(false)}
            disabled={deletingAccount}
            className="px-4 py-2 rounded-[.5rem] text-[.875rem] font-[500] text-[#344054] bg-white border border-[#D0D5DD] hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#D0D5DD] transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleDeleteAccount}
            disabled={deletingAccount}
            className="flex items-center gap-2 px-4 py-2 rounded-[.5rem] text-[.875rem] font-[500] text-white bg-[#D42620] hover:bg-[#B91C1C] focus:outline-none focus:ring-2 focus:ring-[#FDA29B] transition-colors disabled:opacity-50"
          >
            {deletingAccount && <Icon icon="svg-spinners:ring-resize" className="w-4 h-4" />}
            Yes, Delete My Account
          </button>
        </div>
      </Modal>
    </div>
  );
}
