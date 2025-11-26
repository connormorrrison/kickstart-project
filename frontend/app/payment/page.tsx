'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { CreditCard, Calendar, Clock, MapPin, ShieldCheck, MoveLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import CustomInput from '@/components/CustomInput';
import UserMenu from '@/components/UserMenu';

export default function PaymentPage() {
    const { selectedSpot, user } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { signOut } = require('@/hooks/useAuth').useAuth();

    // If no spot is selected, redirect back to home
    useEffect(() => {
        if (!selectedSpot) {
            router.push('/');
        }
    }, [selectedSpot, router]);

    if (!selectedSpot) return null;

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 1500));
        alert('Payment successful! Booking confirmed.');
        router.push('/');
    };

    // Calculate fees
    const serviceFee = 2.00;
    const total = selectedSpot.pricePerHour + serviceFee;

    return (
        <main className="min-h-screen w-full bg-gray-50 relative">
            {/* Top Left - Home Button (Fixed) */}
            <div className="fixed top-5 left-5 z-20">
                <Button2 onClick={() => router.push('/')}>
                    <MoveLeft size={18} className="mr-2" />
                    Home
                </Button2>
            </div>

            {/* Top Right - User Menu (Fixed) */}
            <div className="fixed top-5 right-5 z-20 flex flex-col gap-3 items-end">
                <UserMenu onSignOut={signOut} showDashboard={true} />
            </div>

            {/* Content Section */}
            <div className="pt-24 px-8 max-w-[1200px] mx-auto pb-12">
                <h1 className="text-3xl font-normal text-gray-900 mb-8">Confirm and Pay</h1>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    {/* Left Column: Payment Details */}
                    <div>
                        <Tile className="p-8">
                            {/* Reduced mb-6 to mb-4 */}
                            <div className="flex items-center gap-3 mb-4">
                                <CreditCard size={24} className="text-gray-900" />
                                <h2 className="text-base font-normal text-gray-900">Payment Method</h2>
                            </div>

                            {/* Reduced gap-6 to gap-5 */}
                            <form onSubmit={handlePayment} className="flex flex-col gap-5">
                                <div>
                                    <label className="block mb-2 text-base font-normal text-gray-700">Card Number</label>
                                    <CustomInput
                                        type="text"
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        className="w-full rounded-xl"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block mb-2 text-base font-normal text-gray-700">Expiration</label>
                                        <CustomInput
                                            type="text"
                                            placeholder="MM/YY"
                                            required
                                            className="w-full rounded-xl"
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-base font-normal text-gray-700">CVC</label>
                                        <CustomInput
                                            type="text"
                                            placeholder="123"
                                            required
                                            className="w-full rounded-xl"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block mb-2 text-base font-normal text-gray-700">Cardholder Name</label>
                                    <CustomInput
                                        type="text"
                                        placeholder="John Doe"
                                        required
                                        className="w-full rounded-xl"
                                    />
                                </div>

                                <Button1 
                                    type="submit" 
                                    disabled={isLoading}
                                    className="w-full justify-center mt-2"
                                >
                                    {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                                </Button1>
                            </form>
                        </Tile>
                    </div>

                    {/* Right Column: Booking Summary */}
                    <div>
                        <Tile className="p-6 sticky top-24">
                            {/* Reduced mb-6 to mb-4 */}
                            <h2 className="text-xl font-normal mb-4 text-gray-900">Booking Summary</h2>

                            {/* Reduced mb-6 to mb-4 */}
                            <div className="mb-4">
                                <div className="text-lg font-normal text-gray-900 mb-1">{selectedSpot.street}</div>
                                <div className="flex items-center gap-1.5 text-base text-gray-500 font-normal">
                                    <MapPin size={16} /> 
                                    {selectedSpot.city}, {selectedSpot.province}
                                </div>
                            </div>

                            {/* Reduced py-6 to py-4 and gap-4 to gap-3 */}
                            <div className="py-4 border-y border-gray-100 flex flex-col gap-3">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600 text-base font-normal">
                                        <Calendar size={18} /> Date
                                    </div>
                                    <div className="font-normal text-base text-gray-900">Today</div>
                                </div>
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-2 text-gray-600 text-base font-normal">
                                        <Clock size={18} /> Time
                                    </div>
                                    <div className="font-normal text-base text-gray-900">10:00 - 11:00</div>
                                </div>
                            </div>

                            {/* Reduced py-6 to py-4 */}
                            <div className="py-4 border-b border-gray-100 space-y-2">
                                <div className="flex justify-between text-base font-normal">
                                    <span className="text-gray-600">Price per hour</span>
                                    <span className="text-gray-900">${selectedSpot.pricePerHour.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-base font-normal">
                                    <span className="text-gray-600">Service fee</span>
                                    <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
                                </div>
                            </div>

                            {/* Reduced pt-6 to pt-4 and mb-6 to mb-4 */}
                            <div className="pt-4 flex justify-between items-center mb-4">
                                <span className="font-normal text-lg text-gray-900">Total</span>
                                <span className="font-normal text-lg text-gray-900">${total.toFixed(2)}</span>
                            </div>

                            <div className="flex gap-3 bg-green-50 p-3 rounded-lg text-green-800 text-base items-start font-normal">
                                <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                                <div>
                                    <span className="font-normal">Free cancellation</span> up to 24 hours before check-in.
                                </div>
                            </div>
                        </Tile>
                    </div>
                </div>
            </div>
        </main>
    );
}