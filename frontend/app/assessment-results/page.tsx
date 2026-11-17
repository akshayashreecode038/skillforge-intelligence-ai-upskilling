'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowRight, TrendingUp, Award, FileText, Code2, FlaskConical, CheckCircle2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { getSkillProfile, getUserProfile } from '@/lib/services';
import { cn } from '@/lib/utils';
import type { SkillProfile, User } from '@/lib/types';

const evidenceIcons = {
  assessment: Award,
  resume: FileText,
  project: Code2,
  practice: FlaskConical,
};

export default function AssessmentResultsPage() {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    getSkillProfile().then(setProfile);
    getUserProfile().then(setUser);
  }, []);

  const overall = profile?.overallAlignment ?? 0;
  const skills = profile?.skills ?? [];
  const targetRoleTitle = user?.targetRoleId || 'your target role';

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-4xl items-center px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillForge</span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-4xl px-6 py-10">
        {/* Header */}
        <div className="mb-8 text-center animate-slide-up">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <TrendingUp className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Your Skill Profile Is Ready</h1>
          <p className="mt-2 text-muted-foreground">
            Based on your assessment, resume, and self-reported skills, here's where you stand.
          </p>
        </div>

        {/* Overall Readiness */}
        <Card className="mb-6 shadow-md">
          <CardContent className="p-8">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="flex-1 text-center sm:text-left">
                <p className="text-sm font-medium text-muted-foreground">Current competency alignment</p>
                <p className="mt-1 text-5xl font-bold text-primary">{overall}%</p>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  This measures how your current skills align with the requirements of {targetRoleTitle} — not a prediction of employment outcomes.
                </p>
              </div>
              <div className="relative flex h-32 w-32 items-center justify-center">
                <svg className="h-32 w-32 -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="hsl(var(--secondary))" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke="hsl(var(--primary))" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 52 * (overall / 100)} ${2 * Math.PI * 52}`}
                  />
                </svg>
                <div className="absolute text-center">
                  <p className="text-2xl font-bold">{overall}%</p>
                  <p className="text-xs text-muted-foreground">aligned</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Breakdown */}
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-xl font-bold">Skill breakdown</h2>
          <Badge variant="secondary">{skills.length} skills assessed</Badge>
        </div>

        <div className="space-y-4">
          {skills.map((skill, i) => (
            <Card key={skill.skillId} className="animate-slide-up overflow-hidden" style={{ animationDelay: `${i * 80}ms` }}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold">{skill.skillName}</h3>
                      <Badge
                        variant="outline"
                        className={cn(
                          skill.gap === 0
                            ? 'border-success/30 text-success'
                            : skill.gap > 15
                            ? 'border-destructive/30 text-destructive'
                            : 'border-warning/30 text-warning'
                        )}
                      >
                        {skill.gap === 0 ? 'On target' : skill.gap > 15 ? 'Large gap' : 'Moderate gap'}
                      </Badge>
                    </div>
                    <div className="mt-3 flex items-center gap-6">
                      <div>
                        <p className="text-xs text-muted-foreground">Current</p>
                        <p className="text-lg font-semibold">{skill.currentLevel}%</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground">Target</p>
                        <p className="text-lg font-semibold text-muted-foreground">{skill.targetLevel}%</p>
                      </div>
                      <div className="h-8 w-px bg-border" />
                      <div>
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className="text-sm font-medium capitalize">{skill.confidence}</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="relative h-2.5 rounded-full bg-secondary">
                        <div
                          className="absolute h-full rounded-full bg-primary"
                          style={{ width: `${skill.currentLevel}%` }}
                        />
                        <div
                          className="absolute top-[-3px] h-[18px] w-[2px] bg-muted-foreground/60"
                          style={{ left: `${skill.targetLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                <div className="mt-4 border-t pt-4">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
                  <div className="space-y-1.5">
                    {skill.evidence.map((ev, j) => {
                      const Icon = evidenceIcons[ev.type];
                      return (
                        <div key={j} className="flex items-center gap-2 text-sm">
                          <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="text-muted-foreground">{ev.description}</span>
                          <span className="ml-auto text-xs text-muted-foreground/60">{ev.date}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Disclaimer */}
        <div className="mt-6 flex items-start gap-3 rounded-lg bg-secondary/50 p-4">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Skill alignment reflects your demonstrated competencies relative to role requirements. It does not guarantee job placement. Continue learning and building projects to strengthen your profile.
          </p>
        </div>

        {/* CTA */}
        <Card className="mt-6 overflow-hidden border-primary/20 bg-primary/5">
          <CardContent className="flex flex-col items-center gap-4 p-8 text-center">
            <CheckCircle2 className="h-10 w-10 text-primary" />
            <div>
              <h2 className="text-xl font-bold">Your personalized roadmap is ready</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Your AI agent has created a learning plan based on your skill gaps. Start learning now.
              </p>
            </div>
            <Button size="lg" asChild>
              <Link href="/dashboard">
                Go to Dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
