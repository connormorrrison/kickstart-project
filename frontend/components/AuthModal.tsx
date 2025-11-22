'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AuthModal() {
    const { isAuthModalOpen, setAuthModalOpen, setUser } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock login delay
        setTimeout(() => {
            setUser({
                id: 'user1',
                name: 'Demo User',
                email: email,
                isHost: false
            });
            setAuthModalOpen(false);
            setIsLoading(false);
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

                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '20px', textAlign: 'center' }}>Welcome Back</h2>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Email</label>
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
                        <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: 500 }}>Password</label>
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
