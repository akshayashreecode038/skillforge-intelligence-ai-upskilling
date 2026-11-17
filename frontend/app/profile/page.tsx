'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  User as UserIcon,
  Sparkles,
  Target,
  Brain,
  Clock,
  CheckCircle2,
  BookOpen,
  ArrowRight,
  RotateCcw,
  Save,
  Check,
  ShieldCheck,
  Calendar,
  Layers,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  getUserProfile,
  updateUserProfile,
  getLearningMemory,
  updateLearningMemory,
  resetDemoState,
} from '@/lib/services';
import { getTargetRole } from '@/lib/mock-data';
import type { User, LearningMemory } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [memory, setMemory] = useState<LearningMemory | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const role = getTargetRole();

  useEffect(() => {
    getUserProfile().then(setUser);
    getLearningMemory().then(setMemory);

    const handleUpdate = () => {
      getUserProfile().then(setUser);
      getLearningMemory().then(setMemory);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  if (!user || !memory) {
    return (
      <AppShell title="Profile & Learning Memory">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Retrieving your learning profile...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleSavePreferences = async (style: 'practical' | 'visual' | 'conceptual' | 'mixed', sessionLength: number) => {
    const updatedMemory = await updateLearningMemory({
      learningPreferences: {
        ...memory.learningPreferences,
        style,
        sessionLengthMinutes: sessionLength,
      },
    });
    setMemory(updatedMemory);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <AppShell title="Profile & Learning Memory">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserIcon className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">User Profile & AI Memory</h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              Manage your career objectives, preferred learning modalities, and inspect what the AI companion remembers.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                resetDemoState();
                window.location.reload();
              }}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
              Reset Demo State
            </Button>
          </div>
        </div>

        {/* SECTION 25: Dedicated "Learning Memory" Box */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Brain className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Learning Memory</CardTitle>
                  <CardDescription className="text-xs">
                    Persistent contextual ledger maintained by your AI agent
                  </CardDescription>
                </div>
              </div>

              {/* USP Callout Badge */}
              <Badge variant="outline" className="border-primary/40 bg-primary/10 text-primary text-xs">
                <Sparkles className="mr-1 h-3 w-3" />
                Persistent Cross-Session Memory
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">
              Your Recent Learning Context:
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Completed Topics</p>
                  <p className="text-muted-foreground">
                    Python fundamentals, SQL SELECT & aggregations, targeted multi-table join drill
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs">
                <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Demonstrated Mastery</p>
                  <p className="text-muted-foreground">
                    High aptitude in data filtering, grouping logic, and basic statistical measures
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs">
                <span className="h-2 w-2 rounded-full bg-amber-500 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-foreground">Needs Reinforcement</p>
                  <p className="text-muted-foreground">
                    Probability distributions, hypothesis testing, and business impact synthesis
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-lg border bg-card p-3 text-xs">
                <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Active Modality Preference</p>
                  <p className="text-muted-foreground capitalize">
                    Prefers {memory.learningPreferences.style} exercises & {memory.learningPreferences.sessionLengthMinutes}-minute sessions
                  </p>
                </div>
              </div>
            </div>

            {/* Last Session / Resume Box */}
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  <Clock className="h-3.5 w-3.5" />
                  Last Active Session
                </div>
                <p className="text-base font-bold text-foreground">
                  {memory.lastSession.topic}
                </p>
                <p className="text-xs text-muted-foreground">
                  Progress: {memory.lastSession.progressPercentage}% · Position: {memory.currentRoadmapPosition}
                </p>
              </div>

              <Button asChild size="default" className="shrink-0 shadow-sm">
                <Link href="/learn">
                  Resume Where You Left Off
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* User Information & Career Target (2 cols) */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* User Details */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Full Name</Label>
                <Input value={user.name} readOnly className="bg-secondary/20 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Email Address</Label>
                <Input value={user.email} readOnly className="bg-secondary/20 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Education</Label>
                <Input value={user.education} readOnly className="bg-secondary/20 text-sm" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Current Occupation</Label>
                <Input value={user.currentOccupation} readOnly className="bg-secondary/20 text-sm" />
              </div>
            </CardContent>
          </Card>

          {/* Career Target */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Career Target</CardTitle>
              <CardDescription className="text-xs">
                Your roadmap and gap analysis are calibrated against this benchmark
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-base text-foreground">{role.title}</span>
                  <Badge variant="default" className="text-xs">Primary Target</Badge>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {role.description}
                </p>
              </div>

              <div className="space-y-2 text-xs">
                <p className="font-semibold text-muted-foreground uppercase tracking-wider text-[11px]">
                  Required Core Competencies
                </p>
                <div className="space-y-1.5">
                  <div className="flex justify-between py-1 border-b">
                    <span>SQL (Window Functions & Joins)</span>
                    <span className="font-semibold text-primary">85% Required</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Python Data Wrangling</span>
                    <span className="font-semibold text-primary">80% Required</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span>Statistics & Inference</span>
                    <span className="font-semibold text-primary">75% Required</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span>Data Visualization & Reporting</span>
                    <span className="font-semibold text-primary">80% Required</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button asChild variant="outline" size="sm" className="w-full text-xs">
                  <Link href="/skill-gap">
                    Inspect Role Gap Breakdown
                    <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* SECTION 26: Learning Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">AI Personalization & Learning Preferences</CardTitle>
                <CardDescription className="text-xs">
                  The AI modifies question difficulty, examples, and module length based on these settings
                </CardDescription>
              </div>
              {isSaved && (
                <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                  <Check className="mr-1 h-3 w-3" /> Saved!
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Preferred Learning Style */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Preferred Learning Style
              </Label>
              <div className="grid gap-3 sm:grid-cols-4">
                {[
                  { id: 'practical', title: 'Practical', desc: 'Code sandboxes, live queries & realistic tasks' },
                  { id: 'visual', title: 'Visual', desc: 'Diagrams, animations & visual flowcharts' },
                  { id: 'conceptual', title: 'Conceptual', desc: 'First-principles theory & analogies' },
                  { id: 'mixed', title: 'Mixed', desc: 'Balanced combination of all three formats' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() =>
                      handleSavePreferences(opt.id as any, memory.learningPreferences.sessionLengthMinutes)
                    }
                    className={cn(
                      'rounded-xl border p-3.5 text-left transition-all',
                      memory.learningPreferences.style === opt.id
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border/60 hover:bg-secondary/40'
                    )}
                  >
                    <p className="font-semibold text-xs text-foreground">{opt.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{opt.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Preferred Session Length */}
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                Preferred Session Duration
              </Label>
              <div className="grid gap-3 sm:grid-cols-3">
                {[
                  { mins: 15, title: '15 Minutes', desc: 'Micro-drills & focused single-concept practice' },
                  { mins: 30, title: '30 Minutes', desc: 'Standard balanced lesson with interactive exercise' },
                  { mins: 60, title: '60 Minutes', desc: 'Deep dive, comprehensive projects & capstones' },
                ].map((dur) => (
                  <button
                    key={dur.mins}
                    type="button"
                    onClick={() =>
                      handleSavePreferences(memory.learningPreferences.style, dur.mins)
                    }
                    className={cn(
                      'rounded-xl border p-3.5 text-left transition-all',
                      memory.learningPreferences.sessionLengthMinutes === dur.mins
                        ? 'border-primary bg-primary/5 ring-1 ring-primary/30'
                        : 'border-border/60 hover:bg-secondary/40'
                    )}
                  >
                    <p className="font-semibold text-xs text-foreground">{dur.title}</p>
                    <p className="text-[11px] text-muted-foreground mt-1">{dur.desc}</p>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
