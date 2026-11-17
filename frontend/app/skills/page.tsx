'use client';

import { useState, useEffect } from 'react';
import { Radar, TrendingUp, Award, FileText, Code2, FlaskConical, X, Clock, Target } from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { getSkillProfile, getUserProfile } from '@/lib/services';
import { getTargetRole } from '@/lib/mock-data';
import { cn } from '@/lib/utils';
import type { SkillProfile, SkillAssessment, User } from '@/lib/types';

const evidenceIcons = {
  assessment: Award,
  resume: FileText,
  project: Code2,
  practice: FlaskConical,
};

const proficiencyLabels: Record<string, string> = {
  beginner: 'Developing',
  intermediate: 'Competent',
  advanced: 'Proficient',
  expert: 'Expert',
};

export default function SkillsPage() {
  const [profile, setProfile] = useState<SkillProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<SkillAssessment | null>(null);

  const loadData = () => {
    getSkillProfile().then(setProfile);
    getUserProfile().then(setUser);
  };

  useEffect(() => {
    loadData();
    window.addEventListener('skillforge_state_updated', loadData);
    return () => window.removeEventListener('skillforge_state_updated', loadData);
  }, []);

  const role = getTargetRole();
  const roleTitle = user?.targetRoleId || role.title;
  const skills = profile?.skills || [];
  const sortedSkills = [...skills].sort((a, b) => b.gap - a.gap);
  const overallAlignment = profile?.overallAlignment ?? 0;


  return (
    <AppShell title="My Skill Profile">
      <div className="mx-auto max-w-5xl space-y-6 p-6">
        {/* Header */}
        <div className="animate-slide-up">
          <div className="flex items-center gap-2">
            <Radar className="h-5 w-5 text-primary" />
            <h1 className="text-2xl font-bold tracking-tight">My Skill Profile</h1>
          </div>
          <p className="mt-1 text-muted-foreground">
            Your skill intelligence map — updated continuously based on assessments, projects, and learning activity.
          </p>
        </div>

        {/* Overall alignment */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4" />
                  Target Role: <span className="font-medium text-foreground">{roleTitle}</span>
                </div>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-primary">{overallAlignment}%</span>
                  <span className="text-sm text-muted-foreground">overall skill alignment</span>
                </div>
                <Progress value={overallAlignment} className="mt-3 h-2 max-w-md" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Last updated: {profile?.lastUpdated ? new Date(profile.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'}
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-2xl font-bold text-success">{skills.filter(s => s.gap === 0).length}</p>
                  <p className="text-xs text-muted-foreground">on target</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-2xl font-bold text-warning">{skills.filter(s => s.gap > 0 && s.gap <= 15).length}</p>
                  <p className="text-xs text-muted-foreground">moderate gap</p>
                </div>
                <div className="rounded-lg bg-secondary/50 p-3">
                  <p className="text-2xl font-bold text-destructive">{skills.filter(s => s.gap > 15).length}</p>
                  <p className="text-xs text-muted-foreground">large gap</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Map Visualization */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Skill Map</CardTitle>
            <CardDescription>Click any skill to see detailed evidence and gap analysis.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              {/* Central node + radial skills */}
              <div className="relative flex h-80 w-full max-w-2xl items-center justify-center">
                {/* SVG connections */}
                <svg className="absolute inset-0 h-full w-full" viewBox="0 0 600 320">
                  {sortedSkills.map((_, i) => {
                    const angle = (i / sortedSkills.length) * 2 * Math.PI - Math.PI / 2;
                    const x = 300 + Math.cos(angle) * 130;
                    const y = 160 + Math.sin(angle) * 100;
                    return (
                      <line
                        key={i}
                        x1="300" y1="160" x2={x} y2={y}
                        stroke="hsl(var(--border))" strokeWidth="1.5"
                        strokeDasharray={sortedSkills[i].gap === 0 ? '0' : '4 4'}
                        opacity={sortedSkills[i].gap === 0 ? 0.3 : 0.6}
                      />
                    );
                  })}
                </svg>

                {/* Central node */}
                <div className="absolute z-10 flex h-24 w-24 items-center justify-center rounded-full border-2 border-primary bg-primary/10 text-center">
                  <div>
                    <p className="text-xs font-bold text-primary">{roleTitle}</p>
                    <p className="text-lg font-bold">{overallAlignment}%</p>
                  </div>
                </div>

                {/* Skill nodes */}
                {sortedSkills.map((skill, i) => {
                  const angle = (i / sortedSkills.length) * 2 * Math.PI - Math.PI / 2;
                  const x = Math.cos(angle) * 130;
                  const y = Math.sin(angle) * 100;
                  const isOnTarget = skill.gap === 0;
                  return (
                    <button
                      key={skill.skillId}
                      onClick={() => setSelectedSkill(skill)}
                      className="absolute z-10 flex h-16 w-16 flex-col items-center justify-center rounded-full border-2 text-center transition-all hover:scale-110 hover:shadow-md"
                      style={{
                        transform: `translate(${x}px, ${y}px)`,
                        borderColor: isOnTarget ? 'hsl(var(--success))' : skill.gap > 15 ? 'hsl(var(--destructive))' : 'hsl(var(--warning))',
                        backgroundColor: isOnTarget ? 'hsl(var(--success) / 0.1)' : skill.gap > 15 ? 'hsl(var(--destructive) / 0.08)' : 'hsl(var(--warning) / 0.08)',
                      }}
                    >
                      <p className="text-[10px] font-semibold leading-tight">{skill.skillName.split(' ')[0]}</p>
                      <p className="text-sm font-bold">{skill.currentLevel}%</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skill Cards */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sortedSkills.map((skill, i) => (
            <Card
              key={skill.skillId}
              className="cursor-pointer animate-slide-up transition-all hover:shadow-md hover:border-primary/40"
              style={{ animationDelay: `${i * 60}ms` }}
              onClick={() => setSelectedSkill(skill)}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold">{skill.skillName}</h3>
                    <p className="text-xs text-muted-foreground">
                      Last assessed: {new Date(skill.lastAssessed).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
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

                <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Current</p>
                    <p className="font-semibold">{skill.currentLevel}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Target</p>
                    <p className="font-semibold text-muted-foreground">{skill.targetLevel}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-semibold capitalize">{skill.confidence}</p>
                  </div>
                </div>

                <div className="mt-3">
                  <div className="relative h-2 rounded-full bg-secondary">
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
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Skill Detail Dialog */}
      <Dialog open={!!selectedSkill} onOpenChange={(open) => !open && setSelectedSkill(null)}>
        <DialogContent className="max-w-lg">
          {selectedSkill && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedSkill.skillName}
                  <Badge
                    variant="outline"
                    className={cn(
                      selectedSkill.gap === 0
                        ? 'border-success/30 text-success'
                        : selectedSkill.gap > 15
                        ? 'border-destructive/30 text-destructive'
                        : 'border-warning/30 text-warning'
                    )}
                  >
                    {selectedSkill.gap === 0 ? 'On target' : `${selectedSkill.gap} pts to target`}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Current level</p>
                    <p className="font-semibold">{proficiencyLabels[selectedSkill.proficiency]}</p>
                    <p className="text-xs text-muted-foreground">{selectedSkill.currentLevel}%</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Target level</p>
                    <p className="font-semibold">Proficient</p>
                    <p className="text-xs text-muted-foreground">{selectedSkill.targetLevel}%</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Confidence</p>
                    <p className="font-semibold capitalize">{selectedSkill.confidence}</p>
                  </div>
                  <div className="rounded-lg bg-secondary/50 p-3">
                    <p className="text-xs text-muted-foreground">Gap</p>
                    <p className={cn(
                      'font-semibold',
                      selectedSkill.gap === 0 ? 'text-success' : selectedSkill.gap > 15 ? 'text-destructive' : 'text-warning'
                    )}>
                      {selectedSkill.gap === 0 ? 'Closed' : `${selectedSkill.gap} points`}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Evidence</p>
                  <div className="space-y-2">
                    {selectedSkill.evidence.map((ev, j) => {
                      const Icon = evidenceIcons[ev.type];
                      return (
                        <div key={j} className="flex items-center gap-3 rounded-lg border p-3">
                          <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="flex-1">
                            <p className="text-sm">{ev.description}</p>
                            <p className="text-xs text-muted-foreground">{ev.date}</p>
                          </div>
                          <Badge variant="secondary" className="capitalize text-xs">{ev.type}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <Button className="w-full">
                  Start learning to close this gap
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}
