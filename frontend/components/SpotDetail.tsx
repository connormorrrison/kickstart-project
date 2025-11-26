'use client';

import { useStore } from '@/lib/store';
import { X, MapPin, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import { formatAddress } from '@/lib/addressUtils';

export default function SpotDetail() {
    const { selectedSpot, setSelectedSpot, user, setAuthModalOpen } = useStore();

    if (!selectedSpot) return null;

    const handleBook = () => {
        if (!user) {
            setAuthModalOpen(true);
        } else {
            alert('Proceeding to payment...');
        }
    };

    return (
        <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <div
                className="absolute inset-0 bg-black/30 pointer-events-auto"
                onClick={() => setSelectedSpot(null)}
            />
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.95 }}
                className="w-[90%] max-w-[600px] z-21 pointer-events-auto max-h-[90vh] flex flex-col"
            >
                <Tile className="overflow-hidden p-0">
                    <div className="p-6 overflow-y-auto">
                        <div className="flex justify-between items-start mb-2.5">
                            <h2 className="text-2xl font-bold">Parking Spot</h2>
                            <button
                                onClick={() => setSelectedSpot(null)}
                                className="bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600 mb-5">
                            <MapPin size={16} />
                            <span>{formatAddress(selectedSpot)}</span>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <Clock size={20} className="mb-2 text-gray-600" />
                                <div className="text-xs text-gray-600">Available</div>
                                <div className="font-semibold">
                                    {selectedSpot.availabilityIntervals && selectedSpot.availabilityIntervals.length > 0
                                        ? `${selectedSpot.availabilityIntervals[0].start} - ${selectedSpot.availabilityIntervals[0].end}`
                                        : 'See availability'}
                                </div>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <Shield size={20} className="mb-2 text-gray-600" />
                                <div className="text-xs text-gray-600">Host</div>
                                <div className="font-semibold">{selectedSpot.hostName || 'Host'}</div>
                            </div>
                        </div>

                        <p className="leading-relaxed text-gray-700 mb-6">
                            Private parking spot available for rent. Contact host for more details.
                        </p>

                        <div className="border-t border-gray-200 pt-5 flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold">${selectedSpot.pricePerHour}</div>
                                <div className="text-sm text-gray-600">per hour</div>
                            </div>
                            <Button1 onClick={handleBook}>
                                Book Spot
                            </Button1>
                        </div>
                    </div>
                </Tile>
            </motion.div>
        </div>
    );
}
