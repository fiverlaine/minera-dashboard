import React from 'react';

interface LogoProps {
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ className }) => (
  <svg 
    width="320" 
    height="80" 
    viewBox="0 0 320 80" 
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* 
      Definições do SVG, incluindo o gradiente e a importação da fonte.
      A fonte 'Lexend' é importada do Google Fonts para um visual mais moderno.
    */}
    <defs>
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Lexend:wght@800&display=swap');`}
      </style>
      <linearGradient id="customGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" style={{ stopColor: '#001bd8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#002560', stopOpacity: 1 }} />
      </linearGradient>
    </defs>
    
    {/* Ícone com a seta */}
    <g id="icon">
      <rect x="10" y="10" width="60" height="60" rx="15" ry="15" fill="url(#customGradient)" />
      <path d="M 25 53 L 38 40 L 45 47 L 55 33 M 50 33 L 55 33 L 55 38"
            fill="none"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round" />
    </g>
    
    {/* 
      Texto "AdHawk" atualizado.
      - font-family: Alterado para 'Lexend' para um estilo mais moderno.
      - font-weight: Ajustado para '800' (ExtraBold), o peso mais adequado para esta fonte.
    */}
    <text x="85" y="45" fontFamily="'Lexend', sans-serif" fontSize="45" fontWeight="800" fill="white" dominantBaseline="middle">AdHawk</text>
  </svg>
);

export default Logo; 