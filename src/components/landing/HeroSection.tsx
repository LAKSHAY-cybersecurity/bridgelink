import { ArrowRight, Terminal, Zap, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const useCountUp = (target: number, duration = 2000, suffix = "") => {
  const [value, setValue] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (!started) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) {
        setValue(target);
        clearInterval(timer);
      } else {
        setValue(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [started, target, duration]);

  return { value: `${value.toLocaleString()}${suffix}`, trigger: () => setStarted(true) };
};

const FloatingParticle = ({ delay, x, y, size }: { delay: number; x: string; y: string; size: number }) => (
  <motion.div
    className="absolute rounded-full bg-primary/30"
    style={{ left: x, top: y, width: size, height: size }}
    animate={{
      y: [0, -30, 0, 20, 0],
      x: [0, 15, -10, 5, 0],
      opacity: [0.2, 0.6, 0.3, 0.5, 0.2],
      scale: [1, 1.3, 0.8, 1.1, 1],
    }}
    transition={{ duration: 8, delay, repeat: Infinity, ease: "easeInOut" }}
  />
);

const TypewriterText = ({ text, delay = 0 }: { text: string; delay?: number }) => {
  const [displayed, setDisplayed] = useState("");
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), delay * 1000);
    return () => clearTimeout(t);
  }, [delay]);

  useEffect(() => {
    if (!started) return;
    let i = 0;
    const timer = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else clearInterval(timer);
    }, 40);
    return () => clearInterval(timer);
  }, [started, text]);

  return (
    <span>
      {displayed}
      {displayed.length < text.length && <span className="animate-pulse text-primary">|</span>}
    </span>
  );
};

const stats = [];

const HeroSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const springX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const springY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  const orbX = useTransform(springX, [0, 1], [-20, 20]);
  const orbY = useTransform(springY, [0, 1], [-20, 20]);

  const counters = stats.map((s) => useCountUp(s.value, 2000, s.suffix));

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    mouseX.set((e.clientX - rect.left) / rect.width);
    mouseY.set((e.clientY - rect.top) / rect.height);
  };

  return (
    <section
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-screen flex items-center overflow-hidden pt-16"
    >
      {/* Animated grid background */}
      <motion.div
        className="absolute inset-0 grid-bg"
        animate={{ opacity: [0.2, 0.4, 0.2] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Parallax gradient orbs */}
      <motion.div
        className="absolute top-1/4 -left-32 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px]"
        style={{ x: orbX, y: orbY }}
      />
      <motion.div
        className="absolute bottom-1/4 -right-32 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[120px]"
        style={{ x: useTransform(springX, [0, 1], [20, -20]), y: useTransform(springY, [0, 1], [15, -15]) }}
      />

      {/* Scan line */}
      <motion.div
        className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"
        animate={{ top: ["-5%", "105%"] }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
      />

      {/* Floating particles */}
      {[
        { delay: 0, x: "10%", y: "20%", size: 4 },
        { delay: 1, x: "80%", y: "15%", size: 3 },
        { delay: 2, x: "60%", y: "70%", size: 5 },
        { delay: 0.5, x: "25%", y: "80%", size: 3 },
        { delay: 1.5, x: "90%", y: "50%", size: 4 },
        { delay: 3, x: "45%", y: "30%", size: 2 },
        { delay: 2.5, x: "70%", y: "85%", size: 3 },
        { delay: 0.8, x: "15%", y: "55%", size: 4 },
      ].map((p, i) => (
        <FloatingParticle key={i} {...p} />
      ))}

      <div className="container relative z-10 py-20">
        <div className="max-w-5xl">
          {/* Terminal badge */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.6, type: "spring" }}
            className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8"
          >
            <motion.div animate={{ rotate: [0, 10, -10, 0] }} transition={{ duration: 2, repeat: Infinity }}>
              <Terminal className="h-3.5 w-3.5 text-primary" />
            </motion.div>
            <span className="text-xs font-mono text-primary">
              <TypewriterText text="v2.0 — Trust-Verified Referrals" delay={0.5} />
            </span>
          </motion.div>

          {/* Headline with staggered reveal */}
          <div className="overflow-hidden">
            <motion.h1
              className="font-display text-5xl sm:text-6xl md:text-8xl font-bold tracking-tighter leading-[0.95] mb-6"
            >
              <motion.span
                className="block"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Referrals
              </motion.span>
              <motion.span
                className="block gradient-text"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.45, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Built on Merit.
              </motion.span>
              <motion.span
                className="block text-stroke text-4xl sm:text-5xl md:text-7xl"
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                Not Privilege.
              </motion.span>
            </motion.h1>
          </div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-xl mb-10 leading-relaxed"
          >
            A fraud-resistant marketplace where trust is earned through
            verified code, not social connections. Stop cold messaging — start
            proving your worth.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-20"
          >
            <Link to="/auth">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  className="gradient-primary text-primary-foreground font-semibold px-8 h-13 text-base animate-pulse-glow group"
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Launch Dashboard
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </motion.div>
            </Link>
            <a href="#how-it-works">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border/60 text-foreground hover:bg-secondary h-13 px-8 text-base"
                >
                  <Zap className="mr-2 h-4 w-4 text-accent" />
                  See How It Works
                </Button>
              </motion.div>
            </a>
          </motion.div>

          {/* Metrics with count-up */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1, duration: 0.8 }}
            onViewportEnter={() => counters.forEach((c) => c.trigger())}
            className="flex items-center gap-8 md:gap-16 border-t border-border/40 pt-8"
          >
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 + i * 0.1, duration: 0.5 }}
                className="group"
              >
                <motion.div
                  className="font-display text-2xl md:text-3xl font-bold"
                  whileHover={{ scale: 1.1, color: "hsl(160, 100%, 45%)" }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  {counters[i].value}
                </motion.div>
                <div className="text-xs text-muted-foreground mt-0.5 group-hover:text-foreground transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
