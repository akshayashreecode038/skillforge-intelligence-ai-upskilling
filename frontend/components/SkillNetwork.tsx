'use client';

import { useState } from 'react';
import { Sparkles, Brain, CheckCircle2, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface SkillNode {
  id: string;
  name: string;
  level: number;
  status: 'mastered' | 'priority-gap' | 'developing' | 'future';
  x: number; // percentage in view
  y: number; // percentage in view
  brightness: 'high' | 'medium' | 'soft';
}

const skillNodes: SkillNode[] = [
  {
    id: 'python',
    name: 'Python',
    level: 84,
    status: 'mastered',
    x: 20,
    y: 24,
    brightness: 'high',
  },
  {
    id: 'sql',
    name: 'SQL',
    level: 78,
    status: 'developing',
    x: 80,
    y: 22,
    brightness: 'high',
  },
  {
    id: 'stats',
    name: 'Statistics',
    level: 48,
    status: 'priority-gap',
    x: 84,
    y: 72,
    brightness: 'medium',
  },
  {
    id: 'ml',
    name: 'Machine Learning',
    level: 35,
    status: 'future',
    x: 16,
    y: 74,
    brightness: 'soft',
  },
  {
    id: 'viz',
    name: 'Data Visualization',
    level: 62,
    status: 'developing',
    x: 50,
    y: 86,
    brightness: 'medium',
  },
];

export function SkillNetwork() {
  const [hoveredNode, setHoveredNode] = useState<SkillNode | null>(null);

  // Center coordinates (50%, 50%)
  const centerX = 50;
  const centerY = 46;

  return (
    <div className="pointer-events-none absolute inset-0 z-10 hidden md:block overflow-hidden">
      {/* SVG Connecting Lines between Central Profile Hub and Skill Satellites */}
      <svg className="absolute inset-0 h-full w-full opacity-60">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
            <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="pulseGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#818cf8" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {skillNodes.map((node) => (
          <g key={`connection-${node.id}`}>
            {/* Base line */}
            <line
              x1={`${centerX}%`}
              y1={`${centerY}%`}
              x2={`${node.x}%`}
              y2={`${node.y}%`}
              stroke="url(#lineGrad)"
              strokeWidth="1"
              strokeDasharray="4 6"
              className="animate-[pulse_4s_ease-in-out_infinite]"
            />

            {/* Glowing signal particle moving on the line */}
            <circle
              cx={`${(centerX * 2 + node.x) / 3}%`}
              cy={`${(centerY * 2 + node.y) / 3}%`}
              r="2.5"
              fill="#38bdf8"
              className="animate-ping"
              style={{ animationDuration: '3.5s' }}
            />
          </g>
        ))}
      </svg>

      {/* Floating Interactive Skill Nodes */}
      {skillNodes.map((node) => {
        const isHovered = hoveredNode?.id === node.id;

        return (
          <div
            key={node.id}
            style={{
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
            className="pointer-events-auto absolute transition-transform duration-700 hover:scale-110"
            onMouseEnter={() => setHoveredNode(node)}
            onMouseLeave={() => setHoveredNode(null)}
          >
            {/* Ambient Halo */}
            <div
              className={cn(
                'absolute -inset-3 rounded-full blur-md transition-opacity duration-500',
                node.brightness === 'high'
                  ? 'bg-primary/20 opacity-80 animate-pulse'
                  : node.brightness === 'medium'
                  ? 'bg-amber-500/15 opacity-60'
                  : 'bg-primary/10 opacity-30'
              )}
            />

            {/* Node Capsule */}
            <div
              className={cn(
                'relative flex items-center gap-2 rounded-full border px-3.5 py-1.5 backdrop-blur-md transition-all duration-300 shadow-lg cursor-pointer select-none',
                node.status === 'priority-gap'
                  ? 'border-amber-500/40 bg-background/80 text-amber-500'
                  : node.status === 'mastered'
                  ? 'border-emerald-500/40 bg-background/80 text-emerald-600 dark:text-emerald-400'
                  : 'border-primary/40 bg-background/80 text-foreground'
              )}
            >
              {/* Status Dot */}
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  node.status === 'priority-gap'
                    ? 'bg-amber-500 animate-ping'
                    : node.status === 'mastered'
                    ? 'bg-emerald-500'
                    : 'bg-primary animate-pulse'
                )}
              />

              <span className="text-xs font-semibold tracking-tight">{node.name}</span>

              <span className="text-[11px] font-mono text-muted-foreground ml-0.5">
                {node.level}%
              </span>
            </div>

            {/* Hover Tooltip Popover */}
            {isHovered && (
              <div className="absolute left-1/2 top-full z-30 mt-2 w-48 -translate-x-1/2 rounded-xl border border-border/80 bg-popover/95 p-3 text-xs shadow-xl backdrop-blur-md animate-slide-up">
                <div className="flex items-center justify-between pb-1.5 border-b border-border/60">
                  <span className="font-bold text-foreground">{node.name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {node.status.replace('-', ' ')}
                  </Badge>
                </div>
                <div className="pt-2 space-y-1 text-muted-foreground text-[11px]">
                  <div className="flex justify-between">
                    <span>Validated level:</span>
                    <span className="font-semibold text-primary">{node.level}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target benchmark:</span>
                    <span className="font-semibold text-foreground">80%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
export default SkillNetwork;
