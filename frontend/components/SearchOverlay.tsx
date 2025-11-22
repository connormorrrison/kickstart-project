'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { Search, Calendar, Clock, User as UserIcon } from 'lucide-react';

export default function SearchOverlay() {
    const { searchCriteria, setSearchCriteria, user, setAuthModalOpen } = useStore();
    const [isExpanded, setIsExpanded] = useState(true);
    const router = useRouter();

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
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => router.push('/host-login')}
                        style={{ fontSize: '0.8rem', fontWeight: 600, textDecoration: 'underline' }}
                    >
                        Host
                    </button>
                    <button
                        onClick={() => !user && setAuthModalOpen(true)}
                        style={{
                            background: '#f0f0f0',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        {user ? (
                            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'black', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>
                                {user.name[0]}
                            </div>
                        ) : (
                            <UserIcon size={18} />
                        )}
                    </button>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {/* Date & Time */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px', display: 'block' }}>Date</label>
                        <div style={{ position: 'relative' }}>
                            <Calendar size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="date"
                                value={searchCriteria.date}
                                onChange={(e) => setSearchCriteria({ date: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px', display: 'block' }}>Start</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="time"
                                value={searchCriteria.startTime}
                                onChange={(e) => setSearchCriteria({ startTime: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <label style={{ fontSize: '0.8rem', color: '#666', marginBottom: '4px', display: 'block' }}>End</label>
                        <div style={{ position: 'relative' }}>
                            <Clock size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#666' }} />
                            <input
                                type="time"
                                value={searchCriteria.endTime}
                                onChange={(e) => setSearchCriteria({ endTime: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '8px 8px 8px 32px',
                                    borderRadius: '6px',
                                    border: '1px solid #e5e5e5',
                                    fontSize: '0.9rem'
                                }}
                            />
                        </div>
                    </div>
                </div>

                <button style={{
                    background: 'black',
                    color: 'white',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: 500,
                    marginTop: '5px',
                    transition: 'opacity 0.2s'
                }}>
                    Search
                </button>
            </div>
        </div>
    );
}
