import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { isDev } from '@/app/config/env';

interface Props {
  children: ReactNode;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error?: Error | null;
}

/** Bọc route: reset khi `resetKey` (pathname) đổi */
export class RouteErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[RouteErrorBoundary]', error, info.componentStack);
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-8">
          <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center">
            <AlertCircle className="mx-auto size-12 text-red-400" strokeWidth={1.25} />
            <h2 className="mt-4 font-display text-lg font-semibold text-[var(--text-primary)]">Trang không tải được</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Đã xảy ra lỗi khi hiển thị nội dung. Bạn có thể thử lại hoặc quay lại sau.
            </p>
            <Button
              type="button"
              className="mt-6"
              onClick={() => this.setState({ hasError: false, error: null })}
            >
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
