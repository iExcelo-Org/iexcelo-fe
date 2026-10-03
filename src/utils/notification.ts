import type { NotificationType } from "@/types";

export function notifIcon(type: NotificationType): string {
  switch (type) {
    case "new_message":
      return "hugeicons:bubble-chat-notification";
    case "new_chatroom":
      return "hugeicons:messenger";
    case "giveback_activated":
      return "hugeicons:healtcare";
    case "subscription_expiring":
    case "subscription_expired":
      return "hugeicons:wallet-01";
    case "exam_result":
      return "hugeicons:book-open-02";
    default:
      return "hugeicons:notification-01";
  }
}
