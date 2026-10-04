import { motion } from "framer-motion";

const stats = [
  { value: "12K+", label: "Verified Students" },
  { value: "3.4K", label: "Referrals Given" },
  { value: "94%", label: "Fraud Catch Rate" },
  { value: "78%", label: "Interview Rate" },
];

export const StatsSection = () => (
  <section className="py-16 border-y border-border/50">
    <div className="container">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <div className="text-3xl md:text-4xl font-bold text-gradient mb-1">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);
