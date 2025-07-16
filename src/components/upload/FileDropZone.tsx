import { useCallback } from 'react';
import { Upload, FileText, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UploadFile } from '@/types/conversation';
import { formatFileSize } from '@/lib/format-detection';

interface FileDropZoneProps {
  files: UploadFile[];
  onFilesAdded: (files: File[]) => void;
  onFileRemove: (fileId: string) => void;
  className?: string;
}

export const FileDropZone = ({ 
  files, 
  onFilesAdded, 
  onFileRemove,
  className = ""
}: FileDropZoneProps) => {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    onFilesAdded(droppedFiles);
  }, [onFilesAdded]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      onFilesAdded(selectedFiles);
    }
  }, [onFilesAdded]);

  const getStatusIcon = (file: UploadFile) => {
    switch (file.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (file: UploadFile) => {
    const variants = {
      pending: 'secondary',
      analyzing: 'outline',
      uploading: 'outline',
      processing: 'outline',
      completed: 'default',
      error: 'destructive'
    } as const;

    return (
      <Badge variant={variants[file.status]}>
        {file.status === 'analyzing' && 'Analyzing...'}
        {file.status === 'uploading' && `${Math.round(file.progress)}%`}
        {file.status === 'processing' && 'Processing...'}
        {file.status === 'completed' && 'Ready'}
        {file.status === 'error' && 'Error'}
        {file.status === 'pending' && 'Ready'}
      </Badge>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Drop Zone */}
      <div
        className="relative border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".json,.txt,.pdf,.csv,.zip"
          onChange={handleFileInput}
          className="hidden"
        />
        
        <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Drop conversation files here</h3>
        <p className="text-muted-foreground mb-4">or click to browse</p>
        <div className="text-sm text-muted-foreground">
          Supports: ChatGPT JSON, Claude TXT, PDF exports, CSV files
          <br />
          Maximum file size: 50MB
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium">Uploaded Files</h4>
          <div className="space-y-2">
            {files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 border rounded-lg bg-card"
              >
                <div className="flex items-center space-x-3 flex-1">
                  {getStatusIcon(file)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {file.file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                      <span>{formatFileSize(file.file.size)}</span>
                      {file.detectedFormat && (
                        <>
                          <span>•</span>
                          <span className="font-medium">
                            {file.detectedFormat.preview}
                          </span>
                          <span>•</span>
                          <span>
                            {Math.round(file.detectedFormat.confidence * 100)}% confidence
                          </span>
                        </>
                      )}
                    </div>
                    {file.error && (
                      <p className="text-xs text-destructive mt-1">
                        {file.error}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(file)}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onFileRemove(file.id)}
                    disabled={file.status === 'uploading' || file.status === 'processing'}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};