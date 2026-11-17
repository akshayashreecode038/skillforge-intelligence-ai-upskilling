'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Sparkles, ArrowRight, ArrowLeft, Check, Upload, Search, BarChart3, Code2, BrainCircuit, FileText, ClipboardCheck, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { jobRoles, allSkills } from '@/lib/mock-data';
import { analyzeProfile } from '@/lib/services';
import type { ProficiencyLevel } from '@/lib/types';

const steps = ['About You', 'Career Goal', 'Existing Skills', 'Resume', 'Assessment'];

const roleIcons: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  'bar-chart-3': BarChart3,
  'code-2': Code2,
  'brain-circuit': BrainCircuit,
};

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [education, setEducation] = useState('');
  const [experience, setExperience] = useState<ProficiencyLevel>('beginner');
  const [occupation, setOccupation] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedSkills, setSelectedSkills] = useState<Record<string, ProficiencyLevel | 'none'>>({});
  const [resumeText, setResumeText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) => ({
      ...prev,
      [skillId]: prev[skillId] === 'none' || !prev[skillId] ? 'intermediate' : 'none',
    }));
  };

  const setSkillLevel = (skillId: string, level: ProficiencyLevel) => {
    setSelectedSkills((prev) => ({ ...prev, [skillId]: level }));
  };

  // Find the human-readable role title from the selected role id
  const selectedRoleTitle = jobRoles.find((r) => r.id === selectedRole)?.title ?? selectedRole;

  const canProceed = () => {
    if (step === 0) return name.trim() && education.trim() && occupation.trim();
    if (step === 1) return !!selectedRole;
    if (step === 2) return Object.values(selectedSkills).filter((v) => v !== 'none').length > 0;
    if (step === 3) return resumeText.trim().length > 20;
    return true;
  };

  const next = () => {
    if (step < steps.length - 1) setStep(step + 1);
  };
  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      // Build a combined resume text from the form inputs
      const fullResumeText = [
        `Name: ${name}`,
        `Education: ${education}`,
        `Experience Level: ${experience}`,
        `Current Occupation: ${occupation}`,
        `Resume / Background:\n${resumeText}`,
        `Self-reported skills: ${Object.entries(selectedSkills)
          .filter(([, v]) => v !== 'none')
          .map(([k, v]) => `${k} (${v})`)
          .join(', ')}`,
      ].join('\n');

      await analyzeProfile(name, selectedRoleTitle, fullResumeText);
      router.push('/dashboard');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Is the backend running?';
      setSubmitError(msg);
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary/20">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillForge</span>
          </Link>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground">
            Sign in
          </Link>
        </div>
      </div>

      {/* Progress */}
      <div className="mx-auto max-w-3xl px-6 pt-10">
        <div className="flex items-center justify-between">
          {steps.map((s, i) => (
            <div key={s} className="flex flex-1 items-center">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    i < step && 'border-primary bg-primary text-primary-foreground',
                    i === step && 'border-primary bg-primary/10 text-primary',
                    i > step && 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {i < step ? <Check className="h-4 w-4" /> : i + 1}
                </div>
                <span className={cn(
                  'hidden text-xs sm:block',
                  i <= step ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}>
                  {s}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={cn(
                  'mx-2 h-0.5 flex-1 rounded-full transition-all',
                  i < step ? 'bg-primary' : 'bg-border'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-2xl px-6 py-10">
        {step === 0 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tell us about you</h1>
              <p className="mt-1 text-muted-foreground">We'll use this to personalize your experience.</p>
            </div>
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input id="name" placeholder="Alex Chen" value={name} onChange={(e) => setName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education</Label>
                  <Input id="education" placeholder="B.S. Computer Science, UC Berkeley" value={education} onChange={(e) => setEducation(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Experience level</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['beginner', 'intermediate', 'advanced'] as ProficiencyLevel[]).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setExperience(level)}
                        className={cn(
                          'rounded-lg border px-3 py-2.5 text-sm font-medium capitalize transition-all',
                          experience === level
                            ? 'border-primary bg-primary/10 text-primary'
                            : 'border-border hover:bg-secondary'
                        )}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="occupation">Current occupation</Label>
                  <Input id="occupation" placeholder="Student, Junior Developer, etc." value={occupation} onChange={(e) => setOccupation(e.target.value)} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {step === 1 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">What role are you working toward?</h1>
              <p className="mt-1 text-muted-foreground">We'll map your skills against this target.</p>
            </div>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search for a role..." className="pl-9" />
            </div>
            <div className="space-y-3">
              {jobRoles.map((role) => {
                const Icon = roleIcons[role.icon] ?? BarChart3;
                const selected = selectedRole === role.id;
                return (
                  <button
                    key={role.id}
                    onClick={() => setSelectedRole(role.id)}
                    className={cn(
                      'flex w-full items-start gap-4 rounded-xl border p-5 text-left transition-all',
                      selected ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-border hover:border-primary/40 hover:bg-secondary/50'
                    )}
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl" style={{ backgroundColor: `hsl(${role.color} / 0.1)` }}>
                      <Icon className="h-6 w-6" style={{ color: `hsl(${role.color})` }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{role.title}</h3>
                        {selected && <Check className="h-4 w-4 text-primary" />}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{role.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground">
              Don't see your role? More roles coming soon.
            </p>
          </div>
        )}

        {step === 2 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">What skills do you already have?</h1>
              <p className="mt-1 text-muted-foreground">
                Select your skills and estimate your level. Don't worry — we'll validate this with an assessment.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {allSkills.slice(0, 12).map((skill) => {
                const selected = selectedSkills[skill.id] && selectedSkills[skill.id] !== 'none';
                const level = selectedSkills[skill.id] || 'none';
                return (
                  <div
                    key={skill.id}
                    className={cn(
                      'rounded-xl border p-4 transition-all',
                      selected ? 'border-primary bg-primary/5' : 'border-border'
                    )}
                  >
                    <button
                      onClick={() => toggleSkill(skill.id)}
                      className="flex w-full items-center justify-between"
                    >
                      <span className="font-medium">{skill.name}</span>
                      <div className={cn(
                        'flex h-5 w-5 items-center justify-center rounded-full border-2 transition',
                        selected ? 'border-primary bg-primary' : 'border-border'
                      )}>
                        {selected && <Check className="h-3 w-3 text-primary-foreground" />}
                      </div>
                    </button>
                    {selected && (
                      <div className="mt-3 flex gap-2">
                        {(['beginner', 'intermediate', 'advanced'] as ProficiencyLevel[]).map((l) => (
                          <button
                            key={l}
                            onClick={() => setSkillLevel(skill.id, l)}
                            className={cn(
                              'rounded-md px-2.5 py-1 text-xs font-medium capitalize transition',
                              level === l ? 'bg-primary text-primary-foreground' : 'bg-secondary text-muted-foreground hover:bg-secondary/70'
                            )}
                          >
                            {l}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="flex items-center gap-2 rounded-lg bg-secondary/60 p-4 text-sm text-muted-foreground">
              <ClipboardCheck className="h-4 w-4 shrink-0 text-primary" />
              Self-reported proficiency will be validated in the diagnostic assessment.
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Tell us about your background</h1>
              <p className="mt-1 text-muted-foreground">
                Paste your resume, LinkedIn summary, or describe your experience. The AI will identify your skill gaps.
              </p>
            </div>
            <Card>
              <CardContent className="p-6 space-y-3">
                <Label htmlFor="resume-text">Your background / resume text</Label>
                <Textarea
                  id="resume-text"
                  placeholder={`Example:\n- 2 years as a junior developer at Acme Corp\n- Built REST APIs with Python/FastAPI\n- Experience with MySQL databases\n- Computer Science degree from XYZ University\n- Personal projects: data dashboard with React`}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  className="min-h-[200px] text-sm"
                />
                <p className="text-xs text-muted-foreground">
                  Minimum 20 characters. The more detail you provide, the better the AI can calibrate your skill gaps.
                </p>
              </CardContent>
            </Card>
            {resumeText.trim().length > 20 && (
              <div className="flex items-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-4 text-sm">
                <Check className="h-4 w-4 shrink-0 text-primary" />
                <span className="text-muted-foreground">
                  Ready! The AI will analyze your background for <strong className="text-foreground">{selectedRoleTitle}</strong> skill gaps.
                </span>
              </div>
            )}
          </div>
        )}

        {step === 4 && (
          <div className="animate-slide-up space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Ready for your diagnostic assessment</h1>
              <p className="mt-1 text-muted-foreground">
                Before creating your roadmap, we'll test your current knowledge across the key skills for your target role.
              </p>
            </div>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <ClipboardCheck className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">Data Analyst Foundations</p>
                    <p className="text-sm text-muted-foreground">15 questions · ~20 minutes · Adaptive</p>
                  </div>
                </div>
                <div className="space-y-2 rounded-lg bg-secondary/50 p-4 text-sm">
                  <p className="font-medium">What to expect:</p>
                  <ul className="space-y-1.5 text-muted-foreground">
                    <li>• Questions adapt based on your answers</li>
                    <li>• Covers SQL, Python, Statistics, Visualization, and Business Analysis</li>
                    <li>• Don't worry about getting everything right — this calibrates your starting point</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 space-y-3">
          {submitError && (
            <div className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Could not connect to backend</p>
                <p className="mt-0.5 text-xs opacity-80">{submitError}</p>
                <p className="mt-1 text-xs opacity-70">Make sure the backend is running: <code className="font-mono">uvicorn main:app --reload</code></p>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={prev} disabled={step === 0 || submitting}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            {step < steps.length - 1 ? (
              <Button onClick={next} disabled={!canProceed()}>
                Continue
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={submitting || !canProceed()}>
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Analyzing with AI...
                  </>
                ) : (
                  <>
                    Analyze My Skills
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
