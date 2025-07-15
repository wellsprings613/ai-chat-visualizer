import { useRef, useEffect, useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { ConversationNode } from './ConversationNode';
import { ConnectionLine } from './ConnectionLine';
import { MiniMap } from './MiniMap';
import { 
  ConversationNode as NodeType, 
  ViewportState, 
  Connection,
  Position 
} from '@/types/whiteboard';
import { cn } from '@/lib/utils';

interface InteractiveCanvasProps {
  nodes: NodeType[];
  connections: Connection[];
  viewport: ViewportState;
  selectedNodes: string[];
  searchQuery: string;
  onViewportChange: (viewport: ViewportState) => void;
  onNodeSelect: (nodeId: string, multi: boolean) => void;
  onNodeMove: (nodeId: string, position: Position) => void;
  onNodeEdit: (nodeId: string) => void;
  onCanvasClick: () => void;
}

export const InteractiveCanvas = ({
  nodes,
  connections,
  viewport,
  selectedNodes,
  searchQuery,
  onViewportChange,
  onNodeSelect,
  onNodeMove,
  onNodeEdit,
  onCanvasClick
}: InteractiveCanvasProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 1000, height: 800 });
  const [isPanning, setIsPanning] = useState(false);
  const [lastPanPoint, setLastPanPoint] = useState({ x: 0, y: 0 });
  
  // Handle canvas resize
  useEffect(() => {
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setCanvasSize({ width: rect.width, height: rect.height });
      }
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  // Handle wheel zoom
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, viewport.zoom * delta));
    
    if (newZoom !== viewport.zoom) {
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        
        // Zoom towards mouse position
        const zoomFactor = newZoom / viewport.zoom;
        const newPan = {
          x: mouseX - zoomFactor * (mouseX - viewport.pan.x),
          y: mouseY - zoomFactor * (mouseY - viewport.pan.y)
        };
        
        onViewportChange({
          ...viewport,
          zoom: newZoom,
          pan: newPan
        });
      }
    }
  }, [viewport, onViewportChange]);

  // Handle mouse pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning) {
      const deltaX = e.clientX - lastPanPoint.x;
      const deltaY = e.clientY - lastPanPoint.y;
      
      const newPan = {
        x: viewport.pan.x + deltaX,
        y: viewport.pan.y + deltaY
      };
      
      onViewportChange({
        ...viewport,
        pan: newPan
      });
      
      setLastPanPoint({ x: e.clientX, y: e.clientY });
    }
  }, [isPanning, lastPanPoint, viewport, onViewportChange]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Add global mouse event listeners
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, handleMouseMove, handleMouseUp]);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onNodeSelect('', false); // Clear selection
      }
      if (e.key === 'Delete' && selectedNodes.length > 0) {
        // Handle delete nodes
        console.log('Delete selected nodes:', selectedNodes);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedNodes, onNodeSelect]);

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCanvasClick();
    }
  };

  const handleViewportChange = (pan: Position) => {
    onViewportChange({
      ...viewport,
      pan
    });
  };

  // Calculate canvas bounds
  const canvasBounds = {
    left: -viewport.pan.x / viewport.zoom,
    top: -viewport.pan.y / viewport.zoom,
    right: (-viewport.pan.x + canvasSize.width) / viewport.zoom,
    bottom: (-viewport.pan.y + canvasSize.height) / viewport.zoom
  };

  // Filter visible nodes for performance
  const visibleNodes = nodes.filter(node => {
    const nodeRight = node.position.x + node.size.width;
    const nodeBottom = node.position.y + node.size.height;
    
    return !(
      node.position.x > canvasBounds.right ||
      nodeRight < canvasBounds.left ||
      node.position.y > canvasBounds.bottom ||
      nodeBottom < canvasBounds.top
    );
  });

  return (
    <div 
      ref={canvasRef}
      className="flex-1 relative overflow-hidden bg-canvas-background canvas-grid cursor-grab active:cursor-grabbing"
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onClick={handleCanvasClick}
    >
      {/* Main canvas content */}
      <motion.div
        className="absolute inset-0 origin-top-left"
        style={{
          scale: viewport.zoom,
          x: viewport.pan.x,
          y: viewport.pan.y,
        }}
      >
        {/* SVG for connections */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ 
            width: canvasSize.width / viewport.zoom,
            height: canvasSize.height / viewport.zoom
          }}
        >
          {connections.map((connection) => (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              nodes={nodes}
              isActive={
                selectedNodes.includes(connection.from) ||
                selectedNodes.includes(connection.to)
              }
              opacity={searchQuery ? 0.3 : 1}
            />
          ))}
        </svg>

        {/* Nodes */}
        {visibleNodes.map((node) => (
          <ConversationNode
            key={node.id}
            node={node}
            isSelected={selectedNodes.includes(node.id)}
            onSelect={onNodeSelect}
            onMove={onNodeMove}
            onDoubleClick={onNodeEdit}
            zoom={viewport.zoom}
            searchQuery={searchQuery}
          />
        ))}
      </motion.div>

      {/* Mini Map */}
      <MiniMap
        nodes={nodes}
        viewport={viewport}
        onViewportChange={handleViewportChange}
        canvasSize={canvasSize}
      />

      {/* Canvas info overlay */}
      <div className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm border border-border rounded-lg p-3 text-sm">
        <div className="text-muted-foreground">
          Zoom: {Math.round(viewport.zoom * 100)}%
        </div>
        <div className="text-muted-foreground">
          Nodes: {visibleNodes.length} / {nodes.length}
        </div>
        {selectedNodes.length > 0 && (
          <div className="text-primary">
            Selected: {selectedNodes.length}
          </div>
        )}
      </div>
    </div>
  );
};