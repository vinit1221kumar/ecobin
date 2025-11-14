const ShiningText = ({ text, className = '', style = {} }) => {
  return (
    <span className={`relative inline-block overflow-hidden ${className}`} style={style}>
      <span className="relative z-10 block">{text}</span>
      <span
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/90 to-transparent pointer-events-none z-20"
        style={{
          backgroundSize: '200% 100%',
          backgroundPosition: '-200% 0',
          animation: 'shine 3s linear infinite',
          mixBlendMode: 'overlay',
        }}
      />
      <style>{`
        @keyframes shine {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </span>
  );
};

export default ShiningText;

