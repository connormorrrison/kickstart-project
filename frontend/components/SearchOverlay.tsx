'use client';

import * as React from 'react';
import { ChevronDownIcon, User, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import DatePickerButton from '@/components/DatePickerButton';
import DateCalendar from '@/components/DateCalendar';
import Tile from '@/components/Tile';
import TimeInput from '@/components/TimeInput';
import Title2 from '@/components/Title2';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import PopoverContent1 from '@/components/PopoverContent1';

export default function SearchOverlay() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = React.useState('10:00');
  const [endTime, setEndTime] = React.useState('11:00');
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const { selectedSpot, setSelectedSpot, user, setAuthModalOpen } = useStore();

  // --- MECHANICS: Data Persistence ---
  // We need to keep the data around for 300ms after it becomes null
  // so the closing animation has something to display while it shrinks.
  const [displaySpot, setDisplaySpot] = React.useState(selectedSpot);

  React.useEffect(() => {
    if (selectedSpot) {
      setDisplaySpot(selectedSpot);
    } else {
      const timer = setTimeout(() => setDisplaySpot(null), 300); // Match duration-300
      return () => clearTimeout(timer);
    }
  }, [selectedSpot]);

  const handleBook = () => {
    if (!user) setAuthModalOpen(true);
    else alert('Proceeding to payment...');
  };

  return (
    <Tile className="absolute left-5 top-5 z-10 w-[350px] p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-xl text-left font-medium">Find Parking</h2>
        <Button2 icon={<User />}>Sign In</Button2>
      </div>

      <div className="flex flex-col gap-4">
        {/* Datepicker */}
        <div className="w-full">
          <Title2>Date</Title2>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger asChild>
              <DatePickerButton className={cn(!date && "text-muted-foreground")}>
                {date ? date.toLocaleDateString() : "Select date"}
                <ChevronDownIcon className="opacity-50" />
              </DatePickerButton>
            </PopoverTrigger>
            <PopoverContent1 className="w-fit p-0" align="start">
              <DateCalendar
                mode="single"
                selected={date}
                onSelect={(newDate) => {
                  setDate(newDate);
                  setIsDatePickerOpen(false);
                }}
                captionLayout="dropdown"
              />
            </PopoverContent1>
          </Popover>
        </div>

        {/* Time Input */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Title2>Start</Title2>
            <TimeInput value={startTime} onChange={(e) => setStartTime(e.target.value)} />
          </div>
          <div className="flex-1">
            <Title2>End</Title2>
            <TimeInput value={endTime} onChange={(e) => setEndTime(e.target.value)} />
          </div>
        </div>

        <Button1 disabled={!date}>Search</Button1>

        {/* --- THE ANIMATION --- */}
        <div
          className={`
            grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.1,0.9,0.3,1)]
            ${selectedSpot ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
          `}
        >
          {/* Inner min-h-0 is required for the grid trick to work */}
          <div className="min-h-0">
            {displaySpot && (
              <>
                <Tile className="p-4 mt-4 shadow-none bg-gray-50">
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={24} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-base font-normal">{displaySpot.hostName || 'Host'}</div>
                          <div className="flex items-center gap-1.5 text-base text-green-600">
                            <Shield size={14} />
                            <span>Verified Host</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSpot(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div className="flex items-center gap-2 text-base text-gray-600">
                      <MapPin size={16} />
                      <span>{displaySpot.address}</span>
                    </div>

                    <div>
                      <div className="text-base text-gray-600 mb-1">Full availability</div>
                      <div className="text-base font-normal">
                        <div>Monday - Sunday</div>
                        <div>
                          {displaySpot.availabilityIntervals && displaySpot.availabilityIntervals.length > 0
                            ? displaySpot.availabilityIntervals.map((interval, idx) => (
                                <span key={idx}>
                                  {interval.start} - {interval.end}
                                  {idx < displaySpot.availabilityIntervals!.length - 1 ? ', ' : ''}
                                </span>
                              ))
                            : `${displaySpot.availableStart} - ${displaySpot.availableEnd}`
                          }
                        </div>
                      </div>
                    </div>

                    {date && (
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-base font-normal text-blue-900 mb-1">Selected time</div>
                        <div className="text-base font-normal text-blue-800">
                          {date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-base font-normal text-blue-800">
                          {startTime} - {endTime}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-200">
                      <div className="text-base text-gray-600 mb-1">Hourly rate</div>
                      <div className="text-base font-normal">${displaySpot.pricePerHour}/hour</div>
                    </div>
                  </div>
                </Tile>
                <Button1 onClick={handleBook} className="w-full mt-4 pb-1">Proceed to Payment</Button1>
              </>
            )}
          </div>
        </div>
      </div>
    </Tile>
  );
}