import React, { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Props {
  children: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center p-8 text-center bg-slate-50/50 rounded-[2rem] border border-slate-100 m-6">
          <div className="h-16 w-16 rounded-2xl bg-red-50 flex items-center justify-center mb-6">
            <AlertTriangle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Something went wrong</h2>
          <p className="text-slate-500 max-w-md mx-auto mb-8">
            An unexpected error occurred while loading this section. Our team has been notified.
          </p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-12 px-8 font-semibold shadow-xl border-0"
          >
            Refresh Page
          </Button>
          {process.env.NODE_ENV === 'development' && this.state.error && (
             <pre className="mt-8 p-4 bg-red-50/50 text-red-800 text-left rounded-xl text-xs overflow-auto max-w-full w-full">
                {this.state.error.message}
             </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
