'use client';

import { ReactNode } from 'react';

interface Button1Props {
    onClick?: () => void;
    children: ReactNode;
}

export default function Button1({ onClick, children }: Button1Props) {
    return (
        <button
            onClick={onClick}
            style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                fontSize: '0.875rem',
                fontWeight: 500,
                border: '1px solid #e5e5e5',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#f5f5f5'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
        >
            {children}
        </button>
    );
}
