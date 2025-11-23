import React from 'react';
import { cn } from '@/lib/utils';

interface BadgeProps {
  text: string;
  icon?: React.ReactNode;
  iconColor?: 'blue' | 'green';
  className?: string;
}

export default function Badge({ text, icon, iconColor = 'blue', className }: BadgeProps) {
  const iconColorClass = iconColor === 'green' ? 'text-green-600' : 'text-blue-600';

  return (
    <span
      className={cn(
        'px-3 py-1 text-base rounded-full font-normal border flex items-center gap-2',
        className
      )}
    >
      {icon && (
        <span className={cn(iconColorClass, 'w-[18px] h-[18px] flex items-center justify-center')}>
          {icon}
        </span>
      )}
      <span className="text-gray-700">{text}</span>
    </span>
  );
}
