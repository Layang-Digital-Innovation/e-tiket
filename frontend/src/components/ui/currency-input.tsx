'use client';

import * as React from 'react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

export interface CurrencyInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value?: number;
  onChange?: (value: number) => void;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value = 0, onChange, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState('');

    // Format number to currency display
    const formatNumber = (num: number): string => {
      return new Intl.NumberFormat('id-ID').format(num);
    };

    // Parse currency string to number
    const parseNumber = (str: string): number => {
      const cleaned = str.replace(/[^\d]/g, '');
      return cleaned === '' ? 0 : parseInt(cleaned, 10);
    };

    // Update display value when value prop changes
    React.useEffect(() => {
      if (value !== undefined) {
        setDisplayValue(formatNumber(value));
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      const numericValue = parseNumber(inputValue);
      
      setDisplayValue(formatNumber(numericValue));
      
      if (onChange) {
        onChange(numericValue);
      }
    };

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      // Select all text on focus for easy editing
      e.target.select();
    };

    return (
      <div className="relative">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none">
          Rp
        </span>
        <Input
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          onFocus={handleFocus}
          className={cn('pl-10', className)}
          {...props}
        />
      </div>
    );
  }
);

CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
