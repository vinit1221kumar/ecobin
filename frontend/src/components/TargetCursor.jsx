import { useEffect, useRef, useMemo } from 'react';
import { gsap } from 'gsap';

const TargetCursor = ({
  targetSelector = 'button, a, input, select, textarea, [role="button"], .cursor-target',
  hideDefaultCursor = true
}) => {
  const cursorRef = useRef(null);
  const dotRef = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });

  const isMobile = useMemo(() => {
    const hasTouchScreen = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isSmallScreen = window.innerWidth <= 768;
    return hasTouchScreen && isSmallScreen;
  }, []);

  useEffect(() => {
    if (isMobile || !cursorRef.current || !dotRef.current) return;

    const cursor = cursorRef.current;
    const dot = dotRef.current;
    let styleElement = null;
    let isHovering = false;

    // Hide default cursor
    if (hideDefaultCursor) {
      document.body.style.cursor = 'none';
      // Also hide cursor on all interactive elements
      styleElement = document.createElement('style');
      styleElement.id = 'target-cursor-style';
      styleElement.textContent = `
        * {
          cursor: none !important;
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Initialize cursor position and scale
    gsap.set(cursor, {
      xPercent: -50,
      yPercent: -50,
      scale: 1,
      x: window.innerWidth / 2,
      y: window.innerHeight / 2
    });

    gsap.set(dot, {
      scale: 1
    });

    // Mouse move handler
    const handleMouseMove = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      
      gsap.to(cursor, {
        x: e.clientX,
        y: e.clientY,
        duration: 0.3,
        ease: 'power2.out'
      });
    };

    // Check if element matches selector
    const matchesSelector = (element) => {
      if (!element) return false;
      try {
        // Split selector by comma and check each
        const selectors = targetSelector.split(',').map(s => s.trim());
        return selectors.some(sel => {
          try {
            return element.matches(sel) || element.closest(sel);
          } catch {
            return false;
          }
        });
      } catch {
        return false;
      }
    };

    // Mouse over handler for interactive elements
    const handleMouseOver = (e) => {
      if (matchesSelector(e.target) && !isHovering) {
        isHovering = true;
        gsap.to(cursor, {
          scale: 1.5,
          duration: 0.3,
          ease: 'power2.out'
        });

        gsap.to(dot, {
          scale: 0.5,
          duration: 0.3,
          ease: 'power2.out'
        });
      }
    };

    // Mouse out handler for interactive elements
    const handleMouseOut = (e) => {
      if (matchesSelector(e.target) && isHovering) {
        // Check if we're still over an interactive element
        const relatedTarget = e.relatedTarget;
        if (!relatedTarget || !matchesSelector(relatedTarget)) {
          isHovering = false;
          gsap.to(cursor, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });

          gsap.to(dot, {
            scale: 1,
            duration: 0.3,
            ease: 'power2.out'
          });
        }
      }
    };

    // Mouse down
    const handleMouseDown = () => {
      gsap.to(cursor, {
        scale: isHovering ? 1.2 : 0.8,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    // Mouse up
    const handleMouseUp = () => {
      gsap.to(cursor, {
        scale: isHovering ? 1.5 : 1,
        duration: 0.2,
        ease: 'power2.out'
      });
    };

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseover', handleMouseOver, true);
    document.addEventListener('mouseout', handleMouseOut, true);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    // Cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseover', handleMouseOver, true);
      document.removeEventListener('mouseout', handleMouseOut, true);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      
      if (hideDefaultCursor) {
        document.body.style.cursor = '';
        if (styleElement && styleElement.parentNode) {
          styleElement.parentNode.removeChild(styleElement);
        }
      }
    };
  }, [isMobile, targetSelector, hideDefaultCursor]);

  if (isMobile) {
    return null;
  }

  return (
    <div
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999]"
      style={{ 
        willChange: 'transform',
        width: '32px',
        height: '32px'
      }}
    >
      {/* Outer ring */}
      <div
        className="absolute inset-0 rounded-full border-2 border-[#00B8A9]"
        style={{ 
          willChange: 'transform',
          boxShadow: '0 0 10px rgba(0, 184, 169, 0.5)'
        }}
      />
      
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="absolute top-1/2 left-1/2 w-2 h-2 bg-[#00B8A9] rounded-full -translate-x-1/2 -translate-y-1/2"
        style={{ 
          willChange: 'transform',
          boxShadow: '0 0 8px rgba(0, 184, 169, 0.8)'
        }}
      />
    </div>
  );
};

export default TargetCursor;
