'use client';

import { useState } from 'react';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const HOURS = [
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
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', fontWeight: 500 }}>Availability</label>
            <p style={{ fontSize: '0.875rem', color: '#666', marginBottom: '12px' }}>Click and drag to select your available time slots</p>

            <div style={{
                overflow: 'auto',
                maxHeight: '400px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: '80px repeat(7, 1fr)', gap: '1px', background: '#e5e7eb' }}>
                    {/* Header row with days */}
                    <div style={{ background: 'white', padding: '8px', fontSize: '0.75rem', fontWeight: 600 }}></div>
                    {DAYS.map((day) => (
                        <div
                            key={day}
                            style={{
                                background: '#f9fafb',
                                padding: '8px',
                                fontWeight: 600,
                                textAlign: 'center',
                                fontSize: '0.7rem'
                            }}
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
                                style={{
                                    background: '#f9fafb',
                                    padding: '8px',
                                    fontWeight: 500,
                                    fontSize: '0.7rem',
                                    display: 'flex',
                                    alignItems: 'center'
                                }}
                            >
                                {hour}
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
                                        style={{
                                            background: isSelected ? '#3b82f6' : 'white',
                                            padding: '12px',
                                            cursor: 'pointer',
                                            userSelect: 'none',
                                            transition: 'background 0.1s',
                                            minHeight: '35px'
                                        }}
                                    />
                                );
                            })}
                        </>
                    ))}
                </div>
            </div>
        </div>
    );
}
