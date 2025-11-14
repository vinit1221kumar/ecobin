import { Component } from 'react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });
    
    // Log error to console for debugging
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Here you could also log to an error reporting service
    // e.g., Sentry.captureException(error, { contexts: { react: errorInfo } });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div 
          className="min-h-screen flex items-center justify-center p-4"
          style={{ backgroundColor: '#0F172A' }}
        >
          <div 
            className="max-w-2xl w-full p-8 rounded-xl"
            style={{ 
              backgroundColor: '#1E293B',
              border: '2px solid #DC2626',
              boxShadow: '0 0 20px rgba(220, 38, 38, 0.3)'
            }}
          >
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 
                className="text-3xl font-bold mb-2"
                style={{ color: '#DC2626' }}
              >
                Something went wrong
              </h1>
              <p 
                className="text-lg"
                style={{ color: '#E2E8F0' }}
              >
                We're sorry, but something unexpected happened.
              </p>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div 
                className="mb-6 p-4 rounded-lg"
                style={{ 
                  backgroundColor: '#0F172A',
                  border: '1px solid #334155'
                }}
              >
                <p 
                  className="font-semibold mb-2"
                  style={{ color: '#DC2626' }}
                >
                  Error Details (Development Only):
                </p>
                <pre 
                  className="text-xs overflow-auto"
                  style={{ color: '#94A3B8' }}
                >
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 font-semibold rounded-lg text-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ backgroundColor: '#00B8A9' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#004D40'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#00B8A9'}
              >
                Go to Home
              </button>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-3 font-semibold rounded-lg transition-all duration-300"
                style={{ 
                  backgroundColor: 'transparent',
                  color: '#E2E8F0',
                  border: '2px solid #E2E8F0'
                }}
                onMouseEnter={(e) => {
                  e.target.style.backgroundColor = '#E2E8F0';
                  e.target.style.color = '#1E293B';
                }}
                onMouseLeave={(e) => {
                  e.target.style.backgroundColor = 'transparent';
                  e.target.style.color = '#E2E8F0';
                }}
              >
                Reload Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

