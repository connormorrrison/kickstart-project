import type { ComponentPropsWithoutRef } from 'react';
import { PopoverContent } from '@/components/ui/popover';
import { cn } from '@/lib/utils';

type PopoverContent1Props = ComponentPropsWithoutRef<typeof PopoverContent>;

export default function PopoverContent1({ className, ...props }: PopoverContent1Props) {
  return (
    <PopoverContent
      className={cn('rounded-xl', className)}
      {...props}
    />
  );
}
