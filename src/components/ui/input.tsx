import * as React from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input2 = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return <input type={type} className={cn('cursor-pointer white flex h-10 w-full rounded-md border-b-2 border-white  bg-background text-sm ring-offset-background file:cursor-pointer file:min-h-10 file:px-3 file:py-2 file:border-0 file:bg-accentCol file:text-sm file:font-medium placeholder:text-accentCol focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50', className)} ref={ref} {...props} />;
});
Input2.displayName = 'Input2';

export { Input2 };
