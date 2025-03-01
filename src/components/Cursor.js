import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

export default function Cursor() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const mouseMove = (e) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    window.addEventListener('mousemove', mouseMove);
    return () => window.removeEventListener('mousemove', mouseMove);
  }, []);

  return (
    <>
      <motion.div
        className="cursor-dot fixed z-50"
        animate={{ x: position.x + 2, y: position.y + 2 }}
        transition={{ type: 'spring', mass: 0.1 }}
      />
      <motion.div
        className="cursor-outline fixed z-50"
        animate={{
          x: position.x - 5,
          y: position.y - 5,
          scale: 1.2,
        }}
        transition={{ type: 'spring', mass: 0.1 }}
      />
    </>
  );
}