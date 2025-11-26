'use client';

import { useState, useMemo, useCallback } from 'react';
import { Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

// UI Components
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import CustomInput from '@/components/CustomInput';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';

// Custom Logic Components
import AvailabilityPicker from './AvailabilityPicker';
import AddressMapPreview from './AddressMapPreview';

// Helper Component for Title2
const Title2 = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-xl font-normal text-gray-900 ${className}`}>{children}</h2>
);

interface AddListingModalProps {
  isOpen: boolean;
  onClose: (open: boolean) => void;
  onListingAdded?: () => void;
}

interface TimeSlot {
  day: string;
  hour: string;
  hourNum: number;
}

interface GroupedTimeRange {
  day: string;
  startHour: string;
  endHour: string;
}

export default function AddListingModal({ isOpen, onClose, onListingAdded }: AddListingModalProps) {
  const { user } = useStore();
  
  // Split Address State
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('Vancouver');
  const [province, setProvince] = useState('BC');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('Canada');
  
  const [rate, setRate] = useState<string>('10');
  const [coordinates, setCoordinates] = useState({ lat: 49.2827, lng: -123.1207 });
  const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derived full address for Geocoding
  const fullAddress = useMemo(() => {
    return [street, city, province, postalCode, country].filter(Boolean).join(', ');
  }, [street, city, province, postalCode, country]);

  // Calculate booking likelihood
  const numericRate = parseFloat(rate) || 0;
  const bookingLikelihood = Math.max(0, Math.round(100 - (numericRate / 50 * 100)));

  const handleCoordinatesChange = useCallback((lat: number, lng: number) => {
    setCoordinates({ lat, lng });
  }, []);

  function parseTimeToHour(time: string): number {
    const match = time.match(/(\d+):00 (AM|PM)/);
    if (!match) return 0;
    let hour = parseInt(match[1]);
    const period = match[2];
    if (period === 'PM' && hour !== 12) hour += 12;
    if (period === 'AM' && hour === 12) hour = 0;
    return hour;
  }

  function formatEndHour(startHourNum: number): string {
    const endHourNum = startHourNum + 1;
    if (endHourNum === 0 || endHourNum === 24) return '12:00 AM';
    else if (endHourNum < 12) return `${endHourNum}:00 AM`;
    else if (endHourNum === 12) return '12:00 PM';
    else return `${endHourNum - 12}:00 PM`;
  }

  function getNextDateForDay(dayName: string): string {
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetDay = dayOrder.indexOf(dayName);
    const today = new Date();
    const currentDay = today.getDay();
    let daysUntil = targetDay - currentDay;
    if (daysUntil <= 0) daysUntil += 7;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntil);
    const year = targetDate.getFullYear();
    const month = String(targetDate.getMonth() + 1).padStart(2, '0');
    const day = String(targetDate.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  const groupedTimeRanges = useMemo(() => {
    const slots: TimeSlot[] = Array.from(selectedSlots).map(slot => {
      const [day, time] = slot.split('-');
      const hourNum = parseTimeToHour(time);
      return { day, hour: time, hourNum };
    });

    const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    slots.sort((a, b) => {
      const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      if (dayDiff !== 0) return dayDiff;
      return a.hourNum - b.hourNum;
    });

    const grouped: GroupedTimeRange[] = [];
    let currentRange: GroupedTimeRange | null = null;

    for (const slot of slots) {
      if (!currentRange || currentRange.day !== slot.day ||
        parseTimeToHour(currentRange.endHour) !== slot.hourNum) {
        if (currentRange) grouped.push(currentRange);
        currentRange = {
          day: slot.day,
          startHour: slot.hour,
          endHour: formatEndHour(slot.hourNum)
        };
      } else {
        currentRange.endHour = formatEndHour(slot.hourNum);
      }
    }
    if (currentRange) grouped.push(currentRange);

    return grouped;
  }, [selectedSlots]);

  // Convert to API format for availability intervals
  const availabilityIntervals = useMemo(() => {
    return groupedTimeRanges.map(range => ({
      day: range.day,
      start_time: range.startHour.replace(' ', '').toLowerCase(), // "10:00 AM" -> "10:00am"
      end_time: range.endHour.replace(' ', '').toLowerCase(),
    }));
  }, [groupedTimeRanges]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setSubmitError('You must be logged in to create a listing');
      return;
    }

    if (selectedSlots.size === 0) {
      setSubmitError('Please select at least one availability time slot');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const { spotsApi } = await import('@/lib/api');

      // Create the parking spot
      const newSpot = await spotsApi.create({
        street,
        city,
        province,
        postal_code: postalCode,
        country,
        lat: coordinates.lat,
        lng: coordinates.lng,
        price_per_hour: numericRate,
        availability_intervals: availabilityIntervals,
      });

      // Reset form
      setStreet('');
      setPostalCode('');
      setRate('10');
      setCoordinates({ lat: 49.2827, lng: -123.1207 });
      setSelectedSlots(new Set());

      if (onListingAdded) {
        onListingAdded();
      }
      onClose(false);
    } catch (error) {
      console.error('Error creating listing:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to create listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto sm:rounded-xl">
        <DialogHeader>
          <DialogTitle className="font-normal text-2xl">Add New Listing</DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Enter the details for your parking spot to start earning
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="grid gap-8 py-4">
          
          {/* Address Section */}
          <div className="grid gap-4">
            <Title2>Address</Title2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <CustomInput 
                  placeholder="Street Address" 
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="rounded-xl"
                  required
                />
              </div>
              <CustomInput 
                placeholder="City" 
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="rounded-xl"
                required
              />
              <CustomInput 
                placeholder="Province / State" 
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="rounded-xl"
                required
              />
              <CustomInput 
                placeholder="Postal / Zip Code" 
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="rounded-xl"
                required
              />
              <CustomInput 
                placeholder="Country" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="rounded-xl"
                required
              />
            </div>
            
            <div className="rounded-xl overflow-hidden border border-gray-100 mt-2">
              <AddressMapPreview
                address={fullAddress}
                onCoordinatesChange={handleCoordinatesChange}
              />
            </div>
          </div>

          {/* Rate Section */}
          <div className="grid gap-4">
            <Title2>Hourly Rate</Title2>
            <div className="flex items-start gap-4">
              <div className="relative w-full">
                {/* Vertically centered dollar sign */}
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">$</span>
                <CustomInput
                  type="number"
                  min="0"
                  max="200"
                  step="1"
                  value={rate}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || (parseFloat(val) >= 0 && parseFloat(val) <= 200)) {
                      setRate(val);
                    }
                  }}
                  className="pl-7 rounded-xl"
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="flex flex-col justify-center h-10 min-w-[140px]">
                <span className={`text-base font-normal ${bookingLikelihood > 70 ? 'text-green-600' : bookingLikelihood > 30 ? 'text-amber-500' : 'text-red-600'}`}>
                  {bookingLikelihood}% likely to book
                </span>
              </div>
            </div>
          </div>

          {/* Availability Picker */}
          <div className="grid gap-4">
            <Title2>Availability</Title2>
            <AvailabilityPicker
              selectedSlots={selectedSlots}
              onSlotsChange={setSelectedSlots}
            />
          </div>

          {/* Times Selected Display */}
          {groupedTimeRanges.length > 0 && (
            <div className="grid gap-4">
              <Title2>Times Selected</Title2>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="max-h-40 overflow-auto space-y-2">
                  {groupedTimeRanges.map((range, index) => (
                    <div
                      key={index}
                      className="text-base font-normal text-gray-900 pb-2 border-b border-gray-200 last:border-0 last:pb-0"
                    >
                      <span className="font-medium">{range.day},</span>
                      <span className="ml-1">{range.startHour} - {range.endHour}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {submitError && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm">
              {submitError}
            </div>
          )}

          {/* Footer Spacing */}
          <DialogFooter className="gap-3 sm:gap-3 pt-4">
            <Button2 type="button" onClick={() => onClose(false)}>
              Cancel
            </Button2>
            <Button1 
              type="submit" 
              disabled={selectedSlots.size === 0 || isSubmitting}
            >
              <Plus size={18} className="mr-2" />
              {isSubmitting ? 'Creating...' : 'Add Listing'}
            </Button1>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}