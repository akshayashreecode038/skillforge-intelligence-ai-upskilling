'use client';

import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface FeatureCardProps {
  step: string;
  title: string;
  headline: string;
  description: string;
  metric: string;
  href: string;
}

export default function FeatureCard({
  step,
  title,
  headline,
  description,
  metric,
  href,
}: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="group flex flex-col justify-between border-t border-white/10 pt-8 pb-6 pr-6"
    >
      <div className="space-y-5">
        <div className="flex items-start justify-between">
          <span className="text-xs font-medium text-white/30 tracking-widest uppercase">
            {step}
          </span>
          <span className="text-[11px] text-white/25 font-medium">
            {metric}
          </span>
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-white tracking-tight">
            {title}
          </h3>
          <p className="text-sm text-white/50 leading-relaxed">
            {headline}
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        <p className="text-sm text-white/35 leading-relaxed">
          {description}
        </p>
        <Link
          href={href}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-white/50 hover:text-white transition-colors group/link"
        >
          <span>Learn more</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover/link:translate-x-0.5" />
        </Link>
      </div>
    </motion.div>
  );
}
