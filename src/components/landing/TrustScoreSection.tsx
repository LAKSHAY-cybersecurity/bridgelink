import { motion, useInView } from "framer-motion";
import { useRef, useState, useEffect } from "react";

const segments = [
  { label: "GitHub Integrity", pct: 30, color: "hsl(160, 100%, 45%)" },
  { label: "LeetCode Score", pct: 20, color: "hsl(45, 100%, 60%)" },
  { label: "Behavior Score", pct: 20, color: "hsl(200, 70%, 55%)" },
  { label: "Referral History", pct: 15, color: "hsl(340, 70%, 55%)" },
  { label: "Peer Endorsements", pct: 15, color: "hsl(280, 60%, 55%)" },
];

const AnimatedNumber = ({ value, inView }: { value: number; inView: boolean }) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = value / 60;
    const timer = setInterval(() => {
      start += step;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [inView, value]);
  return <>{count}</>;
};

const TrustScoreSection = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="trust-score" className="py-32 relative">
      <div className="container" ref={ref}>
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Visualization */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center justify-center order-2 lg:order-1"
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* Outer pulsing ring */}
              <motion.div
                className="absolute inset-0 rounded-full border border-primary/10"
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 3, repeat: Infinity }}
              />

              <svg viewBox="0 0 200 200" className="w-full h-full">
                <circle cx="100" cy="100" r="90" fill="none" stroke="hsl(225, 14%, 14%)" strokeWidth="1" />
                <circle cx="100" cy="100" r="80" fill="none" stroke="hsl(225, 14%, 14%)" strokeWidth="1" />
                <motion.circle
                  cx="100" cy="100" r="85" fill="none" stroke="url(#trustGrad2)" strokeWidth="6" strokeLinecap="round"
                  strokeDasharray={`${78 * 5.34} ${534 - 78 * 5.34}`} strokeDashoffset="133"
                  className="drop-shadow-[0_0_12px_hsl(160,100%,45%,0.4)]"
                  initial={{ strokeDasharray: "0 534" }}
                  animate={inView ? { strokeDasharray: `${78 * 5.34} ${534 - 78 * 5.34}` } : {}}
                  transition={{ duration: 2, ease: "easeOut", delay: 0.3 }}
                />
                {/* Secondary decorative ring */}
                <motion.circle
                  cx="100" cy="100" r="75" fill="none" stroke="hsl(160, 100%, 45%)" strokeWidth="0.5" strokeDasharray="4 8"
                  animate={{ strokeDashoffset: [0, -48] }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                />
                <defs>
                  <linearGradient id="trustGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="hsl(160, 100%, 45%)" />
                    <stop offset="100%" stopColor="hsl(45, 100%, 60%)" />
                  </linearGradient>
                </defs>
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <motion.span
                  className="font-display text-6xl font-bold glow-text"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={inView ? { scale: 1, opacity: 1 } : {}}
                  transition={{ delay: 0.8, duration: 0.6, type: "spring" }}
                >
                  <AnimatedNumber value={78} inView={inView} />
                </motion.span>
                <span className="text-xs text-muted-foreground mt-1 font-mono">TRUST INDEX</span>
                <motion.span
                  className="text-xs text-primary font-semibold mt-1 font-mono flex items-center gap-1"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" /> HIGH
                </motion.span>
              </div>

              {/* Floating orbit dots */}
              {[0, 72, 144, 216, 288].map((deg, i) => (
                <motion.div
                  key={deg}
                  className="absolute w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: segments[i].color }}
                  initial={{
                    top: "50%",
                    left: "50%",
                    scale: 0,
                  }}
                  animate={inView ? {
                    top: `${50 + 46 * Math.sin((deg * Math.PI) / 180)}%`,
                    left: `${50 + 46 * Math.cos((deg * Math.PI) / 180)}%`,
                    scale: 1,
                  } : {}}
                  transition={{ delay: 1 + i * 0.15, duration: 0.6, type: "spring" }}
                >
                  <motion.div
                    className="w-full h-full rounded-full"
                    style={{ backgroundColor: segments[i].color, boxShadow: `0 0 12px ${segments[i].color}` }}
                    animate={{ scale: [1, 1.4, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right — Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="order-1 lg:order-2"
          >
            <span className="font-mono text-xs text-primary tracking-widest uppercase">// trust engine</span>
            <h2 className="font-display text-4xl md:text-5xl font-bold mt-3 mb-4 tracking-tight">
              Your Trust Score,
              <br />
              Decoded.
            </h2>
            <p className="text-muted-foreground mb-10 leading-relaxed max-w-lg">
              A transparent, multi-dimensional score that quantifies your professional credibility. No black boxes — every signal is auditable.
            </p>
            <div className="space-y-5">
              {segments.map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, x: 30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 + i * 0.12, duration: 0.5 }}
                  className="group"
                >
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-medium group-hover:text-primary transition-colors">{s.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{s.pct}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-secondary overflow-hidden relative">
                    <motion.div
                      className="h-full rounded-full relative"
                      style={{ backgroundColor: s.color }}
                      initial={{ width: 0 }}
                      whileInView={{ width: `${s.pct * 3.3}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.12, duration: 1, ease: "easeOut" }}
                    >
                      {/* Shimmer effect */}
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                        animate={{ x: ["-100%", "200%"] }}
                        transition={{ duration: 2, repeat: Infinity, delay: 1 + i * 0.2, repeatDelay: 3 }}
                      />
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TrustScoreSection;
