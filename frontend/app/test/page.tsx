'use client';

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function TestPage() {
    return (
        <div style={{ padding: '40px', maxWidth: '600px', margin: '0 auto' }}>
            <Card>
                <CardHeader>
                    <CardTitle>Test Card</CardTitle>
                    <CardDescription>This is a test card using shadcn/ui</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Card content goes here. This is testing whether the Card component renders properly.</p>
                </CardContent>
            </Card>
        </div>
    );
}
