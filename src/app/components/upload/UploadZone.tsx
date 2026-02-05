import { useCallback, useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faFileImage } from '@fortawesome/free-solid-svg-icons';

interface UploadZoneProps {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  maxFiles?: number;
  currentCount?: number;
}

export function UploadZone({
  onFilesSelected,
  disabled = false,
  maxFiles = 10,
  currentCount = 0,
}: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current++;
    if (dragCounterRef.current === 1) {
      setIsDragging(true);
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current === 0) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      dragCounterRef.current = 0;
      setIsDragging(false);

      if (disabled) return;

      const files = Array.from(e.dataTransfer.files).filter((file) =>
        file.type.startsWith('image/')
      );

      if (files.length > 0) {
        onFilesSelected(files);
      }
    },
    [disabled, onFilesSelected]
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files ? Array.from(e.target.files) : [];
      if (files.length > 0) {
        onFilesSelected(files);
      }
      // Reset input so same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onFilesSelected]
  );

  const remaining = maxFiles - currentCount;
  const isAtLimit = remaining <= 0;

  const handleContainerClick = useCallback(() => {
    if (!disabled && !isAtLimit) {
      fileInputRef.current?.click();
    }
  }, [disabled, isAtLimit]);

  return (
    <div
      onClick={handleContainerClick}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`
        relative border-2 border-dashed rounded-lg pt-12 pb-16 px-8 text-center transition-colors
        ${
          isDragging
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 bg-white'
        }
        ${disabled || isAtLimit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        multiple
        onChange={handleFileSelect}
        disabled={disabled || isAtLimit}
        className="hidden"
      />

      <div className="flex flex-col items-center gap-5">
        <div
          className={`
            w-16 h-16 rounded-full flex items-center justify-center
            ${isDragging ? 'bg-primary-100' : 'bg-gray-100'}
          `}
        >
          <FontAwesomeIcon
            icon={isDragging ? faFileImage : faCloudUploadAlt}
            className={`text-2xl ${isDragging ? 'text-primary-500' : 'text-gray-400'}`}
          />
        </div>

        <div>
          <p className="text-gray-700 font-medium text-2xl">
            Upload Images
          </p>
          <p className="text-gray-500 text-sm mt-2">
            Drag and drop or click to browse (PNG, JPG, WebP)
          </p>
        </div>

        <p className="text-gray-400 text-xs mt-1">
          {isAtLimit
            ? `Maximum ${maxFiles} images reached`
            : `Up to ${remaining} more image${remaining !== 1 ? 's' : ''} (max 5MB each)`}
        </p>
      </div>
    </div>
  );
}
