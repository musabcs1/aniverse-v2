import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface FireBadgeProps {
  children: React.ReactNode;
}

const FireBadge: React.FC<FireBadgeProps> = ({ children }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLDivElement[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  
  useEffect(() => {
    if (!containerRef.current) return;
    
    // Create fire particles
    const container = containerRef.current;
    const particleCount = 12;
    
    // Clean up existing particles
    while (particlesRef.current.length) {
      const particle = particlesRef.current.pop();
      particle?.remove();
    }
    
    // Create new particles
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'fire-particle absolute';
      container.appendChild(particle);
      particlesRef.current.push(particle);
    }
    
    // Animation function
    const animateParticles = () => {
      const centerX = container.offsetWidth / 2;
      const centerY = container.offsetHeight / 2;
      const radius = Math.max(container.offsetWidth, container.offsetHeight) / 2;
      
      particlesRef.current.forEach((particle, index) => {
        // Reset particle that completed animation
        if (!particle.style.opacity || parseFloat(particle.style.opacity) <= 0.05) {
          const angle = (index / particleCount) * Math.PI * 2;
          const distance = radius * 0.5;
          
          // Position around the badge
          const x = centerX + Math.cos(angle) * distance;
          const y = centerY + Math.sin(angle) * distance;
          
          // Set initial position
          particle.style.left = `${x}px`;
          particle.style.top = `${y}px`;
          
          // Random size (3-6px)
          const size = 3 + Math.random() * 3;
          particle.style.width = `${size}px`;
          particle.style.height = `${size}px`;
          
          // Color variation
          const hue = 20 + Math.random() * 20; // orange-red hues
          const lightness = 50 + Math.random() * 20; // brighter colors
          particle.style.backgroundColor = `hsl(${hue}, 100%, ${lightness}%)`;
          
          // Reset opacity
          particle.style.opacity = '0.8';
          
          // Set filter for glow effect
          particle.style.filter = `blur(${1 + Math.random()}px)`;
          
          // Store animation values
          particle.dataset.vx = String((Math.random() - 0.5) * 2);
          particle.dataset.vy = String(-1 - Math.random() * 2); // always move upward
          particle.dataset.life = '1';
        } else {
          // Update position
          const vx = parseFloat(particle.dataset.vx || '0');
          const vy = parseFloat(particle.dataset.vy || '0');
          const life = parseFloat(particle.dataset.life || '1') - 0.02;
          
          const currentX = parseFloat(particle.style.left);
          const currentY = parseFloat(particle.style.top);
          
          particle.style.left = `${currentX + vx}px`;
          particle.style.top = `${currentY + vy}px`;
          
          // Fade out
          particle.style.opacity = String(life * 0.8);
          
          // Update life
          particle.dataset.life = String(life);
          
          // Add some wobble
          const wobble = Math.sin(Date.now() / 200 + index) * 0.3;
          particle.style.transform = `translateX(${wobble}px)`;
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animateParticles);
    };
    
    // Start animation
    animateParticles();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      
      particlesRef.current.forEach(particle => {
        particle.remove();
      });
      particlesRef.current = [];
    };
  }, []);
  
  return (
    <motion.div 
      ref={containerRef}
      className="admin-badge-container relative"
      initial={{ scale: 0.9 }}
      animate={{ 
        scale: [0.9, 1.1, 0.9],
        rotate: [-1, 1, -1]
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity,
        repeatType: "reverse"
      }}
    >
      <div className="fire-effect"></div>
      <div className="admin-badge-fire relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

export default FireBadge; 