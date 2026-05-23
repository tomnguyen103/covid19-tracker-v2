import React from 'react';
import { Alert, Button, Box } from '@mui/material';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  reset = () => this.setState({ hasError: false, message: '' });

  render() {
    if (this.state.hasError) {
      return (
        <Box className="p-4">
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={this.reset}>
                Retry
              </Button>
            }
          >
            Something went wrong: {this.state.message}
          </Alert>
        </Box>
      );
    }
    return this.props.children;
  }
}
