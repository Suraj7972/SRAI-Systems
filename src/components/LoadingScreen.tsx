import { motion } from "framer-motion";

const LoadingScreen = ({ onComplete }: { onComplete: () => void }) => {
  const letters = "SRAI SYSTEMS".split("");

  return (
    <motion.div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0a0c14] overflow-hidden"
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      transition={{ delay: 1.5, duration: 0.5, ease: "easeInOut" }}
      onAnimationComplete={onComplete}
    >
      <div className="flex flex-col items-center gap-6">
        {/* SR Logo Spring animation */}
        <motion.div
          className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
            boxShadow: "0 0 40px rgba(99,102,241,0.5)",
          }}
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
        >
          <div className="absolute inset-0 bg-white/10" />
          <span className="text-3xl font-black text-white relative z-10">SR</span>
        </motion.div>

        {/* Text stagger */}
        <div className="flex space-x-1" style={{ fontFamily: "Syne, sans-serif" }}>
          {letters.map((char, index) => (
            <motion.span
              key={index}
              className="text-white text-xl md:text-2xl font-bold tracking-widest"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + index * 0.05, duration: 0.4 }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>

        {/* Indigo loading bar */}
        <div className="w-48 h-[2px] bg-white/10 rounded-full overflow-hidden mt-2 relative">
          <motion.div
            className="absolute top-0 left-0 h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #4f46e5, #38bdf8)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ delay: 0.2, duration: 1.2, ease: "easeInOut" }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default LoadingScreen;
