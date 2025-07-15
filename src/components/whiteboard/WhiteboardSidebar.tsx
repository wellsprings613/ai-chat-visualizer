import { useState } from 'react';
import { Filter, Calendar, MessageSquare, Code, Target, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { NodeType } from '@/types/whiteboard';

interface WhiteboardSidebarProps {
  selectedNodeTypes: NodeType[];
  onNodeTypeToggle: (type: NodeType) => void;
  totalNodes: number;
  selectedNodes: number;
}

export const WhiteboardSidebar = ({
  selectedNodeTypes,
  onNodeTypeToggle,
  totalNodes,
  selectedNodes
}: WhiteboardSidebarProps) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const nodeTypes = [
    { type: 'topic' as NodeType, label: 'Topics', icon: Circle, color: 'bg-node-topic' },
    { type: 'message' as NodeType, label: 'Messages', icon: MessageSquare, color: 'bg-node-user' },
    { type: 'code' as NodeType, label: 'Code', icon: Code, color: 'bg-node-code' },
    { type: 'action' as NodeType, label: 'Actions', icon: Target, color: 'bg-node-action' }
  ];

  if (!isExpanded) {
    return (
      <div className="w-12 bg-background border-r border-border p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(true)}
          className="h-8 w-8 p-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="w-64 bg-background border-r border-border p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-lg">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(false)}
          className="h-8 w-8 p-0"
        >
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Stats */}
      <div className="mb-6 p-3 bg-muted rounded-lg">
        <div className="text-sm text-muted-foreground">Canvas Overview</div>
        <div className="text-2xl font-bold">{totalNodes}</div>
        <div className="text-sm text-muted-foreground">Total Nodes</div>
        {selectedNodes > 0 && (
          <div className="text-sm text-primary mt-1">
            {selectedNodes} selected
          </div>
        )}
      </div>

      {/* Node Type Filters */}
      <div className="space-y-4">
        <div>
          <Label className="text-sm font-medium mb-3 block">Node Types</Label>
          <div className="space-y-3">
            {nodeTypes.map(({ type, label, icon: Icon, color }) => (
              <div key={type} className="flex items-center space-x-2">
                <Checkbox
                  id={type}
                  checked={selectedNodeTypes.includes(type)}
                  onCheckedChange={() => onNodeTypeToggle(type)}
                />
                <div className="flex items-center gap-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <Label htmlFor={type} className="text-sm font-normal cursor-pointer">
                    {label}
                  </Label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Time Range */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Time Range</Label>
          <Button variant="outline" className="w-full justify-start">
            <Calendar className="h-4 w-4 mr-2" />
            All Time
          </Button>
        </div>

        <Separator />

        {/* Quick Actions */}
        <div>
          <Label className="text-sm font-medium mb-3 block">Quick Actions</Label>
          <div className="space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              Select All
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Clear Selection
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start">
              Auto Layout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};