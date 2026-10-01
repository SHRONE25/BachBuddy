import React, { useEffect, useState } from 'react';

const IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1600', // PG
  'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=1600',   // Hostel
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1600',   // Room
];

const HeroBackground = () => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setIndex((i) => (i + 1) % IMAGES.length), 4500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hero-bg">
      {IMAGES.map((src, i) => (
        <div
          key={i}
          className="hero-bg-img"
          style={{ backgroundImage: `url(${src})`, opacity: i === index ? 1 : 0 }}
        />
      ))}
    </div>
  );
};

export default HeroBackground;