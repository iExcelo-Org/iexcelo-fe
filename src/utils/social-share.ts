export const SHARE_PLATFORMS = [
  { icon: "hugeicons:facebook-02", name: "Facebook" },
  { icon: "hugeicons:tiktok", name: "TikTok" },
  { icon: "hugeicons:new-twitter", name: "Twitter" },
  { icon: "hugeicons:instagram", name: "Instagram" },
  { icon: "hugeicons:whatsapp", name: "WhatsApp" },
];

export function buildShareUrl(platform: string, link: string): string | null {
  const encodedLink = encodeURIComponent(link);
  const text = encodeURIComponent(
    "Join iExcelo and start your learning journey!",
  );
  switch (platform) {
    case "Facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedLink}`;
    case "Twitter":
      return `https://twitter.com/intent/tweet?url=${encodedLink}&text=${text}`;
    case "WhatsApp":
      return `https://wa.me/?text=${text}%20${encodedLink}`;
    default:
      return null;
  }
}
