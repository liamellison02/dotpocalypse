import React, { Component, ErrorInfo, ReactNode } from 'react';
import styled from 'styled-components';
import { Window, Button } from 'react95';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorContainer = styled.div`
  padding: 20px;
  text-align: center;
`;

const ErrorMessage = styled.div`
  margin: 20px 0;
  padding: 10px;
  background-color: #efefef;
  border: 2px solid #c0c0c0;
`;

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
  }

  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <ErrorContainer>
          <ErrorMessage>
            <h3>Something went wrong</h3>
            <p>There was an error rendering this component.</p>
            {this.state.error && (
              <details>
                <summary>Error details</summary>
                <p>{this.state.error.toString()}</p>
              </details>
            )}
          </ErrorMessage>
          <Button onClick={this.resetError}>Try Again</Button>
        </ErrorContainer>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
