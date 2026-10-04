import { Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Footer = () => (
  <motion.footer className="border-t border-border/30 py-12 relative overflow-hidden" initial={{ opacity: 1 }}>
    {/* Subtle animated line */}
    <motion.div
      className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent"
      animate={{ backgroundPosition: ["0% 0%", "200% 0%"] }}
      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
      style={{ backgroundSize: "200% 100%" }}
    />
    <div className="container">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            className="w-7 h-7 rounded-md gradient-primary flex items-center justify-center"
            whileHover={{ rotate: 360 }}
            transition={{ duration: 0.6 }}
          >
            <Shield className="h-3.5 w-3.5 text-primary-foreground" />
          </motion.div>
          <span className="font-display font-bold">BridgeLink</span>
        </Link>
        <div className="flex items-center gap-6 text-xs text-muted-foreground">
          {[
            { label: "Features", href: "#features" },
            { label: "Process", href: "#how-it-works" },
            { label: "Trust Score", href: "#trust-score" },
            { label: "Sign In", to: "/auth" },
          ].map((item) =>
            item.to ? (
              <Link key={item.label} to={item.to} className="hover:text-foreground transition-colors hover:text-primary">
                {item.label}
              </Link>
            ) : (
              <a key={item.label} href={item.href} className="hover:text-foreground transition-colors hover:text-primary">
                {item.label}
              </a>
            )
          )}
        </div>
        <p className="text-xs text-muted-foreground/50 font-mono">© 2026 BridgeLink</p>
      </motion.div>
    </div>
  </motion.footer>
);

export default Footer;
