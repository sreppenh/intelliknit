import React from 'react';

// Error Message Component - Warm and Friendly
export const ErrorMessage = ({ message, type = 'error', onDismiss }) => {
  const getStyles = () => {
    switch (type) {
      case 'error':
        return {
          container: 'bg-red-50 border-2 border-red-200 text-red-700',
          icon: '⚠️',
          title: 'Oops!'
        };
      case 'warning':
        return {
          container: 'bg-yarn-100 border-2 border-yarn-300 text-yarn-800',
          icon: '💡',
          title: 'Heads up!'
        };
      case 'info':
        return {
          container: 'bg-sage-100 border-2 border-sage-200 text-sage-700',
          icon: 'ℹ️',
          title: 'Good to know'
        };
      default:
        return {
          container: 'bg-wool-100 border-2 border-wool-200 text-wool-700',
          icon: '📝',
          title: 'Note'
        };
    }
  };

  const styles = getStyles();

  return (
    <div className={`rounded-xl p-4 ${styles.container}`}>
      <div className="flex items-start gap-3">
        <div className="text-lg flex-shrink-0">{styles.icon}</div>
        <div className="flex-1">
          <div className="font-semibold text-sm mb-1">{styles.title}</div>
          <div className="text-sm">{message}</div>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="text-lg opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// Form Validation Message
export const ValidationError = ({ message }) => {
  if (!message) return null;

  return (
    <div className="mt-2 flex items-center gap-2">
      <span className="text-sm">⚠️</span>
      <span className="text-sm text-red-600">{message}</span>
    </div>
  );
};

// Loading State Component
export const LoadingSpinner = ({ message = 'Working on it...' }) => (
  <div className="flex items-center justify-center p-8">
    <div className="text-center">
      <div className="text-3xl mb-3 animate-spin">🧶</div>
      <p className="text-wool-500 text-sm">{message}</p>
    </div>
  </div>
);

// Empty State Component
export const EmptyState = ({
  icon = '📝',
  title = 'Nothing here yet',
  description = 'Get started by adding something new',
  action
}) => (
  <div className="text-center py-12 bg-white rounded-xl border-2 border-wool-200 shadow-sm">
    <div className="text-4xl mb-4">{icon}</div>
    <h3 className="text-lg font-semibold text-wool-600 mb-2">{title}</h3>
    <p className="content-subheader">{description}</p>
    {action && action}
  </div>
);

// Success Toast/Message
export const SuccessMessage = ({ message, onDismiss }) => (
  <div className="bg-yarn-100 border-2 border-yarn-200 text-yarn-700 rounded-xl p-4">
    <div className="flex items-start gap-3">
      <div className="text-lg flex-shrink-0">🎉</div>
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">Success!</div>
        <div className="text-sm">{message}</div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-lg opacity-70 hover:opacity-100 transition-opacity flex-shrink-0"
        >
          ×
        </button>
      )}
    </div>
  </div>
);

// Error Boundary Fallback
export const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-yarn-50 flex items-center justify-center p-4">
    <div className="bg-white rounded-2xl shadow-lg max-w-md w-full border-2 border-red-200">
      <div className="bg-red-500 text-white px-6 py-4 rounded-t-2xl">
        <div className="text-center">
          <div className="text-2xl mb-2">😞</div>
          <h2 className="text-lg font-semibold">Something went wrong</h2>
          <p className="text-red-100 text-sm">We're sorry about that!</p>
        </div>
      </div>

      <div className="p-6 bg-yarn-50">
        <div className="text-center mb-6">
          <p className="text-wool-600 mb-4">
            IntelliKnit ran into an unexpected problem. Don't worry - your project data is safe.
          </p>
          <details className="text-left">
            <summary className="text-sm text-wool-500 cursor-pointer mb-2">
              Technical details (for troubleshooting)
            </summary>
            <pre className="text-xs text-wool-400 bg-wool-100 p-2 rounded border overflow-auto">
              {error.message}
            </pre>
          </details>
        </div>

        <div className="stack-sm">
          <button
            onClick={resetError}
            className="w-full btn-primary"
          >
            Try Again
          </button>

          <button
            onClick={() => window.location.reload()}
            className="w-full btn-tertiary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Network Error Component
export const NetworkError = ({ onRetry }) => (
  <div className="bg-yarn-100 border-2 border-yarn-300 text-yarn-800 rounded-xl p-4">
    <div className="flex items-start gap-3">
      <div className="text-lg flex-shrink-0">📡</div>
      <div className="flex-1">
        <div className="font-semibold text-sm mb-1">Connection Issue</div>
        <div className="text-sm mb-3">
          Can't connect right now. Check your internet connection and try again.
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-yarn-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-yarn-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    </div>
  </div>
);

export default {
  ErrorMessage,
  ValidationError,
  LoadingSpinner,
  EmptyState,
  SuccessMessage,
  ErrorFallback,
  NetworkError
};