'use client';

import {useEffect, useState} from 'react';

/**
 * True once the page has scrolled past the top.
 *
 * The header and the hero both change shape on this transition — the bar
 * becomes an inset pill, the hero pulls in from the edges and picks up the
 * same radius. They have to switch on the same pixel and over the same
 * duration, or the two rounded shapes appear one after the other and the
 * effect reads as a glitch. Sharing the threshold here is what keeps them in
 * step.
 */
export const SCROLL_THRESHOLD = 24;

export function useScrolled() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLL_THRESHOLD);
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return scrolled;
}
