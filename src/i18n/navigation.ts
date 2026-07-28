import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

/**
 * Locale-aware replacements for next/link and next/navigation. Always import
 * Link, redirect, usePathname and useRouter from here rather than from Next
 * directly, so the domain/prefix strategy is applied consistently.
 */
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
