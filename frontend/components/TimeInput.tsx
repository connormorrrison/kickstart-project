import type { ComponentPropsWithoutRef } from 'react';
import { Input } from '@/components/ui/input';

type TimeInputProps = ComponentPropsWithoutRef<typeof Input>;

export default function TimeInput({ className, ...props }: TimeInputProps) {
  return (
    <Input
      type="time"
      className={`h-10! rounded-xl! text-base! font-normal! text-gray-600! shadow-none! [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none ${className || ''}`}
      {...props}
    />
  );
}
