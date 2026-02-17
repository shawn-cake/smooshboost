import type { MetadataOptions } from '../../types';

interface TitleDescSectionProps {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  titleDesc: MetadataOptions['titleDesc'];
  onTitleDescChange: (titleDesc: MetadataOptions['titleDesc']) => void;
  disabled?: boolean;
}

const TITLE_MAX = 60;
const DESC_MAX = 160;

export function TitleDescSection({
  enabled,
  onEnabledChange,
  titleDesc,
  onTitleDescChange,
  disabled = false,
}: TitleDescSectionProps) {
  const titleCount = titleDesc.title.length;
  const descCount = titleDesc.description.length;

  const getTitleColor = () => {
    if (titleCount > 100) return 'text-error';
    if (titleCount > TITLE_MAX) return 'text-accent-700';
    return 'text-gray-500';
  };

  const getDescColor = () => {
    if (descCount > 300) return 'text-error';
    if (descCount > DESC_MAX) return 'text-accent-700';
    return 'text-gray-500';
  };

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
        <span className="text-xs font-medium text-gray-700">
          Add title & description (Image SEO)
        </span>
      </label>

      {/* Expanded content */}
      {enabled && (
        <div className="ml-7 space-y-4">
          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">Title:</label>
            <input
              type="text"
              value={titleDesc.title}
              onChange={(e) =>
                onTitleDescChange({ ...titleDesc, title: e.target.value })
              }
              placeholder="Professional landscape photo by Cake Websites"
              disabled={disabled}
              readOnly={disabled}
              className={`w-full px-3 py-2 text-xs border border-gray-300 rounded-md
                       placeholder:text-gray-400 focus:border-primary focus:outline-none
                       focus:ring-2 focus:ring-primary-100
                       ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {!disabled && (
              <p className={`text-xs ${getTitleColor()}`}>
                {titleCount} / {TITLE_MAX} characters (recommended max)
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-gray-700">
              Description:
            </label>
            <textarea
              value={titleDesc.description}
              onChange={(e) =>
                onTitleDescChange({ ...titleDesc, description: e.target.value })
              }
              placeholder="High-quality image of the Blue Ridge Mountains landscape looking west during sunset in Autumn."
              rows={3}
              disabled={disabled}
              readOnly={disabled}
              className={`w-full px-3 py-2 text-xs border border-gray-300 rounded-md
                       placeholder:text-gray-400 focus:border-primary focus:outline-none
                       focus:ring-2 focus:ring-primary-100 resize-y min-h-[80px]
                       ${disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'}`}
            />
            {!disabled && (
              <p className={`text-xs ${getDescColor()}`}>
                {descCount} / {DESC_MAX} characters (recommended max)
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

