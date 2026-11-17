'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Home,
  Radar,
  GitCompare,
  Milestone,
  GraduationCap,
  FolderKanban,
  ClipboardCheck,
  TrendingUp,
  Bot,
  User as UserIcon,
  PanelLeftClose,
  PanelLeft,
  Sparkles,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: Home },
  { href: '/skills', label: 'My Skills', icon: Radar },
  { href: '/skill-gap', label: 'Skill Gap', icon: GitCompare },
  { href: '/roadmap', label: 'Roadmap', icon: Milestone },
  { href: '/learn', label: 'Learn', icon: GraduationCap },
  { href: '/projects', label: 'Projects', icon: FolderKanban },
  { href: '/assessment', label: 'Assessment', icon: ClipboardCheck },
  { href: '/progress', label: 'Progress', icon: TrendingUp },
  { href: '/agent', label: 'AI Agent', icon: Bot },
];

export function AppSidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={cn(
        'flex h-screen flex-col border-r bg-sidebar transition-all duration-300',
        collapsed ? 'w-[68px]' : 'w-64'
      )}
    >
      <div className="flex items-center justify-between px-4 py-5">
        <Link href="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Sparkles className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <span className="text-lg font-bold tracking-tight">SkillForge</span>
          )}
        </Link>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-md p-1.5 text-muted-foreground hover:bg-accent/10 hover:text-foreground lg:block"
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-3 py-2">
        {navItems.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                active
                  ? 'bg-primary/10 text-primary'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon
                className={cn(
                  'h-5 w-5 shrink-0 transition-transform',
                  active ? 'text-primary' : 'group-hover:scale-110'
                )}
              />
              {!collapsed && <span>{item.label}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary" />
              )}
            </Link>
          );
        })}
      </nav>

      <div className="border-t px-3 py-3">
        <Link
          href="/profile"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
            pathname === '/profile'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
          title={collapsed ? 'Profile' : undefined}
        >
          <UserIcon className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Profile</span>}
        </Link>
        <Link
          href="/settings"
          className={cn(
            'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
            pathname === '/settings'
              ? 'bg-primary/10 text-primary'
              : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
          )}
          title={collapsed ? 'Settings' : undefined}
        >
          <Settings className="h-5 w-5 shrink-0" />
          {!collapsed && <span>Settings</span>}
        </Link>
      </div>
    </aside>
  );
}
