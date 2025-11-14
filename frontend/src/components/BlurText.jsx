import { useState } from 'react';

const BlurText = ({ text, className = '', blurAmount = 5 }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`inline-block transition-all duration-500 cursor-default ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        filter: isHovered ? 'blur(0px)' : `blur(${blurAmount}px)`,
        textShadow: isHovered ? '0 0 10px rgba(74, 124, 42, 0.5)' : 'none',
        willChange: 'filter',
      }}
    >
      {text}
    </span>
  );
};

export default BlurText;

