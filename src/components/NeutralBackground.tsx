"use client"

export function NeutralBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "linear-gradient(135deg, #0f1419 0%, #1a1a1a 50%, #1e2530 100%)",
      }}
    >
      {/* Grid pattern mais sutil */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
          `,
          backgroundSize: "40px 40px",
        }}
      />
      
      {/* Subtle gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(30, 37, 48, 0.3) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(15, 20, 25, 0.2) 0%, transparent 50%),
            radial-gradient(ellipse at bottom center, rgba(0, 27, 216, 0.05) 0%, transparent 70%)
          `,
        }}
      />

      {/* Noise texture for depth */}
      <div 
        className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </div>
  )
} 