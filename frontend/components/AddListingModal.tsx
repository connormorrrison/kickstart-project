'use client';

import { useState, useMemo } from 'react';
import { X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import AvailabilityPicker from './AvailabilityPicker';

interface AddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddListing: (listing: { address: string; rate: number; availableStart: string; availableEnd: string; imagePreview: string | null }) => void;
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

export default function AddListingModal({ isOpen, onClose, onAddListing }: AddListingModalProps) {
    const [address, setAddress] = useState('');
    const [rate, setRate] = useState(10); // Default to $10
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [selectedSlots, setSelectedSlots] = useState<Set<string>>(new Set());

    // Calculate booking likelihood (inverse of price)
    const bookingLikelihood = Math.round(100 - (rate / 20 * 100));

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAddListing({
            address,
            rate,
            availableStart: '09:00', // Default for now
            availableEnd: '17:00', // Default for now
            imagePreview
        });
        // Reset form
        setAddress('');
        setRate(10);
        setImagePreview(null);
        setSelectedSlots(new Set());
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
                    {/* Image Upload */}
                    <div>
                        <label style={{ display: 'block', marginBottom: '8px', fontSize: '1rem', fontWeight: 500 }}>Spot Image</label>
                        <div
                            style={{
                                border: '2px dashed #e5e5e5',
                                borderRadius: '12px',
                                padding: '20px',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : '#f9f9f9',
                                height: '200px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                position: 'relative',
                                overflow: 'hidden'
                            }}
                            onClick={() => document.getElementById('image-upload')?.click()}
                        >
                            {!imagePreview && (
                                <div style={{ color: '#666' }}>
                                    <Upload size={32} style={{ margin: '0 auto 8px' }} />
                                    <p style={{ fontWeight: 600, marginBottom: '4px' }}>Click to upload</p>
                                    <p style={{ fontSize: '0.8rem' }}>JPG, PNG (Max 5MB)</p>
                                </div>
                            )}
                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                style={{ display: 'none' }}
                            />
                        </div>
                    </div>

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

                    <button
                        type="submit"
                        style={{
                            width: '100%',
                            background: 'black',
                            color: 'white',
                            padding: '14px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: '10px',
                            cursor: 'pointer'
                        }}
                    >
                        Add Listing
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
