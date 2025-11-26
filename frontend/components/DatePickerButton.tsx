import type { ComponentPropsWithoutRef } from 'react';
import { Button } from '@/components/ui/button';

type DatePickerButtonProps = ComponentPropsWithoutRef<typeof Button>;

export default function DatePickerButton({ className, ...props }: DatePickerButtonProps) {
  return (
    <Button
      variant="outline"
      className={`h-10! rounded-xl! text-base! font-normal! text-gray-600! w-full! justify-between! shadow-none! ${className || ''}`}
      {...props}
    />
  );
}
