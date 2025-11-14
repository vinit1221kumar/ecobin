import { useState, useEffect } from 'react';

const DecryptedText = ({ text, className = '', speed = 50 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  const randomChar = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()';
    return chars[Math.floor(Math.random() * chars.length)];
  };

  useEffect(() => {
    if (currentIndex < text.length) {
      const iterations = 5;
      let iteration = 0;

      const interval = setInterval(() => {
        if (iteration < iterations) {
          setDisplayedText(
            text.substring(0, currentIndex) +
            randomChar() +
            text.substring(currentIndex + 1)
          );
          iteration++;
        } else {
          clearInterval(interval);
          setDisplayedText(text.substring(0, currentIndex + 1));
          setCurrentIndex(prev => prev + 1);
        }
      }, speed / iterations);

      return () => clearInterval(interval);
    }
  }, [currentIndex, text, speed]);

  return (
    <span className={`inline-block font-mono ${className}`}>
      {displayedText}
      {currentIndex < text.length && <span className="animate-pulse">|</span>}
    </span>
  );
};

export default DecryptedText;

