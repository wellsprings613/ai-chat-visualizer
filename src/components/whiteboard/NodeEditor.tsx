import { useState } from 'react';
import { X, Save, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ConversationNode, NodeType } from '@/types/whiteboard';

interface NodeEditorProps {
  node: ConversationNode;
  onSave: (nodeId: string, updates: Partial<ConversationNode>) => void;
  onCancel: () => void;
}

export const NodeEditor = ({ node, onSave, onCancel }: NodeEditorProps) => {
  const [title, setTitle] = useState(node.title);
  const [content, setContent] = useState(node.content);
  const [type, setType] = useState<NodeType>(node.type);
  const [sender, setSender] = useState<'user' | 'ai'>(node.sender || 'user');

  const handleSave = () => {
    onSave(node.id, {
      title,
      content,
      type,
      sender
    });
  };

  const nodeTypeOptions = [
    { value: 'topic', label: 'Topic' },
    { value: 'message', label: 'Message' },
    { value: 'code', label: 'Code' },
    { value: 'action', label: 'Action' }
  ];

  const senderOptions = [
    { value: 'user', label: 'User' },
    { value: 'ai', label: 'AI' }
  ];

  return (
    <Dialog open onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            Edit Node
            <Button variant="ghost" size="sm" onClick={onCancel}>
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Node Type */}
          <div className="space-y-2">
            <Label htmlFor="type">Node Type</Label>
            <Select value={type} onValueChange={(value) => setType(value as NodeType)}>
              <SelectTrigger>
                <SelectValue placeholder="Select node type" />
              </SelectTrigger>
              <SelectContent>
                {nodeTypeOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sender */}
          <div className="space-y-2">
            <Label htmlFor="sender">Sender</Label>
            <Select value={sender} onValueChange={(value) => setSender(value as 'user' | 'ai')}>
              <SelectTrigger>
                <SelectValue placeholder="Select sender" />
              </SelectTrigger>
              <SelectContent>
                {senderOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter node title"
            />
          </div>

          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter node content"
              rows={6}
              className={type === 'code' ? 'font-mono' : ''}
            />
          </div>

          {/* Node Info */}
          <div className="text-sm text-muted-foreground space-y-1">
            <div>Node ID: {node.id}</div>
            <div>Created: {new Date(node.timestamp).toLocaleString()}</div>
            <div>Connections: {node.connections.length}</div>
            <div>Position: ({Math.round(node.position.x)}, {Math.round(node.position.y)})</div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button variant="destructive" size="sm">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
          
          <div className="flex gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};