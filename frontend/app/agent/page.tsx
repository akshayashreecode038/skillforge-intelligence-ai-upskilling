'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  Lightbulb,
  CheckCircle2,
  TrendingUp,
  Brain,
  ShieldCheck,
  Compass,
  Zap,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getChatMessages, sendAgentMessage, getLearningMemory, getUserProfile } from '@/lib/services';
import type { AIMessage, AIReasoning, LearningMemory, User } from '@/lib/types';
import { cn } from '@/lib/utils';

const quickActions = [
  { label: 'Why am I learning joins again?', icon: HelpCircle, prompt: 'I understand basic SQL. Why am I learning joins again?' },
  { label: 'Explain this', icon: Lightbulb, prompt: 'Explain how Window Functions work with an intuitive analogy.' },
  { label: 'Give me an example', icon: Sparkles, prompt: 'Give me a practical example of ROW_NUMBER vs DENSE_RANK.' },
  { label: 'Quiz me', icon: CheckCircle2, prompt: 'Quiz me on SQL Window functions and ranking.' },
  { label: 'Give me a challenge', icon: Zap, prompt: 'Give me a real-world analytics challenge to test my retention.' },
  { label: 'Review my progress', icon: TrendingUp, prompt: 'Review my overall skill progress and tell me where I stand.' },
  { label: 'What should I learn next?', icon: Compass, prompt: 'What should I learn next to maximize my job readiness?' },
];

