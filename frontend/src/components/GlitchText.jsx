import { useState, useEffect } from 'react';

const GlitchText = ({ text, className = '', style = {} }) => {
  const [glitchActive, setGlitchActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 150);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Extract color from style prop for glow effect
  const textColor = style.color || '#00B8A9';
  
  // Convert hex to rgba for glow effect
  const hexToRgba = (hex, alpha) => {
    if (!hex || hex.length < 7) return `rgba(0, 184, 169, ${alpha})`;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <span 
      className={`relative inline-block ${className}`} 
      style={{
        ...style,
        color: textColor,
        textShadow: glitchActive 
          ? `2px 0 #ff00c1, -2px 0 #00fff9, 0 0 10px ${hexToRgba(textColor, 0.5)}`
          : `0 0 10px ${hexToRgba(textColor, 0.4)}`,
        transform: glitchActive ? 'translate(1px, -1px)' : 'translate(0)',
        transition: 'all 0.1s ease',
      }}
    >
      {text}
    </span>
  );
};

export default GlitchText;

