import { useState } from "react";
import { Building2, MapPin, Code, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ReferralSlotProps {
  id: string;
  company: string;
  role: string;
  location: string;
  skills: string[];
  minTrust: number;
  slotsLeft: number;
  totalSlots: number;
}

const ReferralSlotCard = ({ id, company, role, location, skills, minTrust, slotsLeft, totalSlots }: ReferralSlotProps) => {
  return (
    <div className="glass rounded-2xl p-5 hover:glow-border transition-all duration-300 group">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-display font-semibold">{role}</h4>
          <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
            <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{company}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{location}</span>
          </div>
        </div>
        <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">Trust ≥ {minTrust}</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {skills.map((s) => (
          <span key={s} className="text-[11px] bg-secondary px-2 py-0.5 rounded-md text-secondary-foreground flex items-center gap-1">
            <Code className="h-3 w-3" />{s}
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Users className="h-3 w-3" />{slotsLeft}/{totalSlots} slots remaining
        </span>
      </div>
    </div>
  );
};

export default ReferralSlotCard;