export default function AgentPage() {
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [memory, setMemory] = useState<LearningMemory | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [lastReasoning, setLastReasoning] = useState<AIReasoning | null>({
    skill: 'SQL Joins & Window Functions',
    evidence: 'Diagnostic Assessment #1 & Practice Task #2',
    action: 'Targeted drill prior to advanced analytics',
    confidence: '94% Competency Match',
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getChatMessages().then(setMessages);
    getLearningMemory().then(setMemory);
    getUserProfile().then(setUser);

    const handleUpdate = () => {
      getChatMessages().then(setMessages);
      getLearningMemory().then(setMemory);
    };
    window.addEventListener('skillforge_state_updated', handleUpdate);
    return () => window.removeEventListener('skillforge_state_updated', handleUpdate);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSend = async (customPrompt?: string) => {
    const text = customPrompt || input;
    if (!text.trim()) return;

    if (!customPrompt) setInput('');
    
    const userMsg: AIMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    const { reply, reasoning } = await sendAgentMessage(text);
    setIsThinking(false);
    setMessages((prev) => [...prev, reply]);
    if (reasoning) {
      setLastReasoning(reasoning);
    }
  };

  return (
    <AppShell title="AI Learning Agent">
      <div className="mx-auto max-w-6xl p-6 space-y-6">
        {/* Header */}
        <div className="animate-slide-up flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Bot className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Your Learning Agent
              </h1>
              <p className="text-sm text-muted-foreground">
                Knows your progress. Adapts to your needs. Continuously updates your roadmap.
              </p>
            </div>
          </div>

          <Badge variant="outline" className="border-primary/30 bg-primary/10 text-primary py-1.5 px-3">
            <Sparkles className="mr-1.5 h-3.5 w-3.5" />
            Context Memory Active
          </Badge>
        </div>

        {/* 2-Column Layout: Chat on Left, Context & Reasoning on Right */}
        <div className="grid gap-6 lg:grid-cols-12">
          {/* Main Chat Interface (8 cols) */}
          <Card className="flex flex-col h-[650px] lg:col-span-8 border-border">
            {/* Quick Action Chips Header */}
            <div className="border-b bg-card/60 p-3 overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                {quickActions.map((act, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(act.prompt)}
                    className="flex items-center gap-1.5 rounded-full border border-border/80 bg-secondary/40 px-3 py-1 text-xs text-muted-foreground transition-all hover:border-primary/40 hover:bg-secondary hover:text-foreground"
                  >
                    <act.icon className="h-3 w-3 text-primary" />
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <div
                    key={msg.id}
                    className={cn(
                      'flex flex-col text-sm',
                      isUser ? 'items-end' : 'items-start'
                    )}
                  >
                    <div className="flex items-start gap-2.5 max-w-[85%]">
                      {!isUser && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground text-xs mt-0.5">
                          <Bot className="h-4 w-4" />
                        </div>
                      )}
                      <div
                        className={cn(
                          'rounded-2xl px-4 py-3 leading-relaxed shadow-sm',
                          isUser
                            ? 'bg-primary text-primary-foreground rounded-br-none'
                            : 'bg-secondary/60 text-foreground border border-border/60 rounded-bl-none'
                        )}
                      >
                        <p className="whitespace-pre-line">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-3 text-xs text-muted-foreground pl-1">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Sparkles className="h-4 w-4 animate-spin" />
                  </div>
                  <span>Agent analyzing your skill profile & learning context...</span>
                </div>
              )}

              <div ref={scrollRef} />
            </div>

            {/* Transparent Reasoning Card (Section 19 Requirement) */}
            {lastReasoning && (
              <div className="border-t bg-primary/[0.03] p-3 px-4">
                <div className="rounded-lg border border-primary/20 bg-background/80 p-3 text-xs space-y-1">
                  <div className="flex items-center justify-between font-semibold text-primary">
                    <span className="flex items-center gap-1.5">
                      <Brain className="h-3.5 w-3.5" />
                      WHY THIS RECOMMENDATION?
                    </span>
                    <span className="text-[10px] text-muted-foreground">{lastReasoning.confidence}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 text-muted-foreground text-[11px]">
                    <div>
                      <span className="text-foreground font-medium">Skill:</span> {lastReasoning.skill}
                    </div>
                    <div>
                      <span className="text-foreground font-medium">Evidence:</span> {lastReasoning.evidence}
                    </div>
                    <div>
                      <span className="text-foreground font-medium">Action:</span> {lastReasoning.action}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Chat Input */}
            <div className="border-t p-3 bg-card">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSend();
                }}
                className="flex items-center gap-2"
              >
                <Input
                  placeholder="Ask your agent anything about your skills, roadmap, or concepts..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="flex-1 text-sm"
                />
                <Button type="submit" disabled={!input.trim() || isThinking} className="gap-1.5">
                  <Send className="h-4 w-4" />
                  Send
                </Button>
              </form>
            </div>
          </Card>

          {/* Right Column: AI Learning Memory Context Card (4 cols) */}
          <div className="space-y-4 lg:col-span-4">
            <Card className="border-border">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="text-xs uppercase">
                    Persistent Memory
                  </Badge>
                  <span className="text-xs text-muted-foreground">Updated live</span>
                </div>
                <CardTitle className="text-base font-bold text-foreground mt-2">
                  What Your Agent Remembers
                </CardTitle>
                <CardDescription className="text-xs">
                  Context used to tailor difficulty, explanations, and roadmap ordering
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4 text-xs">
                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-1.5">
                    Demonstrated Strengths
                  </p>
                  <div className="space-y-1">
                    {memory?.strongConcepts.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="font-semibold text-foreground uppercase tracking-wider text-[11px] mb-1.5">
                    Reinforcement Priorities
                  </p>
                  <div className="space-y-1">
                    {memory?.weakConcepts.map((c, i) => (
                      <div key={i} className="flex items-center gap-2 text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0" />
                        <span>{c}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-lg bg-secondary/40 p-3 space-y-1 border">
                  <p className="font-semibold text-foreground">Current Roadmap Milestone</p>
                  <p className="text-muted-foreground">{memory?.currentRoadmapPosition}</p>
                </div>

                <div className="pt-2">
                  <Button asChild variant="outline" size="sm" className="w-full">
                    <Link href="/profile">
                      View Full Memory & Preferences
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="border-primary/20 bg-primary/5">
              <CardContent className="p-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 font-semibold text-primary">
                  <Zap className="h-3.5 w-3.5" />
                  Not a Generic Chatbot
                </div>
                <p className="text-muted-foreground leading-relaxed">
                  Your agent is deeply connected to your diagnostic assessment scores, code workspace submissions, and target role competency requirements.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
