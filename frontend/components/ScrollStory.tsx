'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';

/**
 * Razorpay Buildathon-inspired cinematic scroll story:
 * - High-resolution atmospheric developer night workstations (rainy window, desk lamps, glowing monitors)
 * - Each slide has its own distinct background image that crossfades seamlessly
 * - STRICT zero-overlap slide rendering (display: none + clamped opacity guarantee)
 * - Key high-impact phrases highlighted in warm gold (#d09d55)
 * - Dynamic study clock (23:47 -> 02:50) and SCROLL indicator
 */

interface Slide {
  bg: string;
  pretitle?: React.ReactNode;
  headline: React.ReactNode;
  body?: React.ReactNode;
  tags?: string[];
  cta?: { label: string; href: string };
  time: string;
  size?: 'xl' | 'lg';
}

const SLIDES: Slide[] = [
  {
    bg: '/razorpay_desk_clean_hd.jpg',
    pretitle: 'Think you can master any skill?',
    headline: 'Prove it.',
    body: 'A next-generation skill intelligence platform to discover, diagnose, and accelerate your true engineering competence.',
    cta: { label: 'Build My Profile', href: '/onboarding' },
    tags: [
      '/ Students & Engineers',
      '/ Adaptive Diagnostics',
      '/ Real-time Role Alignment',
    ],
    time: '23:47',
    size: 'xl',
  },
  {
    bg: '/dark_tech_workstation.jpg',
    pretitle: 'Razor-sharp role benchmarks. No generic courses.',
    headline: (
      <>
        We&apos;re looking for students who{' '}
        <span className="text-[#d09d55]">build</span> with skills, not talk about them.
      </>
    ),
    body: (
      <>
        Most learning is <span className="text-[#d09d55]">completely wasted</span>. You spend 40 hours on basics you already know, and skip the 4 hours that <span className="text-[#d09d55]">actually matter</span> for your career.
      </>
    ),
    time: '00:10',
    size: 'lg',
  },
  {
    bg: '/desk_monitors_night.jpg',
    pretitle: 'Step 01 — Dynamic Competency Intelligence',
    headline: (
      <>
        We map <span className="text-[#d09d55]">exactly</span> what you know.
      </>
    ),
    body: (
      <>
        SkillForge builds a live <span className="text-white font-medium">knowledge graph</span> from your code, GitHub, and adaptive diagnostics. No guessing. Just <span className="text-[#d09d55]">validated competence</span>.
      </>
    ),
    time: '00:45',
    size: 'lg',
  },
  {
    bg: '/developer_coding_night.jpg',
    pretitle: 'Step 02 — Role Benchmark Diagnostics',
    headline: (
      <>
        Discover the gaps that{' '}
        <span className="text-[#d09d55]">actually move you forward</span>.
      </>
    ),
    body: (
      <>
        Your AI agent benchmarks you against real engineering expectations at top tech companies, targeting the <span className="text-[#d09d55]">highest-ROI learning hours</span>.
      </>
    ),
    time: '01:25',
    size: 'lg',
  },
  {
    bg: '/laptop_workspace_dark.jpg',
    pretitle: 'Step 03 — Autonomous Recalibration',
    headline: (
      <>
        Your roadmap,{' '}
        <span className="text-[#d09d55]">rebuilt every week</span>.
      </>
    ),
    body: (
      <>
        Skip what you already know. Focus only on high-leverage concepts, practical sandbox tasks, and <span className="text-[#d09d55]">realistic code challenges</span>.
      </>
    ),
    time: '02:05',
    size: 'lg',
  },
  {
    bg: '/rainy_window_city.jpg',
    pretitle: 'Your Career, Accelerated',
    headline: (
      <>
        Your skills.{' '}
        <span className="text-[#d09d55]">Your future</span>.
      </>
    ),
    body: (
      <>
        Stop guessing which course to take. Let an intelligent agent diagnose your gaps and build the <span className="text-[#d09d55]">fastest path</span> to your target role.
      </>
    ),
    cta: { label: 'Get Started Now', href: '/onboarding' },
    tags: [
      '/ Zero Fluff',
      '/ Validated Skills Graph',
      '/ In-person & Remote Tracks',
    ],
    time: '02:50',
    size: 'xl',
  },
];

