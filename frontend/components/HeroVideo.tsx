'use client';

import { useState, useEffect, useRef } from 'react';

// Configurable hero video URL - can be overridden via props or env
export const HERO_VIDEO_URL =
  'https://assets.mixkit.co/videos/preview/mixkit-digital-network-connections-loop-32986-large.mp4';

interface HeroVideoProps {
  videoUrl?: string;
  posterUrl?: string;
}

export function HeroVideo({
  videoUrl = HERO_VIDEO_URL,
  posterUrl,
}: HeroVideoProps) {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mediaQuery.matches);

    const handleChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Neural Particle Network Canvas Fallback & Ambient Layer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Initialize subtle floating particles
    const particleCount = reducedMotion ? 25 : 55;
    const particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * (reducedMotion ? 0.15 : 0.45),
      vy: (Math.random() - 0.5) * (reducedMotion ? 0.15 : 0.45),
      radius: Math.random() * 1.8 + 1,
      alpha: Math.random() * 0.5 + 0.2,
    }));

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Draw particle connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 140) {
            const lineAlpha = (1 - dist / 140) * 0.25;
            ctx.strokeStyle = `rgba(56, 189, 248, ${lineAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw particles
      for (const p of particles) {
        ctx.fillStyle = `rgba(147, 197, 253, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();

        if (!reducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          if (p.x < 0) p.x = width;
          if (p.x > width) p.x = 0;
          if (p.y < 0) p.y = height;
          if (p.y > height) p.y = 0;
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [reducedMotion]);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden select-none"
    >
      {/* 1. Video Element (if reduced motion is not preferred and no video error) */}
      {!reducedMotion && !videoError && (
        <video
          autoPlay
          muted
          loop
          playsInline
          poster={posterUrl}
          onLoadedData={() => setVideoLoaded(true)}
          onError={() => setVideoError(true)}
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity duration-1000 ${
            videoLoaded ? 'opacity-35' : 'opacity-0'
          }`}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      )}

      {/* 2. Procedural Neural Particle Canvas (Always provides rich depth, active if video is loading or fallback) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full opacity-60 mix-blend-screen"
      />

      {/* 3. Multi-layer Dark Overlays for Maximum Contrast & Readability */}
      {/* Ambient subtle primary glow */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, hsl(var(--primary) / 0.16) 0%, transparent 65%)',
        }}
      />

      {/* Dark Vignette and Gradient Blend to content below */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/70 to-background" />

      {/* Subtle grid accent */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border)/0.08)_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border)/0.08)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_40%,#000_70%,transparent_100%)] opacity-40" />
    </div>
  );
}
export default HeroVideo;
