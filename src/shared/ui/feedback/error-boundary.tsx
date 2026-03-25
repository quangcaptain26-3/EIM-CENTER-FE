// error-boundary.tsx
// Bắt lỗi render React (VD: undefined access, throw trong component).
// Khi API 500 hoặc lỗi khác làm component crash → hiện ErrorState thay vì màn hình trắng.

import { Component, type ErrorInfo, type ReactNode } from "react";
import { ErrorState } from "./error-state";

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Message hiển thị khi có lỗi (mặc định thân thiện) */
  fallbackMessage?: string;
  /** Gọi khi bắt được lỗi (log, report) */
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex items-center justify-center p-8">
          <ErrorState
            title="Đã có lỗi xảy ra"
            message={this.props.fallbackMessage ?? "Có lỗi xảy ra, vui lòng thử lại."}
            onRetry={this.handleRetry}
          />
        </div>
      );
    }

    return this.props.children;
  }
}
