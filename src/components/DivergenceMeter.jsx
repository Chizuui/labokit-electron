import React, { useState, useEffect } from 'react';

const DivergenceMeter = ({ value = "1.048596" }) => {
  const [displayValue, setDisplayValue] = useState(value);

  // Helper to generate "glitch" numbers
  const generateGlitch = (target) => {
    return target.split('').map(char => 
      /\d/.test(char) ? Math.floor(Math.random() * 10) : char
    ).join('');
  };

  useEffect(() => {
    if (value === displayValue) return;

    let cycles = 0;
    const maxCycles = 15; // Animation duration
    
    const interval = setInterval(() => {
      cycles++;
      setDisplayValue(generateGlitch(value));

      if (cycles >= maxCycles) {
        clearInterval(interval);
        setDisplayValue(value);
      }
    }, 40); // Speed of number switching

    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="relative p-6 border-2 border-orange-900/40 bg-black/60 rounded-xl backdrop-blur-sm">
      {/* The Digits */}
      <div className="font-dseg text-5xl md:text-7xl tracking-widest nixie-glow select-none">
        {displayValue}
      </div>
      
      {/* Decorative Label */}
      <div className="absolute top-2 left-4 text-[10px] text-orange-800 tracking-[0.2em] font-sans">
        DIVERGENCE METER
      </div>
    </div>
  );
};

export default DivergenceMeter;