'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Brain,
  Target,
  TrendingUp,
  Bot,
  ArrowRight,
  CheckCircle2,
  Zap,
  Wrench,
  GraduationCap,
  ClipboardCheck,
  FolderKanban,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import FeatureCard from '@/components/FeatureCard';
import { ScrollStory } from '@/components/ScrollStory';
import { PageBackground } from '@/components/PageBackground';

/* ─── Data ─── */
const corePillars = [
  {
    step: '01',
    title: 'Understand',
    headline: 'Build a living profile of your skills.',
    description:
      'We extract your capabilities from your resume, past projects, and adaptive diagnostic tests. No self-delusion, just validated competence.',
    metric: 'Skill Graph',
    href: '/onboarding',
  },
  {
    step: '02',
    title: 'Diagnose',
    headline: 'Discover the gaps between now and your target role.',
    description:
      'Our benchmark engine compares your demonstrated levels against real industry expectations for Data Analysts, Software Developers, and ML Engineers.',
    metric: 'Role Alignment',
    href: '/skill-gap',
  },
  {
    step: '03',
    title: 'Adapt',
    headline: 'Let your AI agent decide what to learn next.',
    description:
      'Skip what you already know. Focus only on high-ROI concepts, practical tasks, and realistic code challenges that actually close your gaps.',
    metric: 'Contextual Memory',
    href: '/learn',
  },
];

const skillGaps = [
  { skill: 'SQL', current: 72, target: 85, status: 'Active Priority', color: 'bg-blue-500' },
  { skill: 'Python', current: 81, target: 80, status: 'Mastered', color: 'bg-emerald-500' },
  { skill: 'Statistics', current: 45, target: 75, status: 'Priority Gap', color: 'bg-red-500' },
  { skill: 'Visualization', current: 60, target: 80, status: 'Developing', color: 'bg-amber-500' },
  { skill: 'Business Analysis', current: 51, target: 70, status: 'Developing', color: 'bg-amber-500' },
];

const loopSteps = [
  { label: 'Learn', icon: GraduationCap, desc: 'Tailored concepts' },
  { label: 'Practice', icon: Wrench, desc: 'Real code sandboxes' },
  { label: 'Evaluate', icon: ClipboardCheck, desc: 'Live AI feedback' },
  { label: 'Adapt', icon: Zap, desc: 'Recalibrate roadmap' },
  { label: 'Advance', icon: TrendingUp, desc: 'Update skill profile' },
];

/* ─── Shared section label ─── */
function Label({ children }: { children: string }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/35 mb-4">
      {children}
    </p>
  );
}

/* ─── Divider ─── */
function Divider() {
  return <div className="border-t border-white/8" />;
}