const SLIDE_HEIGHT = 100;

export function ScrollStory() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  return (
    <div
      ref={containerRef}
      style={{ height: `${SLIDES.length * SLIDE_HEIGHT}vh` }}
      className="relative"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        {/* ── Crossfading Background Images ── */}
        {SLIDES.map((slide, i) => (
          <PhotoBackground
            key={i}
            src={slide.bg}
            index={i}
            total={SLIDES.length}
            scrollYProgress={scrollYProgress}
          />
        ))}

        {/* Ambient moody overlay */}
        <div className="absolute inset-0 z-10 bg-black/40" />

        {/* Top vignette for clean navigation reading */}
        <div className="absolute inset-x-0 top-0 h-36 z-10 bg-gradient-to-b from-black/70 to-transparent pointer-events-none" />

        {/* Bottom subtle gradient into page content */}
        <div className="absolute inset-x-0 bottom-0 h-36 z-10 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />

        {/* ── Slide Text Content (Strict Zero-Overlap) ── */}
        <div className="absolute inset-0 z-20 flex items-center justify-center px-6 sm:px-12">
          {SLIDES.map((slide, i) => (
            <SlideText
              key={i}
              slide={slide}
              index={i}
              total={SLIDES.length}
              scrollYProgress={scrollYProgress}
            />
          ))}
        </div>

        {/* ── Night Study Clock (bottom right, e.g. 23:47) ── */}
        <StudyClock scrollYProgress={scrollYProgress} />

        {/* ── Center Scroll Indicator ── */}
        <ScrollHint scrollYProgress={scrollYProgress} />
      </div>
    </div>
  );
}

/* ─── Photo background with crossfade per slide ─── */
function PhotoBackground({
  src,
  index,
  total,
  scrollYProgress,
}: {
  src: string;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;

  const opacity = useTransform(
    scrollYProgress,
    index === 0
      ? [0, end - seg * 0.25, end]
      : index === total - 1
      ? [start, start + seg * 0.25, 1]
      : [start, start + seg * 0.2, end - seg * 0.2, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
      ? [0, 1, 1]
      : [0, 1, 1, 0],
    { clamp: true }
  );

  return (
    <motion.div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: `url(${src})`,
        opacity,
        filter: 'contrast(1.08) brightness(0.92)',
      }}
    />
  );
}

