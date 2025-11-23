'use client';

import { useStore } from '@/lib/store';
import { Star, MapPin } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SpotList() {
    const { selectedSpot, setSelectedSpot, searchCriteria, spots } = useStore();

    // Simple filter logic (mock)
    const filteredSpots = spots.filter(spot => {
        if (!searchCriteria.location) return true;
        return spot.address.toLowerCase().includes(searchCriteria.location.toLowerCase()) ||
            spot.title.toLowerCase().includes(searchCriteria.location.toLowerCase());
    });

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            width: '350px',
            maxHeight: 'calc(100vh - 40px)',
            display: 'flex',
            flexDirection: 'column',
            gap: '15px',
            zIndex: 10,
            pointerEvents: 'none' // Allow clicking through to map
        }}>
            <AnimatePresence>
                {filteredSpots.map((spot) => (
                    <motion.div
                        key={spot.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        style={{
                            background: 'white',
                            borderRadius: '12px',
                            overflow: 'hidden',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            pointerEvents: 'auto', // Re-enable clicks
                            cursor: 'pointer',
                            border: selectedSpot?.id === spot.id ? '2px solid black' : '2px solid transparent',
                            transition: 'border-color 0.2s'
                        }}
                        onClick={() => setSelectedSpot(spot)}
                    >
                        <div style={{ height: '150px', overflow: 'hidden', position: 'relative' }}>
                            <img
                                src={spot.images[0]}
                                alt={spot.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                            <div style={{
                                position: 'absolute',
                                top: '10px',
                                right: '10px',
                                background: 'white',
                                padding: '4px 8px',
                                borderRadius: '20px',
                                fontSize: '0.8rem',
                                fontWeight: 600,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px'
                            }}>
                                <Star size={12} fill="black" /> 4.8
                            </div>
                        </div>
                        <div style={{ padding: '15px' }}>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '4px' }}>{spot.title}</h3>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#666', fontSize: '0.85rem', marginBottom: '10px' }}>
                                <MapPin size={14} />
                                <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{spot.address}</span>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>${spot.pricePerHour}</span>
                                    <span style={{ fontSize: '0.85rem', color: '#666' }}>/hr</span>
                                </div>
                                <button style={{
                                    background: '#f0f0f0',
                                    color: 'black',
                                    padding: '6px 12px',
                                    borderRadius: '6px',
                                    fontSize: '0.85rem',
                                    fontWeight: 500
                                }}>
                                    View
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
