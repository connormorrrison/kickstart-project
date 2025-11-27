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

  // Handle existing AM/PM
  const match12 = time.match(/(\d{1,2}):(\d{2})\s*(am|pm|AM|PM)/i);
  if (match12) {
    const [, hours, minutes, period] = match12;
    return `${hours}:${minutes} ${period.toUpperCase()}`;
  }

  // Handle 24-hour format
  const match24 = time.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    let [, hoursStr, minutes] = match24;
    let hours = parseInt(hoursStr);
    const period = hours >= 12 ? 'PM' : 'AM';

    if (hours > 12) hours -= 12;
    if (hours === 0) hours = 12;

    return `${hours}:${minutes} ${period}`;
  }

  return time;
};

// Helper to parse time string to minutes
const parseTime = (timeStr: string) => {
  if (!timeStr) return 0;
  // Handle 12-hour format with AM/PM (e.g., "9:00 AM")
  const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
  if (match12) {
    let [, hours, minutes, period] = match12;
    let h = parseInt(hours);
    const m = parseInt(minutes);

    if (period.toUpperCase() === 'PM' && h !== 12) h += 12;
    if (period.toUpperCase() === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  }

  // Handle 24-hour format (e.g., "09:00" or "17:00")
  const match24 = timeStr.match(/(\d{1,2}):(\d{2})/);
  if (match24) {
    let [, hours, minutes] = match24;
    return parseInt(hours) * 60 + parseInt(minutes);
  }

  return 0;
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface AvailableSlot {
  start_time: string;
  end_time: string;
}

interface AvailabilityData {
  date: string;
  day: string;
  available_slots: AvailableSlot[];
  operating_hours: AvailableSlot[];
}

export default function SearchOverlay() {
  const router = useRouter();
  const [date, setDate] = React.useState<Date | undefined>(undefined);

  const [startTime, setStartTime] = React.useState('');
  const [endTime, setEndTime] = React.useState('');

  const [isDatePickerOpen, setIsDatePickerOpen] = React.useState(false);
  const [isVisible, setIsVisible] = React.useState(false);
  const [isSearchActive, setIsSearchActive] = React.useState(false);
  const [availability, setAvailability] = React.useState<AvailabilityData | null>(null);
  const [isLoadingAvailability, setIsLoadingAvailability] = React.useState(false);

  const { selectedSpot, setSelectedSpot, user, setAuthModalOpen, setSearchCriteria } = useStore();

  React.useEffect(() => {
    setIsVisible(true);
    // RESET: Ensure we start small (no selected spot) whenever this component mounts
    setSelectedSpot(null);
  }, [setSelectedSpot]);

  const [displaySpot, setDisplaySpot] = React.useState(selectedSpot);

  React.useEffect(() => {
    if (selectedSpot) {
      setDisplaySpot(selectedSpot);
    } else {
      const timer = setTimeout(() => setDisplaySpot(null), 300);
      return () => clearTimeout(timer);
    }
  }, [selectedSpot]);

  // Fetch calculated availability when spot is selected
  React.useEffect(() => {
    if (!selectedSpot) {
      setAvailability(null);
      return;
    }

    // Use selected date if available, otherwise use today
    const dateToCheck = date?.toISOString().split('T')[0] || new Date().toISOString().split('T')[0];

    const fetchAvailability = async () => {
      setIsLoadingAvailability(true);
      try {
        const response = await fetch(`${API_URL}/spots/${selectedSpot.id}/availability/${dateToCheck}`);
        if (response.ok) {
          const data = await response.json();
          setAvailability(data);
        } else {
          console.error('Failed to fetch availability:', response.status);
          setAvailability(null);
        }
      } catch (error) {
        console.error('Error fetching availability:', error);
        setAvailability(null);
      } finally {
        setIsLoadingAvailability(false);
      }
    };

    fetchAvailability();
  }, [selectedSpot, date]);

  const handleBook = () => {
    if (!user) {
      setAuthModalOpen(true);
    } else {
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

  const isSearchButtonEnabled = isSearchActive || (date !== undefined && startTime !== '' && endTime !== '');

  return (
    <PopInOutEffect isVisible={isVisible} className="absolute left-5 top-5 z-10 max-h-[calc(100vh-40px)]">
      <Tile className="w-[350px] p-[24px] overflow-y-auto max-h-[calc(100vh-40px)]">
        <div className="flex flex-col gap-[24px]">
          <h2 className="text-xl text-left font-medium">Find Parking</h2>

          <div className="flex flex-col gap-[24px]">
            {/* Datepicker */}
            <div className="w-full">
              <Title2>Date</Title2>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <DatePickerButton
                    className={cn(
                      !date && "text-muted-foreground",
                      date && "border-green-500 text-green-600 bg-green-50"
                    )}
                  >
                    {date ? date.toLocaleDateString() : "Select date"}
                    <ChevronDownIcon className={cn("opacity-50", date && "text-green-600")} />
                  </DatePickerButton>
                </PopoverTrigger>
                <PopoverContent1 className="w-fit p-0" align="start">
                  <DateCalendar
                    mode="single"
                    selected={date}
                    onSelect={(newDate) => {
                      setDate(newDate);
                      setIsDatePickerOpen(false);
                      // Note: We do NOT update searchCriteria here anymore. Manual search only.
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
                  type={!date ? "text" : "time"}
                  placeholder=""
                  className={cn(startTime && "border-green-500 text-green-600 bg-green-50")}
                />
              </div>
              <div className="flex-1">
                <Title2>End</Title2>
                <TimeInput
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  disabled={!date}
                  type={!date ? "text" : "time"}
                  placeholder=""
                  className={cn(endTime && "border-green-500 text-green-600 bg-green-50")}
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
                  : isSearchButtonEnabled
                    ? 'bg-blue-600 hover:bg-blue-700 text-white border-transparent'
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
                        <Title2>
                          {date ? `Available on ${availability?.day || '...'}` : 'Availability'}
                        </Title2>
                        <div className="text-base font-normal text-gray-600 mt-1 space-y-1">
                          {isLoadingAvailability ? (
                            <div className="text-gray-400">Loading availability...</div>
                          ) : date && availability ? (
                            // LOGIC: If time is selected, check if it's available.
                            // If no time selected, show operating hours.
                            startTime && endTime ? (
                              (() => {
                                const startMins = parseTime(startTime);
                                const endMins = parseTime(endTime);

                                // Check if the selected range is fully covered by any available slot
                                const isAvailable = availability.available_slots.some(slot => {
                                  const slotStart = parseTime(slot.start_time);
                                  const slotEnd = parseTime(slot.end_time);
                                  return slotStart <= startMins && slotEnd >= endMins;
                                });

                                if (isAvailable) {
                                  return (
                                    <div className="flex gap-2 text-green-600 font-normal">
                                      <span>Available: {formatTime(startTime)} - {formatTime(endTime)}</span>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div className="text-red-600 font-normal">
                                      Selected time is unavailable
                                    </div>
                                  );
                                }
                              })()
                            ) : (
                              // No time selected: Show Operating Hours
                              availability.operating_hours && availability.operating_hours.length > 0 ? (
                                availability.operating_hours.map((slot, idx) => (
                                  <div key={idx} className="flex gap-2">
                                    <span>{slot.start_time} - {slot.end_time}</span>
                                  </div>
                                ))
                              ) : (
                                <div className="text-red-600 font-medium">Closed</div>
                              )
                            )
                          ) : displaySpot.availabilityIntervals && displaySpot.availabilityIntervals.length > 0 ? (
                            displaySpot.availabilityIntervals.map((interval: any, idx: number) => (
                              <div key={idx} className="flex flex-col sm:flex-row sm:gap-2">
                                {interval.day && <span className="font-medium text-gray-900">{interval.day},</span>}
                                <span>{formatTime(interval.start)} - {formatTime(interval.end)}</span>
                              </div>
                            ))
                          ) : (
                            <div>Check calendar</div>
                          )}
                        </div>
                      </div>

                      <div>
                        <Title2>Hourly Rate</Title2>
                        <div className="text-base font-normal text-gray-600 mt-1">${displaySpot.pricePerHour}/hour</div>
                      </div>
                    </div>
                  </Tile>
                  <Button1
                    onClick={handleBook}
                    className="w-full mt-6"
                    disabled={!!(date && availability && (
                      availability.available_slots.length === 0 ||
                      (startTime && endTime && !availability.available_slots.some(slot => {
                        const startMins = parseTime(startTime);
                        const endMins = parseTime(endTime);
                        const slotStart = parseTime(slot.start_time);
                        const slotEnd = parseTime(slot.end_time);
                        return slotStart <= startMins && slotEnd >= endMins;
                      }))
                    ))}
                  >
                    {date && availability && startTime && endTime && !availability.available_slots.some(slot => {
                      const startMins = parseTime(startTime);
                      const endMins = parseTime(endTime);
                      const slotStart = parseTime(slot.start_time);
                      const slotEnd = parseTime(slot.end_time);
                      return slotStart <= startMins && slotEnd >= endMins;
                    })
                      ? 'Selected Time Unavailable'
                      : date && availability && availability.available_slots.length === 0
                        ? 'Fully Booked'
                        : 'Book with Host'
                    }
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