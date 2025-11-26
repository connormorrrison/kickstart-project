'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDownIcon, User, Shield } from 'lucide-react';
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

// Helper to format the full address string
const formatAddress = (spot: any) => {
  if (!spot) return '';
  if (spot.street && spot.city) {
    return `${spot.street}, ${spot.city}, ${spot.province}`;
  }
  return spot.address || '';
};

// Helper function to format time
const formatTime = (time: string) => {
  if (!time) return '';
  const match = time.match(/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)?/i);
  if (!match) return time;
  const [, hours, minutes, period] = match;
  const formattedPeriod = period ? period.toUpperCase() : '';
  return `${hours}:${minutes} ${formattedPeriod}`.trim();
};

export default function SearchOverlay() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  
  // Default values could be set here if you wanted, e.g. '09:00', '17:00'
  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');
  
  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(false);

  const { selectedSpot, setSelectedSpot, user, setAuthModalOpen, setSearchCriteria } = useStore();

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  const [displaySpot, setDisplaySpot] = React.useState(selectedSpot);

  React.useEffect(() => {
    if (selectedSpot) {
      setDisplaySpot(selectedSpot);
    } else {
      const timer = setTimeout(() => setDisplaySpot(null), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSpot]);

  // Update handleBook to proceed regardless of search inputs
  const handleBook = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
      // We pass whatever state we have (even if empty) to the next page.
      // The Payment/Booking page will handle the "Select Date" logic.
      setSearchCriteria({
        date: date?.toISOString().split('T')[0] || '',
        startTime: startTime,
        endTime: endTime,
      });
      router.push('/payment');
    }
  };

  const handleSearchToggle = () => {
    if (isSearchActive) {
      // RESET
      setIsSearchActive(false);
      setDate(undefined);
      setStartTime('');
      setEndTime('');
      setSearchCriteria({ date: '', startTime: '', endTime: '' });
    } else {
      // SEARCH
      setIsSearchActive(true);
      setSearchCriteria({
        date: date?.toISOString().split('T')[0] || '',
        startTime: startTime,
        endTime: endTime,
      });
    }
  };

  // Logic for search button remains the same (needs input to search)
  const isSearchButtonEnabled = isSearchActive || (date !== undefined && startTime !== '' && endTime !== '');

  return (
    <PopInOutEffect isVisible={isVisible} className="absolute left-5 top-5 z-10 max-h-[calc(100vh-40px)]">
      <Tile className="w-[350px] p-[24px] shadow-xl overflow-y-auto max-h-[calc(100vh-40px)]">
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
              <TimeInput
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={!date}
                placeholder={!date ? "-" : "09:00"}
              />
            </div>
            <div className="flex-1">
              <Title2>End</Title2>
              <TimeInput
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={!date}
                placeholder={!date ? "-" : "17:00"}
              />
            </div>
          </div>

          <Button1 
            disabled={!isSearchButtonEnabled} 
            onClick={handleSearchToggle}
            className={`
              transition-all duration-500 ease-in-out
              ${isSearchActive 
                ? 'bg-red-600 hover:bg-red-700 text-white border-transparent' 
                : ''
              }
            `}
          >
            {isSearchActive ? "Reset Search" : "Search"}
          </Button1>
        </div>

        {/* --- THE ANIMATION --- */}
        <div className={`grid overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.1,0.9,0.3,1)] ${selectedSpot ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
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
                          <div className="flex items-center gap-1.5 text-base text-green-600">
                            <Shield size={14} />
                            <span>Verified Host</span>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => setSelectedSpot(null)} className="text-gray-500 hover:text-gray-700">✕</button>
                    </div>

                    <div>
                      <Title2>Address</Title2>
                      <div className="text-base font-normal text-gray-600 mt-1">{formatAddress(displaySpot)}</div>
                    </div>

                    <div>
                      <Title2>Full Availability</Title2>
                      <div className="text-base font-normal text-gray-600 mt-1 space-y-1">
                        {displaySpot.availabilityIntervals && displaySpot.availabilityIntervals.length > 0
                          ? displaySpot.availabilityIntervals.map((interval: any, idx: number) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:gap-2">
                                {interval.day && <span className="font-medium text-gray-900">{interval.day},</span>}
                                <span>{formatTime(interval.start)} - {formatTime(interval.end)}</span>
                              </div>
                            ))
                          : <div>Check calendar</div>
                        }
                      </div>
                    </div>

                    <div>
                      <Title2>Hourly Rate</Title2>
                      <div className="text-base font-normal text-gray-600 mt-1">${displaySpot.pricePerHour}/hour</div>
                    </div>
                  </div>
                </Tile>
                {/* Button now simply says "Book with Host" and navigates */}
                <Button1 onClick={handleBook} className="w-full mt-[24px]">
                  Book with Host
                </Button1>
              </>
            )}
          </div>
        </div>
      </div>
    </Tile>
    </PopInOutEffect>
  );
}