'use client';

import { useState, useEffect } from 'react';
import { Plus } from 'lucide-react';
import AddListingModal from '@/components/AddListingModal';
import ListingDetailModal from '@/components/ListingDetailModal';
import MapPreview from '@/components/MapPreview';

interface TimeSlot {
    date: string;
    start: number;
    end: number;
}

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
    lat: number;
    lng: number;
    timeSlots: TimeSlot[];
}

export default function HostDashboard() {
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [listings, setListings] = useState<Listing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedListing, setSelectedListing] = useState<Listing | null>(null);

    // Fetch postings from backend
    useEffect(() => {
        const fetchPostings = async () => {
            try {
                const response = await fetch('http://localhost:8000/postings/all');
                const data = await response.json();

                // Group postings by location (address + lat + lng)
                const grouped = new Map<string, any[]>();

                data.data.forEach((posting: any) => {
                    const key = `${posting.address}-${posting.lat}-${posting.lng}`;
                    if (!grouped.has(key)) {
                        grouped.set(key, []);
                    }
                    grouped.get(key)!.push(posting);
                });

                // Transform grouped data to Listing format
                const transformedListings: Listing[] = Array.from(grouped.entries()).map(([, postings]) => {
                    const firstPosting = postings[0];

                    // Format time ranges for description
                    const timeRanges = postings.map(p =>
                        `${p.date} ${p.start}:00-${p.end}:00`
                    ).join(', ');

                    // Extract time slots
                    const timeSlots: TimeSlot[] = postings.map(p => ({
                        date: p.date,
                        start: p.start,
                        end: p.end
                    }));

                    return {
                        id: firstPosting.id,
                        address: firstPosting.address,
                        description: timeRanges,
                        price: firstPosting.price,
                        status: postings.every(p => !p.customer_id) ? 'active' : 'inactive',
                        image: null,
                        bookings: 0,
                        rating: null,
                        availableStart: `${firstPosting.start}:00`,
                        availableEnd: `${firstPosting.end}:00`,
                        lat: firstPosting.lat,
                        lng: firstPosting.lng,
                        timeSlots
                    };
                });

                setListings(transformedListings);
            } catch (error) {
                console.error('Failed to fetch postings:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPostings();
    }, []);

    // Calculate stats from listings
    const activeListingsCount = listings.filter(l => l.status === 'active').length;
    const totalBookings = listings.reduce((sum, listing) => sum + listing.bookings, 0);
    const totalTimeSlots = listings.reduce((sum, listing) => sum + listing.timeSlots.length, 0);

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
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Active Listings</h3>
                        <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                            {activeListingsCount}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                            {totalTimeSlots} time slots available
                        </span>
                    </div>
                    <div style={{ borderRadius: '12px', border: '1px solid #e5e7eb', background: 'white', padding: '24px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 500, color: '#6b7280' }}>Total Bookings</h3>
                        <div style={{ marginTop: '8px', fontSize: '1.5rem', fontWeight: 700, color: '#111827' }}>
                            {totalBookings}
                        </div>
                        <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>All-time bookings</span>
                    </div>
                </div>

                {/* listings grid */}
                <h2 style={{ marginBottom: '16px', fontSize: '1.125rem', fontWeight: 600, color: '#111827' }}>Your Listings</h2>

                {isLoading ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        Loading listings...
                    </div>
                ) : listings.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                        No listings yet. Click "Add Listing" to create your first one!
                    </div>
                ) : (
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

                                {/* map preview */}
                                <div style={{ height: '160px', width: '100%', overflow: 'hidden' }}>
                                    <MapPreview lat={listing.lat} lng={listing.lng} height="160px" />
                                </div>

                                {/* content */}
                                <div style={{ padding: '20px' }}>
                                    <h3 style={{ fontWeight: 600, color: '#111827' }}>{listing.address}</h3>

                                    <button
                                        onClick={() => setSelectedListing(listing)}
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
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <AddListingModal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
            />

            {selectedListing && (
                <ListingDetailModal
                    isOpen={!!selectedListing}
                    onClose={() => setSelectedListing(null)}
                    address={selectedListing.address}
                    lat={selectedListing.lat}
                    lng={selectedListing.lng}
                    price={selectedListing.price}
                    timeSlots={selectedListing.timeSlots}
                />
            )}
        </div>
    );
}