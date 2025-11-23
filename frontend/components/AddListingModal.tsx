'use client';

import { useState, useMemo, useCallback } from 'react';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import AvailabilityPicker from './AvailabilityPicker';
import AddressMapPreview from './AddressMapPreview';

interface AddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface TimeSlot {
    day: string;
    hour: string;
    hourNum: number; // 12-23 for 12 PM - 11 PM
}

interface GroupedTimeRange {
    day: string;
    startHour: string;
    endHour: string;
}

interface BackendTimeSlot {
    date: string; // yyyy-mm-dd format
    start: number[]; // Array of start hours (24-hour format)
    end: number[]; // Array of end hours (24-hour format)
}

export default function AddListingModal({ isOpen, onClose }: AddListingModalProps) {
    const [address, setAddress] = useState('');
    const [rate, setRate] = useState(10); // Default to $10
    const [coordinates, setCoordinates] = useState({ lat: 49.2827, lng: -123.1207 }); // Default: Vancouver
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    // Calculate booking likelihood (inverse of price)
    const bookingLikelihood = Math.round(100 - (rate / 20 * 100));

    const handleCoordinatesChange = useCallback((lat: number, lng: number) => {
        setCoordinates({ lat, lng });
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError(null);

        try {
            // Send each time range as a separate posting
            const promises = backendFormattedData.map(async (timeRange) => {
                const response = await fetch('http://localhost:8000/postings/create', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        username: 'testing1',
                        password_hash: 'abc',
                        address: address,
                        lat: coordinates.lat,
                        lng: coordinates.lng,
                        price: rate,
                        date: timeRange.date,
                        start: timeRange.start,
                        end: timeRange.end,
                    }),
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.detail || 'Failed to create posting');
                }

                return response.json();
            });

            await Promise.all(promises);

            // Success! Reset form and close modal
            setAddress('');
            setRate(10);
            setCoordinates({ lat: 49.2827, lng: -123.1207 });
            setSelectedSlots(new Set());
            alert(`Successfully created ${backendFormattedData.length} listing(s)!`);
            onClose();
        } catch (error) {
            console.error('Error creating listing:', error);
            setSubmitError(error instanceof Error ? error.message : 'Failed to create listing');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Parse time slots and group consecutive hours into ranges
    const groupedTimeRanges = useMemo(() => {
        // Parse selected slots (format: "Monday-12:00 PM")
        const slots: TimeSlot[] = Array.from(selectedSlots).map(slot => {
            const [day, time] = slot.split('-');
            const hourNum = parseTimeToHour(time);
            return { day, hour: time, hourNum };
        });

        // Sort by day order and hour
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        slots.sort((a, b) => {
            const dayDiff = dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
            if (dayDiff !== 0) return dayDiff;
            return a.hourNum - b.hourNum;
        });

        // Group consecutive hours by day
        const grouped: GroupedTimeRange[] = [];
        let currentRange: GroupedTimeRange | null = null;

        for (const slot of slots) {
            if (!currentRange || currentRange.day !== slot.day ||
                parseTimeToHour(currentRange.endHour) !== slot.hourNum) {
                // Start a new range
                if (currentRange) grouped.push(currentRange);
                currentRange = {
                    day: slot.day,
                    startHour: slot.hour,
                    endHour: formatEndHour(slot.hourNum)
                };
            } else {
                // Extend the current range
                currentRange.endHour = formatEndHour(slot.hourNum);
            }
        }
        if (currentRange) grouped.push(currentRange);

        return grouped;
    }, [selectedSlots]);

    // Convert "12:00 PM" format to hour number (12-23)
    function parseTimeToHour(time: string): number {
        const match = time.match(/(\d+):00 (AM|PM)/);
        if (!match) return 0;
        let hour = parseInt(match[1]);
        const period = match[2];
        if (period === 'PM' && hour !== 12) hour += 12;
        if (period === 'AM' && hour === 12) hour = 0;
        return hour;
    }

    // Format the end hour (adds 1 hour to the selected hour)
    function formatEndHour(startHourNum: number): string {
        const endHourNum = startHourNum + 1;

        if (endHourNum === 0 || endHourNum === 24) {
            return '12:00 AM'; // Midnight
        } else if (endHourNum < 12) {
            return `${endHourNum}:00 AM`; // 1 AM - 11 AM
        } else if (endHourNum === 12) {
            return '12:00 PM'; // Noon
        } else {
            return `${endHourNum - 12}:00 PM`; // 1 PM - 11 PM
        }
    }

    // Convert day name to next occurrence date (yyyy-mm-dd format)
    function getNextDateForDay(dayName: string): string {
        const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const targetDay = dayOrder.indexOf(dayName);
        const today = new Date();
        const currentDay = today.getDay();

        // Calculate days until target day
        let daysUntil = targetDay - currentDay;
        if (daysUntil <= 0) daysUntil += 7; // Next week if day has passed

        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + daysUntil);

        // Format as yyyy-mm-dd
        const year = targetDate.getFullYear();
        const month = String(targetDate.getMonth() + 1).padStart(2, '0');
        const day = String(targetDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Convert selected slots to backend format
    // Each time range becomes one posting with start: [startHour], end: [endHour]
    const backendFormattedData = useMemo(() => {
        return groupedTimeRanges.map(range => {
            const date = getNextDateForDay(range.day);
            const startHour = parseTimeToHour(range.startHour);
            const endHour = parseTimeToHour(range.endHour);

            return {
                date,
                start: [startHour],  // Single-element array
                end: [endHour]       // Single-element array
            };
        });
    }, [groupedTimeRanges]);

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.5)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '500px',
                    maxHeight: '90vh',
                    overflow: 'auto',
                    position: 'relative'
                }}
            >
                <button
                    onClick={onClose}
                    style={{ position: 'absolute', top: '20px', right: '20px', color: '#666', cursor: 'pointer' }}
                >
                    <X size={20} />
                </button>

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px' }}>Add New Listing</h2>

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    {/* Address */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 500 }}>Address</label>
                        <input
                            required
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="e.g. 1234 Main St, Vancouver, BC"
                            style={{
                                width: '100%',
                                padding: '12px',
                                borderRadius: '8px',
                                border: '1px solid #e5e5e5',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {/* Map Preview */}
                    <AddressMapPreview
                        address={address}
                        onCoordinatesChange={handleCoordinatesChange}
                    />

                    {/* Rate Slider */}
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <label style={{ fontSize: '1rem', fontWeight: 500 }}>Hourly Rate</label>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827' }}>${rate.toFixed(2)}</div>
                                <div style={{ fontSize: '0.75rem', color: bookingLikelihood > 70 ? '#059669' : bookingLikelihood > 30 ? '#f59e0b' : '#dc2626' }}>
                                    {bookingLikelihood}% customers likely to book
                                </div>
                            </div>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="20"
                            step="0.5"
                            value={rate}
                            onChange={(e) => setRate(parseFloat(e.target.value))}
                            style={{
                                width: '100%',
                                height: '8px',
                                borderRadius: '4px',
                                background: `linear-gradient(to right, #059669 0%, #f59e0b 50%, #dc2626 100%)`,
                                outline: 'none',
                                cursor: 'pointer'
                            }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '0.75rem', color: '#6b7280' }}>
                            <span>$0</span>
                            <span>$20</span>
                        </div>
                    </div>

                    {/* Availability Picker */}
                    <AvailabilityPicker
                        selectedSlots={selectedSlots}
                        onSlotsChange={setSelectedSlots}
                    />

                    {/* Times Selected Display */}
                    {groupedTimeRanges.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                            <label style={{ display: 'block', marginBottom: '12px', fontSize: '1rem', fontWeight: 600 }}>
                                Times Selected
                            </label>
                            <div style={{
                                background: '#f9fafb',
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '16px',
                                maxHeight: '200px',
                                overflow: 'auto'
                            }}>
                                {groupedTimeRanges.map((range, index) => (
                                    <div
                                        key={index}
                                        style={{
                                            padding: '8px 0',
                                            fontSize: '0.95rem',
                                            color: '#374151',
                                            borderBottom: index < groupedTimeRanges.length - 1 ? '1px solid #e5e7eb' : 'none'
                                        }}
                                    >
                                        <span style={{ fontWeight: 500 }}>{range.day}</span>
                                        <span style={{ color: '#6b7280' }}>, </span>
                                        <span>{range.startHour} - {range.endHour}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Backend Format Preview (for debugging) */}
                            <details style={{ marginTop: '12px' }}>
                                <summary style={{
                                    fontSize: '0.85rem',
                                    color: '#6b7280',
                                    cursor: 'pointer',
                                    userSelect: 'none'
                                }}>
                                    View Backend Format
                                </summary>
                                <pre style={{
                                    marginTop: '8px',
                                    padding: '12px',
                                    background: '#1f2937',
                                    color: '#10b981',
                                    borderRadius: '6px',
                                    fontSize: '0.75rem',
                                    overflow: 'auto',
                                    maxHeight: '150px'
                                }}>
                                    {JSON.stringify(backendFormattedData, null, 2)}
                                </pre>
                            </details>
                        </div>
                    )}

                    {submitError && (
                        <div style={{
                            background: '#fee2e2',
                            border: '1px solid #fca5a5',
                            color: '#dc2626',
                            padding: '12px',
                            borderRadius: '8px',
                            fontSize: '0.9rem'
                        }}>
                            {submitError}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={selectedSlots.size === 0 || isSubmitting}
                        style={{
                            width: '100%',
                            background: (selectedSlots.size === 0 || isSubmitting) ? '#d1d5db' : 'black',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: '10px',
                            cursor: (selectedSlots.size === 0 || isSubmitting) ? 'not-allowed' : 'pointer',
                            opacity: (selectedSlots.size === 0 || isSubmitting) ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                    >
                        {isSubmitting ? 'Creating listings...' : selectedSlots.size === 0 ? 'Select availability to continue' : 'Add Listing'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
