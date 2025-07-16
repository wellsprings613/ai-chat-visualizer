import { useState } from 'react';
import { FileUp, MessageSquare, Link } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileDropZone } from './FileDropZone';
import { TextPasteArea } from './TextPasteArea';
import { ProcessingIndicator } from './ProcessingIndicator';
import { useFileUpload } from '@/hooks/useFileUpload';
import { useToast } from '@/hooks/use-toast';

interface UniversalUploadZoneProps {
  className?: string;
}

export const UniversalUploadZone = ({ className = "" }: UniversalUploadZoneProps) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [urlInput, setUrlInput] = useState('');
  const { toast } = useToast();
  
  const {
    files,
    processingStatus,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    analyzeTextContent
  } = useFileUpload();

  const handleTextProcess = async (content: string, format: any) => {
    try {
      // Create a virtual file from the text content
      const blob = new Blob([content], { type: 'text/plain' });
      const file = new File([blob], `pasted-conversation-${Date.now()}.txt`, {
        type: 'text/plain'
      });
      
      addFiles([file]);
      
      toast({
        title: "Text added",
        description: `Detected as ${format.preview}`,
      });
    } catch (error) {
      toast({
        title: "Error processing text",
        description: "Please try again",
        variant: "destructive"
      });
    }
  };

  const handleUrlImport = () => {
    if (!urlInput.trim()) {
      toast({
        title: "Enter a URL",
        description: "Please provide a valid conversation URL",
        variant: "destructive"
      });
      return;
    }

    // For now, show a placeholder message
    toast({
      title: "URL import coming soon",
      description: "This feature will be available in the next update",
    });
  };

  const hasFilesToProcess = files.some(f => 
    f.status === 'pending' && f.detectedFormat
  );

  return (
    <Card className={`min-h-[500px] ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileUp className="h-5 w-5" />
          Import AI Conversations
        </CardTitle>
        <CardDescription>
          Upload files, paste text, or import from URLs to create your interactive conversation whiteboard
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <FileUp className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="paste" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Paste Text
            </TabsTrigger>
            <TabsTrigger value="url" className="flex items-center gap-2">
              <Link className="h-4 w-4" />
              Import URL
            </TabsTrigger>
          </TabsList>

          {/* File Upload Tab */}
          <TabsContent value="upload" className="mt-6">
            <FileDropZone
              files={files}
              onFilesAdded={addFiles}
              onFileRemove={removeFile}
            />
          </TabsContent>

          {/* Paste Text Tab */}
          <TabsContent value="paste" className="mt-6">
            <TextPasteArea
              onTextProcess={handleTextProcess}
              onFormatAnalyze={analyzeTextContent}
            />
          </TabsContent>

          {/* URL Import Tab */}
          <TabsContent value="url" className="mt-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="https://chatgpt.com/share/..."
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                />
                <div className="text-sm text-muted-foreground">
                  Import from shared conversation links (ChatGPT, Claude, etc.)
                </div>
              </div>
              
              <Button 
                onClick={handleUrlImport}
                disabled={!urlInput.trim()}
                className="w-full"
              >
                Import from URL
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        {/* Processing Status */}
        <ProcessingIndicator
          status={processingStatus}
          onRetry={processFiles}
          onClear={clearFiles}
        />

        {/* Process Files Button */}
        {hasFilesToProcess && processingStatus.status === 'idle' && (
          <div className="flex justify-center pt-4 border-t">
            <Button 
              onClick={processFiles}
              size="lg"
              className="min-w-[200px]"
            >
              Process {files.filter(f => f.status === 'pending').length} File(s)
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};