import * as React from 'react';

interface Props {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-[60vh] flex items-center justify-center p-8">
          <div className="glass-strong p-16 rounded-[3rem] border-white/80 shadow-2xl max-w-2xl w-full text-center">
            <div className="w-24 h-24 bg-rose-50 rounded-[1.5rem] flex items-center justify-center mx-auto mb-10 shadow-inner">
               <svg className="w-12 h-12 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
               </svg>
            </div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-4">Protocol Divergence Detected</h1>
            <p className="text-sm text-slate-500 font-black uppercase tracking-widest leading-relaxed mb-10 opacity-70">
              The system encountered an unhandled exception in the analytics cluster.
            </p>
            <div className="space-y-4">
               <button
                 onClick={() => window.location.reload()}
                 className="w-full py-5 bg-slate-900 text-white rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-800 transition-all shadow-xl"
               >
                 Re-initialize Interface
               </button>
               <button
                 onClick={() => window.location.href = '/'}
                 className="w-full py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl font-black text-[11px] uppercase tracking-[0.3em] hover:bg-slate-50 transition-all"
               >
                 Return to Primary Node
               </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
