'use client';

import { useStore } from '@/lib/store';
import { X, Star, MapPin, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SpotDetail() {
    const { selectedSpot, setSelectedSpot, user, setAuthModalOpen } = useStore();

    if (!selectedSpot) return null;

    const handleBook = () => {
        if (!user) {
            // Trigger auth flow
            setAuthModalOpen(true);
            // In a real app, we'd set an auth modal state here
        } else {
            alert('Proceeding to payment...');
        }
    };

    return (
        <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 20,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            pointerEvents: 'none'
        }}>
            <div
                style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.3)',
                    pointerEvents: 'auto'
                }}
                onClick={() => setSelectedSpot(null)}
            />
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                style={{
                    width: '90%',
                    maxWidth: '600px',
                    background: 'white',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
                    zIndex: 21,
                    pointerEvents: 'auto',
                    maxHeight: '90vh',
                    display: 'flex',
                    flexDirection: 'column'
                }}
            >
                <div style={{ position: 'relative', height: '250px' }}>
                    <img
                        src={selectedSpot.images[0]}
                        alt={selectedSpot.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                    <button
                        onClick={() => setSelectedSpot(null)}
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
                            boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                        }}
                    >
                        <X size={18} />
                    </button>
                </div>

                <div style={{ padding: '24px', overflowY: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700 }}>{selectedSpot.title}</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                            <Star size={16} fill="black" /> 4.8
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666', marginBottom: '20px' }}>
                        <MapPin size={16} />
                        <span>{selectedSpot.address}</span>
                    </div>

                    <div style={{ display: 'flex', gap: '15px', marginBottom: '24px' }}>
                        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', flex: 1 }}>
                            <Clock size={20} style={{ marginBottom: '8px', color: '#666' }} />
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Available</div>
                            <div style={{ fontWeight: 600 }}>{selectedSpot.availableStart} - {selectedSpot.availableEnd}</div>
                        </div>
                        <div style={{ background: '#f5f5f5', padding: '12px', borderRadius: '8px', flex: 1 }}>
                            <Shield size={20} style={{ marginBottom: '8px', color: '#666' }} />
                            <div style={{ fontSize: '0.8rem', color: '#666' }}>Security</div>
                            <div style={{ fontWeight: 600 }}>Verified Host</div>
                        </div>
                    </div>

                    <p style={{ lineHeight: 1.6, color: '#444', marginBottom: '24px' }}>
                        {selectedSpot.description}
                    </p>

                    <div style={{ borderTop: '1px solid #eee', paddingTop: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div>
                            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>${selectedSpot.pricePerHour}</div>
                            <div style={{ fontSize: '0.9rem', color: '#666' }}>per hour</div>
                        </div>
                        <button
                            onClick={handleBook}
                            style={{
                                background: 'black',
                                color: 'white',
                                padding: '14px 32px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                            }}
                        >
                            Book Spot
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
