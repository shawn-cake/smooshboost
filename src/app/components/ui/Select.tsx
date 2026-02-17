import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectOption {
  value: string;
  label: string;
  description?: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  options: SelectOption[];
  onChange: (value: string) => void;
  label?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ options, onChange, label, value, disabled, className = '', ...props }, ref) => {
    return (
      <div className={className}>
        {label && (
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-gray-900 text-xs focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
              {option.description && ` - ${option.description}`}
            </option>
          ))}
        </select>
      </div>
    );
  }
);

Select.displayName = 'Select';
