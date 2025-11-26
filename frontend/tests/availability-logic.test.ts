import { describe, it, expect } from 'vitest'; // or 'jest'

// --- 1. TYPES & MOCK DATA STRUCTURES ---

type TimeString = string; // Format "HH:mm" or "h:mma"

interface AvailabilityInterval {
  id: string;
  day: string;
  start_time: TimeString;
  end_time: TimeString;
}

interface Booking {
  id: string;
  spot_id: string;
  date: string; // "YYYY-MM-DD"
  day: string;  // "Monday"
  start_time: TimeString;
  end_time: TimeString;
}

// --- 2. THE SOLUTION LOGIC (Helper Functions) ---

// Helper: Convert time string to minutes from midnight for easy math
// Handles "14:00", "2:00pm", "9:00am"
const toMinutes = (timeStr: string): number => {
  const normalized = timeStr.toLowerCase().replace(/\s/g, '');
  let [time, modifier] = normalized.split(/(am|pm)/);
  let [hours, minutes] = time.split(':').map(Number);

  if (modifier === 'pm' && hours < 12) hours += 12;
  if (modifier === 'am' && hours === 12) hours = 0;

  return hours * 60 + minutes;
};

// Helper: Convert minutes back to "HH:mm"
const toTimeStr = (minutes: number): string => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  // formatting to 24h format for simplicity in output, though logic handles both
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
};

/**
 * CORE LOGIC: Validates if a NEW booking request overlaps with EXISTING bookings.
 * Returns true if the slot is free, false if blocked.
 */
const isSlotAvailable = (
  requestedStart: string,
  requestedEnd: string,
  existingBookings: Booking[]
): boolean => {
  const reqStart = toMinutes(requestedStart);
  const reqEnd = toMinutes(requestedEnd);

  for (const booking of existingBookings) {
    const bookStart = toMinutes(booking.start_time);
    const bookEnd = toMinutes(booking.end_time);

    // Check for overlap
    // Overlap exists if: (ReqStart < BookEnd) AND (ReqEnd > BookStart)
    if (reqStart < bookEnd && reqEnd > bookStart) {
      return false; // Collision detected
    }
  }
  return true;
};

/**
 * VISUAL LOGIC: Calculates the *remaining* availability chunks
 * by subtracting bookings from the base availability.
 */
const getRemainingAvailability = (
  baseInterval: AvailabilityInterval,
  todaysBookings: Booking[]
): { start: string; end: string }[] => {
  const baseStart = toMinutes(baseInterval.start_time);
  const baseEnd = toMinutes(baseInterval.end_time);

  // Sort bookings by start time
  const sortedBookings = [...todaysBookings].sort(
    (a, b) => toMinutes(a.start_time) - toMinutes(b.start_time)
  );

  let currentStart = baseStart;
  const availableChunks: { start: string; end: string }[] = [];

  for (const booking of sortedBookings) {
    const bookStart = toMinutes(booking.start_time);
    const bookEnd = toMinutes(booking.end_time);

    // If the booking is completely outside (before) the current window (shouldn't happen if filtered correctly, but safety check)
    if (bookEnd <= currentStart) continue;

    // If there is a gap between current availability start and booking start, that's an open slot
    if (currentStart < bookStart) {
      availableChunks.push({
        start: toTimeStr(currentStart),
        end: toTimeStr(Math.min(bookStart, baseEnd)), // Don't go past base end
      });
    }

    // Move our pointer to the end of this booking
    // Math.max handles overlapping bookings
    currentStart = Math.max(currentStart, bookEnd);

    // If we've passed the base end time, stop
    if (currentStart >= baseEnd) break;
  }

  // If there is time left after the last booking
  if (currentStart < baseEnd) {
    availableChunks.push({
      start: toTimeStr(currentStart),
      end: toTimeStr(baseEnd),
    });
  }

  return availableChunks;
};

// --- 3. TEST CASES ---

