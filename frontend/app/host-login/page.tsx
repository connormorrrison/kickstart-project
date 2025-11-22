'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default function HostLoginPage() {
    const router = useRouter();
    const { setUser } = useStore();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Mock login - accept anything
        setTimeout(() => {
            setUser({
                id: 'host-' + Math.random().toString(36).substr(2, 9),
                name: email.split('@')[0],
                email: email,
                isHost: true
            });
            router.push('/host');
        }, 800);
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f9f9f9', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
            <div style={{ width: '100%', maxWidth: '400px' }}>
                <button
                    onClick={() => router.push('/')}
                    style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '30px', color: '#666' }}
                >
                    <ArrowLeft size={20} /> Back to Map
                </button>

                <div style={{ background: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
                    <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '10px', textAlign: 'center' }}>Host Sign In</h1>
                    <p style={{ color: '#666', marginBottom: '30px', textAlign: 'center' }}>Sign in to manage your parking spots</p>

                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Email</label>
                            <input
                                required
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 500 }}>Password</label>
                            <input
                                required
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e5e5e5' }}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            style={{
                                width: '100%',
                                background: 'black',
                                color: 'white',
                                padding: '14px',
                                borderRadius: '8px',
                                fontWeight: 600,
                                fontSize: '1rem',
                                opacity: isLoading ? 0.7 : 1
                            }}
                        >
                            {isLoading ? 'Signing in...' : 'Continue'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
