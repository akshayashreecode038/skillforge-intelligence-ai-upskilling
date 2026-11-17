'use client';

import { useState } from 'react';
import {
  Settings as SettingsIcon,
  Bell,
  Sparkles,
  Shield,
  Sliders,
  RotateCcw,
  Check,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { resetDemoState } from '@/lib/services';

export default function SettingsPage() {
  const [notifyAssessment, setNotifyAssessment] = useState(true);
  const [notifyAgentRecs, setNotifyAgentRecs] = useState(true);
  const [notifyProjects, setNotifyProjects] = useState(true);
  const [notifyRevisit, setNotifyRevisit] = useState(true);

  const [adaptiveDifficulty, setAdaptiveDifficulty] = useState(true);
  const [streamExplanations, setStreamExplanations] = useState(true);
  const [showReasoningCards, setShowReasoningCards] = useState(true);

  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell title="Platform Settings">
      <div className="mx-auto max-w-4xl space-y-6 p-6">
        {/* Page Header */}
        <div className="animate-slide-up flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div>
            <div className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5 text-primary" />
              <h1 className="text-2xl font-bold tracking-tight text-foreground">Settings & Preferences</h1>
            </div>
            <p className="mt-1 text-muted-foreground">
              Configure notifications, agent personalization, and application behavior.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {saved && (
              <Badge variant="outline" className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600">
                <Check className="mr-1 h-3 w-3" /> Preferences Saved
              </Badge>
            )}
            <Button onClick={handleSave} size="sm">
              Save Changes
            </Button>
          </div>
        </div>

        {/* SECTION 27: Smart Notifications */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">Notification Triggers</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Actionable, high-relevance alerts rather than marketing noise
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Assessment Results Ready</Label>
                <p className="text-xs text-muted-foreground">
                  Alert when diagnostic scoring completes and recalibrates your skill alignment index.
                </p>
              </div>
              <Switch checked={notifyAssessment} onCheckedChange={setNotifyAssessment} />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">AI Agent Next Steps</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when your learning companion adjusts your roadmap or recommends a high-ROI activity.
                </p>
              </div>
              <Switch checked={notifyAgentRecs} onCheckedChange={setNotifyAgentRecs} />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Practical Project Feedback</Label>
                <p className="text-xs text-muted-foreground">
                  Notify when project submissions have been evaluated across technical and business criteria.
                </p>
              </div>
              <Switch checked={notifyProjects} onCheckedChange={setNotifyProjects} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Memory Reinforcement Prompts</Label>
                <p className="text-xs text-muted-foreground">
                  Spaced repetition reminders like "Time to revisit Statistics foundations."
                </p>
              </div>
              <Switch checked={notifyRevisit} onCheckedChange={setNotifyRevisit} />
            </div>
          </CardContent>
        </Card>

        {/* AI Agent Configuration */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <CardTitle className="text-base">AI Agent Behavior</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Fine-tune the reasoning transparency and pedagogical adaptations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Adaptive Diagnostic Difficulty</Label>
                <p className="text-xs text-muted-foreground">
                  Dynamically adjust question complexity based on continuous accuracy and response speed.
                </p>
              </div>
              <Switch checked={adaptiveDifficulty} onCheckedChange={setAdaptiveDifficulty} />
            </div>

            <div className="flex items-center justify-between py-2 border-b">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Transparent "Why This Recommendation?" Cards</Label>
                <p className="text-xs text-muted-foreground">
                  Display the evidence and role competency linkage behind every AI recommendation.
                </p>
              </div>
              <Switch checked={showReasoningCards} onCheckedChange={setShowReasoningCards} />
            </div>

            <div className="flex items-center justify-between py-2">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Natural Response Streaming</Label>
                <p className="text-xs text-muted-foreground">
                  Stream explanations naturally with subtle micro-animations.
                </p>
              </div>
              <Switch checked={streamExplanations} onCheckedChange={setStreamExplanations} />
            </div>
          </CardContent>
        </Card>

        {/* Reset Demo State Box */}
        <Card className="border-border">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <RotateCcw className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="text-base">Demo Environment Management</CardTitle>
            </div>
            <CardDescription className="text-xs">
              Clear local cached progress to re-demonstrate the onboarding and diagnostic flow from scratch.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground max-w-md">
                Resets skill scores, chat history, and completed projects back to Alex Chen's initial demo baseline.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  resetDemoState();
                  alert('Demo state reset to initial baseline!');
                  window.location.reload();
                }}
              >
                Reset Demo State
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
