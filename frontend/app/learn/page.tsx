'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Play,
  CheckCircle2,
  Sparkles,
  Bot,
  Send,
  Code2,
  Terminal,
  RotateCcw,
  ArrowRight,
  BookOpen,
  HelpCircle,
  Lightbulb,
  Check,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getLearningRoadmap,
  updateModuleProgress,
  updateSkillProfile,
  sendAgentMessage,
  getChatMessages,
} from '@/lib/services';
import type { LearningModule, AIMessage, AIReasoning } from '@/lib/types';
import { cn } from '@/lib/utils';

export default function LearnPage() {
  const [modules, setModules] = useState<LearningModule[]>([]);
  const [currentModuleId, setCurrentModuleId] = useState<string>('mod-sql-window');
  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(2); // 3rd lesson: Window Functions practice
  const [userCode, setUserCode] = useState<string>(
`-- Calculate the 3-month rolling revenue for each region
SELECT 
  region,
  sale_month,
  revenue,
  AVG(revenue) OVER (
    PARTITION BY region 
    ORDER BY sale_month 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS rolling_3mo_avg
FROM regional_sales;`
  );
  const [codeOutput, setCodeOutput] = useState<any[] | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [agentFeedback, setAgentFeedback] = useState<string | null>(null);

  // AI Tutor chat state
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isAiResponding, setIsAiResponding] = useState(false);
  const [activeReasoning, setActiveReasoning] = useState<AIReasoning | null>(null);

  useEffect(() => {
    getLearningRoadmap().then((mods) => {
      setModules(mods);
    });
    getChatMessages().then(setChatMessages);

    const handleUpdate = () => {
      getLearningRoadmap().then(setModules);
      getChatMessages().then(setChatMessages);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  const activeModule = modules.find((m) => m.id === currentModuleId) ?? modules[3];
  const activeLesson = activeModule?.lessons[currentLessonIndex] ?? activeModule?.lessons[0];

  const handleRunCode = () => {
    setIsExecuting(true);
    setTimeout(() => {
      setIsExecuting(false);
      setCodeOutput([
        { region: 'North America', sale_month: '2025-01', revenue: '$120,000', rolling_3mo_avg: '$120,000' },
        { region: 'North America', sale_month: '2025-02', revenue: '$145,000', rolling_3mo_avg: '$132,500' },
        { region: 'North America', sale_month: '2025-03', revenue: '$160,000', rolling_3mo_avg: '$141,667' },
        { region: 'Europe', sale_month: '2025-01', revenue: '$95,000', rolling_3mo_avg: '$95,000' },
        { region: 'Europe', sale_month: '2025-02', revenue: '$110,000', rolling_3mo_avg: '$102,500' },
      ]);
    }, 600);
  };

  const handleCompleteTask = async () => {
    setTaskCompleted(true);
    // Update module progress to 100%
    await updateModuleProgress('mod-sql-window', 100, 'completed');
    // Elevate SQL skill from 78% to 85%
    await updateSkillProfile('skill-sql', 85, 'Mastered Window Functions interactive task (rolling aggregation & ranking)');

    setAgentFeedback(
      '✓ Great job Alex! Your SQL competency has improved based on your latest practical evaluation. Your SQL gap is now closed (85% target reached). Your next priority is Statistics.'
    );

    // Also trigger an AI message in chat
    const { reply } = await sendAgentMessage(
      'I completed the SQL Window Functions practical exercise!'
    );
    setChatMessages((prev) => [...prev, reply]);
  };

  const handleSendChat = async (presetText?: string) => {
    const textToSend = presetText || chatInput;
    if (!textToSend.trim()) return;

    if (!presetText) setChatInput('');
    setIsAiResponding(true);

    const { reply, reasoning } = await sendAgentMessage(textToSend, {
      currentTopic: activeModule?.title,
      skillId: activeModule?.skillId,
    });

    setIsAiResponding(false);
    setChatMessages((prev) => [...prev, reply]);
    if (reasoning) {
      setActiveReasoning(reasoning);
    }
  };

  return (
    <AppShell title="Interactive Learning Workspace">
      <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
        {/* Left: Module & Lesson Navigation Sidebar (280px) */}
        <aside className="w-72 shrink-0 border-r bg-sidebar/50 p-4 flex flex-col justify-between overflow-y-auto hidden md:flex">
          <div className="space-y-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Active Module
              </span>
              <h2 className="text-base font-bold text-foreground mt-0.5">
                {activeModule?.title}
              </h2>
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Module Completion</span>
                  <span className="font-semibold text-primary">{activeModule?.progress}%</span>
                </div>
                <Progress value={activeModule?.progress} className="h-1.5" />
              </div>
            </div>

            <div className="space-y-1 pt-2">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                Lessons in this module
              </span>
              <div className="space-y-1 mt-1">
                {activeModule?.lessons.map((lesson, idx) => {
                  const isActive = idx === currentLessonIndex;
                  return (
                    <button
                      key={lesson.id}
                      onClick={() => setCurrentLessonIndex(idx)}
                      className={cn(
                        'flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs font-medium transition-all',
                        isActive
                          ? 'bg-primary text-primary-foreground font-semibold shadow-sm'
                          : 'text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      )}
                    >
                      <div className="flex items-center gap-2">
                        {lesson.completed ? (
                          <CheckCircle2 className={cn('h-3.5 w-3.5', isActive ? 'text-primary-foreground' : 'text-emerald-500')} />
                        ) : (
                          <span className={cn('h-1.5 w-1.5 rounded-full', isActive ? 'bg-primary-foreground' : 'bg-muted-foreground')} />
                        )}
                        <span className="truncate max-w-[160px]">{lesson.title}</span>
                      </div>
                      <span className={cn('text-[10px]', isActive ? 'text-primary-foreground/80' : 'text-muted-foreground')}>
                        {lesson.duration}m
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Return to roadmap */}
          <div className="pt-4 border-t">
            <Button asChild variant="outline" size="sm" className="w-full text-xs">
              <Link href="/roadmap">
                <GraduationCap className="mr-1.5 h-3.5 w-3.5" />
                View Full Roadmap
              </Link>
            </Button>
          </div>
        </aside>

        {/* Center: Lesson Content & Interactive Task (Flex 1) */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Lesson Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b pb-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary">
                  {activeModule?.skillName}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Lesson {currentLessonIndex + 1} of {activeModule?.lessons.length}
                </span>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-foreground mt-1">
                {activeLesson?.title ?? 'SQL Window Functions'}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={currentLessonIndex === 0}
                onClick={() => setCurrentLessonIndex((i) => Math.max(0, i - 1))}
              >
                Previous
              </Button>
              <Button
                size="sm"
                disabled={currentLessonIndex >= (activeModule?.lessons.length ?? 1) - 1}
                onClick={() => setCurrentLessonIndex((i) => i + 1)}
              >
                Next Lesson
              </Button>
            </div>
          </div>

          {/* Feedback banner if task completed */}
          {agentFeedback && (
            <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 animate-slide-up">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-emerald-700 dark:text-emerald-300">
                    Skill Profile Updated!
                  </p>
                  <p className="text-muted-foreground">{agentFeedback}</p>
                  <div className="pt-2 flex gap-3">
                    <Button asChild size="sm" variant="default">
                      <Link href="/skill-gap">Inspect Skill Gap</Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href="/projects">Start Practical Project</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Concept Explanation Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" />
                Key Concept: Partitioning vs Grouping
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/90 leading-relaxed">
              <p>
                Unlike <code>GROUP BY</code> which collapses rows into aggregated summaries, <strong>Window Functions</strong> preserve row identity while computing moving calculations across a defined window.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 pt-2">
                <div className="rounded-lg bg-secondary/40 p-3 text-xs space-y-1">
                  <p className="font-semibold text-foreground">1. PARTITION BY</p>
                  <p className="text-muted-foreground">
                    Divides rows into subsets (e.g. <code>PARTITION BY region</code>) so calculations restart for each partition.
                  </p>
                </div>
                <div className="rounded-lg bg-secondary/40 p-3 text-xs space-y-1">
                  <p className="font-semibold text-foreground">2. Frame Specification</p>
                  <p className="text-muted-foreground">
                    <code>ROWS BETWEEN 2 PRECEDING AND CURRENT ROW</code> establishes a 3-interval rolling window.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Hands-on Interactive Task / Code Sandbox */}
          <Card className="border-border">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code2 className="h-4 w-4 text-primary" />
                  <CardTitle className="text-base">Practical Challenge</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Hands-on Task
                </Badge>
              </div>
              <CardDescription>
                Execute the rolling revenue query across regions, then submit for AI validation.
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border bg-zinc-950 p-3 text-zinc-100 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800 text-zinc-400">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5" />
                    query.sql
                  </span>
                  <button
                    onClick={() =>
                      setUserCode(`SELECT 
  region,
  sale_month,
  revenue,
  AVG(revenue) OVER (
    PARTITION BY region 
    ORDER BY sale_month 
    ROWS BETWEEN 2 PRECEDING AND CURRENT ROW
  ) AS rolling_3mo_avg
FROM regional_sales;`)
                    }
                    className="flex items-center gap-1 hover:text-zinc-200"
                    title="Reset query"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Reset
                  </button>
                </div>
                <textarea
                  value={userCode}
                  onChange={(e) => setUserCode(e.target.value)}
                  rows={9}
                  className="w-full bg-transparent pt-2 outline-none resize-none font-mono text-xs text-zinc-100 leading-relaxed"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <Button
                  onClick={handleRunCode}
                  disabled={isExecuting}
                  variant="secondary"
                  size="sm"
                  className="gap-1.5"
                >
                  <Play className="h-3.5 w-3.5 fill-current" />
                  {isExecuting ? 'Running Query...' : 'Run Query'}
                </Button>

                <Button
                  onClick={handleCompleteTask}
                  disabled={taskCompleted}
                  size="sm"
                  className="gap-1.5"
                >
                  <Check className="h-3.5 w-3.5" />
                  {taskCompleted ? 'Task Evaluated & Verified' : 'Submit for AI Evaluation'}
                </Button>
              </div>

              {/* Output Preview Table */}
              {codeOutput && (
                <div className="space-y-2 rounded-lg border bg-card p-4 animate-slide-up">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Query Results (5 rows returned)
                  </p>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="border-b text-left text-muted-foreground">
                          <th className="pb-2 font-medium">region</th>
                          <th className="pb-2 font-medium">sale_month</th>
                          <th className="pb-2 font-medium">revenue</th>
                          <th className="pb-2 font-medium text-primary">rolling_3mo_avg</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {codeOutput.map((row, i) => (
                          <tr key={i} className="py-1">
                            <td className="py-1.5 font-medium">{row.region}</td>
                            <td className="py-1.5 text-muted-foreground">{row.sale_month}</td>
                            <td className="py-1.5">{row.revenue}</td>
                            <td className="py-1.5 font-semibold text-primary">{row.rolling_3mo_avg}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </main>

        {/* Right: Embedded AI Learning Agent (360px) */}
        <aside className="w-80 lg:w-96 shrink-0 border-l bg-background flex flex-col justify-between hidden lg:flex">
          {/* Header */}
          <div className="border-b p-4">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">AI Learning Companion</h3>
                <p className="text-[11px] text-muted-foreground">Adapts explanations to your skill level</p>
              </div>
            </div>

            {/* Quick Action Prompt Chips */}
            <div className="mt-3 flex flex-wrap gap-1.5">
              <button
                onClick={() => handleSendChat("Explain this like I'm a beginner.")}
                className="rounded-full border border-border/80 bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                Explain like a beginner
              </button>
              <button
                onClick={() => handleSendChat('Give me a practical example.')}
                className="rounded-full border border-border/80 bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                Give practical example
              </button>
              <button
                onClick={() => handleSendChat('Test me on this.')}
                className="rounded-full border border-border/80 bg-secondary/40 px-2.5 py-1 text-[11px] text-muted-foreground hover:border-primary/40 hover:text-foreground"
              >
                Test me on this
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {chatMessages.slice(-4).map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={cn(
                    'flex flex-col text-xs leading-relaxed',
                    isUser ? 'items-end' : 'items-start'
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-xl px-3.5 py-2.5',
                      isUser
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary/60 text-foreground border border-border/50'
                    )}
                  >
                    <p className="whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              );
            })}

            {isAiResponding && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground italic">
                <Sparkles className="h-3.5 w-3.5 animate-spin text-primary" />
                AI is generating adaptive explanation...
              </div>
            )}

            {/* Transparent Reasoning Card */}
            {activeReasoning && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-[11px] space-y-1 animate-slide-up">
                <p className="font-semibold text-primary uppercase tracking-wider">
                  Why this explanation?
                </p>
                <p className="text-muted-foreground">
                  <strong>Skill:</strong> {activeReasoning.skill}
                </p>
                <p className="text-muted-foreground">
                  <strong>Action:</strong> {activeReasoning.action}
                </p>
              </div>
            )}
          </div>

          {/* Chat Input */}
          <div className="border-t p-3 bg-card/40">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendChat();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask about this query or concept..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-md border bg-background px-3 py-2 text-xs outline-none focus:ring-1 focus:ring-primary"
              />
              <Button type="submit" size="sm" className="h-8 w-8 p-0" disabled={!chatInput.trim()}>
                <Send className="h-3.5 w-3.5" />
              </Button>
            </form>
          </div>
        </aside>
      </div>
    </AppShell>
  );
}
