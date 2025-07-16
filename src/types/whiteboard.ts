export interface WhiteboardNode {
  id: string;
  type: 'message';
  position: { x: number; y: number };
  data: {
    sender: 'user' | 'assistant' | 'system';
    content: string;
    timestamp?: string;
    order: number;
    preview: string; // First 100 characters
  };
}

export interface WhiteboardEdge {
  id: string;
  source: string;
  target: string;
  type: 'conversation';
}

export interface WhiteboardData {
  nodes: WhiteboardNode[];
  edges: WhiteboardEdge[];
  metadata: {
    conversationId: string;
    title: string;
    totalNodes: number;
    lastUpdated: string;
  };
}

export interface ViewportState {
  x: number;
  y: number;
  zoom: number;
}

export interface WhiteboardFilters {
  showUserMessages: boolean;
  showAssistantMessages: boolean;
  searchQuery: string;
  selectedTimeRange?: {
    start: Date;
    end: Date;
  };
}