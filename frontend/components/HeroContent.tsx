'use client';

import Link from 'next/link';
import { Sparkles, ArrowRight, ShieldCheck, Brain, Compass, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export function HeroContent() {
  return (
    <div className="relative z-20 flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pt-10 pb-6">
      {/* Eyebrow Badge */}
      <div className="animate-slide-up inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary backdrop-blur-md shadow-sm mb-6">
        <Sparkles className="h-3.5 w-3.5 text-primary animate-pulse" />
        <span>AI-POWERED PERSONAL UPSKILLING</span>
      </div>

      {/* Main Headline */}
      <h1 className="animate-slide-up text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-foreground leading-[1.08] max-w-3xl">
        Know where you stand.
        <br />
        <span className="bg-gradient-to-r from-primary via-sky-400 to-indigo-400 bg-clip-text text-transparent">
          Know what to learn next.
        </span>
      </h1>

      {/* Supporting Description */}
      <p className="animate-slide-up mt-6 max-w-2xl text-base sm:text-lg md:text-xl text-muted-foreground/95 leading-relaxed">
        An AI learning companion that understands what you know, identifies your skill gaps, and continuously adapts your path toward your career goals.
      </p>

      {/* CTA Button Group */}
      <div className="animate-slide-up mt-8 flex flex-wrap items-center justify-center gap-4">
        {/* Primary CTA */}
        <Button
          size="lg"
          asChild
          className="h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:shadow-primary/40 hover:scale-[1.02] active:scale-[0.99]"
        >
          <Link href="/onboarding">
            Build My Skill Profile
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>

        {/* Secondary CTA */}
        <Button
          size="lg"
          variant="outline"
          asChild
          className="h-12 px-7 text-base font-medium border-border/80 bg-background/60 backdrop-blur-md transition-all duration-300 hover:bg-secondary hover:border-primary/40"
        >
          <Link href="#overview">
            See How It Works
          </Link>
        </Button>

        {/* Instant 1-Click Demo Explore for Hackathon Judges */}
        <Button
          size="lg"
          variant="ghost"
          asChild
          className="h-12 px-5 text-sm text-muted-foreground hover:text-foreground border border-dashed border-border/60 hover:border-primary/50 bg-background/30 backdrop-blur-sm"
        >
          <Link href="/dashboard">
            <Play className="mr-1.5 h-3.5 w-3.5 fill-current text-primary" />
            Explore Live Dashboard (Alex Chen)
          </Link>
        </Button>
      </div>

      {/* Trust & Proof Markers */}
      <div className="animate-slide-up mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4 text-primary" />
          <span>Persistent Learning Memory</span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Dynamic Skill Graph</span>
        </div>
        <div className="flex items-center gap-2">
          <Compass className="h-4 w-4 text-sky-400" />
          <span>Zero Generic Course Catalogs</span>
        </div>
      </div>
    </div>
  );
}
export default HeroContent;
