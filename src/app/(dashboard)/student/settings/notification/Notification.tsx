"use client";

import { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import { Switch } from "@/components/atoms";
import { useAuthStore, useSettingsStore, useUtilsStore } from "@/store";
import { CARD_SHADOW } from "@/utils";

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

function NotifRow({
  icon,
  label,
  description,
  value,
  onChange,
  disabled,
  tooltip,
}: {
  icon: string;
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
  tooltip?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-[1rem] border-b border-[#F2F4F7] last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="mt-[.125rem] w-8 h-8 rounded-[.5rem] bg-[#EFF8FF] flex items-center justify-center shrink-0">
          <Icon icon={icon} className="w-4 h-4 text-[#007FFF]" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-[.875rem] font-[500] text-[#344054]">{label}</p>
            {tooltip && (
              <div className="relative group">
                <Icon icon="hugeicons:information-circle" className="w-4 h-4 text-[#98A2B3] cursor-help" />
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-10 w-52 px-3 py-2 bg-[#101828] text-white text-[.75rem] rounded-[.5rem] shadow-lg pointer-events-none">
                  {tooltip}
                </div>
              </div>
            )}
          </div>
          <p className="text-[.8125rem] text-[#667085] mt-[.125rem]">{description}</p>
        </div>
      </div>
      <div className={disabled ? "opacity-40 pointer-events-none" : ""}>
        <Switch value={value} onChange={onChange} />
      </div>
    </div>
  );
}

type EmailPrefKey = "newsletterOptIn" | "promotionsOptIn" | "productUpdatesOptIn" | "securityAlertsOptIn";

export default function Notification() {
  const { user } = useAuthStore();
  const { updateNotificationPreferences, updatingNotifPrefs } = useSettingsStore();
  const { subscribeToPush, unsubscribeFromPush } = useUtilsStore();

  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;
    navigator.serviceWorker.ready.then(async (reg) => {
      const sub = await reg.pushManager.getSubscription();
      setPushEnabled(!!sub);
    });
  }, []);

  const handlePushToggle = async (enabled: boolean) => {
    setPushEnabled(enabled);
    if (enabled) await subscribeToPush();
    else await unsubscribeFromPush();
  };

  const handleEmailPref = async (key: EmailPrefKey, value: boolean) => {
    await updateNotificationPreferences({ [key]: value });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Push Notifications */}
      <SectionCard
        title="Push Notifications"
        description="Control how you receive real-time alerts on your devices"
      >
        <NotifRow
          icon="hugeicons:computer"
          label="Desktop Notifications"
          description="Receive push alerts in your browser for exam reminders, results, and important updates"
          value={pushEnabled}
          onChange={handlePushToggle}
        />
        <NotifRow
          icon="hugeicons:smart-phone-01"
          label="Mobile Notifications"
          description="Receive push alerts on your mobile device"
          value={false}
          onChange={() => {}}
          disabled
          tooltip="Coming soon — mobile app not yet available"
        />
      </SectionCard>

      {/* Email Notifications */}
      <SectionCard
        title="Email Notifications"
        description="Choose which types of emails iExcelo can send you. You can unsubscribe at any time."
      >
        <NotifRow
          icon="hugeicons:news-01"
          label="Newsletter"
          description="Weekly digest of top resources, student tips, and what's new on the platform"
          value={user?.newsletterOptIn ?? true}
          onChange={(v) => handleEmailPref("newsletterOptIn", v)}
          disabled={updatingNotifPrefs}
        />
        <NotifRow
          icon="hugeicons:sale-tag-01"
          label="Promotions & Offers"
          description="Special discounts, subscription deals, and time-limited offers from iExcelo"
          value={user?.promotionsOptIn ?? true}
          onChange={(v) => handleEmailPref("promotionsOptIn", v)}
          disabled={updatingNotifPrefs}
        />
        <NotifRow
          icon="hugeicons:rocket-01"
          label="Product Updates"
          description="New features, improvements, and announcements about changes to the iExcelo platform"
          value={user?.productUpdatesOptIn ?? true}
          onChange={(v) => handleEmailPref("productUpdatesOptIn", v)}
          disabled={updatingNotifPrefs}
        />
        <NotifRow
          icon="hugeicons:shield-01"
          label="Security Alerts"
          description="General security notices and awareness emails from the iExcelo team. Does not include account-specific security alerts, which are always sent."
          value={user?.securityAlertsOptIn ?? true}
          onChange={(v) => handleEmailPref("securityAlertsOptIn", v)}
          disabled={updatingNotifPrefs}
        />
      </SectionCard>
    </div>
  );
}
