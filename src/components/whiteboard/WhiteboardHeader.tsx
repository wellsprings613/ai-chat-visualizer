import { Search, Filter, Download, Share, PanelRightOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { WhiteboardFilters } from '@/types/whiteboard';

interface WhiteboardHeaderProps {
  title: string;
  totalMessages: number;
  filters: WhiteboardFilters;
  onFilterChange: (filters: Partial<WhiteboardFilters>) => void;
  onToggleSidebar: () => void;
}

export const WhiteboardHeader = ({ 
  title, 
  totalMessages, 
  filters, 
  onFilterChange, 
  onToggleSidebar 
}: WhiteboardHeaderProps) => {
  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            <Badge variant="secondary">{totalMessages} messages</Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search messages..."
              value={filters.searchQuery}
              onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
              className="pl-9 w-64"
            />
          </div>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h3 className="font-medium">Message Filters</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-user">Show User Messages</Label>
                    <Switch
                      id="show-user"
                      checked={filters.showUserMessages}
                      onCheckedChange={(checked) => onFilterChange({ showUserMessages: checked })}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="show-assistant">Show Assistant Messages</Label>
                    <Switch
                      id="show-assistant"
                      checked={filters.showAssistantMessages}
                      onCheckedChange={(checked) => onFilterChange({ showAssistantMessages: checked })}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>

          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>

          <Button variant="outline" size="sm" onClick={onToggleSidebar}>
            <PanelRightOpen className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};