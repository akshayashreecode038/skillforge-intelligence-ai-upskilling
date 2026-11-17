'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  GraduationCap,
  TrendingUp,
  Clock,
  CheckCircle2,
  Award,
  FolderKanban,
  Flame,
  Target,
  Sparkles,
  Brain,
  GitCompare,
  Milestone,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  getUserProfile,
  getSkillProfile,
  getLearningRoadmap,
  getLearningProgress,
  getLearningMemory,
} from '@/lib/services';
import { getTargetRole, recommendations } from '@/lib/mock-data';
import type { User, SkillProfile, LearningModule, LearningProgress as LearningProgressType, LearningMemory } from '@/lib/types';

const activityIcons = {
  lesson: GraduationCap,
  assessment: Award,
  project: FolderKanban,
  'skill-update': TrendingUp,
};

function formatTimeAgo(dateStr: string) {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 3600) return `${Math.max(1, Math.floor(diff / 60))}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<LearningProgressType | null>(null);
  const [memory, setMemory] = useState<LearningMemory | null>(null);

  const role = getTargetRole();

  const loadData = () => {
    getUserProfile().then(setUser);
    getSkillProfile().then(setProfile);
    getLearningRoadmap().then(setModules);
    getLearningProgress().then(setProgress);
    getLearningMemory().then(setMemory);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('skillforge_state_updated', loadData);
    return () => window.removeEventListener('skillforge_state_updated', loadData);
  }, []);

  if (!user || !profile || !progress || !memory) {
    return (
      <AppShell title="Dashboard">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading your personalized dashboard...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const currentModule = modules.find((m) => m.status === 'in-progress') ?? modules[0];
  const topRec = recommendations[0];
  const alignment = profile.overallAlignment;

  const priorities = profile.skills
    .filter((s) => s.gap > 0)
    .sort((a, b) => b.gap - a.gap)
    .slice(0, 3);

  return (
    <AppShell title="Dashboard">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Welcome Back & Greeting Banner */}
        <div className="animate-slide-up flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Good morning, {user.name.split(' ')[0]}.
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Welcome back. You left off at <strong className="text-foreground">{memory.lastSession.topic}</strong> ({memory.lastSession.progressPercentage}%).
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary py-1 px-3">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Continuous AI Synchronization Active
            </Badge>
          </div>
        </div>

        {/* Top row: Career Target + AI Recommendation */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Career Target */}
          <Card className="lg:col-span-1 border-border shadow-sm">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5 font-semibold uppercase tracking-wider">
                  <Target className="h-4 w-4 text-primary" />
                  Career Target
                </span>
                <Badge variant="secondary" className="text-xs">Primary</Badge>
              </div>

              <div>
                <p className="text-xl font-bold text-foreground">{role.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Industry Competency Benchmark</p>
              </div>

              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Skill Alignment</span>
                  <span className="text-lg font-bold text-primary">{alignment}%</span>
                </div>
                <Progress value={alignment} className="h-2" />
                <p className="text-[11px] text-muted-foreground pt-1">
                  Validated capability match (not hiring probability)
                </p>
              </div>

              <div className="pt-1 flex gap-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link href="/skill-gap">Inspect Gap</Link>
                </Button>
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link href="/skills">Skill Map</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Recommendation */}
          <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background lg:col-span-2 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm">
                  <Bot className="h-6 w-6" />
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                      Your AI Learning Agent recommends
                    </p>
                    <Badge variant="outline" className="text-[11px]">
                      High ROI
                    </Badge>
                  </div>
                  <h3 className="text-base font-bold text-foreground">{topRec.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Spend 25 minutes on window functions before moving to advanced analytics.
                  </p>
                  <div className="flex flex-wrap items-center gap-4 pt-1">
                    <Button size="sm" asChild>
                      <Link href="/learn">
                        Start Recommended Activity
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      ~{topRec.estimatedMinutes} min · {topRec.reason}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Continue Learning + Top Priorities */}
        <div className="grid gap-4 lg:grid-cols-3">
          {/* Continue Learning */}
          <Card className="lg:col-span-2 overflow-hidden border-border shadow-sm">
            <div className="flex flex-col sm:flex-row">
              <div className="flex-1 p-6 space-y-3">
                <Badge variant="secondary" className="gap-1 text-xs">
                  <GraduationCap className="h-3.5 w-3.5" />
                  Continue Learning
                </Badge>
                <h3 className="text-xl font-bold text-foreground">
                  Continue: {currentModule.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {currentModule.description}
                </p>
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Module Progress</span>
                    <span className="font-semibold text-primary">{currentModule.progress}%</span>
                  </div>
                  <Progress value={currentModule.progress} className="h-2" />
                </div>
                <div className="pt-2">
                  <Button asChild>
                    <Link href="/learn">
                      Continue Learning
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>

              {/* Radial Visualizer */}
              <div className="flex items-center justify-center bg-secondary/30 p-8 sm:w-52 border-t sm:border-t-0 sm:border-l">
                <div className="relative h-28 w-28 flex items-center justify-center">
                  <svg className="h-28 w-28 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--secondary))" strokeWidth="8" />
                    <circle
                      cx="50"
                      cy="50"
                      r="42"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42 * (currentModule.progress / 100)} ${2 * Math.PI * 42}`}
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center">
                    <span className="text-2xl font-bold text-foreground">{currentModule.progress}%</span>
                    <span className="text-[10px] text-muted-foreground">complete</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Top Priorities */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Top Priorities</CardTitle>
                <Badge variant="outline" className="text-[10px]">Ranked by Gap</Badge>
              </div>
              <CardDescription className="text-xs">Highest leverage competencies to close</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {priorities.map((p, i) => (
                <div key={p.skillName} className="flex items-center gap-3 p-2 rounded-lg bg-secondary/30">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-foreground truncate">{p.skillName}</p>
                    <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                      <span>{p.currentLevel}%</span>
                      <ArrowRight className="h-3 w-3" />
                      <span>{p.targetLevel}%</span>
                      <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px] text-rose-500 border-rose-500/30">
                        -{p.gap}%
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              <Button asChild variant="ghost" size="sm" className="w-full text-xs">
                <Link href="/skill-gap">Open Complete Skill Gap Comparison</Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 25: Persistent Learning Memory Box */}
        <Card className="border-border bg-card/60">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-primary" />
                <CardTitle className="text-base font-bold">Persistent Learning Memory</CardTitle>
              </div>
              <Badge variant="secondary" className="text-xs">
                Cross-Session Memory
              </Badge>
            </div>
            <CardDescription className="text-xs">
              Context remembered by your AI companion to optimize your experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 text-xs">
              <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Completed
                </p>
                <p className="text-muted-foreground">SQL & Python fundamentals, joins refresher</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Sparkles className="h-3.5 w-3.5 text-primary" /> Strong
                </p>
                <p className="text-muted-foreground">Data filtering, grouping, aggregation syntax</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-amber-500" /> Needs Work
                </p>
                <p className="text-muted-foreground">Probability distributions & business impact</p>
              </div>
              <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                <p className="font-semibold text-foreground flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-primary" /> Last Session
                </p>
                <p className="text-muted-foreground truncate">{memory.lastSession.topic} ({memory.lastSession.progressPercentage}%)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Progress + Recent Activity */}
        <div className="grid gap-4 lg:grid-cols-2">
          {/* Weekly Progress */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Weekly Progress</CardTitle>
                <Badge variant="secondary" className="gap-1 text-xs">
                  <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                  {user.streak} day streak
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="rounded-lg bg-secondary/30 p-2">
                  <Clock className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-base font-bold">{progress.weeklyTime}</p>
                  <p className="text-[10px] text-muted-foreground">minutes</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2">
                  <CheckCircle2 className="mx-auto h-4 w-4 text-emerald-500" />
                  <p className="mt-1 text-base font-bold">{progress.topicsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">topics</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2">
                  <Award className="mx-auto h-4 w-4 text-primary" />
                  <p className="mt-1 text-base font-bold">{progress.assessmentsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">assessments</p>
                </div>
                <div className="rounded-lg bg-secondary/30 p-2">
                  <FolderKanban className="mx-auto h-4 w-4 text-indigo-500" />
                  <p className="mt-1 text-base font-bold">{progress.projectsCompleted}</p>
                  <p className="text-[10px] text-muted-foreground">projects</p>
                </div>
              </div>

              <div>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Weekly goal: 300 mins</span>
                  <span className="font-semibold text-primary">{progress.weeklyTime} / {progress.weeklyGoal} min</span>
                </div>
                <Progress value={(progress.weeklyTime / progress.weeklyGoal) * 100} className="h-1.5" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">Recent Activity</CardTitle>
                <Link href="/progress" className="text-xs text-primary hover:underline">
                  View full history
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {progress.recentActivity.slice(0, 4).map((activity, i) => {
                  const Icon = activityIcons[activity.type] ?? CheckCircle2;
                  return (
                    <div key={activity.id} className="relative flex items-start gap-3 py-2 text-xs">
                      {i < 3 && <div className="absolute left-[13px] top-7 h-[calc(100%-8px)] w-px bg-border" />}
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                        <Icon className="h-3.5 w-3.5" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-foreground">{activity.description}</p>
                        <p className="text-[11px] text-muted-foreground">{formatTimeAgo(activity.timestamp)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Launch Cards */}
        <div className="grid gap-3 sm:grid-cols-4">
          <Link href="/skill-gap" className="group">
            <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <GitCompare className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">Skill Gap</p>
                  <p className="text-[11px] text-muted-foreground">Compare vs role</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/roadmap" className="group">
            <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Milestone className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">Roadmap</p>
                  <p className="text-[11px] text-muted-foreground">Dynamic path</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/projects" className="group">
            <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FolderKanban className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">Projects</p>
                  <p className="text-[11px] text-muted-foreground">Practical tasks</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>

          <Link href="/agent" className="group">
            <Card className="transition-all group-hover:border-primary/50 group-hover:shadow-sm">
              <CardContent className="flex items-center gap-3 p-3.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold truncate">AI Agent</p>
                  <p className="text-[11px] text-muted-foreground">Ask anything</p>
                </div>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary" />
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </AppShell>
  );
}
