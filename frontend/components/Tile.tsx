import type { ComponentPropsWithoutRef } from 'react';
import { Card } from '@/components/ui/card';

type TileProps = ComponentPropsWithoutRef<typeof Card>;

export default function Tile({ className, ...props }: TileProps) {
  return (
    <Card
      className={`shadow-xl ${className || ''}`}
      {...props}
    />
  );
}
