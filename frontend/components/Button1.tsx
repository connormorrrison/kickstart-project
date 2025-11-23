import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '@/components/ui/button';
import React from 'react';

type Button1Props = ComponentPropsWithoutRef<typeof Button> & {
  icon?: React.ReactNode;
};

export default function Button1({ className, icon, children, ...props }: Button1Props) {
  return (
    <Button
      className={`h-10 rounded-xl text-base font-normal text-white bg-blue-600 hover:bg-blue-700 shadow-none ${className || ''}`}
      {...props}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {children}
    </Button>
  );
}