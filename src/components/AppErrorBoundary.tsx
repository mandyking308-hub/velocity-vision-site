import { Component, ReactNode } from "react";
import { reportClientError } from "@/lib/clientErrorReport";

interface Props { children: ReactNode }
interface State { hasError: boolean }

/**
 * Top-level customer-facing error boundary.
 * Shows a calm recovery screen and reports only sanitised technical context.
 */
export default class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    const pathname = typeof window !== "undefined" ? window.location.pathname : "";
    void reportClientError(error, pathname);
  }

  private handleReload = () => {
    this.setState({ hasError: false });
    if (typeof window !== "undefined") window.location.reload();
  };

  render() {
    if (!this.state.hasError) return this.props.children;
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground">
            Your work is safe. This page hit an unexpected error and our team has been notified
            with technical details only — no personal or campaign data was sent.
          </p>
          <div className="flex gap-3 justify-center pt-2">
            <button
              onClick={this.handleReload}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Reload the page
            </button>
            <a
              href="/contact"
              className="inline-flex items-center rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Contact support
            </a>
          </div>
        </div>
      </div>
    );
  }
}
