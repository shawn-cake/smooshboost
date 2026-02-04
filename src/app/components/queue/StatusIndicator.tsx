import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faCircle,
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { Spinner } from '../ui';
import type { ImageStatus } from '../../types';

interface StatusIndicatorProps {
  status: ImageStatus;
  size?: 'sm' | 'md';
}

export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const iconSize = size === 'sm' ? 'text-xs' : 'text-sm';
  const containerSize = size === 'sm' ? 'w-5 h-5' : 'w-6 h-6';

  switch (status) {
    case 'queued':
      return (
        <div
          className={`${containerSize} rounded-full border-2 border-gray-300 flex items-center justify-center`}
          title="Queued"
        >
          <FontAwesomeIcon
            icon={faCircle}
            className={`${iconSize} text-gray-300`}
          />
        </div>
      );

    case 'compressing':
      return (
        <div
          className={`${containerSize} flex items-center justify-center`}
          title="Compressing"
        >
          <Spinner size="sm" className="text-primary-500" />
        </div>
      );

    case 'complete':
      return (
        <div
          className={`${containerSize} rounded-full bg-green-500 flex items-center justify-center`}
          title="Complete"
        >
          <FontAwesomeIcon icon={faCheck} className={`${iconSize} text-white`} />
        </div>
      );

    case 'error':
      return (
        <div
          className={`${containerSize} rounded-full bg-red-500 flex items-center justify-center`}
          title="Error"
        >
          <FontAwesomeIcon icon={faXmark} className={`${iconSize} text-white`} />
        </div>
      );

    default:
      return null;
  }
}
