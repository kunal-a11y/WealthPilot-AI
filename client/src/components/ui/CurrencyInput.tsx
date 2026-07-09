import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';

interface CurrencyInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number | string;
  onChange: (value: string) => void;
  currencySymbol?: string;
}

export function CurrencyInput({ value, onChange, currencySymbol = "₹", className, ...props }: CurrencyInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    if (value !== undefined && value !== null && value !== "") {
      const numStr = value.toString().replace(/,/g, '');
      if (!isNaN(Number(numStr))) {
        // Format with commas, e.g. 1,00,000 for en-IN
        const formatted = Number(numStr).toLocaleString('en-IN', { maximumFractionDigits: 2 });
        setDisplayValue(formatted);
      }
    } else {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Remove all characters except digits and decimal point
    const rawVal = e.target.value.replace(/[^0-9.]/g, '');
    
    // Prevent multiple decimal points
    if ((rawVal.match(/\./g) || []).length > 1) return;

    onChange(rawVal);
    
    // Optimistic UI update while typing to handle trailing dots (e.g. "100.")
    if (rawVal === "" || rawVal.endsWith('.')) {
      setDisplayValue(e.target.value.replace(/[^0-9.,]/g, ''));
    }
  };

  return (
    <div className="relative w-full">
      {currencySymbol && (
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-zinc-500 font-medium">{currencySymbol}</span>
        </div>
      )}
      <input
        {...props}
        type="text"
        inputMode="decimal"
        value={displayValue}
        onChange={handleChange}
        className={cn(
          "w-full bg-zinc-900 border border-zinc-700 rounded-lg pr-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors",
          currencySymbol ? "pl-8" : "pl-4",
          className
        )}
      />
    </div>
  );
}
