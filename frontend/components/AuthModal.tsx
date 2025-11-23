'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';

const HOST_EMAIL = 'host@example.com';
const HOST_PASSWORD = 'password123';

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, setUser } = useStore();
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Check hardcoded credentials
        setTimeout(() => {
            if (email === HOST_EMAIL && password === HOST_PASSWORD) {
                setUser({
                    id: 'host1',
                    name: 'Host User',
                    email: email,
                    isHost: true
                });
                setAuthModalOpen(false);
                setIsLoading(false);
                router.push('/host/dashboard');
            } else {
                setError('Invalid email or password');
                setIsLoading(false);
            }
        }, 1000);
    };

    if (!isAuthModalOpen) return null;

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            zIndex: 50,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'rgba(0,0,0,0.5)'
        }}>
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                    background: 'white',
                    padding: '30px',
                    borderRadius: '16px',
                    width: '90%',
                    maxWidth: '400px',
                    position: 'relative'
                }}
            >
                <button
                    onClick={() => setAuthModalOpen(false)}
                    style={{ position: 'absolute', top: '20px', right: '20px', color: '#666' }}
                >
                    <X size={20} />
                </button>

                <div style={{ textAlign: 'center', marginBottom: '25px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '8px' }}>Host Sign In</h2>
                    <p style={{ fontSize: '1rem', color: '#666' }}>Sign in to manage your parking spots and reservations</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '1rem', fontWeight: 500 }}>Email</label>
                        <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #e5e5e5',
                                fontSize: '1rem'
                            }}
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '1rem', fontWeight: 500 }}>Password</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '10px',
                                borderRadius: '8px',
                                border: '1px solid #e5e5e5',
                                fontSize: '1rem'
                            }}
                        />
                    </div>

                    {error && (
                        <div style={{
                            padding: '12px',
                            background: '#fee',
                            color: '#c00',
                            borderRadius: '8px',
                            fontSize: '0.9rem',
                            textAlign: 'center'
                        }}>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        style={{
                            background: 'black',
                            color: 'white',
                            padding: '12px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '1rem',
                            marginTop: '10px',
                            opacity: isLoading ? 0.7 : 1
                        }}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
