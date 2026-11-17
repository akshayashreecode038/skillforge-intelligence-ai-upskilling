'use client';

import { ChevronDown } from 'lucide-react';

interface ScrollIndicatorProps {
  targetId?: string;
  label?: string;
}

export function ScrollIndicator({
  targetId = 'overview',
  label = 'Scroll to discover',
}: ScrollIndicatorProps) {
  const handleClick = () => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <button
      onClick={handleClick}
      aria-label="Scroll to next section"
      className="group absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 flex-col items-center gap-2 text-xs text-muted-foreground/80 transition-all hover:text-foreground focus:outline-none"
    >
      <span className="text-[11px] font-medium tracking-widest uppercase opacity-70 group-hover:opacity-100 transition-opacity">
        {label}
      </span>
      <div className="flex h-8 w-5 items-start justify-center rounded-full border border-border/80 p-1 backdrop-blur-sm group-hover:border-primary/60 transition-colors">
        <div className="h-2 w-1 rounded-full bg-primary animate-bounce" />
      </div>
    </button>
  );
}
export default ScrollIndicator;
