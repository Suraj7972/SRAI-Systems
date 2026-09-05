const BackgroundEffects = () => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
    {/* Primary aurora */}
    <div
      className="aurora-blob w-[700px] h-[700px] -top-[250px] -left-[250px]"
      style={{ background: "hsl(230 90% 60% / 0.10)" }}
    />
    {/* Secondary aurora */}
    <div
      className="aurora-blob w-[600px] h-[600px] top-[30%] -right-[200px]"
      style={{
        background: "hsl(260 80% 60% / 0.07)",
        animationDelay: "-7s",
      }}
    />
    {/* Warm accent */}
    <div
      className="aurora-blob w-[500px] h-[500px] bottom-[5%] left-[20%]"
      style={{
        background: "hsl(350 80% 55% / 0.05)",
        animationDelay: "-14s",
      }}
    />
    {/* Cyan accent */}
    <div
      className="aurora-blob w-[400px] h-[400px] top-[60%] right-[30%]"
      style={{
        background: "hsl(190 90% 50% / 0.04)",
        animationDelay: "-10s",
      }}
    />

    {/* Grid overlay */}
    <div
      className="absolute inset-0 opacity-[0.02]"
      style={{
        backgroundImage:
          "linear-gradient(hsl(230 90% 60% / 0.3) 1px, transparent 1px), linear-gradient(90deg, hsl(230 90% 60% / 0.3) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
      }}
    />

    {/* Radial vignette */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "radial-gradient(ellipse at 50% 50%, transparent 0%, hsl(220 20% 6% / 0.5) 100%)",
      }}
    />
  </div>
);

export default BackgroundEffects;
