import { useState } from 'react';
import { MessageSquare, Sparkles, Type, FileText } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DetectedFormat } from '@/types/conversation';
import { generatePreviewText } from '@/lib/format-detection';

interface TextPasteAreaProps {
  onTextProcess: (content: string, format: DetectedFormat) => void;
  onFormatAnalyze: (content: string) => DetectedFormat;
  className?: string;
}

export const TextPasteArea = ({ 
  onTextProcess, 
  onFormatAnalyze,
  className = ""
}: TextPasteAreaProps) => {
  const [textContent, setTextContent] = useState('');
  const [detectedFormat, setDetectedFormat] = useState<DetectedFormat | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const content = e.target.value;
    setTextContent(content);
    
    // Auto-analyze if content is substantial
    if (content.length > 100) {
      setIsAnalyzing(true);
      // Debounce the analysis
      setTimeout(() => {
        const format = onFormatAnalyze(content);
        setDetectedFormat(format);
        setIsAnalyzing(false);
      }, 500);
    } else {
      setDetectedFormat(null);
    }
  };

  const handleProcess = () => {
    if (textContent.trim() && detectedFormat) {
      onTextProcess(textContent, detectedFormat);
    }
  };

  const getFormatIcon = (type: string) => {
    switch (type) {
      case 'chatgpt_json':
        return <MessageSquare className="h-4 w-4" />;
      case 'claude_text':
        return <Sparkles className="h-4 w-4" />;
      case 'generic_chat':
        return <Type className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getFormatColor = (confidence: number) => {
    if (confidence >= 0.8) return 'default';
    if (confidence >= 0.6) return 'secondary';
    return 'outline';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-4">
        <Textarea
          placeholder="Paste your conversation text here... We'll automatically detect the format"
          value={textContent}
          onChange={handleTextChange}
          className="min-h-[200px] resize-none"
        />
        
        <div className="text-sm text-muted-foreground">
          Supports: ChatGPT exports, Claude conversations, generic chat formats, and more
        </div>
      </div>

      {/* Format Detection Results */}
      {(detectedFormat || isAnalyzing) && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              {isAnalyzing ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  Analyzing format...
                </>
              ) : (
                <>
                  {getFormatIcon(detectedFormat!.type)}
                  Format Detected
                </>
              )}
            </CardTitle>
          </CardHeader>
          
          {detectedFormat && !isAnalyzing && (
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={getFormatColor(detectedFormat.confidence)}>
                      {detectedFormat.preview}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {Math.round(detectedFormat.confidence * 100)}% confidence
                    </span>
                  </div>
                </div>
                
                {detectedFormat.messageCount && (
                  <div className="text-sm text-muted-foreground">
                    Estimated {detectedFormat.messageCount} messages
                    {detectedFormat.estimatedTokens && (
                      <> • ~{detectedFormat.estimatedTokens.toLocaleString()} tokens</>
                    )}
                  </div>
                )}
                
                <div className="text-sm text-muted-foreground border-l-2 border-muted pl-3">
                  <strong>Preview:</strong> {generatePreviewText(textContent, 150)}
                </div>
              </div>
            </CardContent>
          )}
        </Card>
      )}

      {/* Process Button */}
      <div className="flex justify-end">
        <Button 
          onClick={handleProcess}
          disabled={!textContent.trim() || !detectedFormat || isAnalyzing}
          className="min-w-[140px]"
        >
          Process Conversation
        </Button>
      </div>
    </div>
  );
};