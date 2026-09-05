import { useEffect, useRef } from "react";

const CursorGlow = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0 });
  const actualPos = useRef({ x: 0, y: 0 });
  const raf = useRef(0);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      pos.current = { x: e.clientX, y: e.clientY };
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate(${e.clientX - 4}px, ${e.clientY - 4}px)`;
      }
    };

    const animate = () => {
      actualPos.current.x += (pos.current.x - actualPos.current.x) * 0.08;
      actualPos.current.y += (pos.current.y - actualPos.current.y) * 0.08;
      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate(${actualPos.current.x - 200}px, ${actualPos.current.y - 200}px)`;
      }
      raf.current = requestAnimationFrame(animate);
    };

    window.addEventListener("mousemove", move);
    raf.current = requestAnimationFrame(animate);
    return () => {
      window.removeEventListener("mousemove", move);
      cancelAnimationFrame(raf.current);
    };
  }, []);

  return (
    <>
      <div
        ref={cursorRef}
        className="pointer-events-none fixed top-0 left-0 z-[80] hidden md:block"
        style={{
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: "radial-gradient(circle, hsl(230 90% 60% / 0.06), hsl(190 100% 60% / 0.02) 40%, transparent 70%)",
          filter: "blur(1px)",
          willChange: "transform",
        }}
      />
      <div
        ref={cursorDotRef}
        className="pointer-events-none fixed top-0 left-0 z-[81] hidden md:block"
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "hsl(230 90% 70% / 0.5)",
          boxShadow: "0 0 12px hsl(230 90% 60% / 0.4)",
          willChange: "transform",
        }}
      />
    </>
  );
};

export default CursorGlow;
