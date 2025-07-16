import { AlertCircle, CheckCircle2, Loader2, Upload } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ProcessingStatus } from '@/types/conversation';

interface ProcessingIndicatorProps {
  status: ProcessingStatus;
  onRetry?: () => void;
  onClear?: () => void;
}

export const ProcessingIndicator = ({ 
  status, 
  onRetry, 
  onClear 
}: ProcessingIndicatorProps) => {
  if (status.status === 'idle') return null;

  const getStatusIcon = () => {
    switch (status.status) {
      case 'detecting':
      case 'uploading':
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin" />;
      case 'completed':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <Upload className="h-4 w-4" />;
    }
  };

  const getStatusColor = () => {
    switch (status.status) {
      case 'completed':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <Alert variant={getStatusColor()}>
        {getStatusIcon()}
        <AlertTitle>
          {status.status === 'detecting' && 'Analyzing Format'}
          {status.status === 'uploading' && 'Uploading Files'}
          {status.status === 'processing' && 'Processing Conversations'}
          {status.status === 'completed' && 'Upload Complete'}
          {status.status === 'error' && 'Processing Failed'}
        </AlertTitle>
        <AlertDescription>
          <div className="space-y-2">
            <p>{status.message}</p>
            
            {status.currentFile && (
              <p className="text-sm text-muted-foreground">
                Current file: {status.currentFile}
              </p>
            )}
            
            {(status.status === 'uploading' || status.status === 'processing') && (
              <div className="mt-3">
                <Progress value={status.progress} className="w-full" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round(status.progress)}% complete
                </p>
              </div>
            )}
            
            {status.status === 'error' && (
              <div className="flex gap-2 mt-3">
                {onRetry && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onRetry}
                  >
                    Try Again
                  </Button>
                )}
                {onClear && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onClear}
                  >
                    Clear Files
                  </Button>
                )}
              </div>
            )}
            
            {status.status === 'completed' && onClear && (
              <div className="mt-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onClear}
                >
                  Upload More Files
                </Button>
              </div>
            )}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};