'use client';

import * as React from 'react';
import { ChevronDownIcon, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import DatePickerButton from '@/components/DatePickerButton';
import DateCalendar from '@/components/DateCalendar';
import Tile from '@/components/Tile';
import TimeInput from '@/components/TimeInput';
import Title2 from '@/components/Title2';
import {
  Popover,
  PopoverTrigger,
} from '@/components/ui/popover';
import PopoverContent1 from '@/components/PopoverContent1';

export default function SearchOverlay() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = React.useState('10:00');
  const [endTime, setEndTime] = React.useState('11:00');

  return (
    <Tile className="absolute left-5 top-5 z-10 w-[350px] p-5">
      {/* header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-left font-medium">Find Parking</h2>
        <Button2 icon={<User />}>Sign In</Button2>
      </div>

      {/* form content */}
      <div className="flex flex-col gap-4">
        
        {/* datepicker */}
        <div className="w-full">
          <Title2>Date</Title2>
          <Popover>
            <PopoverTrigger asChild>
              <DatePickerButton
                className={cn(
                  !date && "text-muted-foreground"
                )}
              >
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="opacity-50" />
              </DatePickerButton>
            </PopoverTrigger>
            <PopoverContent1 className="w-fit p-0" align="start">
              <DateCalendar
                mode="single"
                selected={date}
                onSelect={setDate}
                captionLayout="dropdown"
              />
            </PopoverContent1>
          </Popover>
        </div>

        {/* time input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Title2>Start</Title2>
            <TimeInput
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
          <div className="flex-1">
            <Title2>End</Title2>
            <TimeInput
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>
        </div>

        {/* Action button */}
        <Button1 disabled={!date}>
          Search
        </Button1>
      </div>
    </Tile>
  );
}