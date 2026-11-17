'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Bell,
  Search,
  Bot,
  CheckCircle2,
  Sparkles,
  FolderKanban,
  AlertTriangle,
  ArrowRight,
  User as UserIcon,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { currentUser } from '@/lib/mock-data';

const sampleNotifications = [
  {
    id: 'n1',
    title: 'Your assessment results are ready.',
    desc: 'Diagnostic calibration finished with 68% alignment.',
    time: '15m ago',
    href: '/assessment-results',
    icon: CheckCircle2,
    color: 'text-emerald-500',
  },
  {
    id: 'n2',
    title: 'Your AI agent has a new recommendation.',
    desc: 'Spend 25 minutes on window functions before advanced analytics.',
    time: '1h ago',
    href: '/learn',
    icon: Sparkles,
    color: 'text-primary',
  },
  {
    id: 'n3',
    title: 'You have a project waiting.',
    desc: 'E-commerce Sales Dataset is ready for analysis.',
    time: '3h ago',
    href: '/projects',
    icon: FolderKanban,
    color: 'text-indigo-500',
  },
  {
    id: 'n4',
    title: 'Time to revisit Statistics.',
    desc: 'Spaced review recommended for probability distributions.',
    time: '1d ago',
    href: '/skill-gap',
    icon: AlertTriangle,
    color: 'text-amber-500',
  },
];

export default function AppHeader({ title }: { title?: string }) {
  const [unread, setUnread] = useState(true);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-6 backdrop-blur-sm">
      <div className="flex items-center gap-4">
        {title && (
          <h1 className="text-lg font-semibold tracking-tight text-foreground">{title}</h1>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search skills, modules, roadmap..."
            className="h-9 w-64 pl-9 text-xs"
          />
        </div>

        {/* AI Agent Button */}
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="relative text-muted-foreground hover:text-foreground"
          title="AI Learning Agent"
        >
          <Link href="/agent">
            <Bot className="h-5 w-5 text-primary" />
            <span className="sr-only">AI Agent</span>
          </Link>
        </Button>

        {/* SECTION 27: Useful Notifications Dropdown */}
        <DropdownMenu onOpenChange={() => setUnread(false)}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
              <Bell className="h-5 w-5" />
              {unread && (
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2">
            <DropdownMenuLabel className="flex items-center justify-between px-2 py-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <span>Notifications</span>
              <span className="text-[10px] text-primary">4 New</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <div className="space-y-1 py-1">
              {sampleNotifications.map((n) => {
                const Icon = n.icon;
                return (
                  <DropdownMenuItem key={n.id} asChild className="cursor-pointer rounded-lg p-2.5 focus:bg-secondary">
                    <Link href={n.href} className="flex items-start gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-secondary text-primary mt-0.5">
                        <Icon className={`h-4 w-4 ${n.color}`} />
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="text-xs font-semibold text-foreground leading-snug">{n.title}</p>
                        <p className="text-[11px] text-muted-foreground line-clamp-1">{n.desc}</p>
                        <p className="text-[10px] text-muted-foreground/70">{n.time}</p>
                      </div>
                    </Link>
                  </DropdownMenuItem>
                );
              })}
            </div>
            <DropdownMenuSeparator />
            <div className="p-1">
              <Button asChild variant="ghost" size="sm" className="w-full text-xs text-center">
                <Link href="/settings">Configure Alert Triggers</Link>
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full ring-offset-background transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                  {currentUser.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{currentUser.name}</span>
                <span className="text-xs text-muted-foreground">{currentUser.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile">Profile & Learning Memory</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/skill-gap">My Skill Gap</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings">Settings</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/login">Sign out</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
export { AppHeader };
