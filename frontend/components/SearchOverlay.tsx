'use client';

import { useState, useEffect } from 'react';

import { useStore } from '@/lib/store';
import { Calendar, Clock, User as UserIcon } from 'lucide-react';
import Button1 from './Button1';

export default function SearchOverlay() {
    const { searchCriteria, setSearchCriteria, setAuthModalOpen, setFilterActive } = useStore();
    const [localDate, setLocalDate] = useState(searchCriteria.date);
    const [localStartTime, setLocalStartTime] = useState(searchCriteria.startTime);
    const [localEndTime, setLocalEndTime] = useState(searchCriteria.endTime);

    // Sync local state if store changes externally (optional but good practice)
    useEffect(() => {
        setLocalDate(searchCriteria.date);
        setLocalStartTime(searchCriteria.startTime);
        setLocalEndTime(searchCriteria.endTime);
    }, [searchCriteria]);

    const [isLoading, setIsLoading] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    const handleSearch = async () => {
        setIsLoading(true);
        // Simulate loading delay for better UX
        await new Promise(resolve => setTimeout(resolve, 600));

        setSearchCriteria({
            date: localDate,
            startTime: localStartTime,
            endTime: localEndTime
        });
        setFilterActive(true);
        setIsLoading(false);
    };

    return (
        <div style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 10,
            background: 'white',
            padding: '20px',
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            width: '350px',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '15px' }}>
                <h2 style={{ fontSize: '1.2rem', fontWeight: 600 }}>Find Parking</h2>
                <Button1 onClick={() => setAuthModalOpen(true)}>
                    <UserIcon size={16} />
                    Host Sign In
                </Button1>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Date & Time */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '1rem', color: '#666', marginBottom: '4px', display: 'block' }}>Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="date"
                                value={localDate}
                                onChange={(e) => setLocalDate(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '1rem', color: '#666', marginBottom: '4px', display: 'block' }}>Start</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="time"
                                value={localStartTime}
                                onChange={(e) => setLocalStartTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '1rem', color: '#666', marginBottom: '4px', display: 'block' }}>End</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="time"
                                value={localEndTime}
                                onChange={(e) => setLocalEndTime(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '1rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    onClick={handleSearch}
                    disabled={isLoading}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{
                        background: isHovered ? '#333' : 'black',
                        color: 'white',
                        padding: '12px',
                        borderRadius: '8px',
                        fontWeight: 500,
                        marginTop: '5px',
                        transition: 'all 0.2s ease',
                        fontSize: '1rem',
                        cursor: isLoading ? 'wait' : 'pointer',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '8px',
                        opacity: isLoading ? 0.8 : 1
                    }}>
                    {isLoading ? (
                        <>
                            <div style={{
                                width: '16px',
                                height: '16px',
                                border: '2px solid white',
                                borderTop: '2px solid transparent',
                                borderRadius: '50%',
                                animation: 'spin 1s linear infinite'
                            }} />
                            Searching...
                        </>
                    ) : (
                        'Search'
                    )}
                </button>
                <style jsx>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        </div>
    );
}