describe('Parking Availability Logic', () => {
  // Mock Data from User's Prompt
  const baseAvailability: AvailabilityInterval = {
    id: '18',
    day: 'Monday',
    start_time: '9:00am', // 09:00
    end_time: '5:00pm',   // 17:00
  };

  describe('isSlotAvailable (Validation)', () => {
    const existingBookings: Booking[] = [
      {
        id: 'b1',
        spot_id: '18',
        date: '2023-10-23',
        day: 'Monday',
        start_time: '12:00pm', // 12:00
        end_time: '2:00pm',    // 14:00
      },
    ];

    it('should allow booking a completely free slot before existing bookings', () => {
      // Trying to book 9am - 11am
      const result = isSlotAvailable('9:00am', '11:00am', existingBookings);
      expect(result).toBe(true);
    });

    it('should allow booking a completely free slot after existing bookings', () => {
      // Trying to book 3pm - 5pm
      const result = isSlotAvailable('3:00pm', '5:00pm', existingBookings);
      expect(result).toBe(true);
    });

    it('should REJECT a booking that overlaps the start of an existing booking', () => {
      // Trying to book 11:00am - 12:30pm (Overlaps 12:00-12:30)
      const result = isSlotAvailable('11:00am', '12:30pm', existingBookings);
      expect(result).toBe(false);
    });

    it('should REJECT a booking that is inside an existing booking', () => {
      // Trying to book 12:30pm - 1:30pm (Inside 12:00-2:00)
      const result = isSlotAvailable('12:30pm', '1:30pm', existingBookings);
      expect(result).toBe(false);
    });

    it('should REJECT a booking that envelops an existing booking', () => {
      // Trying to book 11:00am - 3:00pm (Contains 12:00-2:00 completely)
      const result = isSlotAvailable('11:00am', '3:00pm', existingBookings);
      expect(result).toBe(false);
    });
  });

  describe('getRemainingAvailability (Display)', () => {
    it('should return the full interval if there are NO bookings', () => {
      const chunks = getRemainingAvailability(baseAvailability, []);

      expect(chunks).toHaveLength(1);
      expect(chunks[0].start).toBe('09:00');
      expect(chunks[0].end).toBe('17:00'); // 5pm
    });

    it('should split availability if there is a booking in the MIDDLE', () => {
      const bookings: Booking[] = [{
        id: 'b1', spot_id: '18', date: 'X', day: 'Monday',
        start_time: '12:00pm',
        end_time: '2:00pm'
      }];

      const chunks = getRemainingAvailability(baseAvailability, bookings);

      // We expect 2 chunks: 9-12 and 2-5
      expect(chunks).toHaveLength(2);
      expect(chunks[0]).toEqual({ start: '09:00', end: '12:00' });
      expect(chunks[1]).toEqual({ start: '14:00', end: '17:00' });
    });

    it('should shorten availability if booking is at the START', () => {
      const bookings: Booking[] = [{
        id: 'b1', spot_id: '18', date: 'X', day: 'Monday',
        start_time: '9:00am',
        end_time: '11:00am'
      }];

      const chunks = getRemainingAvailability(baseAvailability, bookings);

      // Expect 1 chunk: 11-5
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ start: '11:00', end: '17:00' });
    });

    it('should shorten availability if booking is at the END', () => {
      const bookings: Booking[] = [{
        id: 'b1', spot_id: '18', date: 'X', day: 'Monday',
        start_time: '3:00pm',
        end_time: '5:00pm'
      }];

      const chunks = getRemainingAvailability(baseAvailability, bookings);

      // Expect 1 chunk: 9-3
      expect(chunks).toHaveLength(1);
      expect(chunks[0]).toEqual({ start: '09:00', end: '15:00' });
    });

    it('should handle multiple bookings causing multiple splits', () => {
      // Bookings: 10-11 and 13-14
      // Base: 9-17
      const bookings: Booking[] = [
        { id: '1', spot_id: '18', date: 'X', day: 'Monday', start_time: '10:00am', end_time: '11:00am' },
        { id: '2', spot_id: '18', date: 'X', day: 'Monday', start_time: '1:00pm', end_time: '2:00pm' }
      ];

      const chunks = getRemainingAvailability(baseAvailability, bookings);

      // Expect: 9-10, 11-13, 14-17
      expect(chunks).toHaveLength(3);
      expect(chunks[0]).toEqual({ start: '09:00', end: '10:00' });
      expect(chunks[1]).toEqual({ start: '11:00', end: '13:00' });
      expect(chunks[2]).toEqual({ start: '14:00', end: '17:00' });
    });

    it('should return NO chunks if the day is fully booked', () => {
      const bookings: Booking[] = [{
        id: 'b1', spot_id: '18', date: 'X', day: 'Monday',
        start_time: '9:00am',
        end_time: '5:00pm'
      }];

      const chunks = getRemainingAvailability(baseAvailability, bookings);
      expect(chunks).toHaveLength(0);
    });
  });
});
