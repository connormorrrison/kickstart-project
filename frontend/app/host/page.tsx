'use client';

import { useState } from 'react';
import { Plus, MapPin, DollarSign, Clock } from 'lucide-react';
import AddListingModal from '@/components/AddListingModal';
import Tile from '@/components/Tile';
import Title2 from '@/components/Title2';
import Button1 from '@/components/Button1';
import Button2 from '@/components/Button2';
import Badge from '@/components/Badge';
import { CardContent } from '@/components/ui/card';

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
        <div className="min-h-screen bg-gray-50 p-4 md:p-10">
            <div className="max-w-7xl mx-auto">

                {/* header section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-normal text-gray-900">Host Dashboard</h1>
                        <p className="mt-1 text-base text-gray-600">Manage your parking spots and view performance.</p>
                    </div>
                    <Button1
                        onClick={() => setIsAddModalOpen(true)}
                        icon={<Plus size={16} />}
                    >
                        Add Listing
                    </Button1>
                </div>

                {/* stats overview */}
                <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Tile className="p-6 shadow-none">
                        <Title2 className="text-base text-gray-600 mb-0">Total Earnings</Title2>
                        <div className="mt-2 text-3xl font-bold text-gray-900">$1,240.50</div>
                        <span className="text-base text-green-600">+12% from last month</span>
                    </Tile>
                    <Tile className="p-6">
                        <Title2 className="text-base text-gray-600 ">Active Listings</Title2>
                        <div className="text-3xl font-bold text-gray-900">2</div>
                    </Tile>
                    <Tile className="p-6">
                        <Title2 className="text-base text-gray-600 mb-0">Total Bookings</Title2>
                        <div className="mt-2 text-3xl font-bold text-gray-900">57</div>
                    </Tile>
                </div>

                {/* listings grid */}
                <h2 className="mb-4 text-xl font-semibold text-gray-900">Your Listings</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {listings.map((listing) => (
                        <Tile key={listing.id} className="overflow-hidden p-0 relative hover:shadow-2xl transition-shadow">
                            {/* status badge */}
                            <div className="absolute right-3 top-3 z-10">
                                <Badge
                                    text={listing.status === 'active' ? 'Active' : 'Inactive'}
                                    className={listing.status === 'active' ? 'bg-green-100 border-green-200' : 'bg-gray-100 border-gray-200'}
                                />
                            </div>

                            {/* image placeholder */}
                            <div
                                className="h-40 w-full bg-gray-100 bg-cover bg-center"
                                style={listing.image ? { backgroundImage: `url(${listing.image})` } : {}}
                            >
                                {!listing.image && (
                                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                                        <MapPin size={32} />
                                    </div>
                                )}
                            </div>

                            {/* content */}
                            <CardContent className="p-5">
                                <h3 className="font-semibold text-gray-900">{listing.address}</h3>
                                <p className="mt-1 text-base text-gray-600 truncate">
                                    {listing.description}
                                </p>

                                <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-4">
                                    <Badge
                                        text={`$${listing.price.toFixed(2)}/hr`}
                                        icon={<DollarSign size={14} />}
                                        className="border-0"
                                    />
                                    <Badge
                                        text="24/7"
                                        icon={<Clock size={14} />}
                                        className="border-0"
                                    />
                                </div>

                                <Button2 className="mt-4 w-full">
                                    Manage Listing
                                </Button2>
                            </CardContent>
                        </Tile>
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
