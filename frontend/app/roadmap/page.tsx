'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Milestone,
  CheckCircle2,
  PlayCircle,
  Lock,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Award,
  ChevronDown,
  ChevronUp,
  Brain,
  Zap,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getLearningRoadmap, getUserProfile, getLearningMemory } from '@/lib/services';
import { getTargetRole } from '@/lib/mock-data';
import type { LearningModule, LearningMemory } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function RoadmapPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [memory, setMemory] = useState<LearningMemory | null>(null);
  const [expandedModuleId, setExpandedModuleId] = useState<string>('mod-sql-window');
  const role = getTargetRole();

  useEffect(() => {
    getLearningRoadmap().then(setModules);
    getLearningMemory().then(setMemory);

    const handleUpdate = () => {
      getLearningRoadmap().then(setModules);
      getLearningMemory().then(setMemory);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  if (!modules.length) {
    return (
      <AppShell title="Learning Roadmap">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Generating your personalized AI roadmap...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const completedCount = modules.filter((m) => m.status === 'completed').length;
  const inProgressModule = modules.find((m) => m.status === 'in-progress') ?? modules[0];
  const totalMinutes = modules.reduce((acc, m) => acc + m.estimatedMinutes, 0);

  // Reasons dynamically tailored to Alex's skill gaps
  const recommendationReasons: Record<string, string> = {
    'mod-python-foundations':
      'Verified via resume & diagnostic assessment (84% score). Marked as mastered.',
    'mod-sql-foundations':
      'Completed foundational data query syntax. Demonstrates clear competency.',
    'mod-sql-joins':
      'Targeted refresher completed after diagnostic identified minor subquery gap.',
    'mod-sql-window':
      'CURRENT PRIORITY — Required to elevate your SQL competency to the 85% target role standard.',
    'mod-stats-foundations':
      'UPCOMING PRIORITY — Identified as your largest skill gap (48% vs 75% target).',
    'mod-business-analytics':
      'FUTURE — Synthesizes data analysis into executive business recommendations.',
    'mod-capstone':
      'LOCKED — Final portfolio project evaluating full-stack data analytics competency.',
  };

  return (
    <AppShell title="Learning Roadmap">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Milestone className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">{role.title} Dynamic Roadmap</h1>
              </div>
              <p className="mt-1 text-muted-foreground">
                An adaptive, AI-orchestrated sequence structured around your exact skill gaps.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button asChild>
                <Link href="/learn">
                  <PlayCircle className="mr-2 h-4 w-4" />
                  Resume Current Module
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Roadmap Overview Banner */}
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-card to-secondary/30">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                    <Sparkles className="mr-1 h-3 w-3" />
                    AI Personalized
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Based on Diagnostic Assessment & Skill Map
                  </span>
                </div>
                <h2 className="text-xl font-bold text-foreground">
                  {completedCount} of {modules.length} Milestones Mastered
                </h2>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Your path dynamically skips elementary topics you already know and isolates high-leverage areas like Window Functions and Statistics.
                </p>
              </div>

              <div className="flex gap-6">
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Total Time</p>
                  <p className="text-xl font-bold">{Math.round(totalMinutes / 60)} hrs</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs text-muted-foreground">Active Module</p>
                  <p className="text-sm font-semibold text-primary max-w-[150px] truncate">
                    {inProgressModule.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4">
              <Progress value={(completedCount / modules.length) * 100} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Dynamic Roadmap Node Sequence */}
        <div className="relative space-y-6 pl-6 before:absolute before:bottom-3 before:left-8 before:top-3 before:w-0.5 before:bg-border md:pl-10 md:before:left-12">
          {modules.map((m, index) => {
            const isCompleted = m.status === 'completed';
            const isCurrent = m.status === 'in-progress';
            const isLocked = m.status === 'not-started';
            const isExpanded = expandedModuleId === m.id;
            const reason = recommendationReasons[m.id] ?? 'Recommended to strengthen role competency.';

            return (
              <div key={m.id} className="relative group">
                {/* Node Status Indicator Pin */}
                <div
                  className={cn(
                    'absolute -left-9 md:-left-12 top-6 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-bold transition-transform group-hover:scale-110',
                    isCompleted && 'border-emerald-500 bg-emerald-500 text-white dark:bg-emerald-600',
                    isCurrent && 'border-primary bg-background text-primary ring-4 ring-primary/20 animate-pulse',
                    isLocked && 'border-muted-foreground/30 bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isCurrent ? (
                    <PlayCircle className="h-4 w-4 fill-primary text-background" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                </div>

                {/* Module Card */}
                <Card
                  className={cn(
                    'transition-all',
                    isCurrent && 'border-primary/50 bg-primary/[0.02] shadow-md ring-1 ring-primary/20',
                    isCompleted && 'border-border/60 bg-card/60 opacity-90',
                    isLocked && 'border-border/40 bg-card/40 opacity-70'
                  )}
                >
                  <CardHeader className="cursor-pointer pb-3" onClick={() => setExpandedModuleId(isExpanded ? '' : m.id)}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <Badge
                          variant={isCompleted ? 'secondary' : isCurrent ? 'default' : 'outline'}
                          className="text-xs uppercase tracking-wider"
                        >
                          {isCompleted ? '✓ Completed' : isCurrent ? 'Current Priority' : index === 4 ? 'Next' : 'Locked'}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {m.skillName} · {m.difficulty.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {m.estimatedMinutes} mins
                        </span>
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </div>
                    </div>

                    <div className="mt-2 flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <CardTitle className="text-lg font-bold text-foreground">
                          {m.title}
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm">
                          {m.description}
                        </CardDescription>
                      </div>

                      {isCurrent && (
                        <Button asChild size="sm">
                          <Link href="/learn">
                            Continue
                            <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                          </Link>
                        </Button>
                      )}
                    </div>

                    {/* Progress line */}
                    {isCurrent && (
                      <div className="mt-3 space-y-1">
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>Module Progress</span>
                          <span className="font-semibold text-primary">{m.progress}%</span>
                        </div>
                        <Progress value={m.progress} className="h-1.5" />
                      </div>
                    )}
                  </CardHeader>

                  {/* Expanded Content: Why recommended + Lessons checklist */}
                  {isExpanded && (
                    <CardContent className="border-t pt-4 space-y-4">
                      {/* Reason AI Recommended */}
                      <div className="rounded-lg bg-secondary/30 p-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1.5 font-semibold text-foreground mb-1">
                          <Brain className="h-3.5 w-3.5 text-primary" />
                          Why this was scheduled:
                        </div>
                        <p>{reason}</p>
                      </div>

                      {/* Lessons list */}
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                          Curriculum Lessons ({m.lessons.length})
                        </p>
                        <div className="grid gap-2 sm:grid-cols-2">
                          {m.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                'flex items-center justify-between rounded-lg border p-2.5 text-xs',
                                lesson.completed ? 'border-emerald-500/20 bg-emerald-500/5 text-foreground' : 'border-border/60 text-muted-foreground'
                              )}
                            >
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    'h-2 w-2 rounded-full',
                                    lesson.completed ? 'bg-emerald-500' : 'bg-muted-foreground/30'
                                  )}
                                />
                                <span className="font-medium">{lesson.title}</span>
                              </div>
                              <span className="text-[11px] text-muted-foreground">{lesson.duration}m</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {isCurrent && (
                        <div className="flex justify-end pt-2">
                          <Button asChild size="sm">
                            <Link href="/learn">
                              Open Lesson Workspace
                              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  )}
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
