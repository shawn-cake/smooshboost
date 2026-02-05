import type { OutputFormat, FormatMode } from '../../types';
import { FORMAT_OPTIONS } from '../../types';

interface FormatSelectorProps {
  formatMode: FormatMode;
  onFormatModeChange: (mode: FormatMode) => void;
  convertFormat: OutputFormat;
  onConvertFormatChange: (format: OutputFormat) => void;
  disabled?: boolean;
  boostOnly?: boolean;
  onBoostOnlyChange?: (boostOnly: boolean) => void;
}

export function FormatSelector({
  formatMode,
  onFormatModeChange,
  convertFormat,
  onConvertFormatChange,
  disabled,
  boostOnly = false,
  onBoostOnlyChange,
}: FormatSelectorProps) {
  const formatDisabled = disabled || boostOnly;

  return (
    <div className="space-y-3">
      {/* Main row with Output Format (left) and Boost Only toggle (right) */}
      <div className="flex items-center justify-between">
        {/* Output Format section - left aligned */}
        <div className={`flex items-center gap-3 ${boostOnly ? 'opacity-50' : ''}`}>
          <label className="text-sm font-medium text-gray-700">Output Format</label>
          {/* Segmented control for format mode */}
          <div className="inline-flex rounded-lg border border-gray-300 p-1 bg-gray-100">
            <button
              type="button"
              onClick={() => onFormatModeChange('match')}
              disabled={formatDisabled}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                formatMode === 'match'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${formatDisabled ? 'cursor-not-allowed' : ''}`}
            >
              Keep Original
            </button>
            <button
              type="button"
              onClick={() => onFormatModeChange('convert')}
              disabled={formatDisabled}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                formatMode === 'convert'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              } ${formatDisabled ? 'cursor-not-allowed' : ''}`}
            >
              Convert to
            </button>
          </div>

          {/* Format dropdown - only visible in convert mode */}
          {formatMode === 'convert' && (
            <select
              value={convertFormat}
              onChange={(e) => onConvertFormatChange(e.target.value as OutputFormat)}
              disabled={formatDisabled}
              className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 focus:border-primary-500 disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {FORMAT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Boost Only toggle - right aligned */}
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm font-medium text-gray-700">Boost Only</span>
          <button
            type="button"
            role="switch"
            aria-checked={boostOnly}
            onClick={() => onBoostOnlyChange?.(!boostOnly)}
            disabled={disabled}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-300 focus:ring-offset-2 ${
              boostOnly ? 'bg-primary-500' : 'bg-gray-300'
            } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow-sm ${
                boostOnly ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </label>
      </div>

      {/* Boost Only explanation */}
      {boostOnly && (
        <p className="text-center text-sm text-gray-500">
          <span className="font-medium text-primary-500">No Compression</span> — Images will only receive metadata
        </p>
      )}
    </div>
  );
}
