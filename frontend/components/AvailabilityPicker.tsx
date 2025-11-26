'use client';

import { useState } from 'react';
import Tile from '@/components/Tile';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = [
  '12:00 AM', '1:00 AM', '2:00 AM', '3:00 AM', '4:00 AM', '5:00 AM',
  '6:00 AM', '7:00 AM', '8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM',
  '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM',
  '6:00 PM', '7:00 PM', '8:00 PM', '9:00 PM', '10:00 PM', '11:00 PM'
];

interface AvailabilityPickerProps {
  selectedSlots: Set<string>;
  onSlotsChange: (slots: Set<string>) => void;
}

export default function AvailabilityPicker({ selectedSlots, onSlotsChange }: AvailabilityPickerProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragMode, setDragMode] = useState<'select' | 'deselect'>('select');

  const getCellId = (day: string, hour: string) => `${day}-${hour}`;

  const handleMouseDown = (day: string, hour: string) => {
    const cellId = getCellId(day, hour);
    const newSelected = new Set(selectedSlots);

    if (selectedSlots.has(cellId)) {
      newSelected.delete(cellId);
      setDragMode('deselect');
    } else {
      newSelected.add(cellId);
      setDragMode('select');
    }

    onSlotsChange(newSelected);
    setIsDragging(true);
  };

  const handleMouseEnter = (day: string, hour: string) => {
    if (!isDragging) return;

    const cellId = getCellId(day, hour);
    const newSelected = new Set(selectedSlots);

    if (dragMode === 'select') {
      newSelected.add(cellId);
    } else {
      newSelected.delete(cellId);
    }

    onSlotsChange(newSelected);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  return (
    <div onMouseUp={handleMouseUp}>
      <p className="text-base text-gray-500 mb-3">Click and drag to select your available time slots</p>

      <Tile className="p-0 overflow-hidden border border-gray-200 rounded-xl">
        <div className="max-h-[400px] overflow-auto">
          <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-px bg-gray-100">
            {/* Header row with days */}
            <div className="bg-white p-2 sticky top-0 z-10"></div>
            {DAYS.map((day) => (
              <div
                key={day}
                className="bg-gray-50 p-2 text-center text-[10px] uppercase font-semibold text-gray-500 sticky top-0 z-10"
              >
                {day.slice(0, 3)}
              </div>
            ))}

            {/* Time rows */}
            {HOURS.map((hour) => (
              <>
                {/* Time label */}
                <div
                  key={`label-${hour}`}
                  className="bg-gray-50 p-2 text-[10px] font-medium text-gray-500 flex items-center justify-end"
                >
                  {hour.replace(':00', '')}
                </div>

                {/* Day cells */}
                {DAYS.map((day) => {
                  const cellId = getCellId(day, hour);
                  const isSelected = selectedSlots.has(cellId);

                  return (
                    <div
                      key={cellId}
                      onMouseDown={() => handleMouseDown(day, hour)}
                      onMouseEnter={() => handleMouseEnter(day, hour)}
                      className={`
                        min-h-[35px] cursor-pointer select-none transition-colors
                        ${isSelected ? 'bg-blue-600' : 'bg-white hover:bg-gray-50'}
                      `}
                    />
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </Tile>
    </div>
  );
}