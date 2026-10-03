import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { toast } from "sonner";
import type { IUtilsStore } from "@/types";
import { api, authRequest } from "@/lib/api";
import { handleAxiosError } from "@/utils";

const MAX_IMAGE_UPLOAD_SIZE = 10 * 1024 * 1024; // 10 MB

export const useUtilsStore = create<IUtilsStore>()(
  persist(
    (set, get) => ({
      countries: [],
      examTypes: [],
      subjects: [],
      isUploadingImage: false,

      setCountries: (countries) => set({ countries }),

      setExamTypes: (examTypes) => set({ examTypes }),

      setSubjects: (subjects) => set({ subjects }),

      fetchSubjectsByExamType: async (examTypeId: string) => {
        try {
          const response = await api.get(`/exams/types/${examTypeId}/subjects`);
          const subjects = response.data.data;
          set({ subjects });
          return subjects;
        } catch {
          // Silent fetch, they may just have to refresh, haha
          return [];
        }
      },

      uploadImage: async (file, folder) => {
        if (file.size > MAX_IMAGE_UPLOAD_SIZE) {
          toast.error("Image must be under 10 MB");
          return null;
        }
        set({ isUploadingImage: true });
        try {
          const formData = new FormData();
          formData.append("image", file);
          const res = await authRequest({
            method: "POST",
            url: `/upload/image?folder=${encodeURIComponent(folder)}`,
            data: formData,
          });
          return res.data.data.url as string;
        } catch (error) {
          handleAxiosError(error, "Image upload failed");
          return null;
        } finally {
          set({ isUploadingImage: false });
        }
      },

      subscribeToPush: async () => {
        // Guard: browser support
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator) || !("PushManager" in window))
          return;
        // Guard: user already said no — never nag again
        if (Notification.permission === "denied") return;

        try {
          // Register (or get existing) service worker, then wait for it to be active
          await navigator.serviceWorker.register("/sw.js", { scope: "/" });
          const registration = await navigator.serviceWorker.ready;

          // Check if already subscribed on this device
          const existing = await registration.pushManager.getSubscription();
          if (existing) {
            // Sync existing subscription to backend (covers re-login on same device)
            const json = existing.toJSON();
            await authRequest({
              method: "POST",
              url: "/notifications/push-subscriptions",
              data: {
                endpoint: existing.endpoint,
                keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
              },
            });
            return;
          }

          // Not subscribed yet — request permission
          const permission = await Notification.requestPermission();
          if (permission !== "granted") return;

          const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
          if (!vapidPublicKey) {
            console.warn(
              "[push] NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set — push subscription skipped",
            );
            return;
          }

          // Convert VAPID key from base64 to Uint8Array
          const urlBase64ToUint8Array = (base64String: string) => {
            const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
            const base64 = (base64String + padding)
              .replace(/-/g, "+")
              .replace(/_/g, "/");
            const rawData = window.atob(base64);
            return Uint8Array.from([...rawData].map((c) => c.charCodeAt(0)));
          };

          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
          });

          const json = subscription.toJSON();
          await authRequest({
            method: "POST",
            url: "/notifications/push-subscriptions",
            data: {
              endpoint: subscription.endpoint,
              keys: { p256dh: json.keys?.p256dh, auth: json.keys?.auth },
            },
          });
        } catch (err) {
          console.error("[push] subscribeToPush failed:", err);
          handleAxiosError(err, "Failed to register push notifications");
        }
      },

      unsubscribeFromPush: async () => {
        if (typeof window === "undefined") return;
        if (!("serviceWorker" in navigator)) return;
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          if (!subscription) return;
          await authRequest({
            method: "DELETE",
            url: "/notifications/push-subscriptions",
            data: { endpoint: subscription.endpoint },
          });
          await subscription.unsubscribe();
        } catch {
          // Silent
        }
      },

      getCountryByIsoCode: (isoCode) => {
        const { countries } = get();
        return countries.find((country) => country.isoCode === isoCode);
      },

      getExamTypeById: (id) => {
        const { examTypes } = get();
        return examTypes.find((examType) => examType.id === id);
      },

      getSubjectsByExamType: (examTypeId) => {
        const { subjects } = get();
        return subjects.filter((subject) => subject.examTypeId === examTypeId);
      },
    }),
    {
      name: "utils-storage",
      storage: createJSONStorage(() => localStorage),
      // Don't persist transient upload state
      partialize: (state) => ({
        countries: state.countries,
        examTypes: state.examTypes,
        subjects: state.subjects,
      }),
    },
  ),
);
