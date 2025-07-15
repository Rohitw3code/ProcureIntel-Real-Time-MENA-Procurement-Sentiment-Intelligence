import React from 'react';
import { XCircle, CheckCircle } from 'lucide-react';

interface AlertMessagesProps {
  error: string | null;
  success: string | null;
  onClearError: () => void;
  onClearSuccess: () => void;
}

export const AlertMessages: React.FC<AlertMessagesProps> = ({
  error,
  success,
  onClearError,
  onClearSuccess
}) => {
  return (
    <>
      {/* Error Alert */}
      {error && (
        <div className="mb-4 sm:mb-6 bg-red-50 border border-red-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-red-600 break-words">{error}</p>
            </div>
            <button
              onClick={onClearError}
              className="ml-2 text-red-400 hover:text-red-600 flex-shrink-0"
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}

      {/* Success Alert */}
      {success && (
        <div className="mb-4 sm:mb-6 bg-emerald-50 border border-emerald-200 rounded-lg p-3 sm:p-4">
          <div className="flex">
            <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400 flex-shrink-0" />
            <div className="ml-2 sm:ml-3 flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-emerald-600 break-words">{success}</p>
            </div>
            <button
              onClick={onClearSuccess}
              className="ml-2 text-emerald-400 hover:text-emerald-600 flex-shrink-0"
            >
              <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
};