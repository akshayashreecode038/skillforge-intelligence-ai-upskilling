'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Radar,
  Award,
  FileText,
  Code2,
  FlaskConical,
  Target,
  Sparkles,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getSkillProfile } from '@/lib/services';
import { getTargetRole } from '@/lib/mock-data';
import type { SkillProfile, SkillAssessment } from '@/lib/types';
import { cn } from '@/lib/utils';

const evidenceIcons = {
  assessment: Award,
  resume: FileText,
  project: Code2,
  practice: FlaskConical,
};

export default function SkillDetailPage() {
  const params = useParams();
  const skillParam = (params?.skill as string) || 'skill-sql';

  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const role = getTargetRole();

  useEffect(() => {
    getSkillProfile().then(setProfile);
  }, []);

  if (!profile) {
    return (
      <AppShell title="Skill Detail">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Loading skill intelligence...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Find skill by id or slug
  const skill =
    profile.skills.find((s) => s.skillId === skillParam || s.skillName.toLowerCase().replace(/\s+/g, '-') === skillParam) ??
    profile.skills[0];

  const gap = Math.max(0, skill.targetLevel - skill.currentLevel);

  return (
    <AppShell title={`${skill.skillName} Detail`}>
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Back Link */}
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="icon" className="h-8 w-8">
            <Link href="/skills">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <span className="text-xs text-muted-foreground">Back to all skills</span>
        </div>

        {/* Skill Hero Banner */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs uppercase">
                    Competency Intelligence
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      gap === 0
                        ? 'border-emerald-500/30 text-emerald-600 bg-emerald-500/10'
                        : gap <= 15
                        ? 'border-amber-500/30 text-amber-600 bg-amber-500/10'
                        : 'border-rose-500/30 text-rose-600 bg-rose-500/10'
                    )}
                  >
                    {gap === 0 ? 'Target Met' : `${gap}% Gap`}
                  </Badge>
                </div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground">{skill.skillName}</h1>
                <p className="text-sm text-muted-foreground max-w-xl">
                  Benchmark calibrated against industry competencies for <strong>{role.title}</strong>.
                </p>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Current Level</p>
                  <p className="text-3xl font-extrabold text-primary">{skill.currentLevel}%</p>
                  <p className="text-xs text-muted-foreground">Target: {skill.targetLevel}%</p>
                </div>
                <Button asChild size="default">
                  <Link href="/learn">
                    Practice This Skill
                    <ArrowRight className="ml-1.5 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 space-y-1">
              <Progress value={skill.currentLevel} className="h-2.5" />
            </div>
          </CardContent>
        </Card>

        {/* 2-Column: Evidence on Left, Gap Analysis & Next Steps on Right */}
        <div className="grid gap-6 md:grid-cols-12">
          {/* Left: Validated Evidence (7 cols) */}
          <Card className="md:col-span-7">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-primary" />
                <CardTitle className="text-base">Validated Evidence</CardTitle>
              </div>
              <CardDescription className="text-xs">
                How this proficiency score was calculated across assessments, resume, and code submissions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {skill.evidence.map((ev, i) => {
                const Icon = evidenceIcons[ev.type] ?? Award;
                return (
                  <div key={i} className="flex items-start gap-3 rounded-lg border bg-card p-3.5 text-xs">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <p className="font-semibold text-foreground text-sm">{ev.description}</p>
                      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                        <span className="capitalize">{ev.type} Verification</span>
                        <span>·</span>
                        <span>{new Date(ev.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Right: Next Steps (5 cols) */}
          <div className="space-y-4 md:col-span-5">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Recommended Next Step
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-xs">
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-2">
                  <p className="font-semibold text-primary text-sm">
                    {gap > 0 ? `Close the ${gap}% Competency Gap` : 'Maintain Proficient Standing'}
                  </p>
                  <p className="text-muted-foreground leading-relaxed">
                    {gap > 0
                      ? 'Spend 20-30 minutes on targeted exercises to reach the benchmark required for technical interviews.'
                      : 'You meet standard expectations for this role. Periodic practice challenges will keep your score fresh.'}
                  </p>
                  <div className="pt-2">
                    <Button asChild size="sm" className="w-full">
                      <Link href="/learn">Start Recommended Activity</Link>
                    </Button>
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/40 p-3 space-y-1">
                  <p className="font-semibold text-foreground">Confidence Metric</p>
                  <p className="text-muted-foreground capitalize">
                    Confidence: <strong>{skill.confidence}</strong> based on {skill.evidence.length} distinct data points.
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
