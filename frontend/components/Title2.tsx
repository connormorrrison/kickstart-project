import type { ComponentPropsWithoutRef } from 'react';

type Title2Props = ComponentPropsWithoutRef<'label'>;

export default function Title2({ className, ...props }: Title2Props) {
  return (
    <label
      className={`mb-1 block text-base text-gray-700 ${className || ''}`}
      {...props}
    />
  );
}
