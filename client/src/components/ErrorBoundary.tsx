import { cn } from "@/lib/utils";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
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

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error: error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-8 bg-[#111015] text-[#f3eee6]">
          <div className="flex flex-col items-center w-full max-w-lg p-8 text-center rounded-sm border hairline bg-[#151219]">
            <AlertTriangle
              size={48}
              className="text-amethyst mb-6 flex-shrink-0"
            />

            <h2 className="font-display mb-4 text-2xl">Something went wrong.</h2>

            <p className="mb-6 text-[#8f8996]">
              We're sorry, but something unexpected happened. Please try again.
            </p>

            <button
              onClick={() => window.location.reload()}
              className="focus-ring inline-flex items-center gap-2 px-4 py-2 rounded-lg text-amethyst hover:text-[#f3eee6] transition-colors"
            >
              <RotateCcw size={16} />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
