// AnimatedNumber.jsx (buat file baru components/)
import { useEffect, useState } from 'react';

export default function AnimatedNumber({ value, duration = 1000 }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const diff = value - start;
    const stepTime = Math.abs(Math.floor(duration / diff)) || 20;
    let current = start;
    const increment = diff > 0 ? 1 : -1;
    const timer = setInterval(() => {
      current += increment;
      setDisplay(current);
      if ((increment > 0 && current >= value) || (increment < 0 && current <= value)) {
        clearInterval(timer);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [value, duration]);

  return <span>{display}</span>;
}
