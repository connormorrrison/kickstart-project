'use client';

import { useState } from 'react';
import { Plus, MapPin, DollarSign, Clock } from 'lucide-react';
import AddListingModal from '@/components/AddListingModal';

interface Listing {
    id: number;
    address: string;
    description?: string;
    price: number;
    status: string;
    image: string | null;
    bookings: number;
    rating: number | null;
    availableStart?: string;
    availableEnd?: string;
}

export default function HostDashboard() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [listings, setListings] = useState<Listing[]>([
        {
            id: 1,
            address: '1055 Canada Place',
            description: 'Underground secure spot near convention center',
            price: 15.00,
            status: 'active',
            image: null,
            bookings: 12,
            rating: 4.8
        },
        {
            id: 2,
            address: '1895 Lower Mall',
            description: 'Driveway parking near UBC campus',
            price: 8.50,
            status: 'active',
            image: null,
            bookings: 45,
            rating: 4.9
        },
        {
            id: 3,
            address: '2211 Wesbrook Mall',
            description: 'Covered parking spot, residential area',
            price: 10.00,
            status: 'inactive',
            image: null,
            bookings: 0,
            rating: null
        }
    ]);

    const handleAddListing = (newListing: { address: string; rate: number; availableStart: string; availableEnd: string; imagePreview: string | null }) => {
        const listing: Listing = {
            id: listings.length + 1,
            address: newListing.address,
            description: '',
            price: newListing.rate,
            status: 'active',
            image: newListing.imagePreview,
            bookings: 0,
            rating: null,
            availableStart: newListing.availableStart,
            availableEnd: newListing.availableEnd
        };
        setListings([...listings, listing]);
        setIsAddModalOpen(false);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '40px 16px' }}>
            <div style={{ maxWidth: '1200px', margin: '0 auto' }}>

                {/* header section */}
                <div style={{ marginBottom: '32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#111827' }}>Host Dashboard</h1>
                        <p style={{ marginTop: '4px', fontSize: '0.875rem', color: '#6b7280' }}>Manage your parking spots and view performance.</p>
                    </div>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            borderRadius: '8px',
                            background: 'black',
                            padding: '8px 16px',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            transition: 'background 0.2s',
                            cursor: 'pointer'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#1f2937'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'black'}
                    >
                        <Plus size={16} />
                        Add Listing
                    </button>
                </div>

                {/* stats overview */}
                <div style={{ marginBottom: '32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Total Earnings</h3>
                        <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>$1,240.50</div>
                        <span style={{ fontSize: '0.75rem', color: '#059669' }}>+12% from last month</span>
                    </div>
                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Active Listings</h3>
                        <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>2</div>
                    </div>
                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Total Bookings</h3>
                        <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>57</div>
                    </div>
                </div>

                {/* listings grid */}
                <h2 style={{ marginBottom: '16px', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Your Listings</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '24px' }}>
                    {listings.map((listing) => (
                        <div
                            key={listing.id}
                            style={{
                                position: 'relative',
                                overflow: 'hidden',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                background: 'white',
                                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                                transition: 'box-shadow 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)'}
                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 2px 0 rgba(0, 0, 0, 0.05)'}
                        >
                            {/* status badge */}
                            <div style={{ position: 'absolute', right: '12px', top: '12px', zIndex: 10 }}>
                                <span style={{
                                    borderRadius: '9999px',
                                    padding: '2px 10px',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    background: listing.status === 'active' ? '#d1fae5' : '#f3f4f6',
                                    color: listing.status === 'active' ? '#047857' : '#4b5563'
                                }}>
                                    {listing.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {/* image placeholder */}
                            <div style={{
                                height: '160px',
                                width: '100%',
                                background: listing.image ? `url(${listing.image}) center/cover no-repeat` : '#f3f4f6',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}>
                                {!listing.image && (
                                    <div style={{ display: 'flex', height: '100%', width: '100%', alignItems: 'center', justifyContent: 'center', color: '#d1d5db' }}>
                                        <MapPin size={32} />
                                    </div>
                                )}
                            </div>

                            {/* content */}
                            <div style={{ padding: '20px' }}>
                                <h3 style={{ fontWeight: 600, color: '#111827' }}>{listing.address}</h3>
                                <p style={{
                                    marginTop: '4px',
                                    fontSize: '0.875rem',
                                    color: '#6b7280',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                }}>{listing.description}</p>

                                <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#374151' }}>
                                        <DollarSign size={14} style={{ color: '#9ca3af' }} />
                                        <span>${listing.price.toFixed(2)}/hr</span>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', color: '#374151' }}>
                                        <Clock size={14} style={{ color: '#9ca3af' }} />
                                        <span>24/7</span>
                                    </div>
                                </div>

                                <button
                                    style={{
                                        marginTop: '16px',
                                        width: '100%',
                                        borderRadius: '6px',
                                        border: '1px solid #e5e7eb',
                                        background: 'transparent',
                                        padding: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#374151',
                                        transition: 'background 0.2s',
                                        cursor: 'pointer'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = '#f9fafb'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    Manage Listing
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <AddListingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                onAddListing={handleAddListing}
            />
        </div>
    );
}