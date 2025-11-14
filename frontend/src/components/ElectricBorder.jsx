const ElectricBorder = ({ children, className = '', color = 'default', thickness = null }) => {
  // 1 cm = 37.795px (approximately 38px)
  const defaultThickness = color === 'blue' ? 4 : 2;
  const borderThickness = thickness !== null ? thickness : defaultThickness;
  const paddingValue = `${borderThickness}px`;

  const getColors = () => {
    if (color === 'blue') {
      return {
        primary: '#2563eb', // blue-600 (darker, more visible)
        secondary: '#3b82f6', // blue-500
        tertiary: '#60a5fa', // blue-400
      };
    }
    // default colors (cyan and pink)
    return {
      primary: '#00fff9',
      secondary: '#ff00c1',
      tertiary: '#00fff9',
    };
  };

  const colors = getColors();

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 rounded-2xl" style={{ padding: paddingValue }}>
        {/* Base solid border for blue - always visible */}
        {color === 'blue' && (
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              border: `${borderThickness}px solid #2563eb`,
              pointerEvents: 'none',
              boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)',
            }}
          />
        )}
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.primary}, ${colors.secondary}, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'electric 2s linear infinite',
            filter: color === 'blue' ? 'none' : 'blur(1px)',
            opacity: color === 'blue' ? 1 : 0.75,
            border: color === 'blue' ? `${borderThickness}px solid transparent` : 'none',
          }}
        />
        <div
          className="absolute inset-0 rounded-2xl"
          style={{
            background: `linear-gradient(90deg, transparent, ${colors.secondary}, ${colors.tertiary}, transparent)`,
            backgroundSize: '200% 100%',
            animation: 'electric-reverse 2s linear infinite',
            filter: color === 'blue' ? 'none' : 'blur(1px)',
            opacity: color === 'blue' ? 0.8 : 0.75,
            border: color === 'blue' ? `${borderThickness}px solid transparent` : 'none',
          }}
        />
        {/* Additional glowing effect for blue */}
        {color === 'blue' && (
          <div
            className="absolute inset-0 rounded-2xl"
            style={{
              border: `${borderThickness}px solid #3b82f6`,
              pointerEvents: 'none',
              opacity: 0.6,
              boxShadow: '0 0 15px rgba(59, 130, 246, 0.8), inset 0 0 15px rgba(59, 130, 246, 0.3)',
            }}
          />
        )}
      </div>
      <div className="relative rounded-2xl" style={{ background: 'white' }}>
        {children}
      </div>
      <style>{`
        @keyframes electric {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes electric-reverse {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
};

export default ElectricBorder;

