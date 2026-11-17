'use client';

/**
 * Clean dark background — no effects, no animations, no gimmicks.
 * A pure near-black base that lets content sections define their own subtle atmosphere.
 */
export function PageBackground() {
  return (
    <div className="fixed inset-0 -z-10 bg-[#0a0a0f]" />
  );
}
