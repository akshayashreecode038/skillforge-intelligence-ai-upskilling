'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  FolderKanban,
  ArrowLeft,
  Database,
  FileCode,
  CheckCircle2,
  AlertCircle,
  Play,
  Upload,
  Send,
  Sparkles,
  BarChart3,
  TrendingUp,
  Award,
  Clock,
  Terminal,
  RotateCcw,
  Check,
  ArrowRight,
} from 'lucide-react';
import { AppShell } from '@/components/app-shell';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getProjects, submitProject } from '@/lib/services';
import type { Project, ProjectEvaluationResult } from '@/lib/types';
import { cn } from '@/lib/utils';

const sampleDataset = [
  { order_id: 'ORD-901', customer_id: 'CUST-104', order_date: '2025-01-04', order_amount: '$148.00', category: 'Electronics', status: 'Completed' },
  { order_id: 'ORD-902', customer_id: 'CUST-218', order_date: '2025-01-05', order_amount: '$64.50', category: 'Apparel', status: 'Completed' },
  { order_id: 'ORD-903', customer_id: 'CUST-104', order_date: '2025-01-18', order_amount: '$210.00', category: 'Electronics', status: 'Completed' },
  { order_id: 'ORD-904', customer_id: 'CUST-390', order_date: '2025-01-22', order_amount: '$35.00', category: 'Home', status: 'Refunded' },
  { order_id: 'ORD-905', customer_id: 'CUST-412', order_date: '2025-02-01', order_amount: '$520.00', category: 'Appliances', status: 'Completed' },
  { order_id: 'ORD-906', customer_id: 'CUST-218', order_date: '2025-02-14', order_amount: '$89.00', category: 'Apparel', status: 'Completed' },
];

