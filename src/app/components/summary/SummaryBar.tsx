import type { Savings } from '../../types';
import { formatBytes } from '../../utils';

interface SummaryBarProps {
  savings: Savings;
  completedCount: number;
  totalCount: number;
}

export function SummaryBar({ savings, completedCount, totalCount }: SummaryBarProps) {
  const allComplete = completedCount === totalCount && totalCount > 0;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Images</p>
            <p className="text-lg font-semibold text-gray-900">
              {completedCount}/{totalCount}
            </p>
          </div>

          {savings.originalSize > 0 && (
            <>
              <div className="h-8 w-px bg-gray-300" />

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Original</p>
                <p className="text-lg font-semibold text-gray-900">
                  {formatBytes(savings.originalSize)}
                </p>
              </div>

              <div className="text-gray-400">→</div>

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Compressed</p>
                <p className="text-lg font-semibold text-green-600">
                  {formatBytes(savings.compressedSize)}
                </p>
              </div>

              <div className="h-8 w-px bg-gray-300" />

              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Saved</p>
                <p className="text-lg font-semibold text-green-600">
                  {savings.percentage}%
                </p>
              </div>
            </>
          )}
        </div>

        {allComplete && (
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              All complete
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
