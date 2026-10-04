import { useEffect, useState } from "react";
import { COMMON_TIMEZONES, getStoredTimezone, setStoredTimezone, resolveTimezone } from "@/lib/timezone";
import { Globe } from "lucide-react";

const TimezoneSelector = ({ compact = false }: { compact?: boolean }) => {
  const [tz, setTz] = useState(getStoredTimezone());

  useEffect(() => {
    const handler = () => setTz(getStoredTimezone());
    window.addEventListener("bl:tz-changed", handler);
    return () => window.removeEventListener("bl:tz-changed", handler);
  }, []);

  const change = (v: string) => {
    setTz(v);
    setStoredTimezone(v);
  };

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
      <Globe className="h-3.5 w-3.5" />
      {!compact && <span>Timezone:</span>}
      <select
        value={tz}
        onChange={(e) => change(e.target.value)}
        className="h-7 rounded-md border border-input bg-background px-1.5 text-xs"
        title={`Showing times in ${resolveTimezone(tz)}`}
      >
        {COMMON_TIMEZONES.map((z) => (
          <option key={z} value={z}>
            {z === "auto" ? `Auto (${Intl.DateTimeFormat().resolvedOptions().timeZone})` : z}
          </option>
        ))}
      </select>
    </div>
  );
};

export default TimezoneSelector;
