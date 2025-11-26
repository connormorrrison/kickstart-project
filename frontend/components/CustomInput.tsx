import * as React from 'react';

interface CustomInputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const CustomInput = React.forwardRef<HTMLInputElement, CustomInputProps>(
  ({ className = '', ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={`h-10 w-full rounded-xl px-4 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-base font-normal ${className}`}
        {...props}
      />
    );
  }
);

CustomInput.displayName = 'CustomInput';

export default CustomInput;