/* ─── Fade-in wrapper ─── */
function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.7, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ─── Main page ─── */
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen text-white" style={{ fontFamily: 'var(--font-sans)' }}>
      <PageBackground />

      {/* ── Navigation ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'border-b border-white/8 bg-[#0a0a0f]/90 backdrop-blur-sm' : 'bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-8">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="text-sm font-bold tracking-tight text-white">SkillForge</span>
            <span className="text-sm font-light text-white/40">/intelligence</span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex text-xs text-white/55">
            <Link href="#overview" className="hover:text-white transition-colors">How It Works</Link>
            <Link href="#skill-graph" className="hover:text-white transition-colors">Skill Graph</Link>
            <Link href="#skill-gap" className="hover:text-white transition-colors">Skill Gap</Link>
            <Link href="#ai-agent" className="hover:text-white transition-colors">AI Agent</Link>
          </nav>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-white/45 hover:text-white cursor-pointer transition-colors px-2 py-1">
              <span className="inline-block font-mono tracking-wider text-[11px]">ıılı sound</span>
            </div>
            <Link
              href="/login"
              className="text-xs text-white/50 hover:text-white transition-colors px-3 py-2"
            >
              Sign In
            </Link>
            <Link
              href="/onboarding"
              className="rounded-sm bg-[#f4efe6] text-black text-xs font-semibold px-4 py-2 hover:bg-white transition-all shadow-md"
            >
              Apply now
            </Link>
          </div>
        </div>
      </header>

      {/* ── Scroll Story Hero ── */}
      <ScrollStory />

      {/* ═══════════════════════════════════════════
          SECTION 2 — HOW IT WORKS
      ═══════════════════════════════════════════ */}
      <section id="overview" className="py-28 px-8 border-t border-white/8 relative overflow-hidden">
        {/* Background: Developer desk with warm lamp and monitors at night */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/desk_monitors_night.jpg')",
            filter: 'brightness(0.32) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.78) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-6xl">
          <FadeIn className="mb-20 max-w-2xl">
            <Label>How It Works</Label>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug">
              A system built around <span className="text-[#d09d55]">you</span> — not around a curriculum.
            </h2>
          </FadeIn>

          <div className="grid gap-0 md:grid-cols-3 md:divide-x md:divide-white/8">
            {corePillars.map((pillar, i) => (
              <div key={pillar.step} className={i > 0 ? 'md:pl-10' : ''}>
                <FeatureCard {...pillar} />
              </div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════
          SECTION 3 — SKILL GRAPH
      ═══════════════════════════════════════════ */}
      <section id="skill-graph" className="py-28 px-8 relative overflow-hidden">
        {/* Background: Developer coding on multi-monitors at night */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/developer_coding_night.jpg')",
            filter: 'brightness(0.28) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left: copy */}
            <FadeIn>
              <Label>Dynamic Skill Intelligence</Label>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug mb-6">
                Understand what you know — <span className="text-[#d09d55]">for real</span>.
              </h2>
              <p className="text-white/55 text-base leading-relaxed mb-10">
                Your profile isn&apos;t a static list of badges. It is a <span className="text-[#d09d55]">live knowledge graph</span> that updates whenever you complete an assessment, pass a code task, or push commits.
              </p>
              <Link
                href="/skills"
                className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors"
              >
                Explore your skill profile
                <ArrowRight className="h-4 w-4" />
              </Link>
            </FadeIn>

            {/* Right: visual */}
            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-5 border-b border-white/8">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-white/40" />
                    <span className="text-xs font-medium text-white/40 uppercase tracking-wider">
                      Knowledge Graph · Data Analyst
                    </span>
                  </div>
                  <span className="text-xs text-emerald-400 font-medium">68% aligned</span>
                </div>

                {/* Radial node diagram */}
                <div className="flex items-center justify-center mb-8">
                  <div className="relative h-52 w-52 flex items-center justify-center">
                    {/* Rings */}
                    <div className="absolute inset-0 rounded-full border border-dashed border-white/8 animate-[spin_50s_linear_infinite]" />
                    <div className="absolute inset-8 rounded-full border border-white/[0.06]" />
                    {/* Center */}
                    <div className="flex flex-col items-center justify-center h-24 w-24 rounded-full bg-white text-black text-center p-2 z-10">
                      <Target className="h-4 w-4 mb-0.5" />
                      <span className="text-[10px] font-bold leading-tight">Data Analyst</span>
                      <span className="text-[9px] opacity-50">Target</span>
                    </div>
                    {/* Nodes */}
                    {[
                      { label: 'Python 84%', pos: 'top-0 left-6', color: 'text-emerald-400' },
                      { label: 'SQL 78%', pos: 'top-2 right-4', color: 'text-white/70' },
                      { label: 'Stats 48%', pos: 'bottom-4 right-2', color: 'text-red-400' },
                      { label: 'Viz 62%', pos: 'bottom-2 left-4', color: 'text-amber-400' },
                    ].map(({ label, pos, color }) => (
                      <div
                        key={label}
                        className={`absolute ${pos} rounded-full border border-white/10 bg-[#0a0a0f] px-2.5 py-1 text-[10px] font-medium ${color}`}
                      >
                        {label}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Evidence list */}
                <div className="space-y-3">
                  {[
                    { icon: CheckCircle2, color: 'text-emerald-400', label: 'Diagnostic assessments', desc: 'Adaptive tests calibrate syntax proficiency.' },
                    { icon: FolderKanban, color: 'text-white/50', label: 'Project submissions', desc: 'Real SQL queries on raw datasets.' },
                    { icon: Brain, color: 'text-blue-400', label: 'Persistent memory', desc: 'The AI never re-tests mastered material.' },
                  ].map(({ icon: Icon, color, label, desc }) => (
                    <div key={label} className="flex items-start gap-3 py-3 border-t border-white/[0.06]">
                      <Icon className={`h-3.5 w-3.5 ${color} mt-0.5 shrink-0`} />
                      <div>
                        <p className="text-xs font-medium text-white/70">{label}</p>
                        <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════
          SECTION 4 — SKILL GAP
      ═══════════════════════════════════════════ */}
      <section id="skill-gap" className="py-28 px-8 relative overflow-hidden">
        {/* Background: Dark developer workstation with glowing keyboard */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/dark_tech_workstation.jpg')",
            filter: 'brightness(0.3) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.78) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left: visual */}
            <FadeIn>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-8">
                <div className="flex justify-between text-[10px] text-white/30 font-medium uppercase tracking-widest pb-4 mb-4 border-b border-white/8">
                  <span>Competency</span>
                  <span>Current / Required</span>
                </div>
                <div className="space-y-5">
                  {skillGaps.map((item) => {
                    const over = item.current >= item.target;
                    return (
                      <div key={item.skill}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2.5">
                            <span className="text-sm font-medium text-white/80">{item.skill}</span>
                            <span
                              className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                                over
                                  ? 'text-emerald-400 bg-emerald-400/10'
                                  : item.status === 'Priority Gap'
                                  ? 'text-red-400 bg-red-400/10'
                                  : 'text-amber-400 bg-amber-400/10'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <span className="text-xs text-white/35 font-mono">
                            <span className={over ? 'text-emerald-400' : 'text-white/60'}>{item.current}%</span>
                            {' / '}{item.target}%
                          </span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-white/[0.06] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${item.current}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full rounded-full ${item.color}`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FadeIn>

            {/* Right: copy + AI diagnosis */}
            <FadeIn delay={0.15} className="space-y-8">
              <div>
                <Label>Industry Competency Mapping</Label>
                <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug mb-4">
                  Know <span className="text-[#d09d55]">exactly</span> what&apos;s missing.
                </h2>
                <p className="text-white/55 text-base leading-relaxed">
                  We compare your verified skills against <span className="text-[#d09d55]">real role benchmarks</span> — not generic job descriptions. You see exactly where you stand.
                </p>
              </div>

              {/* AI diagnosis card */}
              <div className="rounded-xl border border-white/8 bg-white/[0.025] p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bot className="h-3.5 w-3.5 text-white/40" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-white/40">
                    AI Diagnosis
                  </span>
                </div>
                <p className="text-sm font-medium text-white/80 leading-relaxed mb-3">
                  Priority: <span className="text-[#d09d55]">Statistics & Window Functions</span>
                </p>
                <p className="text-xs text-white/45 leading-relaxed">
                  &ldquo;Strong Python fundamentals detected (81%). Largest gap: Statistics (45% vs. 75% required). Roadmap reprioritised toward probability and A/B testing.&rdquo;
                </p>
                <div className="mt-5 pt-4 border-t border-white/8">
                  <Link
                    href="/skill-gap"
                    className="inline-flex items-center gap-1.5 text-xs text-white/50 hover:text-white transition-colors"
                  >
                    View full analysis
                    <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════
          SECTION 5 — AI AGENT
      ═══════════════════════════════════════════ */}
      <section id="ai-agent" className="py-28 px-8 relative overflow-hidden">
        {/* Background: Late-night dark workspace with code on laptop */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/laptop_workspace_dark.jpg')",
            filter: 'brightness(0.3) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.78) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-16 lg:grid-cols-2 items-center">
            {/* Left: copy */}
            <FadeIn>
              <Label>AI Learning Companion</Label>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white leading-snug mb-6">
                A tutor that <span className="text-[#d09d55]">actually knows you</span>.
              </h2>
              <p className="text-white/55 text-base leading-relaxed">
                SkillPilot remembers every assessment you&apos;ve taken, every mistake you&apos;ve made, and every concept you&apos;ve mastered. It <span className="text-[#d09d55]">never wastes your time</span> explaining what you already know.
              </p>
            </FadeIn>

            {/* Right: chat */}
            <FadeIn delay={0.15}>
              <div className="rounded-2xl border border-white/8 bg-white/[0.02] overflow-hidden">
                {/* Chat header */}
                <div className="border-b border-white/8 px-5 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white">
                      <Bot className="h-3.5 w-3.5 text-black" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-white">SkillPilot</p>
                      <p className="text-[10px] text-white/35">Alex Chen · Data Analyst track</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-[10px] text-white/35">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    Active
                  </span>
                </div>

                <div className="p-5 space-y-4">
                  {/* User */}
                  <div className="flex justify-end">
                    <div className="max-w-[78%] rounded-2xl rounded-br-sm bg-white text-black px-4 py-3 text-xs leading-relaxed">
                      I already know Python basics. I don't want to repeat them.
                    </div>
                  </div>

                  {/* AI */}
                  <div className="flex justify-start">
                    <div className="max-w-[82%] rounded-2xl rounded-bl-sm border border-white/8 bg-white/[0.04] px-4 py-3 text-xs text-white/75 leading-relaxed space-y-2.5">
                      <p>
                        Confirmed. Your diagnostic scores Python at 84% — I've already skipped the first three beginner modules.
                      </p>
                      <p>
                        Your next session focuses on <strong className="text-white/90">Pandas, multi-table SQL joins, and window functions</strong>.
                      </p>
                      <div className="mt-3 pt-3 border-t border-white/8 space-y-1.5 text-[11px] text-white/40">
                        <p><span className="text-white/55 font-medium">Skill skipped:</span> Python Fundamentals (84%)</p>
                        <p><span className="text-white/55 font-medium">Evidence:</span> Diagnostic #1 — Top quartile</p>
                        <p><span className="text-white/55 font-medium">Action:</span> Fast-tracked to Data Manipulation</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════
          SECTION 6 — LEARNING LOOP
      ═══════════════════════════════════════════ */}
      <section className="py-28 px-8 relative overflow-hidden">
        {/* Background: Developer desk setup at night */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/desk_monitors_night.jpg')",
            filter: 'brightness(0.28) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.82) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-5xl">
          <FadeIn className="mb-16">
            <Label>Iterative Mastery</Label>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white max-w-lg leading-snug">
              A <span className="text-[#d09d55]">closed loop</span> — not a passive video library.
            </h2>
          </FadeIn>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-0 border-t border-white/8">
            {loopSteps.map((step, idx) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.08 }}
                className="border-r border-white/8 last:border-r-0 px-6 pt-8 pb-6"
              >
                <step.icon className="h-5 w-5 text-white/30 mb-4" />
                <p className="text-sm font-semibold text-white mb-1">{step.label}</p>
                <p className="text-xs text-white/35">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Divider />

      {/* ═══════════════════════════════════════════
          SECTION 7 — CTA
      ═══════════════════════════════════════════ */}
      <section className="py-32 px-8 relative overflow-hidden">
        {/* Background: Rainy night window overlooking city lights */}
        <div
          className="absolute inset-0 -z-10 bg-cover bg-center bg-fixed"
          style={{
            backgroundImage: "url('/rainy_window_city.jpg')",
            filter: 'brightness(0.32) contrast(1.1)',
          }}
        />
        <div className="absolute inset-0 -z-10" style={{ background: 'linear-gradient(180deg, rgba(10,10,15,0.75) 0%, rgba(10,10,15,0.92) 100%)' }} />
        <div className="mx-auto max-w-3xl">
          <FadeIn className="space-y-8">
            <div className="space-y-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-white/35">
                Start Your Journey
              </p>
              <h2 className="text-4xl sm:text-6xl font-bold tracking-tight text-white leading-[1.05]">
                Discover what you should <span className="text-[#d09d55]">learn next</span>.
              </h2>
              <p className="text-white/55 text-base leading-relaxed max-w-lg">
                Stop guessing which course to take. Let an intelligent system <span className="text-[#d09d55]">diagnose your skill gaps</span> and build your personalized career roadmap.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href="/onboarding"
                className="inline-flex items-center gap-2.5 rounded-sm bg-[#f4efe6] text-black font-semibold text-sm px-8 py-3.5 hover:bg-white transition-all shadow-xl hover:scale-[1.02]"
              >
                Apply now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/dashboard"
                className="text-sm text-white/50 hover:text-white transition-colors px-4 py-3.5"
              >
                Explore the dashboard →
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
