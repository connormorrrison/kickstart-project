'use client';

import { useStore } from '@/lib/store';
import { X, Star, MapPin, Clock, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';

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
                    <div className="relative h-[250px]">
                        <img
                            src={selectedSpot.images[0]}
                            alt={selectedSpot.title}
                            className="w-full h-full object-cover"
                        />
                        <button
                            onClick={() => setSelectedSpot(null)}
                            className="absolute top-4 right-4 bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-sm"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 overflow-y-auto">
                        <div className="flex justify-between items-start mb-2.5">
                            <h2 className="text-2xl font-bold">{selectedSpot.title}</h2>
                            <div className="flex items-center gap-1 font-semibold">
                                <Star size={16} fill="black" /> 4.8
                            </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-gray-600 mb-5">
                            <MapPin size={16} />
                            <span>{selectedSpot.address}</span>
                        </div>

                        <div className="flex gap-4 mb-6">
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <Clock size={20} className="mb-2 text-gray-600" />
                                <div className="text-xs text-gray-600">Available</div>
                                <div className="font-semibold">{selectedSpot.availableStart} - {selectedSpot.availableEnd}</div>
                            </div>
                            <div className="bg-gray-100 p-3 rounded-lg flex-1">
                                <Shield size={20} className="mb-2 text-gray-600" />
                                <div className="text-xs text-gray-600">Security</div>
                                <div className="font-semibold">Verified Host</div>
                            </div>
                        </div>

                        <p className="leading-relaxed text-gray-700 mb-6">
                            {selectedSpot.description}
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
