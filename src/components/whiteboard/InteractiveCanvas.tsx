import { useState, useRef, useCallback, useEffect } from 'react';
import { ConversationNode } from './ConversationNode';
import { ConnectionLine } from './ConnectionLine';
import { WhiteboardData, ViewportState } from '@/types/whiteboard';

interface InteractiveCanvasProps {
  data: WhiteboardData;
  onNodeSelect?: (nodeId: string) => void;
  selectedNodeId?: string;
}

export const InteractiveCanvas = ({ data, onNodeSelect, selectedNodeId }: InteractiveCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewport, setViewport] = useState<ViewportState>({ x: 0, y: 0, zoom: 1 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Auto-layout nodes in a flowing conversation layout
  useEffect(() => {
    if (data.nodes.length === 0) return;

    const layoutNodes = () => {
      const nodeSpacing = 400; // Horizontal spacing between nodes
      const verticalSpacing = 200; // Vertical spacing for alternating layout
      
      return data.nodes.map((node, index) => {
        // Alternate between user (top) and assistant (bottom) positions
        const isUser = node.data.sender === 'user';
        const x = index * nodeSpacing + 100;
        const y = isUser ? 100 : 350;
        
        return {
          ...node,
          position: { x, y }
        };
      });
    };

    // Update node positions
    const updatedNodes = layoutNodes();
    data.nodes = updatedNodes;
  }, [data.nodes.length]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - viewport.x, y: e.clientY - viewport.y });
    }
  }, [viewport]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setViewport(prev => ({
        ...prev,
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      }));
    }
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setViewport(prev => ({
      ...prev,
      zoom: Math.max(0.3, Math.min(2, prev.zoom * delta))
    }));
  }, []);

  return (
    <div 
      ref={canvasRef}
      className="w-full h-full bg-background overflow-hidden cursor-grab active:cursor-grabbing relative"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
    >
      <div
        className="absolute inset-0"
        style={{
          transform: `translate(${viewport.x}px, ${viewport.y}px) scale(${viewport.zoom})`,
          transformOrigin: '0 0',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
        }}
      >
        {/* Background grid */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <defs>
            <pattern
              id="grid"
              width="50"
              height="50"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M 50 0 L 0 0 0 50"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="1"
                opacity="0.2"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Connection lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {data.edges.map((edge) => {
            const sourceNode = data.nodes.find(n => n.id === edge.source);
            const targetNode = data.nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;
            
            const isHighlighted = selectedNodeId === edge.source || selectedNodeId === edge.target;
            
            return (
              <ConnectionLine
                key={edge.id}
                sourceX={sourceNode.position.x + 160} // Center of node (320px width / 2)
                sourceY={sourceNode.position.y + 80}  // Center of node height
                targetX={targetNode.position.x + 160}
                targetY={targetNode.position.y + 80}
                isHighlighted={isHighlighted}
              />
            );
          })}
        </svg>

        {/* Nodes */}
        {data.nodes.map((node) => (
          <div
            key={node.id}
            className="absolute pointer-events-auto"
            style={{
              left: node.position.x,
              top: node.position.y,
              zIndex: selectedNodeId === node.id ? 10 : 1
            }}
          >
            <ConversationNode
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={onNodeSelect}
            />
          </div>
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-background border rounded-md p-2 shadow-md">
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.min(2, prev.zoom * 1.2) }))}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          +
        </button>
        <span className="text-xs text-center px-2">{Math.round(viewport.zoom * 100)}%</span>
        <button
          onClick={() => setViewport(prev => ({ ...prev, zoom: Math.max(0.3, prev.zoom * 0.8) }))}
          className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
        >
          -
        </button>
      </div>
    </div>
  );
};