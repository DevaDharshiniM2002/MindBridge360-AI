import * as React from 'react';
import { RefreshCw, AlertTriangle, Home } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// @ts-ignore
export class ErrorBoundary extends React.Component<Props, State> {
  // @ts-ignore
  state: State = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  // @ts-ignore
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('MindMitra ErrorBoundary caught error:', error, errorInfo);
  }

  private handleReset = () => {
    try {
      localStorage.removeItem('mb360_active_tab');
    } catch {}
    // @ts-ignore
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    try {
      localStorage.clear();
    } catch {}
    window.location.reload();
  };

  // @ts-ignore
  render() {
    // @ts-ignore
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F9F7F2] text-[#3D3A35] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 shadow-xl border border-stone-200 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-700 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl font-bold text-stone-800 mb-2">
              MindMitra is recovering
            </h1>
            
            <p className="text-sm text-stone-600 mb-6 leading-relaxed">
              We encountered a minor issue loading your wellness space. Tap below to reload.
            </p>

            {/* @ts-ignore */}
            {this.state.error && (
              <div className="mb-6 p-3 bg-stone-50 rounded-xl text-left border border-stone-200 overflow-x-auto max-h-32 text-xs text-stone-700 font-mono">
                {/* @ts-ignore */}
                {this.state.error.toString()}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="flex-1 py-3 px-4 bg-[#4A8B8D] hover:bg-[#3E7678] active:scale-95 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload App</span>
              </button>
              
              <button
                onClick={this.handleClearStorageAndReload}
                className="py-3 px-4 bg-stone-100 hover:bg-stone-200 active:scale-95 text-stone-700 font-semibold rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Reset Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    // @ts-ignore
    return this.props.children;
  }
}
