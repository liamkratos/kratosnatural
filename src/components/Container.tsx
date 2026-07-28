import type {ReactNode} from 'react';
import {cn} from '@/lib/utils';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  as?: 'div' | 'main' | 'section' | 'header' | 'footer';
};

export default function Container({
  children,
  className,
  as: Component = 'div'
}: ContainerProps) {
  return (
    <Component className={cn('mx-auto w-full max-w-3xl px-6', className)}>
      {children}
    </Component>
  );
}
