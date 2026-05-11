import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { isDev } from '@/app/config/env';

interface Props {
  children: ReactNode;
  fallbackMessage?: string;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <AlertCircle className="mx-auto size-12 text-red-400" strokeWidth={1.25} />
            <h1 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">
              {this.props.fallbackMessage ?? 'Đã xảy ra lỗi.'}
            </h1>
            <Button type="button" className="mt-6" onClick={() => this.setState({ hasError: false, error: null })}>
              Thử lại
            </Button>
            {isDev && this.state.error ? (
              <pre className="mt-6 max-h-48 overflow-auto rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-base)] p-3 text-left text-xs text-red-300">
                {this.state.error.stack ?? this.state.error.message}
              </pre>
            ) : null}
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
