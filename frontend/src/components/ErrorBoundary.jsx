import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("EduMind Application Render Error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch {}
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F4EFE6] text-[#1C1917] flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#E6DFD3] shadow-[0_4px_24px_rgba(40,30,20,0.06)] p-6 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#173F3D] text-white flex items-center justify-center text-xl font-bold">
              !
            </div>
            <h2 className="text-lg font-bold text-[#1C1917]">
              Something unexpected occurred
            </h2>
            <p className="text-xs text-[#78716C] leading-relaxed">
              EduMind AI encountered a runtime state issue. You can reload the page or reset the local workspace cache to restore normal operation.
            </p>
            {this.state.error && (
              <div className="p-3 bg-[#FAF7F2] border border-[#E6DFD3] rounded-xl text-left font-mono text-[11px] text-[#173F3D] overflow-x-auto max-h-32">
                {this.state.error.toString()}
              </div>
            )}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-3 bg-[#FAF7F2] hover:bg-[#F2EAE0] text-[#1C1917] font-semibold text-xs rounded-xl border border-[#E6DFD3] transition-colors"
              >
                Reload Page
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 py-2 px-3 bg-[#173F3D] hover:bg-[#102B2A] text-white font-semibold text-xs rounded-xl transition-colors shadow-sm"
              >
                Reset & Clear Cache
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
