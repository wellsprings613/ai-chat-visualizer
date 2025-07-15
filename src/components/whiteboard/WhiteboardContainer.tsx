import { useState, useCallback, useEffect } from 'react';
import { WhiteboardHeader } from './WhiteboardHeader';
import { WhiteboardSidebar } from './WhiteboardSidebar';
import { InteractiveCanvas } from './InteractiveCanvas';
import { NodeEditor } from './NodeEditor';
import { 
  ConversationNode, 
  ViewportState, 
  CanvasState, 
  NodeType,
  Position 
} from '@/types/whiteboard';
import { allConversations } from '@/data/sampleData';
import { useToast } from '@/hooks/use-toast';

export const WhiteboardContainer = () => {
  const { toast } = useToast();
  
  // Flatten all nodes from all conversations
  const allNodes = allConversations.flatMap(conv => conv.nodes);
  const allConnections = allConversations.flatMap(conv => conv.connections);

  const [canvasState, setCanvasState] = useState<CanvasState>({
    viewport: {
      zoom: 1,
      pan: { x: 0, y: 0 },
      bounds: { left: 0, top: 0, right: 2000, bottom: 2000 }
    },
    selectedNodes: [],
    draggedNode: null,
    searchQuery: '',
    filters: {
      nodeTypes: ['topic', 'message', 'code', 'action'] as NodeType[],
      timeRange: null
    }
  });

  const [nodes, setNodes] = useState<ConversationNode[]>(allNodes);
  const [editingNodeId, setEditingNodeId] = useState<string | null>(null);

  // Filter nodes based on current filters
  const filteredNodes = nodes.filter(node => {
    // Type filter
    if (!canvasState.filters.nodeTypes.includes(node.type)) return false;
    
    // Search filter
    if (canvasState.searchQuery) {
      const query = canvasState.searchQuery.toLowerCase();
      return (
        node.title.toLowerCase().includes(query) ||
        node.content.toLowerCase().includes(query)
      );
    }
    
    return true;
  });

  // Filter connections to only show connections between visible nodes
  const filteredConnections = allConnections.filter(conn => {
    const fromVisible = filteredNodes.some(n => n.id === conn.from);
    const toVisible = filteredNodes.some(n => n.id === conn.to);
    return fromVisible && toVisible;
  });

  // Viewport controls
  const handleViewportChange = useCallback((viewport: ViewportState) => {
    setCanvasState(prev => ({
      ...prev,
      viewport
    }));
  }, []);

  const handleZoomIn = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        zoom: Math.min(3, prev.viewport.zoom * 1.2)
      }
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        zoom: Math.max(0.1, prev.viewport.zoom / 1.2)
      }
    }));
  }, []);

  const handleReset = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      viewport: {
        ...prev.viewport,
        zoom: 1,
        pan: { x: 0, y: 0 }
      },
      selectedNodes: []
    }));
  }, []);

  const handleExport = useCallback(() => {
    toast({
      title: "Export Started",
      description: "Exporting canvas as PNG...",
    });
    // TODO: Implement export functionality
  }, [toast]);

  // Search
  const handleSearchChange = useCallback((query: string) => {
    setCanvasState(prev => ({
      ...prev,
      searchQuery: query
    }));
  }, []);

  // Node selection
  const handleNodeSelect = useCallback((nodeId: string, multi: boolean) => {
    setCanvasState(prev => {
      if (!nodeId) {
        return { ...prev, selectedNodes: [] };
      }

      if (multi) {
        const isSelected = prev.selectedNodes.includes(nodeId);
        return {
          ...prev,
          selectedNodes: isSelected
            ? prev.selectedNodes.filter(id => id !== nodeId)
            : [...prev.selectedNodes, nodeId]
        };
      } else {
        return {
          ...prev,
          selectedNodes: [nodeId]
        };
      }
    });
  }, []);

  // Node movement
  const handleNodeMove = useCallback((nodeId: string, position: Position) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, position } : node
    ));
  }, []);

  // Node editing
  const handleNodeEdit = useCallback((nodeId: string) => {
    setEditingNodeId(nodeId);
  }, []);

  const handleNodeSave = useCallback((nodeId: string, updates: Partial<ConversationNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
    setEditingNodeId(null);
    
    toast({
      title: "Node Updated",
      description: "Your changes have been saved.",
    });
  }, [toast]);

  // Filter controls
  const handleNodeTypeToggle = useCallback((type: NodeType) => {
    setCanvasState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        nodeTypes: prev.filters.nodeTypes.includes(type)
          ? prev.filters.nodeTypes.filter(t => t !== type)
          : [...prev.filters.nodeTypes, type]
      }
    }));
  }, []);

  const handleCanvasClick = useCallback(() => {
    setCanvasState(prev => ({
      ...prev,
      selectedNodes: []
    }));
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'a':
            e.preventDefault();
            setCanvasState(prev => ({
              ...prev,
              selectedNodes: filteredNodes.map(n => n.id)
            }));
            break;
          case 'f':
            e.preventDefault();
            // Focus search input
            (document.querySelector('input[placeholder="Search conversations..."]') as HTMLInputElement)?.focus();
            break;
          case '=':
          case '+':
            e.preventDefault();
            handleZoomIn();
            break;
          case '-':
            e.preventDefault();
            handleZoomOut();
            break;
          case '0':
            e.preventDefault();
            handleReset();
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [filteredNodes, handleZoomIn, handleZoomOut, handleReset]);

  const editingNode = editingNodeId ? nodes.find(n => n.id === editingNodeId) : null;

  return (
    <div className="h-screen flex flex-col bg-background">
      <WhiteboardHeader
        searchQuery={canvasState.searchQuery}
        onSearchChange={handleSearchChange}
        zoom={canvasState.viewport.zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onExport={handleExport}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <WhiteboardSidebar
          selectedNodeTypes={canvasState.filters.nodeTypes}
          onNodeTypeToggle={handleNodeTypeToggle}
          totalNodes={filteredNodes.length}
          selectedNodes={canvasState.selectedNodes.length}
        />
        
        <InteractiveCanvas
          nodes={filteredNodes}
          connections={filteredConnections}
          viewport={canvasState.viewport}
          selectedNodes={canvasState.selectedNodes}
          searchQuery={canvasState.searchQuery}
          onViewportChange={handleViewportChange}
          onNodeSelect={handleNodeSelect}
          onNodeMove={handleNodeMove}
          onNodeEdit={handleNodeEdit}
          onCanvasClick={handleCanvasClick}
        />
      </div>

      {editingNode && (
        <NodeEditor
          node={editingNode}
          onSave={handleNodeSave}
          onCancel={() => setEditingNodeId(null)}
        />
      )}
    </div>
  );
};