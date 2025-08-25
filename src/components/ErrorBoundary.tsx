'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    
    // In production, you might want to log to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: logErrorToService(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;
      return (
        <FallbackComponent 
          error={this.state.error!} 
          resetError={this.resetError} 
        />
      );
    }

    return this.props.children;
  }
}

const DefaultErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Oops! Something went wrong
        </h1>
        <p className="text-gray-600 mb-4">
          We encountered an unexpected error. This might be related to microphone permissions or browser compatibility.
        </p>
        
        {process.env.NODE_ENV === 'development' && (
          <details className="text-left bg-gray-100 rounded p-3 mb-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Error Details (Dev Only)
            </summary>
            <pre className="text-xs mt-2 overflow-auto">
              {error.message}
            </pre>
          </details>
        )}

        <div className="space-y-2">
          <button
            onClick={resetError}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Reload Page
          </button>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Common solutions:</p>
          <ul className="list-disc list-inside text-left mt-2 space-y-1">
            <li>Ensure your browser supports Web Audio API</li>
            <li>Allow microphone permissions when prompted</li>
            <li>Try refreshing the page</li>
            <li>Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;