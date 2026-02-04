import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/logo.svg';

export function Header() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <header className="relative pt-[var(--spacing-12)] pb-4 flex flex-col items-center">
      {/* Logo */}
      <img src={logo} alt="SmooshBoost - Compress and optimize images for the web" width={400} />

      {/* Info icon with tooltip - positioned in top right corner */}
      <div className="absolute top-4 right-4">
        <button
          type="button"
          className="text-gray-400 hover:text-primary-600 transition-colors p-2"
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
          onClick={() => setShowTooltip(!showTooltip)}
          aria-label="About this tool"
        >
          <FontAwesomeIcon icon={faCircleInfo} style={{ width: '24px', height: '24px' }} />
        </button>

        {/* Tooltip popup - positioned below and to the left since we're in the corner */}
        {showTooltip && (
          <div className="absolute top-full right-0 mt-2 w-64 p-3 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-50">
            <div className="absolute -top-1.5 right-4 w-3 h-3 bg-gray-900 rotate-45" />
            <p className="relative z-10">
              A custom image compression tool built with best-in-class lossless compression techniques, bundled with SEO metadata optimization for digital marketing.
            </p>
          </div>
        )}
      </div>
    </header>
  );
}
