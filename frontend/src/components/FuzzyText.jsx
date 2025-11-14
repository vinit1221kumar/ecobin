import { useState, useEffect } from 'react';

const FuzzyText = ({ text, className = '' }) => {
  const [fuzzyChars, setFuzzyChars] = useState(text);

  useEffect(() => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    let interval;

    const animate = () => {
      setFuzzyChars(
        text
          .split('')
          .map((char, i) => {
            if (char === ' ') return ' ';
            return Math.random() > 0.1 ? char : chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );
    };

    interval = setInterval(animate, 50);

    const timeout = setTimeout(() => {
      clearInterval(interval);
      setFuzzyChars(text);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [text]);

  return (
    <span className={`inline-block font-mono ${className}`}>
      {fuzzyChars}
    </span>
  );
};

export default FuzzyText;

