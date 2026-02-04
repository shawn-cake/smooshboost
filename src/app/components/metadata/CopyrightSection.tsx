import type { MetadataOptions } from '../../types';

interface CopyrightSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  copyright: MetadataOptions['copyright'];
  onCopyrightChange: (copyright: MetadataOptions['copyright']) => void;
  disabled?: boolean;
}

const MAX_COPYRIGHT_LENGTH = 160;
const MAX_AUTHOR_LENGTH = 100;

export function CopyrightSection({
  enabled,
  onEnabledChange,
  copyright,
  onCopyrightChange,
  disabled = false,
}: CopyrightSectionProps) {
  const copyrightCharCount = copyright.text.length;
  const authorCharCount = copyright.author.length;
  const isCopyrightOverLimit = copyrightCharCount > MAX_COPYRIGHT_LENGTH;
  const isAuthorOverLimit = authorCharCount > MAX_AUTHOR_LENGTH;

  return (
    <div className={`space-y-3 ${disabled ? 'opacity-60' : ''}`}>
      {/* Checkbox */}
      <label className={`flex items-center gap-3 ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onEnabledChange(e.target.checked)}
          disabled={disabled}
          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary-100 disabled:opacity-50"
        />
        <span className="text-sm font-medium text-gray-700">
          Add copyright & author
        </span>
      </label>

      {/* Expanded content */}
      {enabled && (
        <div className="ml-7 space-y-4">
          {/* Copyright field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Copyright Notice:
            </label>
            <input
              type="text"
              value={copyright.text}
              onChange={(e) => onCopyrightChange({ ...copyright, text: e.target.value })}
              placeholder="© 2026 Client Name. All rights reserved."
              maxLength={MAX_COPYRIGHT_LENGTH + 50}
              disabled={disabled}
              readOnly={disabled}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                       placeholder:text-gray-400 focus:border-primary focus:outline-none
                       focus:ring-2 focus:ring-primary-100
                       ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {!disabled && (
              <div className="flex justify-end">
                <p
                  className={`text-xs ${
                    isCopyrightOverLimit ? 'text-error' : 'text-gray-500'
                  }`}
                >
                  {copyrightCharCount} / {MAX_COPYRIGHT_LENGTH}
                </p>
              </div>
            )}
          </div>

          {/* Author field */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-gray-700">
              Author/Artist:
            </label>
            <input
              type="text"
              value={copyright.author}
              onChange={(e) => onCopyrightChange({ ...copyright, author: e.target.value })}
              placeholder="Photographer or company name"
              maxLength={MAX_AUTHOR_LENGTH + 20}
              disabled={disabled}
              readOnly={disabled}
              className={`w-full px-3 py-2 text-sm border border-gray-300 rounded-md
                       placeholder:text-gray-400 focus:border-primary focus:outline-none
                       focus:ring-2 focus:ring-primary-100
                       ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {!disabled && (
              <div className="flex justify-end">
                <p
                  className={`text-xs ${
                    isAuthorOverLimit ? 'text-error' : 'text-gray-500'
                  }`}
                >
                  {authorCharCount} / {MAX_AUTHOR_LENGTH}
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

