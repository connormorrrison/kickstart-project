'use client';

import { X, DollarSign, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import MapPreview from './MapPreview';

interface TimeSlot {
    date: string;
    start: number;
    end: number;
}

interface ListingDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: string;
    lat: number;
    lng: number;
    price: number;
    timeSlots: TimeSlot[];
}

export default function ListingDetailModal({
    isOpen,
    onClose,
    address,
    lat,
    lng,
    price,
    timeSlots
}: ListingDetailModalProps) {
    if (!isOpen) return null;

    // Format time slots for display
    const formatTime = (hour: number) => {
        if (hour === 0) return '12:00 AM';
        if (hour < 12) return `${hour}:00 AM`;
        if (hour === 12) return '12:00 PM';
        return `${hour - 12}:00 PM`;
    };

    const formatDate = (dateStr: string) => {
        // Parse as local date to avoid timezone issues
        const [year, month, day] = dateStr.split('-').map(Number);
        const date = new Date(year, month - 1, day); // month is 0-indexed
        return date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    };

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
            alignItems: 'center'
        }}>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.5)'
                }}
                onClick={onClose}
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    zIndex: 51,
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                {/* Map Header */}
                <div style={{ position: 'relative', height: '250px' }}>
                    <MapPreview lat={lat} lng={lng} height="250px" />
                    <button
                        onClick={onClose}
                        style={{
                            position: 'absolute',
                            top: '15px',
                            right: '15px',
                            background: 'white',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                            zIndex: 10,
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>
                        {address}
                    </h2>

                    {/* Price */}
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        marginBottom: '24px',
                        padding: '12px',
                        background: '#f9fafb',
                        borderRadius: '8px'
                    }}>
                        <DollarSign size={20} style={{ color: '#059669' }} />
                        <div>
                            <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#059669' }}>
                                ${price.toFixed(2)}/hour
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                                Hourly rate
                            </div>
                        </div>
                    </div>

                    {/* Available Times */}
                    <div>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            marginBottom: '12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <Clock size={18} />
                            Available Times ({timeSlots.length})
                        </h3>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {timeSlots.map((slot, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '12px',
                                        background: '#f9fafb',
                                        borderRadius: '8px',
                                        border: '1px solid #e5e7eb'
                                    }}
                                >
                                    <div style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <Calendar size={16} style={{ color: '#6b7280' }} />
                                            <span style={{ fontWeight: 500, color: '#111827' }}>
                                                {formatDate(slot.date)}
                                            </span>
                                        </div>
                                        <div style={{
                                            padding: '4px 12px',
                                            background: '#dbeafe',
                                            color: '#1e40af',
                                            borderRadius: '6px',
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }}>
                                            {formatTime(slot.start)} - {formatTime(slot.end)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
