import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Bot, ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { WhiteboardNode } from '@/types/whiteboard';

interface ConversationNodeProps {
  node: WhiteboardNode;
  isSelected?: boolean;
  onSelect?: (nodeId: string) => void;
}

export const ConversationNode = ({ node, isSelected, onSelect }: ConversationNodeProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { sender, content, timestamp, order, preview } = node.data;

  const handleClick = () => {
    onSelect?.(node.id);
  };

  const handleToggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };

  const getSenderIcon = () => {
    return sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />;
  };

  const getSenderColor = () => {
    return sender === 'user' 
      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100' 
      : 'bg-green-50 border-green-200 hover:bg-green-100';
  };

  const displayContent = isExpanded ? content : preview;
  const needsExpansion = content.length > preview.length;

  return (
    <Card 
      className={`
        w-80 cursor-pointer transition-all duration-200 hover:shadow-md
        ${getSenderColor()}
        ${isSelected ? 'ring-2 ring-primary' : ''}
      `}
      onClick={handleClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSenderIcon()}
            <Badge variant={sender === 'user' ? 'default' : 'secondary'}>
              {sender === 'user' ? 'User' : 'Assistant'}
            </Badge>
            <span className="text-xs text-muted-foreground">#{order + 1}</span>
          </div>
          
          {timestamp && (
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {new Date(timestamp).toLocaleTimeString()}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="text-sm leading-relaxed">
          {displayContent}
          {displayContent.endsWith('...') && !isExpanded && (
            <span className="text-muted-foreground"> (truncated)</span>
          )}
        </div>
        
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-6 px-2 text-xs"
            onClick={handleToggleExpand}
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                Show More
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};