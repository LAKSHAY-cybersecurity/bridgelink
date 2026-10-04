// Timezone preference stored in localStorage. "auto" = browser-detected.
const KEY = "bl_timezone";

export const getStoredTimezone = (): string => {
  if (typeof window === "undefined") return "auto";
  return localStorage.getItem(KEY) || "auto";
};

export const setStoredTimezone = (tz: string) => {
  localStorage.setItem(KEY, tz);
  window.dispatchEvent(new Event("bl:tz-changed"));
};

export const resolveTimezone = (pref?: string): string => {
  const v = pref || getStoredTimezone();
  if (!v || v === "auto") return Intl.DateTimeFormat().resolvedOptions().timeZone;
  return v;
};

export const formatTime = (iso: string | Date, pref?: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", timeZone: resolveTimezone(pref) });

export const formatDateTime = (iso: string | Date, pref?: string) =>
  new Date(iso).toLocaleString([], { timeZone: resolveTimezone(pref) });

// Common IANA zones for the selector
export const COMMON_TIMEZONES = [
  "auto",
  "UTC",
  "America/Los_Angeles",
  "America/Denver",
  "America/Chicago",
  "America/New_York",
  "America/Sao_Paulo",
  "Europe/London",
  "Europe/Berlin",
  "Europe/Paris",
  "Europe/Moscow",
  "Africa/Johannesburg",
  "Asia/Dubai",
  "Asia/Kolkata",
  "Asia/Singapore",
  "Asia/Shanghai",
  "Asia/Tokyo",
  "Australia/Sydney",
  "Pacific/Auckland",
];
