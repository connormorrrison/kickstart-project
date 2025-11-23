import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';

type Button2Props = ComponentPropsWithoutRef<typeof Button> & {
  icon?: React.ReactNode;
};

export default function Button2({ className, icon, children, ...props }: Button2Props) {
  return (
    <Button
      variant="outline"
      className={`h-10 rounded-xl text-base font-normal text-gray-700 bg-white hover:bg-gray-50 shadow-none ${className || ''}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </Button>
  );
}
