import type { OutputFormat, FormatMode } from '../../types';
import { FORMAT_OPTIONS } from '../../types';

interface FormatSelectorProps {
  formatMode: FormatMode;
  onFormatModeChange: (mode: FormatMode) => void;
  convertFormat: OutputFormat;
  onConvertFormatChange: (format: OutputFormat) => void;
  disabled?: boolean;
}

export function FormatSelector({
  formatMode,
  onFormatModeChange,
  convertFormat,
  onConvertFormatChange,
  disabled,
}: FormatSelectorProps) {
  return (
    <div className="flex items-center justify-center gap-3">
      <label className="text-sm font-medium text-gray-700">Output Format</label>
      {/* Segmented control for format mode */}
      <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-100">
        <button
          type="button"
          onClick={() => onFormatModeChange('match')}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            formatMode === 'match'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Keep Original
        </button>
        <button
          type="button"
          onClick={() => onFormatModeChange('convert')}
          disabled={disabled}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            formatMode === 'convert'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-600 hover:text-gray-900'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          Convert to
        </button>
      </div>

      {/* Format dropdown - always rendered but hidden when not in convert mode */}
        <select
          value={convertFormat}
          onChange={(e) => onConvertFormatChange(e.target.value as OutputFormat)}
          disabled={disabled || formatMode === 'match'}
          className={`px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed transition-opacity ${
            formatMode === 'match' ? 'opacity-0 pointer-events-none' : 'opacity-100'
          }`}
        >
          {FORMAT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
    </div>
  );
}
