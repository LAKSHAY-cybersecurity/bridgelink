import { Shield, Code, BarChart3, Brain, MessageSquare, Award } from "lucide-react";
import { motion, useMotionValue, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  { icon: Shield, title: "Universal Trust Score", desc: "A composite 0–100 trust index from GitHub integrity, LeetCode authenticity, behavioral signals, and referral outcomes.", tag: "CORE" },
  { icon: Code, title: "Code Integrity Analysis", desc: "AST comparison, plagiarism detection, commit entropy scoring, and AI-generated code recognition.", tag: "AI" },
  { icon: BarChart3, title: "Referral Marketplace", desc: "Structured slots with auto-filtered eligibility, cooldown mechanisms, and spam prevention.", tag: "MARKET" },
  { icon: Brain, title: "Fraud Detection Engine", desc: "Behavioral analysis, device fingerprinting, bot detection, and suspicious pattern alerting.", tag: "SECURITY" },
  { icon: MessageSquare, title: "Secure Messaging", desc: "Anonymous communication until acceptance with toxicity detection and moderation logging.", tag: "COMMS" },
  { icon: Award, title: "Reputation System", desc: "Credibility badges, leaderboards, success-weighted scoring, and reputation decay curves.", tag: "SOCIAL" },
];

const FeatureCard = ({ f, i }: { f: typeof features[0]; i: number }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-0.5, 0.5], [8, -8]);
  const rotateY = useTransform(x, [-0.5, 0.5], [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bg-background p-8 md:p-10 group hover:bg-card/50 transition-colors duration-500 relative cursor-default"
    >
      {/* Hover glow overlay */}
      <motion.div
        className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-lg"
      />
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
          <motion.div
            className="w-12 h-12 rounded-xl border border-border/60 flex items-center justify-center group-hover:border-primary/40 group-hover:bg-primary/5 transition-all"
            whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
          >
            <f.icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
          </motion.div>
          <motion.span
            className="font-mono text-[10px] text-muted-foreground/60 tracking-wider px-2 py-1 rounded-full border border-border/30"
            whileHover={{ borderColor: "hsl(160, 100%, 45%)", color: "hsl(160, 100%, 45%)" }}
          >
            {f.tag}
          </motion.span>
        </div>
        <h3 className="font-display text-lg font-semibold mb-3 group-hover:text-primary transition-colors duration-300">{f.title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
      </div>
      {/* Animated corner accent */}
      <motion.div
        className="absolute bottom-0 right-0 w-0 h-0 border-b border-r border-primary/0 group-hover:w-12 group-hover:h-12 group-hover:border-primary/30 transition-all duration-500"
      />
      <motion.div
        className="absolute top-0 left-0 w-0 h-0 border-t border-l border-primary/0 group-hover:w-12 group-hover:h-12 group-hover:border-primary/30 transition-all duration-500"
      />
    </motion.div>
  );
};

const FeaturesSection = () => (
  <section id="features" className="py-32 relative overflow-hidden">
    {/* Animated decorative line */}
    <motion.div
      className="absolute top-0 left-1/2 w-px bg-gradient-to-b from-transparent to-primary/30"
      initial={{ height: 0 }}
      whileInView={{ height: 96 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: "easeOut" }}
    />

    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <motion.span
          className="font-mono text-xs text-primary tracking-widest uppercase inline-block"
          initial={{ opacity: 0, x: -20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {"// capabilities".split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              {char}
            </motion.span>
          ))}
        </motion.span>
        <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 tracking-tight">
          <motion.span
            className="block"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.7 }}
          >
            Trust Infrastructure,
          </motion.span>
          <motion.span
            className="block text-muted-foreground"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.35, duration: 0.7 }}
          >
            Not Just a Job Board.
          </motion.span>
        </h2>
      </motion.div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-px bg-border/30 rounded-2xl overflow-hidden">
        {features.map((f, i) => (
          <FeatureCard key={f.title} f={f} i={i} />
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
