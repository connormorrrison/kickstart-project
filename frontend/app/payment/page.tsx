'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { 
    Calendar as CalendarIcon, 
    Clock, 
    ShieldCheck, 
    Home, 
    ChevronLeft, 
    ChevronRight,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';
import { useState, useEffect, useMemo } from 'react';
import Tile from '@/components/Tile';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import CustomInput from '@/components/CustomInput';
import UserMenu from '@/components/UserMenu';
import { PopInOutEffect } from '@/components/PopInOutEffect';
import { bookingsApi, AvailabilityInterval } from '@/lib/api';
import { cn } from '@/lib/utils';
import { Calendar } from '@/components/ui/calendar';

export default function PaymentPage() {
    const { selectedSpot, user } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const { signOut } = require('@/hooks/useAuth').useAuth();

    // --- State Management ---
    const [step, setStep] = useState(1);
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [selectedInterval, setSelectedInterval] = useState<AvailabilityInterval | null>(null);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    
    // Payment Form State
    const [cardNumber, setCardNumber] = useState('');
    const [expiry, setExpiry] = useState('');
    const [cvc, setCvc] = useState('');
    const [cardholderName, setCardholderName] = useState('');

    // Validation State
    const [timeError, setTimeError] = useState<string | null>(null);
    const [isTimeValid, setIsTimeValid] = useState(false);

    // Check if payment form is complete
    const isPaymentFormValid = cardNumber.trim() !== '' && 
                               expiry.trim() !== '' && 
                               cvc.trim() !== '' && 
                               cardholderName.trim() !== '';

    // --- Validation & Routing ---
    useEffect(() => {
        if (!selectedSpot || !user) {
            router.push('/');
        }
    }, [selectedSpot, user, router]);

    // Reset downstream state when date changes
    useEffect(() => {
        setSelectedInterval(null);
        setStartTime('');
        setEndTime('');
        setTimeError(null);
        setIsTimeValid(false);
    }, [date]);

    // --- CRITICAL FIX: EARLY RETURN ---
    if (!selectedSpot || !user) return null;

    // --- HELPER FUNCTIONS ---

    const getMinutes = (timeStr: string) => {
        if (!timeStr) return 0;
        
        const isPM = timeStr.toLowerCase().includes('pm');
        const isAM = timeStr.toLowerCase().includes('am');
        
        const cleanStr = timeStr.toLowerCase().replace(/[a-z]/g, '').trim();
        let [h, m] = cleanStr.split(':').map(Number);
        
        if (isNaN(h)) return 0;
        if (isNaN(m)) m = 0;

        if (isPM && h < 12) h += 12;
        if (isAM && h === 12) h = 0;

        return (h * 60) + m;
    };

    const formatTime = (timeStr: string) => {
        if (!timeStr) return '';
        
        const totalMinutes = getMinutes(timeStr);
        
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        const displayMinute = m.toString().padStart(2, '0');
        
        return `${displayHour}:${displayMinute} ${ampm}`;
    };

    const minutesToInputFormat = (totalMinutes: number) => {
        const h = Math.floor(totalMinutes / 60);
        const m = totalMinutes % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
    };

    // --- VALIDATION LOGIC ---

    const getDuration = () => {
        if (!startTime || !endTime) return 0;
        const diff = getMinutes(endTime) - getMinutes(startTime);
        return diff > 0 ? diff / 60 : 0;
    };

    const duration = getDuration();
    const serviceFee = 2.00;
    const total = (selectedSpot.pricePerHour * duration) + serviceFee;

    // --- REAL-TIME VALIDATION EFFECT ---
    useEffect(() => {
        if (!selectedInterval || !startTime || !endTime) {
            setIsTimeValid(false);
            return;
        }

        const startMin = getMinutes(startTime);
        const endMin = getMinutes(endTime);
        const limitStart = getMinutes(selectedInterval.start_time);
        const limitEnd = getMinutes(selectedInterval.end_time);

        if (startMin < limitStart) {
            setTimeError(`Start time cannot be before ${formatTime(selectedInterval.start_time)}`);
            setIsTimeValid(false);
            return;
        }

        if (endMin > limitEnd) {
            setTimeError(`End time cannot be after ${formatTime(selectedInterval.end_time)}`);
            setIsTimeValid(false);
            return;
        }

        if (startMin >= endMin) {
            setTimeError("End time must be after start time");
            setIsTimeValid(false);
            return;
        }

        if (endMin - startMin < 15) {
            setTimeError("Booking must be at least 15 minutes");
            setIsTimeValid(false);
            return;
        }

        setTimeError(null);
        setIsTimeValid(true);

    }, [startTime, endTime, selectedInterval]);

    // --- Helpers for Display ---

    const getDayName = (d: Date) => d.toLocaleDateString('en-US', { weekday: 'long' });

    const isDateAvailable = (d: Date) => {
        const dayName = getDayName(d);
        return selectedSpot.availability_intervals?.some(
            (interval: AvailabilityInterval) => interval.day === dayName
        );
    };

    const currentDayIntervals = useMemo(() => {
        if (!date) return [];
        const dayName = getDayName(date);
        return selectedSpot.availability_intervals?.filter(
            (interval: AvailabilityInterval) => interval.day === dayName
        ) || [];
    }, [date, selectedSpot.availability_intervals]);

    const handleNextStep = () => {
        if (step === 1 && date) {
            setStep(2);
        } else if (step === 2 && isTimeValid) {
            setStep(3);
        }
    };

    const handleBackStep = () => {
        if (step > 1) setStep(step - 1);
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const bookingDate = date ? new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().split('T')[0] : '';

            await bookingsApi.create({
                spot_id: selectedSpot.id,
                booking_date: bookingDate,
                start_time: startTime,
                end_time: endTime,
            });

            alert('Booking confirmed!');
            router.push('/dashboard');
        } catch (err) {
            alert(`Booking failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
        } finally {
            setIsLoading(false);
        }
    };

    const renderStepIndicator = () => (
        <div className="flex items-center gap-2 mb-6">
            {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center">
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-normal transition-colors",
                        step === s ? "bg-black text-white" : 
                        step > s ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                    )}>
                        {step > s ? <CheckCircle2 size={16} /> : s}
                    </div>
                    {s < 3 && <div className={cn("w-8 h-1 mx-2 rounded-full", step > s ? "bg-green-500" : "bg-gray-200")} />}
                </div>
            ))}
        </div>
    );

    return (
        <main className="min-h-screen w-full bg-gray-50 relative">
            <div className="fixed top-5 left-5 z-20">
                <Button2 onClick={() => router.push('/')}>
                    <Home size={18} className="mr-2" />
                    Home
                </Button2>
            </div>
            <div className="fixed top-5 right-5 z-20 flex flex-col gap-3 items-end">
                <UserMenu onSignOut={signOut} showDashboard={true} />
            </div>

            <div className="pt-24 px-8 max-w-[1200px] mx-auto pb-12">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-normal text-gray-900">
                        {step === 1 && "Select a Date"}
                        {step === 2 && "Select Time"}
                        {step === 3 && "Confirm and Pay"}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
                    {/* --- LEFT COLUMN --- */}
                    <div>
                        <PopInOutEffect isVisible={true} key={step}> 
                            <Tile className="p-8 min-h-[500px] flex flex-col">
                                {renderStepIndicator()}

                                {/* STEP 1: DATE */}
                                {step === 1 && (
                                    <div className="flex flex-col h-full items-center">
                                        <div className="flex-1 w-full max-w-md">
                                            <p className="text-gray-500 text-base font-normal mb-4 text-center">
                                                Dates with available slots are highlighted
                                            </p>
                                            <div className="flex justify-center border rounded-xl p-4">
                                                <Calendar
                                                    mode="single"
                                                    selected={date}
                                                    onSelect={setDate}
                                                    disabled={(d) => {
                                                        const isPast = d < new Date(new Date().setHours(0, 0, 0, 0));
                                                        const isUnavailable = !isDateAvailable(d);
                                                        return isPast || isUnavailable;
                                                    }}
                                                    className="w-fit"
                                                />
                                            </div>
                                        </div>
                                        <div className="mt-8 flex justify-end w-full">
                                            <Button1 
                                                onClick={handleNextStep} 
                                                disabled={!date}
                                                className="w-full sm:w-auto"
                                            >
                                                Next: Select Time <ChevronRight size={18} className="ml-2" />
                                            </Button1>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 2: TIME */}
                                {step === 2 && (
                                    <div className="flex flex-col h-full">
                                        <div className="flex-1 space-y-8">
                                            <div>
                                                <h3 className="text-lg font-normal text-gray-900 mb-3">1. Select an available slot</h3>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    {currentDayIntervals.map((interval, idx) => (
                                                        <button
                                                            key={idx}
                                                            onClick={() => {
                                                                setSelectedInterval(interval);
                                                                setStartTime(minutesToInputFormat(getMinutes(interval.start_time)));
                                                                setEndTime(minutesToInputFormat(getMinutes(interval.end_time)));
                                                            }}
                                                            className={cn(
                                                                "p-4 rounded-xl border-2 text-left transition-all",
                                                                selectedInterval === interval
                                                                    ? "border-black bg-gray-50"
                                                                    : "border-gray-100 hover:border-gray-300"
                                                            )}
                                                        >
                                                            <span className="block text-sm text-gray-500 uppercase tracking-wide font-normal">Slot {idx + 1}</span>
                                                            <span className="block text-base font-normal text-gray-900">
                                                                {formatTime(interval.start_time)} - {formatTime(interval.end_time)}
                                                            </span>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {selectedInterval && (
                                                <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                                                    <h3 className="text-lg font-normal text-gray-900 mb-3">2. Refine your duration</h3>
                                                    <div className={cn(
                                                        "bg-gray-50 p-6 rounded-xl border transition-colors",
                                                        timeError ? "border-red-200 bg-red-50/50" : "border-gray-200"
                                                    )}>
                                                        
                                                        <div className="flex gap-[24px]">
                                                            <div className="flex-1">
                                                                <label className="block mb-2 text-base font-normal text-gray-900">Start</label>
                                                                <CustomInput
                                                                    type="time"
                                                                    value={startTime}
                                                                    onChange={(e: any) => setStartTime(e.target.value)}
                                                                    disabled={!selectedInterval}
                                                                    placeholder="09:00"
                                                                    className="w-full rounded-xl bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                                                                />
                                                            </div>
                                                            <div className="flex-1">
                                                                <label className="block mb-2 text-base font-normal text-gray-900">End</label>
                                                                <CustomInput
                                                                    type="time"
                                                                    value={endTime}
                                                                    onChange={(e: any) => setEndTime(e.target.value)}
                                                                    disabled={!selectedInterval}
                                                                    placeholder="17:00"
                                                                    className="w-full rounded-xl bg-white [&::-webkit-calendar-picker-indicator]:hidden"
                                                                />
                                                            </div>
                                                        </div>
                                                        
                                                        {timeError && (
                                                            <div className="mt-4 flex items-center text-red-600 text-base font-normal">
                                                                <AlertCircle size={18} className="mr-2" />
                                                                {timeError}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-8 flex justify-between gap-4">
                                            <Button2 onClick={handleBackStep}>
                                                <ChevronLeft size={18} className="mr-2" /> Back
                                            </Button2>
                                            <Button1 
                                                onClick={handleNextStep} 
                                                disabled={!isTimeValid}
                                                className={cn("transition-opacity", !isTimeValid && "opacity-50 cursor-not-allowed")}
                                            >
                                                Next: Payment <ChevronRight size={18} className="ml-2" />
                                            </Button1>
                                        </div>
                                    </div>
                                )}

                                {/* STEP 3: PAYMENT */}
                                {step === 3 && (
                                    <form onSubmit={handlePayment} className="flex flex-col h-full gap-5">
                                        <div className="flex-1 space-y-5">
                                            <div>
                                                <label className="block mb-2 text-base font-normal text-gray-700">Card Number</label>
                                                <CustomInput 
                                                    type="text" 
                                                    placeholder="0000 0000 0000 0000" 
                                                    required 
                                                    className="w-full rounded-xl"
                                                    value={cardNumber}
                                                    onChange={(e: any) => setCardNumber(e.target.value)}
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
                                                        value={expiry}
                                                        onChange={(e: any) => setExpiry(e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block mb-2 text-base font-normal text-gray-700">CVC</label>
                                                    <CustomInput 
                                                        type="text" 
                                                        placeholder="123" 
                                                        required 
                                                        className="w-full rounded-xl"
                                                        value={cvc}
                                                        onChange={(e: any) => setCvc(e.target.value)}
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
                                                    value={cardholderName}
                                                    onChange={(e: any) => setCardholderName(e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-between gap-4">
                                            <Button2 type="button" onClick={handleBackStep}>
                                                <ChevronLeft size={18} className="mr-2" /> Back
                                            </Button2>
                                            <Button1 
                                                type="submit" 
                                                disabled={isLoading || !isPaymentFormValid} // BUTTON DISABLED LOGIC ADDED
                                                className={cn(
                                                    "w-full sm:w-auto justify-center transition-opacity", 
                                                    (isLoading || !isPaymentFormValid) && "opacity-50 cursor-not-allowed"
                                                )}
                                            >
                                                {isLoading ? 'Processing...' : `Pay $${total.toFixed(2)}`}
                                            </Button1>
                                        </div>
                                    </form>
                                )}
                            </Tile>
                        </PopInOutEffect>
                    </div>

                    {/* --- RIGHT COLUMN: SUMMARY --- */}
                    <div>
                        <PopInOutEffect isVisible={true}>
                            <Tile className="p-6 sticky top-24">
                                <h2 className="text-xl font-normal mb-4 text-gray-900">Booking Summary</h2>

                                <div className="mb-4">
                                    <div className="text-lg font-normal text-gray-900 mb-1">{selectedSpot.street}</div>
                                    <div className="text-base text-gray-500 font-normal">
                                        {selectedSpot.city}, {selectedSpot.province}
                                    </div>
                                </div>

                                <div className="py-4 border-y border-gray-100 flex flex-col gap-3">
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-600 text-base font-normal">
                                            <CalendarIcon size={18} /> Date
                                        </div>
                                        <div className={cn("font-normal text-base", date ? "text-gray-900" : "text-gray-400 italic")}>
                                            {date ? date.toLocaleDateString() : 'Select a date'}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-2 text-gray-600 text-base font-normal">
                                            <Clock size={18} /> Time
                                        </div>
                                        <div className={cn("font-normal text-base", (isTimeValid && startTime && endTime) ? "text-gray-900" : "text-gray-400 italic")}>
                                            {(isTimeValid && startTime && endTime) ? `${formatTime(startTime)} - ${formatTime(endTime)}` : 'Select time'}
                                        </div>
                                    </div>
                                </div>

                                <div className="py-4 border-b border-gray-100 space-y-2">
                                    <div className="flex justify-between text-base font-normal">
                                        <span className="text-gray-600">Price per hour</span>
                                        <span className="text-gray-900">${selectedSpot.pricePerHour.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-base font-normal">
                                        <span className="text-gray-600">Duration</span>
                                        <span className="text-gray-900">{duration > 0 ? duration.toFixed(1) : 0} hrs</span>
                                    </div>
                                    <div className="flex justify-between text-base font-normal">
                                        <span className="text-gray-600">Service fee</span>
                                        <span className="text-gray-900">${serviceFee.toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="pt-4 flex justify-between items-center mb-3">
                                    <span className="font-normal text-lg text-gray-900">Total</span>
                                    <span className="font-normal text-lg text-gray-900">${total > 0 ? total.toFixed(2) : '0.00'}</span>
                                </div>

                                <div className="flex gap-3 bg-green-50 p-3 rounded-lg text-green-800 text-base items-start font-normal">
                                    <ShieldCheck size={20} className="shrink-0 mt-0.5" />
                                    <div>
                                        <span className="font-normal">Free cancellation</span> up to 24 hours before check-in.
                                    </div>
                                </div>
                            </Tile>
                        </PopInOutEffect>
                    </div>
                </div>
            </div>
        </main>
    );
}