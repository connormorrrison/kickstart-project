'use client';

import { useAuth } from '@/hooks/useAuth';

export default function AuthProvider({
    children,
}: {
    children: React.ReactNode;
}) {
    // This hook initializes auth state on mount
    useAuth();

    return <>{children}</>;
}
