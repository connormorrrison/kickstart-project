'use client';

import * as React from 'react';
import { ChevronDownIcon, User, MapPin, Shield } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/lib/store';
import Button1 from '@/components/Button1';
import DatePickerButton from '@/components/DatePickerButton';
import DateCalendar from '@/components/DateCalendar';
import Tile from '@/components/Tile';
import TimeInput from '@/components/TimeInput';
import Title2 from '@/components/Title2';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { Popover, PopoverTrigger } from '@/components/ui/popover';
import PopoverContent1 from '@/components/PopoverContent1';

export default function SearchOverlay() {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = React.useState('10:00');
  const [endTime, setEndTime] = React.useState('11:00');
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const { selectedSpot, setSelectedSpot, user, setAuthModalOpen } = useStore();

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  // --- MECHANICS: Data Persistence ---
  const [displaySpot, setDisplaySpot] = React.useState(selectedSpot);

  React.useEffect(() => {
    if (selectedSpot) {
      setDisplaySpot(selectedSpot);
    } else {
      const timer = setTimeout(() => setDisplaySpot(null), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSpot]);

  const handleBook = () => {
    if (!user) setAuthModalOpen(true);
    else alert('Proceeding to payment...');
  };

  return (
    <PopInOutEffect isVisible={isVisible} className="absolute left-5 top-5 z-10">
      <Tile className="w-[350px] p-[24px] shadow-xl">
      <div className="flex flex-col gap-[24px]">
        <h2 className="text-xl text-left font-medium">Find Parking</h2>

        <div className="flex flex-col gap-[24px]">
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
          <div className="flex gap-[24px]">
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
        </div>

        {/* --- THE ANIMATION --- */}
        <div
          className={`
            grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.1,0.9,0.3,1)]
            ${selectedSpot ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}
          `}
        >
          <div className="min-h-0">
            {displaySpot && (
              <>
                <Tile className="p-[24px] shadow-none bg-gray-50">
                  <div className="space-y-[24px]">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-[24px]">
                        <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center">
                          <User size={24} className="text-gray-600" />
                        </div>
                        <div>
                          <div className="text-base font-normal">{displaySpot.hostName || 'Host'}</div>
                          <div className="flex items-center gap-[24px] text-base text-green-600">
                            <Shield size={14} />
                            <span>Verified Host</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSpot(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div>
                      <Title2>Address</Title2>
                      <div className="text-base font-normal text-gray-600">{displaySpot.address}</div>
                    </div>

                    <div>
                      <Title2>Full Availability</Title2>
                      <div className="text-base font-normal text-gray-600">
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

                    <div>
                      <Title2>Hourly Rate</Title2>
                      <div className="text-base font-normal text-gray-600">${displaySpot.pricePerHour}/hour</div>
                    </div>
                  </div>
                </Tile>
                <Button1 onClick={handleBook} className="w-full mt-[24px]">Proceed to Payment</Button1>
              </>
            )}
          </div>
        </div>
      </div>
    </Tile>
    </PopInOutEffect>
  );
}