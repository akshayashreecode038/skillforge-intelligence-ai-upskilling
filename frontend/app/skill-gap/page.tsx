'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  Target,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  BookOpen,
  FolderKanban,
  ShieldCheck,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSkillProfile, getUserProfile } from '@/lib/services';
import { getTargetRole } from '@/lib/mock-data';
import type { SkillProfile, SkillAssessment } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GapInsight {
  whyItMatters: string;
  recommendedAction: string;
  estimatedTimeToClose: string;
  actionHref: string;
  actionLabel: string;
}

const gapInsights: Record<string, GapInsight> = {
  'skill-stats': {
    whyItMatters:
      'Statistical reasoning underpins A/B testing, regression modeling, and separating true signal from random variance in business metrics.',
    recommendedAction:
      'Complete the Probability Distributions lesson and analyze an actual experimentation dataset.',
    estimatedTimeToClose: '4–6 study hours',
    actionHref: '/learn',
    actionLabel: 'Start Statistics Lesson',
  },
  'skill-sql': {
    whyItMatters:
      'Window functions and CTEs are standard requirements for senior analytics roles to compute running totals, customer retention, and cohort analyses without cumbersome subqueries.',
    recommendedAction:
      'Finish the SQL Window Functions module (currently at 64%) and solve the practical retention query.',
    estimatedTimeToClose: '45 minutes',
    actionHref: '/learn',
    actionLabel: 'Continue SQL Window Functions',
  },
  'skill-biz': {
    whyItMatters:
      'Technical insights generate little impact if not translated into actionable ROI projections and clear stakeholder presentations.',
    recommendedAction:
      'Complete the E-commerce Sales Analysis project and submit an executive summary.',
    estimatedTimeToClose: '2 hours',
    actionHref: '/projects',
    actionLabel: 'Launch Practical Project',
  },
  'skill-viz': {
    whyItMatters:
      'Clear, accessible visualizations prevent misinterpretation and help leadership quickly act on dashboard trends.',
    recommendedAction:
      'Practice building interactive KPI cards and distribution heatmaps.',
    estimatedTimeToClose: '1.5 hours',
    actionHref: '/projects',
    actionLabel: 'View Viz Project',
  },
  'skill-python': {
    whyItMatters:
      'Python is your foundational tool for automated data manipulation, ETL scripts, and feature extraction with Pandas.',
    recommendedAction:
      'Maintain proficiency by exploring vectorization techniques in NumPy.',
    estimatedTimeToClose: 'Aligned (On Track)',
    actionHref: '/learn',
    actionLabel: 'Review Python Topics',
  },
};

