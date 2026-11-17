'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Award,
  CheckCircle2,
  FolderKanban,
  AlertTriangle,
  ArrowUpRight,
  Sparkles,
  Calendar,
  Flame,
  ArrowRight,
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getLearningProgress, getSkillProfile, getUserProfile } from '@/lib/services';
import type { LearningProgress, SkillProfile } from '@/lib/types';
import { cn } from '@/lib/utils';

// Longitudinal progression data
const skillHistoryData = [
  { week: 'Week 1', SQL: 45, Python: 60, Statistics: 30, Visualization: 40 },
  { week: 'Week 2', SQL: 58, Python: 70, Statistics: 35, Visualization: 48 },
  { week: 'Week 3', SQL: 68, Python: 78, Statistics: 42, Visualization: 55 },
  { week: 'Week 4', SQL: 78, Python: 84, Statistics: 48, Visualization: 62 },
];

export default function ProgressPage() {
  const [progress, setProgress] = useState<LearningProgress | null>(null);
  const [profile, setProfile] = useState<SkillProfile | null>(null);

  useEffect(() => {
    getLearningProgress().then(setProgress);
    getSkillProfile().then(setProfile);

    const handleUpdate = () => {
      getLearningProgress().then(setProgress);
      getSkillProfile().then(setProfile);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  if (!progress || !profile) {
    return (
      <AppShell title="Progress Analytics">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading longitudinal progress data...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title="Longitudinal Progress">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Learning & Skill Progression</h1>
              </div>
              <p className="mt-1 text-muted-foreground">
                Measurable skill acquisition over time based on validated assessments and practical projects.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary py-1 px-3">
                <Flame className="mr-1 h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                {progress.streakDays} Day Learning Streak
              </Badge>
            </div>
          </div>
        </div>

        {/* 4 Top KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-wider font-semibold">Weekly Study Time</span>
                <Clock className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{progress.weeklyTime}</span>
                <span className="text-xs text-muted-foreground">/ {progress.weeklyGoal} mins</span>
              </div>
              <Progress value={(progress.weeklyTime / progress.weeklyGoal) * 100} className="mt-2 h-1.5" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-wider font-semibold">Topics Mastered</span>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{progress.topicsCompleted}</span>
                <span className="text-xs text-muted-foreground">verified modules</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">+3 topics completed this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-wider font-semibold">Assessments Passed</span>
                <Award className="h-4 w-4 text-primary" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{progress.assessmentsCompleted}</span>
                <span className="text-xs text-muted-foreground">adaptive exams</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">Avg diagnostic score: 78%</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-xs uppercase tracking-wider font-semibold">Projects Completed</span>
                <FolderKanban className="h-4 w-4 text-indigo-500" />
              </div>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl font-bold">{progress.projectsCompleted}</span>
                <span className="text-xs text-muted-foreground">practical challenges</span>
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground">1 project in review</p>
            </CardContent>
          </Card>
        </div>

        {/* Longitudinal Skill Chart */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Progression Over Time Chart (8 cols) */}
          <Card className="lg:col-span-8">
            <CardHeader className="pb-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="text-base">Skill Progression Trajectory</CardTitle>
                  <CardDescription>Validated competence growth across past 4 weeks</CardDescription>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-primary">
                    <span className="h-2 w-2 rounded-full bg-primary" /> SQL
                  </span>
                  <span className="flex items-center gap-1 text-emerald-500">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" /> Python
                  </span>
                  <span className="flex items-center gap-1 text-rose-500">
                    <span className="h-2 w-2 rounded-full bg-rose-500" /> Statistics
                  </span>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={skillHistoryData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="week" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis domain={[0, 100]} stroke="#888888" fontSize={11} tickLine={false} unit="%" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Line type="monotone" dataKey="SQL" stroke="hsl(var(--primary))" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="Python" stroke="#10b981" strokeWidth={2.5} dot={{ r: 4 }} />
                    <Line type="monotone" dataKey="Statistics" stroke="#f43f5e" strokeWidth={2.5} dot={{ r: 4 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Weekly Learning Distribution Bar (4 cols) */}
          <Card className="lg:col-span-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Daily Study Minutes</CardTitle>
              <CardDescription>Daily minutes invested this week</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={progress.dailyMinutes} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} vertical={false} />
                    <XAxis dataKey="day" stroke="#888888" fontSize={11} tickLine={false} />
                    <YAxis stroke="#888888" fontSize={11} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                    />
                    <Bar dataKey="minutes" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Section 24 Requirement: Skills Improving vs Skills Needing Reinforcement */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Skills Improving */}
          <Card className="border-emerald-500/20 bg-emerald-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                <CardTitle className="text-base text-foreground">Skills Accelerating</CardTitle>
              </div>
              <CardDescription>Areas showing consistent upwards trajectory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>SQL Window Functions & Aggregations</span>
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" /> +14% this month
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Elevated from 64% to 78% following hands-on rolling average calculations.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Python Data Wrangling (Pandas)</span>
                  <span className="text-emerald-500 flex items-center gap-0.5">
                    <ArrowUpRight className="h-3 w-3" /> +8% this month
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Solid foundation verified across multiple diagnostic evaluations.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Skills Needing Reinforcement */}
          <Card className="border-amber-500/20 bg-amber-500/[0.02]">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <CardTitle className="text-base text-foreground">Skills Needing Reinforcement</CardTitle>
              </div>
              <CardDescription>Areas targeted for upcoming learning modules</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-lg border bg-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Probability Distributions & Hypothesis Testing</span>
                  <Badge variant="outline" className="border-rose-500/30 text-rose-500 text-[10px]">
                    Priority Gap (48%)
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Next scheduled milestone in roadmap. Needs 30 mins/day for 1 week.
                </p>
                <div className="pt-1">
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    <Link href="/learn">
                      Review Statistics Module
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3.5 space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span>Business Impact Synthesis</span>
                  <Badge variant="outline" className="border-amber-500/30 text-amber-500 text-[10px]">
                    Moderate Gap (51%)
                  </Badge>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Requires additional practice translating SQL queries into executive summaries.
                </p>
                <div className="pt-1">
                  <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs text-primary">
                    <Link href="/projects">
                      Open Practical Project
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
