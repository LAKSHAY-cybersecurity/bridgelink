import { Profile } from "@/contexts/AuthContext";

const TrustScoreCard = ({ score = 0, profile }: { score?: number; profile?: Profile | null }) => {
  const isReferrer = profile?.role === "referrer";
  const displayScore = isReferrer ? (profile?.credibility_score ?? 0) : score;
  const level = displayScore >= 70 ? "High" : displayScore >= 40 ? "Medium" : "Low";
  const levelColor = displayScore >= 70 ? "text-success" : displayScore >= 40 ? "text-warning" : "text-destructive";

  const metrics = isReferrer
    ? [
        { label: "Work Email", val: profile?.work_email ? 100 : 0 },
        { label: "LinkedIn", val: profile?.linkedin_url ? 100 : 0 },
        { label: "Company", val: profile?.company ? 100 : 0 },
        { label: "Verified", val: profile?.verified ? 100 : 0 },
      ]
    : [
        { label: "GitHub", val: profile?.github_integrity_score ?? 0 },
        { label: "LeetCode", val: profile?.leetcode_authenticity_score ?? 0 },
        { label: "Behavior", val: profile?.behavioral_score ?? 0 },
        { label: "Portfolio", val: profile?.portfolio_strength_score ?? 0 },
      ];

  const title = isReferrer ? "Credibility Score" : "Trust Score";

  return (
    <div className="glass rounded-2xl p-6 glow-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-semibold">{title}</h3>
        <span className={`text-xs font-semibold ${levelColor}`}>● {level}</span>
      </div>
      <div className="flex items-center gap-6">
        <div className="relative w-28 h-28 shrink-0">
          <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
            <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(220, 14%, 16%)" strokeWidth="8" />
            <circle cx="50" cy="50" r="42" fill="none" stroke="url(#ts)" strokeWidth="8" strokeLinecap="round"
              strokeDasharray={`${displayScore * 2.64} ${264 - displayScore * 2.64}`} />
            <defs>
              <linearGradient id="ts" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="hsl(175, 80%, 50%)" />
                <stop offset="100%" stopColor="hsl(260, 60%, 60%)" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold">{displayScore}</span>
            <span className="text-[10px] text-muted-foreground">/100</span>
          </div>
        </div>
        <div className="space-y-2 flex-1 text-sm">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-0.5">
                <span className="text-muted-foreground">{m.label}</span>
                <span>{m.val}</span>
              </div>
              <div className="h-1.5 rounded-full bg-secondary">
                <div className="h-full rounded-full gradient-primary" style={{ width: `${m.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrustScoreCard;
