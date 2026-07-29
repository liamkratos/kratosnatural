'use client';

import {useEffect, useRef, useState, type ReactNode} from 'react';
import {cn} from '@/lib/utils';

type RevealProps = {
  children: ReactNode;
  className?: string;
  /** Delay in ms — use multiples of ~60 to stagger siblings. */
  delay?: number;
};

/**
 * Scroll-triggered entrance.
 *
 * Animates transform/opacity only, so it can never cause layout shift, and it
 * costs one IntersectionObserver rather than an animation library. Elements
 * start visible and are hidden only once JS confirms it can animate them, so
 * content is never trapped behind a failed script.
 */
export default function Reveal({children, className, delay = 0}: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) return;

    setShown(false);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShown(true);
        observer.disconnect();
      },
      {rootMargin: '0px 0px -10% 0px'}
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{transitionDelay: `${delay}ms`}}
      className={cn(
        'motion-safe:transition-[opacity,transform] motion-safe:duration-[600ms] motion-safe:ease-out',
        shown ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4',
        className
      )}
    >
      {children}
    </div>
  );
}
