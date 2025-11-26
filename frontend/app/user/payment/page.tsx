'use client';

import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Calendar, Clock, MapPin, ShieldCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { formatAddress } from '@/lib/addressUtils';

export default function PaymentPage() {
    const { selectedSpot, searchCriteria } = useStore();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);

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

    return (
        <main style={{
            minHeight: '100vh',
            background: '#f9fafb',
            padding: '40px 20px',
            fontFamily: 'sans-serif'
        }}>
            <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <button
                    onClick={() => router.back()}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        marginBottom: '24px',
                        fontSize: '1rem',
                        fontWeight: 500,
                        color: '#4b5563'
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>

                <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '32px', color: '#111827' }}>Confirm and Pay</h1>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '40px' }}>
                    {/* Left Column: Payment Details */}
                    <div>
                        <div style={{ background: 'white', padding: '32px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <CreditCard size={24} /> Payment Method
                            </h2>

                            <form onSubmit={handlePayment}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Card Number</label>
                                        <input
                                            type="text"
                                            placeholder="0000 0000 0000 0000"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Expiration</label>
                                            <input
                                                type="text"
                                                placeholder="MM/YY"
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #d1d5db',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>CVC</label>
                                            <input
                                                type="text"
                                                placeholder="123"
                                                required
                                                style={{
                                                    width: '100%',
                                                    padding: '12px',
                                                    borderRadius: '8px',
                                                    border: '1px solid #d1d5db',
                                                    fontSize: '1rem'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500, color: '#374151' }}>Cardholder Name</label>
                                        <input
                                            type="text"
                                            placeholder="John Doe"
                                            required
                                            style={{
                                                width: '100%',
                                                padding: '12px',
                                                borderRadius: '8px',
                                                border: '1px solid #d1d5db',
                                                fontSize: '1rem'
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        style={{
                                            background: 'black',
                                            color: 'white',
                                            padding: '16px',
                                            borderRadius: '8px',
                                            fontWeight: 600,
                                            fontSize: '1.1rem',
                                            marginTop: '16px',
                                            cursor: isLoading ? 'wait' : 'pointer',
                                            opacity: isLoading ? 0.7 : 1,
                                            border: 'none'
                                        }}
                                    >
                                        {isLoading ? 'Processing...' : `Pay $${selectedSpot.pricePerHour.toFixed(2)}`}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Right Column: Booking Summary */}
                    <div>
                        <div style={{ background: 'white', padding: '24px', borderRadius: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', position: 'sticky', top: '40px' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '20px' }}>Booking Summary</h2>

                            <div style={{ marginBottom: '20px' }}>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '4px' }}>Parking Spot</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#6b7280', fontSize: '0.9rem' }}>
                                    <MapPin size={14} /> {formatAddress(selectedSpot)}
                                </div>
                            </div>

                            <div style={{ borderTop: '1px solid #e5e7eb', borderBottom: '1px solid #e5e7eb', padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                                        <Calendar size={18} /> Date
                                    </div>
                                    <div style={{ fontWeight: 500 }}>
                                        {searchCriteria.date ? new Date(searchCriteria.date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'Today'}
                                    </div>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#374151' }}>
                                        <Clock size={18} /> Time
                                    </div>
                                    <div style={{ fontWeight: 500 }}>{searchCriteria.startTime || 'N/A'} - {searchCriteria.endTime || 'N/A'}</div>
                                </div>
                            </div>

                            <div style={{ padding: '20px 0', borderBottom: '1px solid #e5e7eb' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#4b5563' }}>Price per hour</span>
                                    <span>${selectedSpot.pricePerHour.toFixed(2)}</span>
                                </div>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                    <span style={{ color: '#4b5563' }}>Service fee</span>
                                    <span>$2.00</span>
                                </div>
                            </div>

                            <div style={{ paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Total</span>
                                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>${(selectedSpot.pricePerHour + 2).toFixed(2)}</span>
                            </div>

                            <div style={{ marginTop: '24px', display: 'flex', gap: '12px', background: '#f0fdf4', padding: '12px', borderRadius: '8px', color: '#166534', fontSize: '0.85rem', alignItems: 'start' }}>
                                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                                <div>
                                    <strong>Free cancellation</strong> up to 24 hours before check-in.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
