import type { ComponentPropsWithoutRef } from 'react';
import { Calendar } from '@/components/ui/calendar';

type DateCalendarProps = ComponentPropsWithoutRef<typeof Calendar>;

export default function DateCalendar({ className, classNames, ...props }: DateCalendarProps) {
  return (
    <Calendar
      className={`w-full [--cell-size:40px] ${className || ''}`}
      classNames={{
        dropdown_root: 'relative has-focus:border-ring border border-input shadow-none has-focus:ring-ring/50 has-focus:ring-[3px] rounded-xl',
        ...classNames,
      }}
      {...props}
    />
  );
}
