"use client"

export function GridBackground() {
  return (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: "radial-gradient(circle at center, #001bd8, #002560, #000000)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "20px 20px",
        }}
      />
      
      {/* Gradient overlay for more depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(ellipse at top left, rgba(0, 27, 216, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at top right, rgba(0, 37, 96, 0.1) 0%, transparent 50%),
            radial-gradient(ellipse at bottom left, rgba(0, 37, 96, 0.05) 0%, transparent 50%),
            radial-gradient(ellipse at bottom right, rgba(0, 27, 216, 0.05) 0%, transparent 50%)
          `,
        }}
      />
    </div>
  )
} 