import { ParkingSpot } from '@/types';

export const MOCK_SPOTS: ParkingSpot[] = [
    {
        id: '1',
        street: '2000 W 4th Ave',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6J 1N3',
        country: 'Canada',
        lat: 49.268,
        lng: -123.15,
        pricePerHour: 5,
        hostId: 1,
        hostName: 'Sarah Johnson',
        availabilityIntervals: [
            { day: 'Monday', start: '8:00 AM', end: '10:00 PM' },
            { day: 'Tuesday', start: '8:00 AM', end: '10:00 PM' },
            { day: 'Wednesday', start: '8:00 AM', end: '10:00 PM' },
            { day: 'Thursday', start: '8:00 AM', end: '10:00 PM' },
            { day: 'Friday', start: '8:00 AM', end: '10:00 PM' },
            { day: 'Saturday', start: '9:00 AM', end: '11:00 PM' },
            { day: 'Sunday', start: '9:00 AM', end: '11:00 PM' }
        ],
    },
    {
        id: '2',
        street: '800 Robson St',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V6Z 3B7',
        country: 'Canada',
        lat: 49.282,
        lng: -123.12,
        pricePerHour: 12,
        hostId: 2,
        hostName: 'Michael Chen',
        availabilityIntervals: [
            { day: 'Monday', start: '10:00 AM', end: '2:00 PM' },
            { day: 'Monday', start: '5:00 PM', end: '10:00 PM' },
            { day: 'Wednesday', start: '10:00 AM', end: '10:00 PM' },
            { day: 'Friday', start: '10:00 AM', end: '12:00 AM' }
        ],
    },
    {
        id: '3',
        street: '100 E 10th Ave',
        city: 'Vancouver',
        province: 'BC',
        postalCode: 'V5T 1Z1',
        country: 'Canada',
        lat: 49.262,
        lng: -123.10,
        pricePerHour: 4,
        hostId: 3,
        hostName: 'Emily Rodriguez',
        availabilityIntervals: [
            { day: 'Saturday', start: '9:00 AM', end: '6:00 PM' },
            { day: 'Sunday', start: '9:00 AM', end: '6:00 PM' }
        ],
    },
];