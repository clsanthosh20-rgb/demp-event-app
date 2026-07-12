import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@demp/ui';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
          <div className="glass-strong rounded-2xl p-8 max-w-md space-y-4">
            <div className="text-4xl">&#9888;</div>
            <h1 className="text-2xl font-semibold text-white">Something went wrong</h1>
            <p className="text-sm text-white/50 max-w-md">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <Button onClick={() => window.location.reload()}>Reload Page</Button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export { ErrorBoundary };
