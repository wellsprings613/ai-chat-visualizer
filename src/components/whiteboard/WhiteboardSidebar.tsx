import { X, MessageSquare, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WhiteboardNode, WhiteboardData } from '@/types/whiteboard';

interface WhiteboardSidebarProps {
  selectedNode?: WhiteboardNode;
  conversationData: WhiteboardData;
  onClose: () => void;
  onNodeSelect: (nodeId: string) => void;
}

export const WhiteboardSidebar = ({ 
  selectedNode, 
  conversationData, 
  onClose, 
  onNodeSelect 
}: WhiteboardSidebarProps) => {
  return (
    <div className="w-80 border-l bg-background flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Message Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          {selectedNode ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                {selectedNode.data.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                <Badge variant={selectedNode.data.sender === 'user' ? 'default' : 'secondary'}>
                  {selectedNode.data.sender === 'user' ? 'User' : 'Assistant'}
                </Badge>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {selectedNode.data.content}
                </p>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              <MessageSquare className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>Select a message to view details</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};