/* ─── Slide text with 100% strictly non-overlapping active windows ─── */
function SlideText({
  slide,
  index,
  total,
  scrollYProgress,
}: {
  slide: Slide;
  index: number;
  total: number;
  scrollYProgress: any;
}) {
  const seg = 1 / total;
  const start = index * seg;
  const end = (index + 1) * seg;

  // Clamped opacity: completely 0 outside of this slide's segment
  const opacity = useTransform(
    scrollYProgress,
    index === 0
      ? [0, end - seg * 0.3, end]
      : index === total - 1
      ? [start, start + seg * 0.3, 1]
      : [start, start + seg * 0.22, end - seg * 0.22, end],
    index === 0
      ? [1, 1, 0]
      : index === total - 1
      ? [0, 1, 1]
      : [0, 1, 1, 0],
    { clamp: true }
  );

  const y = useTransform(
    scrollYProgress,
    [start, (start + end) / 2, end],
    [24, 0, -24],
    { clamp: true }
  );

  // Absolute physical display protection: removes element entirely when not in range
  const display = useTransform(scrollYProgress, (pos: number) => {
    const dist = Math.abs(pos - (start + end) / 2);
    return dist < seg * 0.58 ? 'flex' : 'none';
  });

  return (
    <motion.div
      className="absolute max-w-4xl w-full text-center text-white pointer-events-none flex-col items-center justify-center px-4"
      style={{ opacity, y, display }}
    >
      {/* Pretitle / Question eyebrow */}
      {slide.pretitle && (
        <p className="mb-4 sm:mb-6 text-sm sm:text-base md:text-lg font-light text-white/70 tracking-tight max-w-2xl mx-auto">
          {slide.pretitle}
        </p>
      )}

      {/* Main Punchy Headline with highlighted keywords in warm gold */}
      <h1
        className={`font-bold tracking-tight leading-[1.08] max-w-3xl mx-auto ${
          slide.size === 'xl'
            ? 'text-5xl sm:text-7xl md:text-[5.75rem]'
            : 'text-3xl sm:text-5xl md:text-6xl'
        }`}
      >
        {slide.headline}
      </h1>

      {/* Descriptive subtext */}
      {slide.body && (
        <p className="mt-5 sm:mt-7 text-sm sm:text-base md:text-lg text-white/65 max-w-2xl mx-auto leading-relaxed font-light">
          {slide.body}
        </p>
      )}

      {/* Cream CTA button like Razorpay's Apply now */}
      {slide.cta && (
        <div className="mt-8 sm:mt-10 pointer-events-auto">
          <Link
            href={slide.cta.href}
            className="inline-flex items-center gap-2 rounded-sm bg-[#f4efe6] text-black font-semibold text-xs sm:text-sm px-8 py-3.5 hover:bg-white transition-all shadow-xl hover:scale-[1.02]"
          >
            {slide.cta.label}
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}

      {/* Metadata tags */}
      {slide.tags && (
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-white/50 font-mono">
          {slide.tags.map((tag, idx) => (
            <span key={idx} className="tracking-wide">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* ─── Dynamic Night Study Clock in bottom-right corner ─── */
function StudyClock({ scrollYProgress }: { scrollYProgress: any }) {
  const times = SLIDES.map((s) => s.time);
  const total = SLIDES.length;

  return (
    <div className="absolute bottom-6 sm:bottom-8 right-6 sm:right-10 z-30 font-mono text-xs sm:text-sm text-white/45 tracking-widest pointer-events-none">
      {times.map((t, idx) => {
        const seg = 1 / total;
        const start = idx * seg;
        const end = (idx + 1) * seg;
        const opacity = useTransform(
          scrollYProgress,
          idx === 0
            ? [0, end - seg * 0.3, end]
            : idx === total - 1
            ? [start, start + seg * 0.3, 1]
            : [start, start + seg * 0.2, end - seg * 0.2, end],
          idx === 0 ? [1, 1, 0] : idx === total - 1 ? [0, 1, 1] : [0, 1, 1, 0],
          { clamp: true }
        );
        const display = useTransform(scrollYProgress, (pos: number) => {
          const dist = Math.abs(pos - (start + end) / 2);
          return dist < seg * 0.58 ? 'inline' : 'none';
        });
        return (
          <motion.span
            key={idx}
            className="absolute right-0 bottom-0"
            style={{ opacity, display }}
          >
            {t}
          </motion.span>
        );
      })}
    </div>
  );
}

/* ─── Center Scroll Hint (SCROLL with vertical bar) ─── */
function ScrollHint({ scrollYProgress }: { scrollYProgress: any }) {
  const opacity = useTransform(scrollYProgress, [0, 0.08], [1, 0], { clamp: true });
  return (
    <motion.div
      className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-2 pointer-events-none"
      style={{ opacity }}
    >
      <span className="text-[10px] font-medium tracking-[0.3em] text-white/45 uppercase">
        Scroll
      </span>
      <div className="h-7 w-[1.5px] bg-gradient-to-b from-white/35 to-transparent" />
    </motion.div>
  );
}
