import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const CTASection = () => (
  <motion.section className="py-32 relative overflow-hidden" initial={{ opacity: 1 }}>
    {/* Animated glow orbs */}
    <motion.div
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] rounded-full bg-primary/8 blur-[100px]"
      animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0.8, 0.5] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
    <motion.div
      className="absolute top-1/3 left-1/4 w-[200px] h-[200px] rounded-full bg-accent/5 blur-[80px]"
      animate={{ x: [0, 50, 0], y: [0, -30, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
    />

    <div className="container relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.7 }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Animated badge */}
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 mb-8"
          animate={{ boxShadow: ["0 0 0px hsl(160,100%,45%,0)", "0 0 20px hsl(160,100%,45%,0.2)", "0 0 0px hsl(160,100%,45%,0)"] }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <Sparkles className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-mono text-primary">Free to start • No credit card</span>
        </motion.div>

        <h2 className="font-display text-4xl md:text-6xl font-bold tracking-tight mb-6">
          <motion.span
            className="block"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
          >
            Ready to Earn Your
          </motion.span>
          <motion.span
            className="block gradient-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.25, duration: 0.6 }}
          >
            Referral?
          </motion.span>
        </h2>
        <motion.p
          className="text-muted-foreground text-lg mb-10 max-w-md mx-auto"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.6 }}
        >
          Join thousands of students proving their skills and getting referred on merit. No gatekeepers.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <Link to="/auth">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.97 }}
              className="inline-block"
            >
              <Button
                size="lg"
                className="gradient-primary text-primary-foreground font-semibold px-10 h-13 text-base animate-pulse-glow group"
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        <motion.p
          className="text-xs text-muted-foreground/60 mt-6 font-mono"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 0.6 }}
          viewport={{ once: true }}
          transition={{ delay: 0.7 }}
        >
          No credit card required • Free tier forever
        </motion.p>
      </motion.div>
    </div>
  </motion.section>
);

export default CTASection;
