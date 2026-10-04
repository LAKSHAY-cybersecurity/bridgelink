import { UserPlus, GitBranch, ShieldCheck, Handshake } from "lucide-react";
import { motion } from "framer-motion";

const steps = [
  { icon: UserPlus, title: "Create Profile", desc: "Sign up and link your GitHub & LeetCode accounts for verification.", num: "01" },
  { icon: GitBranch, title: "Get Verified", desc: "Our engines analyze your code integrity, skills, and behavioral patterns.", num: "02" },
  { icon: ShieldCheck, title: "Earn Trust Score", desc: "Receive a transparent trust index that proves your merit to referrers.", num: "03" },
  { icon: Handshake, title: "Get Referred", desc: "Apply to verified referral slots that match your skill profile.", num: "04" },
];

const HowItWorksSection = () => (
  <section id="how-it-works" className="py-32 relative overflow-hidden">
    {/* Animated background pulse */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/3 blur-[200px]"
      animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
      transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-20"
      >
        <span className="font-mono text-xs text-primary tracking-widest uppercase">// process</span>
        <h2 className="font-display text-4xl md:text-6xl font-bold mt-3 tracking-tight">
          Four Steps to
          <br />
          <span className="gradient-text">Your First Referral.</span>
        </h2>
      </motion.div>

      {/* Timeline connector (desktop) */}
      <div className="relative">
        <motion.div
          className="hidden md:block absolute top-24 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent z-0"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />

        <div className="grid md:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, i) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="relative group"
            >
              {/* Card */}
              <motion.div
                className="glass rounded-2xl p-8 relative overflow-hidden h-full"
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
              >
                {/* Animated glow on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 glow-border rounded-2xl" />

                {/* Pulsing step indicator */}
                <div className="relative mb-6">
                  <motion.div
                    className="w-14 h-14 rounded-2xl border border-border/60 flex items-center justify-center relative overflow-hidden group-hover:border-primary/40 transition-all"
                    whileHover={{ rotate: [0, -5, 5, 0] }}
                    transition={{ duration: 0.4 }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-primary/10"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 + i * 0.2, duration: 0.5 }}
                    />
                    <step.icon className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors relative z-10" />
                  </motion.div>
                  <motion.span
                    className="absolute -top-2 -right-2 font-mono text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full border border-primary/20"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.7 + i * 0.2, type: "spring" }}
                  >
                    {step.num}
                  </motion.span>
                </div>

                <h3 className="font-display text-xl font-semibold mb-2 group-hover:text-primary transition-colors duration-300">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>

                {/* Bottom gradient line */}
                <motion.div
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0"
                  initial={{ scaleX: 0 }}
                  whileHover={{ scaleX: 1 }}
                  transition={{ duration: 0.4 }}
                />
              </motion.div>

              {/* Connecting arrow (between cards) */}
              {i < 3 && (
                <motion.div
                  className="hidden md:flex absolute -right-3 top-24 z-20 w-6 h-6 items-center justify-center"
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.8 + i * 0.2, type: "spring" }}
                >
                  <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_10px_hsl(160,100%,45%,0.5)]" />
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

export default HowItWorksSection;
