import React from "react";
import { AlertTriangle, RefreshCw, Home, LogOut, ChevronDown, ChevronUp } from "lucide-react";
import { clearToken } from "../lib/api";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("KhataNex Global ErrorBoundary caught an unhandled error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReload = () => {
    window.location.reload();
  };

  handleHome = () => {
    window.location.href = "/";
  };

  handleSignOut = () => {
    clearToken();
    window.location.href = "/login";
  };

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4 sm:p-6">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600 ring-8 ring-red-50/50">
              <AlertTriangle size={32} />
            </div>

            <h1 className="mt-5 text-2xl font-bold text-slate-900">
              Something went wrong
            </h1>

            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              We encountered an unexpected error while loading this screen. Your data and account remain safe. You can reload the view or return to your dashboard.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={this.handleReload}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
              >
                <RefreshCw size={16} />
                <span>Reload Page</span>
              </button>

              <button
                type="button"
                onClick={this.handleHome}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-xs hover:bg-slate-50 transition"
              >
                <Home size={16} />
                <span>Go to Home</span>
              </button>

              <button
                type="button"
                onClick={this.handleSignOut}
                className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 shadow-xs hover:bg-red-50 transition"
              >
                <LogOut size={16} />
                <span>Sign In Again</span>
              </button>
            </div>

            {/* Error Diagnostics Toggle */}
            {this.state.error && (
              <div className="mt-6 border-t border-slate-100 pt-4 text-left">
                <button
                  type="button"
                  onClick={() => this.setState((prev) => ({ showDetails: !prev.showDetails }))}
                  className="flex items-center justify-between w-full text-xs font-semibold text-slate-500 hover:text-slate-800"
                >
                  <span>Diagnostic Details</span>
                  {this.state.showDetails ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>

                {this.state.showDetails && (
                  <div className="mt-2.5 rounded-xl bg-slate-900 p-3 text-xs text-red-300 font-mono overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {this.state.error.toString()}
                    {this.state.errorInfo?.componentStack && (
                      <div className="mt-2 text-slate-400 text-[11px]">
                        {this.state.errorInfo.componentStack}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
