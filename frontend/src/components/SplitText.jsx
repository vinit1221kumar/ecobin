import { useEffect, useState } from 'react';

const SplitText = ({ text, className = '' }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <span
      className={`inline-block ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {text.split('').map((char, index) => (
        <span
          key={index}
          className={`inline-block transition-all duration-300 ${
            isHovered ? 'translate-y-[-10px] translate-x-[5px] rotate-12' : ''
          }`}
          style={{
            transitionDelay: `${index * 20}ms`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
};

export default SplitText;