export default function SkillGapPage() {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('skill-stats');
  const role = getTargetRole();

  useEffect(() => {
    getSkillProfile().then(setProfile);
    const handleUpdate = () => {
      getSkillProfile().then(setProfile);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  if (!profile) {
    return (
      <AppShell title="Skill Gap">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Analyzing skill competencies...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const skills = profile.skills;
  const selectedSkill = skills.find((s) => s.skillId === selectedSkillId) ?? skills[0];
  const insight = gapInsights[selectedSkill.skillId] ?? {
    whyItMatters: 'Essential competency required to perform reliably in this target role.',
    recommendedAction: 'Engage with recommended lessons and hands-on exercises.',
    estimatedTimeToClose: '1–2 weeks',
    actionHref: '/learn',
    actionLabel: 'Explore Modules',
  };

  const getStatusBadge = (current: number, target: number) => {
    const diff = target - current;
    if (diff <= 0) {
      return (
        <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="mr-1 h-3 w-3" />
          Strong Alignment
        </Badge>
      );
    }
    if (diff <= 15) {
      return (
        <Badge variant="outline" className="border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400">
          <Clock className="mr-1 h-3 w-3" />
          Developing
        </Badge>
      );
    }
    return (
      <Badge variant="outline" className="border-rose-500/30 bg-rose-500/10 text-rose-600 dark:text-rose-400">
        <AlertCircle className="mr-1 h-3 w-3" />
        Priority Gap
      </Badge>
    );
  };

  return (
    <AppShell title="Skill Gap Analysis">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Your Skill Gap</h1>
              </div>
              <p className="mt-1 text-muted-foreground">
                Comparing your demonstrated capabilities with industry benchmarks for <span className="font-semibold text-foreground">{role.title}</span>.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild variant="outline" size="sm">
                <Link href="/roadmap">
                  View Roadmap
                  <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/learn">
                  Continue Learning
                  <Sparkles className="ml-1.5 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Summary Card */}
        <Card className="border-primary/20 bg-card/60 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Target Role</p>
                <p className="text-xl font-bold text-foreground">{role.title}</p>
                <p className="text-sm text-muted-foreground">5 Key Competency Areas</p>
              </div>

              <div className="space-y-1 border-y py-4 md:border-x md:border-y-0 md:px-6 md:py-0">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Current Skill Alignment</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-primary">{profile.overallAlignment}%</span>
                  <span className="text-xs text-muted-foreground">readiness index</span>
                </div>
                <Progress value={profile.overallAlignment} className="h-2" />
              </div>

              <div className="flex flex-col justify-center space-y-1">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Priority Focus</p>
                <p className="text-base font-semibold text-foreground">Statistics & Business Analysis</p>
                <p className="text-xs text-muted-foreground">Closing these 2 gaps will bring alignment to ~84%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Comparison Section: Left: Bars, Right: Deep-Dive Card */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Left Column: Horizontal comparison bars (7 cols) */}
          <Card className="lg:col-span-7">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Competency Comparison</CardTitle>
                  <CardDescription>Your current validated score vs target role standard</CardDescription>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    <span>Your Profile</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/40" />
                    <span>Target Level</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {skills.map((s) => {
                const isSelected = selectedSkillId === s.skillId;
                const isOver = s.currentLevel >= s.targetLevel;
                const gap = Math.max(0, s.targetLevel - s.currentLevel);

                return (
                  <button
                    key={s.skillId}
                    type="button"
                    onClick={() => setSelectedSkillId(s.skillId)}
                    className={cn(
                      'w-full rounded-xl border p-4 text-left transition-all',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm ring-1 ring-primary/30'
                        : 'border-border/60 hover:border-primary/30 hover:bg-secondary/40'
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-foreground">{s.skillName}</span>
                        {getStatusBadge(s.currentLevel, s.targetLevel)}
                      </div>
                      <div className="flex items-center gap-3 text-sm font-medium">
                        <span className="text-primary font-bold">{s.currentLevel}%</span>
                        <span className="text-muted-foreground text-xs">of {s.targetLevel}% required</span>
                        <ChevronRight className={cn('h-4 w-4 text-muted-foreground transition-transform', isSelected && 'rotate-90 text-primary')} />
                      </div>
                    </div>

                    {/* Horizontal Bar Graphic */}
                    <div className="relative mt-3">
                      {/* Target Marker Bar */}
                      <div className="relative h-3 w-full overflow-hidden rounded-full bg-secondary">
                        {/* Current fill */}
                        <div
                          className={cn(
                            'h-full rounded-full transition-all duration-700',
                            isOver ? 'bg-emerald-500' : gap <= 15 ? 'bg-primary' : 'bg-rose-500'
                          )}
                          style={{ width: `${s.currentLevel}%` }}
                        />
                      </div>

                      {/* Target Indicator Line */}
                      <div
                        className="absolute -top-1 bottom-0 flex flex-col items-center pointer-events-none"
                        style={{ left: `${s.targetLevel}%` }}
                        title={`Target: ${s.targetLevel}%`}
                      >
                        <div className="h-5 w-0.5 bg-foreground rounded-full shadow" />
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                      <span>0%</span>
                      <span>
                        {gap > 0 ? (
                          <span className="text-rose-500 dark:text-rose-400 font-medium">Gap: -{gap}%</span>
                        ) : (
                          <span className="text-emerald-500 font-medium">Met standard (+{s.currentLevel - s.targetLevel}%)</span>
                        )}
                      </span>
                      <span>100%</span>
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Right Column: "Why this matters" and "Recommended actions" (5 cols) */}
          <div className="space-y-4 lg:col-span-5">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-secondary text-xs uppercase tracking-wider">
                    Deep Dive
                  </Badge>
                  <span className="text-xs text-muted-foreground">Confidence: {selectedSkill.confidence.toUpperCase()}</span>
                </div>
                <CardTitle className="text-xl font-bold text-foreground mt-2">
                  {selectedSkill.skillName}
                </CardTitle>
                <div className="flex items-center gap-3 pt-1 text-sm">
                  <span>Current: <strong>{selectedSkill.currentLevel}%</strong></span>
                  <span>·</span>
                  <span>Target: <strong>{selectedSkill.targetLevel}%</strong></span>
                  <span>·</span>
                  <span>
                    Gap: <strong className={selectedSkill.gap > 0 ? 'text-rose-500' : 'text-emerald-500'}>
                      {selectedSkill.gap > 0 ? `-${selectedSkill.gap}%` : 'None'}
                    </strong>
                  </span>
                </div>
              </CardHeader>

              <CardContent className="space-y-5">
                {/* Why this matters */}
                <div className="rounded-lg border border-border/80 bg-secondary/30 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                    <HelpCircle className="h-4 w-4 text-primary" />
                    Why this matters for {role.title}
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {insight.whyItMatters}
                  </p>
                </div>

                {/* Recommended action */}
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <Sparkles className="h-4 w-4 text-primary" />
                    Recommended AI Action
                  </div>
                  <p className="mt-2 text-sm text-foreground/90 leading-relaxed">
                    {insight.recommendedAction}
                  </p>
                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-primary/10">
                    <span className="text-xs text-muted-foreground">
                      Est. investment: <strong>{insight.estimatedTimeToClose}</strong>
                    </span>
                    <Button size="sm" asChild>
                      <Link href={insight.actionHref}>
                        {insight.actionLabel}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>

                {/* Evidence on record */}
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Evidence on Record
                  </p>
                  <div className="space-y-2">
                    {selectedSkill.evidence.map((ev, i) => (
                      <div key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground rounded-md bg-secondary/20 p-2.5">
                        <ShieldCheck className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">{ev.description}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Source: {ev.type.toUpperCase()} · {new Date(ev.date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* AI Callout */}
            <Card className="border-border bg-gradient-to-br from-secondary/40 to-background">
              <CardContent className="p-4 flex items-start gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="text-xs space-y-1">
                  <p className="font-semibold text-foreground">Adaptive Intelligence Note</p>
                  <p className="text-muted-foreground">
                    Your roadmap dynamically shifts practice hours toward your largest gaps while locking or skipping mastered areas like Python foundations.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
