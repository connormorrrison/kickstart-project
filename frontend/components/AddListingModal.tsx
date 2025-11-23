'use client';

import { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import AvailabilityPicker from './AvailabilityPicker';

interface AddListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddListing: (listing: { address: string; rate: number; availableStart: string; availableEnd: string; imagePreview: string | null }) => void;
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
                    style={{ position: 'absolute', top: '20px', right: '20px', color: '#666', cursor: 'pointer', border: 'none', background: 'transparent' }}
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
                            cursor: 'pointer',
                            border: 'none'
                        }}
                    >
                        Add Listing
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
