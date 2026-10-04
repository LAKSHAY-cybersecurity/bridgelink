import { Link } from "react-router-dom";
import { Shield, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "@/components/ThemeToggle";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <motion.nav
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? "glass-strong shadow-lg shadow-background/50" : "bg-transparent"
      }`}
    >
      <div className="container flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2.5 group">
          <motion.div
            className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center"
            whileHover={{ scale: 1.15, rotate: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Shield className="h-4.5 w-4.5 text-primary-foreground" />
          </motion.div>
          <span className="font-display text-lg font-bold tracking-tight">BridgeLink</span>
        </Link>
        <div className="hidden md:flex items-center gap-1">
          {["Features", "How It Works", "Trust Score"].map((item, i) => (
            <motion.a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary/50 relative"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.1 }}
              whileHover={{ y: -1 }}
            >
              {item}
            </motion.a>
          ))}
          <ThemeToggle />
          <div className="w-px h-6 bg-border mx-2" />
          <Link to="/auth">
            <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-foreground">
              Sign In
            </Button>
          </Link>
          <Link to="/auth">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button size="sm" className="gradient-primary text-primary-foreground font-semibold ml-1">
                Get Started
              </Button>
            </motion.div>
          </Link>
        </div>
        <motion.button
          className="md:hidden text-foreground p-2"
          onClick={() => setOpen(!open)}
          whileTap={{ scale: 0.9 }}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </motion.button>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden overflow-hidden border-t border-border/50"
          >
            <div className="glass-strong p-4 flex flex-col gap-2">
              {["Features", "How It Works", "Trust Score"].map((item, i) => (
                <motion.a
                  key={item}
                  href={`#${item.toLowerCase().replace(/\s+/g, "-")}`}
                  className="text-sm text-muted-foreground py-2 px-3 rounded-lg hover:bg-secondary/50"
                  onClick={() => setOpen(false)}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                >
                  {item}
                </motion.a>
              ))}
              <Link to="/auth" onClick={() => setOpen(false)}>
                <Button size="sm" className="w-full gradient-primary text-primary-foreground font-semibold mt-2">
                  Get Started
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
