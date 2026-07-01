import type { OutputFormat } from '../../types';
import { FORMAT_OPTIONS } from '../../types';

interface FormatSelectorProps {
  convertFormat: OutputFormat;
  onConvertFormatChange: (format: OutputFormat) => void;
  disabled?: boolean;
}

export function FormatSelector({
  convertFormat,
  onConvertFormatChange,
  disabled,
}: FormatSelectorProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-xs font-medium text-gray-700">Output Format</label>
      {/* Pill buttons for format options */}
      <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-100">
        {FORMAT_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onConvertFormatChange(option.value)}
            disabled={disabled}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              convertFormat === option.value
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            } ${disabled ? 'cursor-not-allowed' : ''}`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
