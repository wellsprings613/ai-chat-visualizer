export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export type NodeType = 'topic' | 'message' | 'code' | 'action';

export interface ConversationNode {
  id: string;
  type: NodeType;
  title: string;
  content: string;
  position: Position;
  size: Size;
  connections: string[];
  timestamp: string;
  selected?: boolean;
  sender?: 'user' | 'ai';
}

export interface Connection {
  id: string;
  from: string;
  to: string;
  points: Position[];
}

export interface Conversation {
  id: string;
  title: string;
  nodes: ConversationNode[];
  connections: Connection[];
  metadata: {
    totalNodes: number;
    conversationDuration: string;
    mainTopics: string[];
  };
}

export interface ViewportState {
  zoom: number;
  pan: Position;
  bounds: Bounds;
}

export interface CanvasState {
  viewport: ViewportState;
  selectedNodes: string[];
  draggedNode: string | null;
  searchQuery: string;
  filters: {
    nodeTypes: NodeType[];
    timeRange: [Date, Date] | null;
  };
}