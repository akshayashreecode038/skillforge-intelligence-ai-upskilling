'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, ArrowLeft, ArrowRight, Check, Brain, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { assessments } from '@/lib/mock-data';

export default function AssessmentPage() {
  const assessment = assessments[0];
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showExplanation, setShowExplanation] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const question = assessment.questions[currentQ];
  const total = assessment.questions.length;
  const isLast = currentQ === total - 1;
  const hasAnswered = !!answers[question.id];
  const progress = ((currentQ + (hasAnswered ? 1 : 0)) / total) * 100;

  const selectAnswer = (qid: string, oid: string) => {
    if (showExplanation) return;
    setAnswers((prev) => ({ ...prev, [qid]: oid }));
    setShowExplanation(true);
  };

  const next = () => {
    if (isLast) {
      setSubmitted(true);
    } else {
      setCurrentQ(currentQ + 1);
      setShowExplanation(false);
    }
  };

  const prev = () => {
    if (currentQ > 0) {
      setCurrentQ(currentQ - 1);
      setShowExplanation(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-secondary/20 px-4">
        <Card className="max-w-md p-8 text-center shadow-lg">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-success/10">
            <Check className="h-8 w-8 text-success" />
          </div>
          <h1 className="text-2xl font-bold">Assessment complete</h1>
          <p className="mt-2 text-muted-foreground">
            Your answers have been analyzed. Let's see your skill profile.
          </p>
          <Button asChild className="mt-6 w-full" size="lg">
            <Link href="/assessment-results">
              View My Results
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold tracking-tight">SkillForge</span>
          </Link>
          <Badge variant="secondary" className="gap-1.5">
            <Brain className="h-3.5 w-3.5 text-primary" />
            Adaptive Assessment
          </Badge>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Assessment header */}
        <div className="mb-6">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold">{assessment.title}</h1>
              <p className="text-sm text-muted-foreground">
                Question {currentQ + 1} of {total}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {question.difficulty} · {question.topic}
            </Badge>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Adaptive indicator */}
        {currentQ > 0 && !showExplanation && (
          <div className="mb-4 flex items-center gap-2 rounded-lg bg-primary/5 px-4 py-2.5 text-sm text-primary animate-fade-in">
            <TrendingUp className="h-4 w-4" />
            Your next question has been adjusted based on your previous answer.
          </div>
        )}

        {/* Question */}
        <Card className="animate-slide-up">
          <CardContent className="p-6">
            <p className="text-lg font-medium leading-relaxed">
              {question.text}
            </p>
            <div className="mt-6 space-y-3">
              {question.options.map((opt) => {
                const selected = answers[question.id] === opt.id;
                const showCorrect = showExplanation && opt.correct;
                const showWrong = showExplanation && selected && !opt.correct;
                return (
                  <button
                    key={opt.id}
                    onClick={() => selectAnswer(question.id, opt.id)}
                    disabled={showExplanation}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border p-4 text-left transition-all',
                      !showExplanation && 'hover:border-primary/40 hover:bg-secondary/30',
                      selected && !showExplanation && 'border-primary bg-primary/5',
                      showCorrect && 'border-success bg-success/5',
                      showWrong && 'border-destructive bg-destructive/5',
                      !selected && !showCorrect && 'border-border'
                    )}
                  >
                    <div className={cn(
                      'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold',
                      selected && !showExplanation && 'border-primary bg-primary text-primary-foreground',
                      showCorrect && 'border-success bg-success text-success-foreground',
                      showWrong && 'border-destructive bg-destructive text-destructive-foreground',
                      !selected && !showCorrect && 'border-border text-muted-foreground'
                    )}>
                      {opt.id.toUpperCase()}
                    </div>
                    <span className="text-sm">{opt.text}</span>
                    {showCorrect && <Check className="ml-auto h-4 w-4 text-success" />}
                  </button>
                );
              })}
            </div>

            {showExplanation && question.explanation && (
              <div className="mt-5 animate-slide-up rounded-lg bg-secondary/50 p-4">
                <p className="text-sm font-medium">Explanation</p>
                <p className="mt-1 text-sm text-muted-foreground">{question.explanation}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={prev} disabled={currentQ === 0}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button onClick={next} disabled={!hasAnswered}>
            {isLast ? 'Submit Assessment' : 'Next'}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