export default function ProjectWorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const projectId = (params?.id as string) || 'proj-ecommerce';

  const [project, setProject] = useState<Project | null>(null);
  const [sqlCode, setSqlCode] = useState<string>(
`-- Step 1: Filter out refunded orders
-- Step 2: Compute customer repeat purchase interval & running revenue
WITH cleaned_orders AS (
  SELECT 
    order_id,
    customer_id,
    order_date,
    CAST(REPLACE(order_amount, '$', '') AS DECIMAL(10,2)) AS amount,
    category
  FROM raw_ecommerce_orders
  WHERE status != 'Refunded'
)
SELECT 
  customer_id,
  order_date,
  amount,
  SUM(amount) OVER (
    PARTITION BY customer_id 
    ORDER BY order_date
  ) AS customer_cumulative_spend,
  LAG(order_date, 1) OVER (
    PARTITION BY customer_id 
    ORDER BY order_date
  ) AS prev_order_date
FROM cleaned_orders;`
  );

  const [explanation, setExplanation] = useState<string>(
    'Filtered out refunded orders to prevent revenue inflation. Utilized window SUM to identify high-value repeat customer trajectories and calculated days between purchases with LAG to evaluate 30-day retention.'
  );

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<ProjectEvaluationResult | null>(null);
  const [activeTab, setActiveTab] = useState('editor');

  useEffect(() => {
    getProjects().then((projs) => {
      const found = projs.find((p) => p.id === projectId) ?? projs[0];
      setProject(found);
    });
  }, [projectId]);

  const handleSubmit = async () => {
    setIsEvaluating(true);
    // Realistic AI evaluation simulation
    setTimeout(async () => {
      const result = await submitProject(projectId, {
        code: sqlCode,
        explanation,
      });
      setIsEvaluating(false);
      setEvaluationResult(result);
      setActiveTab('evaluation');
    }, 2000);
  };

  return (
    <AppShell title="Project Workspace">
      <div className="mx-auto max-w-6xl space-y-6 p-6">
        {/* Workspace Top Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="icon" className="h-8 w-8">
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider text-muted-foreground">Practical Assessment</span>
                <Badge variant="outline" className="text-xs">Intermediate</Badge>
              </div>
              <h1 className="text-xl font-bold text-foreground mt-0.5">
                {project?.title ?? 'Analyze an E-commerce Sales Dataset'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleSubmit}
              disabled={isEvaluating}
              className="gap-2 shadow-sm"
            >
              {isEvaluating ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
                  Analyzing your project...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Project
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Updated Skill Profile Alert Banner */}
        {evaluationResult && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-5 animate-slide-up shadow-sm">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500 text-white">
                  <Check className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-emerald-800 dark:text-emerald-300">
                    Your skill profile has been updated!
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Project evaluation completed: SQL (+7%) and Business Analysis (+11%) competency levels increased.
                  </p>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button asChild size="sm" variant="outline">
                  <Link href="/skills">View Updated Skill Profile</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href="/dashboard">Return to Dashboard</Link>
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Workspace Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-4 max-w-md">
            <TabsTrigger value="editor">Code Workspace</TabsTrigger>
            <TabsTrigger value="dataset">Dataset View</TabsTrigger>
            <TabsTrigger value="criteria">Evaluation Criteria</TabsTrigger>
            <TabsTrigger value="evaluation" disabled={!evaluationResult}>
              AI Evaluation
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: Code & Explanation Editor */}
          <TabsContent value="editor" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: SQL Code Editor (8 cols) */}
              <div className="space-y-4 lg:col-span-8">
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <div>
                      <CardTitle className="text-base flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        Analysis SQL Script
                      </CardTitle>
                      <CardDescription>
                        Write query to aggregate monthly retention, repeat spend, and product category mix.
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">PostgreSQL</Badge>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="rounded-lg border bg-zinc-950 p-3 text-zinc-100 font-mono text-xs">
                      <textarea
                        value={sqlCode}
                        onChange={(e) => setSqlCode(e.target.value)}
                        rows={14}
                        className="w-full bg-transparent outline-none resize-none font-mono text-xs text-zinc-100 leading-relaxed"
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Executive Summary Explanation */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FileCode className="h-4 w-4 text-primary" />
                      Executive Business Reasoning
                    </CardTitle>
                    <CardDescription>
                      Explain what patterns your query revealed and your recommendations for business leadership.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Textarea
                      value={explanation}
                      onChange={(e) => setExplanation(e.target.value)}
                      rows={4}
                      placeholder="Synthesize your findings into 2-3 concise business recommendations..."
                      className="text-sm"
                    />
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Requirements & Prompts (4 cols) */}
              <div className="space-y-4 lg:col-span-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Requirements</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Exclude cancelled/refunded transactions to avoid overstating retention.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Compute running cumulative order value per customer with window aggregation.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Calculate days elapsed between sequential orders using LAG window function.</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>Provide 1 concrete business insight based on repeating customer frequency.</span>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      AI Evaluation Tip
                    </div>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Evaluators grade both technical syntax precision and how effectively you connect metrics to actionable commercial decisions.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* TAB 2: Sample Dataset View */}
          <TabsContent value="dataset">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">Sample Telemetry: raw_ecommerce_orders</CardTitle>
                    <CardDescription>Simulated transactional dataset representing 12,000 monthly orders</CardDescription>
                  </div>
                  <Badge variant="outline">6 Preview Rows</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto rounded-lg border">
                  <table className="w-full text-xs">
                    <thead className="bg-secondary/50">
                      <tr className="border-b text-left text-muted-foreground">
                        <th className="p-3 font-semibold">order_id</th>
                        <th className="p-3 font-semibold">customer_id</th>
                        <th className="p-3 font-semibold">order_date</th>
                        <th className="p-3 font-semibold">order_amount</th>
                        <th className="p-3 font-semibold">category</th>
                        <th className="p-3 font-semibold">status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {sampleDataset.map((row) => (
                        <tr key={row.order_id} className="hover:bg-secondary/30">
                          <td className="p-3 font-mono font-medium">{row.order_id}</td>
                          <td className="p-3 font-mono">{row.customer_id}</td>
                          <td className="p-3 text-muted-foreground">{row.order_date}</td>
                          <td className="p-3 font-semibold">{row.order_amount}</td>
                          <td className="p-3">{row.category}</td>
                          <td className="p-3">
                            <Badge
                              variant={row.status === 'Completed' ? 'secondary' : 'outline'}
                              className={row.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-600' : 'text-rose-500'}
                            >
                              {row.status}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: Evaluation Criteria */}
          <TabsContent value="criteria">
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">1. SQL Precision (35%)</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>Correct partition clauses, join conditions, and window frame definitions.</p>
                  <p className="font-semibold text-foreground">Target: &gt; 80% accuracy</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">2. Data Cleaning (30%)</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>Handling null values, data type casting, and filtering cancelled orders.</p>
                  <p className="font-semibold text-foreground">Target: &gt; 75% accuracy</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">3. Business Reasoning (35%)</CardTitle>
                </CardHeader>
                <CardContent className="text-xs text-muted-foreground space-y-2">
                  <p>Extracting practical, commercial takeaways for marketing and inventory teams.</p>
                  <p className="font-semibold text-foreground">Target: &gt; 70% accuracy</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 4: Evaluation Results */}
          {evaluationResult && (
            <TabsContent value="evaluation" className="space-y-6 animate-slide-up">
              <div className="grid gap-6 md:grid-cols-12">
                {/* Overall Score Card (4 cols) */}
                <Card className="md:col-span-4 border-primary/30">
                  <CardHeader className="text-center pb-2">
                    <CardDescription>PROJECT EVALUATION</CardDescription>
                    <CardTitle className="text-xl">Overall Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
                    <div className="flex h-32 w-32 items-center justify-center rounded-full border-8 border-primary/20 bg-primary/5">
                      <span className="text-3xl font-extrabold text-primary">
                        {evaluationResult.overallScore}%
                      </span>
                    </div>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-600 bg-emerald-500/10">
                      Validated Competency
                    </Badge>
                  </CardContent>
                </Card>

                {/* Skill-Level Breakdown (8 cols) */}
                <Card className="md:col-span-8">
                  <CardHeader>
                    <CardTitle className="text-base">Skill-Level Evaluation</CardTitle>
                    <CardDescription>
                      Performance mapped directly to your job role capabilities
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {evaluationResult.skillScores.map((item, idx) => (
                      <div key={idx} className="space-y-1.5 rounded-lg border p-3">
                        <div className="flex items-center justify-between text-xs font-semibold">
                          <span>{item.skillName}</span>
                          <span className="text-primary font-bold">{item.score}%</span>
                        </div>
                        <Progress value={item.score} className="h-1.5" />
                        <p className="text-[11px] text-muted-foreground pt-1">{item.feedback}</p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Strengths & Areas to Improve */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" />
                      Strengths Demonstrated
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    {evaluationResult.strengths.map((str, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                        <span>{str}</span>
                      </p>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm text-amber-600 dark:text-amber-400 flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Areas for Reinforcement
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-xs text-muted-foreground">
                    {evaluationResult.areasToImprove.map((area, i) => (
                      <p key={i} className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{area}</span>
                      </p>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Recommended Next Step Box */}
              <Card className="border-primary/20 bg-primary/5">
                <CardContent className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                      <Sparkles className="h-3.5 w-3.5" />
                      Recommended Next Step
                    </div>
                    <p className="text-sm text-foreground font-medium">
                      {evaluationResult.recommendedNextStep}
                    </p>
                  </div>
                  <Button asChild size="sm" className="shrink-0">
                    <Link href="/skill-gap">
                      View Updated Skill Gap
                      <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </AppShell>
  );
}
