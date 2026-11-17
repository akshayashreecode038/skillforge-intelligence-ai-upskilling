'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FolderKanban,
  ArrowRight,
  Clock,
  Sparkles,
  CheckCircle2,
  Brain,
  Layers,
  Database,
  BarChart2,
  FileCode,
  ShieldAlert,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { getProjects } from '@/lib/services';
import type { Project } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    getProjects().then(setProjects);
    const handleUpdate = () => {
      getProjects().then(setProjects);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  if (!projects.length) {
    return (
      <AppShell title="Practical Projects">
        <div className="flex h-96 items-center justify-center">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Curating projects aligned with your skill gaps...</span>
          </div>
        </div>
      </AppShell>
    );
  }

  // Why you're doing this explanations matched to gaps
  const projectReasons: Record<string, string> = {
    'proj-ecommerce':
      'Your SQL skills are strong, but your business-analysis competency needs additional practical evidence.',
    'proj-ab-test':
      'Directly targets your largest gap in Statistics & Hypothesis testing using real experiment telemetry.',
    'proj-churn':
      'Validates advanced SQL window functions and classification accuracy in an operational context.',
  };

  return (
    <AppShell title="Practical Skill Projects">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-primary" />
                <h1 className="text-2xl font-bold tracking-tight">Practical Projects</h1>
              </div>
              <p className="mt-1 text-muted-foreground">
                Solve realistic business tasks with live datasets. Project evaluations directly update your validated skill profile.
              </p>
            </div>
            <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary py-1.5 px-3">
              <Sparkles className="mr-1.5 h-3.5 w-3.5" />
              Gap-Targeted Projects
            </Badge>
          </div>
        </div>

        {/* Featured Recommendation */}
        <Card className="border-primary/30 bg-gradient-to-br from-primary/5 via-card to-background shadow-sm">
          <CardContent className="p-6">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2 max-w-2xl">
                <Badge variant="default" className="text-xs">
                  AI Recommended Next Project
                </Badge>
                <h2 className="text-xl font-bold text-foreground">
                  E-Commerce Sales & Cohort Analysis
                </h2>
                <p className="text-sm text-muted-foreground">
                  {projectReasons['proj-ecommerce']}
                </p>
                <div className="flex flex-wrap gap-2 pt-2">
                  <Badge variant="secondary" className="text-xs">SQL</Badge>
                  <Badge variant="secondary" className="text-xs">Data Cleaning</Badge>
                  <Badge variant="secondary" className="text-xs">Statistics</Badge>
                  <Badge variant="secondary" className="text-xs">Business Analysis</Badge>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
                <div className="text-right sm:pr-4 sm:border-r text-xs text-muted-foreground hidden sm:block">
                  <p>Estimated Time</p>
                  <p className="text-base font-bold text-foreground">2 Hours</p>
                </div>
                <Button asChild size="lg" className="w-full sm:w-auto">
                  <Link href="/projects/proj-ecommerce/workspace">
                    Start Project Workspace
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* All Projects Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const reason = projectReasons[project.id] ?? 'Applies role competencies in a simulated environment.';
            const isCompleted = project.status === 'reviewed';

            return (
              <Card key={project.id} className="flex flex-col justify-between transition-all hover:border-primary/40 hover:shadow-sm">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Badge variant={isCompleted ? 'secondary' : 'outline'} className="text-xs capitalize">
                      {project.difficulty}
                    </Badge>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      ~{project.estimatedHours} hrs
                    </span>
                  </div>

                  <CardTitle className="text-base font-bold text-foreground mt-2">
                    {project.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2 text-xs">
                    {project.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 pt-0">
                  {/* Why you're doing this box */}
                  <div className="rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground space-y-1">
                    <div className="flex items-center gap-1.5 font-semibold text-foreground">
                      <Brain className="h-3.5 w-3.5 text-primary" />
                      Why you're doing this:
                    </div>
                    <p className="line-clamp-2">{reason}</p>
                  </div>

                  {/* Skills practiced */}
                  <div>
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                      Skills Practiced
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {project.skillsPracticed.map((s, idx) => (
                        <span key={idx} className="rounded-md bg-secondary px-2 py-0.5 text-[11px] font-medium text-foreground">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t">
                    <Button asChild variant="outline" className="w-full text-xs">
                      <Link href={`/projects/${project.id}/workspace`}>
                        {isCompleted ? 'View Results & Submission' : 'Open Workspace'}
                        <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
