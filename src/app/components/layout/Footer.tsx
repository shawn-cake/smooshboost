import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons';
import logo from '../../../assets/logo.svg';

export function Footer() {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <footer className="py-8 text-center space-y-3">
      <img src={logo} alt="Smoosh - Image Compression" width={160} className="mx-auto opacity-50" />
      <div className="flex items-center justify-center gap-2">
        <p className="text-xs text-gray-700">
          © Cake Websites · v0.4.0
        </p>
        <div className="relative">
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip(!showTooltip)}
            aria-label="About this tool"
          >
            <FontAwesomeIcon icon={faCircleInfo} style={{ width: '14px', height: '14px' }} />
          </button>

          {showTooltip && (
            <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-primary-900 text-white text-xs rounded-lg shadow-lg z-50">
              <div className="absolute -bottom-1.5 right-4 w-3 h-3 bg-primary-900 rotate-45" />
              <p className="relative z-10">
                A custom image compression tool built with best-in-class compression engines for digital marketing work.
              </p>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}

