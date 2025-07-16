import { useState, useEffect } from 'react';
import { InteractiveCanvas } from './InteractiveCanvas';
import { WhiteboardHeader } from './WhiteboardHeader';
import { WhiteboardSidebar } from './WhiteboardSidebar';
import { WhiteboardData, WhiteboardFilters } from '@/types/whiteboard';
import { ConversationMessage } from '@/types/conversation';
import { generatePreviewText } from '@/lib/format-detection';

interface WhiteboardContainerProps {
  conversationId: string;
  title: string;
  messages: ConversationMessage[];
}

export const WhiteboardContainer = ({ conversationId, title, messages }: WhiteboardContainerProps) => {
  const [whiteboardData, setWhiteboardData] = useState<WhiteboardData | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [filters, setFilters] = useState<WhiteboardFilters>({
    showUserMessages: true,
    showAssistantMessages: true,
    searchQuery: ''
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Convert messages to whiteboard data
  useEffect(() => {
    if (!messages || messages.length === 0) return;

    const nodes = messages.map((message, index) => ({
      id: message.id,
      type: 'message' as const,
      position: { x: 0, y: 0 }, // Will be set by auto-layout
      data: {
        sender: message.role as 'user' | 'assistant' | 'system',
        content: message.content,
        timestamp: message.timestamp?.toISOString(),
        order: index,
        preview: generatePreviewText(message.content, 150)
      }
    }));

    const edges = messages.slice(1).map((message, index) => ({
      id: `edge-${index}`,
      source: messages[index].id,
      target: message.id,
      type: 'conversation' as const
    }));

    setWhiteboardData({
      nodes,
      edges,
      metadata: {
        conversationId,
        title,
        totalNodes: nodes.length,
        lastUpdated: new Date().toISOString()
      }
    });
  }, [messages, conversationId, title]);

  // Apply filters to nodes
  const filteredData = whiteboardData ? {
    ...whiteboardData,
    nodes: whiteboardData.nodes.filter(node => {
      const { sender, content } = node.data;
      
      // Filter by sender type
      if (!filters.showUserMessages && sender === 'user') return false;
      if (!filters.showAssistantMessages && sender === 'assistant') return false;
      
      // Filter by search query
      if (filters.searchQuery && !content.toLowerCase().includes(filters.searchQuery.toLowerCase())) {
        return false;
      }
      
      return true;
    }),
    edges: whiteboardData.edges.filter(edge => {
      // Only show edges where both source and target nodes are visible
      const sourceVisible = whiteboardData.nodes.some(node => 
        node.id === edge.source && 
        ((filters.showUserMessages && node.data.sender === 'user') || 
         (filters.showAssistantMessages && node.data.sender === 'assistant'))
      );
      const targetVisible = whiteboardData.nodes.some(node => 
        node.id === edge.target && 
        ((filters.showUserMessages && node.data.sender === 'user') || 
         (filters.showAssistantMessages && node.data.sender === 'assistant'))
      );
      return sourceVisible && targetVisible;
    })
  } : null;

  const handleNodeSelect = (nodeId: string) => {
    setSelectedNodeId(selectedNodeId === nodeId ? null : nodeId);
    setIsSidebarOpen(true);
  };

  const handleFilterChange = (newFilters: Partial<WhiteboardFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const selectedNode = filteredData?.nodes.find(node => node.id === selectedNodeId);

  if (!filteredData) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading whiteboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <WhiteboardHeader
        title={title}
        totalMessages={filteredData.nodes.length}
        filters={filters}
        onFilterChange={handleFilterChange}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div className="flex-1 relative">
          <InteractiveCanvas
            data={filteredData}
            onNodeSelect={handleNodeSelect}
            selectedNodeId={selectedNodeId}
          />
        </div>
        
        {isSidebarOpen && (
          <WhiteboardSidebar
            selectedNode={selectedNode}
            conversationData={filteredData}
            onClose={() => setIsSidebarOpen(false)}
            onNodeSelect={handleNodeSelect}
          />
        )}
      </div>
    </div>
  );
};