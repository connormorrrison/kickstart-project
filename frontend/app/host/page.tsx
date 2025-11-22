'use client';

import { useState, useRef, useEffect } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, DollarSign } from 'lucide-react';
import { APIProvider, useMapsLibrary } from '@vis.gl/react-google-maps';

function HostForm() {
    const router = useRouter();
    const { addSpot, user } = useStore();
    const geocodingLib = useMapsLibrary('geocoding');
    const placesLib = useMapsLibrary('places');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        address: '',
        pricePerHour: '',
        availableStart: '09:00',
        availableEnd: '17:00',
        availableDateStart: new Date().toISOString().split('T')[0],
        availableDateEnd: new Date().toISOString().split('T')[0]
    });

    // Address Autocomplete
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (!placesLib || !inputRef.current) return;

        const opts = {
            componentRestrictions: { country: 'ca' }, // Restrict to Canada
            fields: ['address_components', 'geometry', 'formatted_address'],
        };

        const ac = new placesLib.Autocomplete(inputRef.current, opts);
        setAutocomplete(ac);

        ac.addListener('place_changed', () => {
            const place = ac.getPlace();
            if (place.formatted_address) {
                setFormData(prev => ({ ...prev, address: place.formatted_address || '' }));
            }
        });
    }, [placesLib]);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        let lat = 49.2827;
        let lng = -123.1207;

        // If we have an autocomplete result with geometry, use that directly
        const place = autocomplete?.getPlace();
        if (place?.geometry?.location) {
            lat = place.geometry.location.lat();
            lng = place.geometry.location.lng();
        } else if (geocodingLib && formData.address) {
            // Fallback to geocoding if manually entered
            const geocoder = new geocodingLib.Geocoder();
            try {
                const response = await geocoder.geocode({ address: formData.address });
                if (response.results[0]) {
                    lat = response.results[0].geometry.location.lat();
                    lng = response.results[0].geometry.location.lng();
                }
            } catch (error) {
                console.error('Geocoding failed:', error);
            }
        }

        addSpot({
            id: Math.random().toString(36).substr(2, 9),
            title: formData.title,
            description: formData.description,
            address: formData.address,
            lat,
            lng,
            pricePerHour: Number(formData.pricePerHour),
            hostId: user?.id || 'anonymous',
            availableStart: formData.availableStart,
            availableEnd: formData.availableEnd,
            availableDateStart: formData.availableDateStart,
            availableDateEnd: formData.availableDateEnd,
            images: [imagePreview || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800&auto=format&fit=crop&q=60']
        });

        setIsSubmitting(false);
        router.push('/');
    };

    return (
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <button
                onClick={() => router.back()}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', color: '#666' }}
            >
                <ArrowLeft size={20} /> Back to Map
            </button>

            <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '10px' }}>List your parking spot</h1>
            <p style={{ color: '#666', marginBottom: '40px' }}>Earn money by renting out your unused parking space.</p>

            <form onSubmit={handleSubmit} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>

                {/* Image Upload */}
                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Spot Image</label>
                    <div
                        style={{
                            border: '2px dashed #e5e5e5',
                            borderRadius: '12px',
                            padding: '20px',
                            textAlign: 'center',
                            cursor: 'pointer',
                            background: imagePreview ? `url(${imagePreview}) center/cover no-repeat` : '#f9f9f9',
                            backgroundSize: 'cover',
                            height: '200px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                        onClick={() => document.getElementById('image-upload')?.click()}
                    >
                        {!imagePreview && (
                            <div style={{ color: '#666' }}>
                                <p style={{ fontWeight: 600, marginBottom: '4px' }}>Click to upload</p>
                                <p style={{ fontSize: '0.8rem' }}>JPG, PNG (Max 5MB)</p>
                            </div>
                        )}
                        <input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            onChange={handleImageUpload}
                            style={{ display: 'none' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Spot Title</label>
                    <input
                        required
                        type="text"
                        placeholder="e.g. Spacious Driveway in Kitsilano"
                        value={formData.title}
                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                    />
                </div>

                <div style={{ marginBottom: '20px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Address</label>
                    <div style={{ position: 'relative' }}>
                        <MapPin size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666', zIndex: 1 }} />
                        <input
                            ref={inputRef}
                            required
                            type="text"
                            placeholder="Start typing address..."
                            value={formData.address}
                            onChange={e => setFormData({ ...formData, address: e.target.value })}
                            style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Price per Hour</label>
                        <div style={{ position: 'relative' }}>
                            <DollarSign size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                required
                                type="number"
                                min="0"
                                step="0.5"
                                placeholder="0.00"
                                value={formData.pricePerHour}
                                onChange={e => setFormData({ ...formData, pricePerHour: e.target.value })}
                                style={{ width: '100%', padding: '12px 12px 12px 35px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Available Date Start</label>
                        <input
                            required
                            type="date"
                            value={formData.availableDateStart}
                            onChange={e => setFormData({ ...formData, availableDateStart: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Available Date End</label>
                        <input
                            required
                            type="date"
                            value={formData.availableDateEnd}
                            onChange={e => setFormData({ ...formData, availableDateEnd: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        />
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Available Time Start</label>
                        <input
                            required
                            type="time"
                            value={formData.availableStart}
                            onChange={e => setFormData({ ...formData, availableStart: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Available Time End</label>
                        <input
                            required
                            type="time"
                            value={formData.availableEnd}
                            onChange={e => setFormData({ ...formData, availableEnd: e.target.value })}
                            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '30px' }}>
                    <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Description</label>
                    <textarea
                        required
                        rows={4}
                        placeholder="Describe your spot..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5', resize: 'none' }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={isSubmitting}
                    style={{
                        width: '100%',
                        background: 'black',
                        color: 'white',
                        padding: '14px',
                        borderRadius: '8px',
                        fontWeight: 600,
                        fontSize: '1rem',
                        opacity: isSubmitting ? 0.7 : 1
                    }}
                >
                    {isSubmitting ? 'Listing Spot...' : 'List Spot'}
                </button>

            </form>
        </div>
    );
}

export default function HostPage() {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9f9', padding: '40px 20px' }}>
            {apiKey ? (
                <APIProvider apiKey={apiKey}>
                    <HostForm />
                </APIProvider>
            ) : (
                <div style={{ textAlign: 'center', marginTop: '50px' }}>
                    <h2>API Key Missing</h2>
                    <p>Please add your Google Maps API key to .env.local</p>
                </div>
            )}
        </div>
    );
}
