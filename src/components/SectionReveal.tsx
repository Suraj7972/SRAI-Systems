import { motion } from "framer-motion";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: "up" | "left" | "right";
}

const SectionReveal = ({ children, delay = 0, className = "", direction = "up" }: Props) => {
  const initial = {
    up: { opacity: 0, y: 40, filter: "blur(8px)" },
    left: { opacity: 0, x: -40, filter: "blur(8px)" },
    right: { opacity: 0, x: 40, filter: "blur(8px)" },
  }[direction];

  const animate = { opacity: 1, y: 0, x: 0, filter: "blur(0px)" };

  return (
    <motion.div
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
};

export default SectionReveal;
