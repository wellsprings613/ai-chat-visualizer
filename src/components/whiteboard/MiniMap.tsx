import { useMemo } from 'react';
import { ConversationNode, ViewportState } from '@/types/whiteboard';
import { cn } from '@/lib/utils';

interface MiniMapProps {
  nodes: ConversationNode[];
  viewport: ViewportState;
  onViewportChange: (pan: { x: number; y: number }) => void;
  canvasSize: { width: number; height: number };
}

export const MiniMap = ({ 
  nodes, 
  viewport, 
  onViewportChange, 
  canvasSize 
}: MiniMapProps) => {
  const miniMapSize = { width: 200, height: 150 };
  
  const { bounds, scale } = useMemo(() => {
    if (nodes.length === 0) {
      return { 
        bounds: { minX: 0, minY: 0, maxX: 1000, maxY: 1000 },
        scale: 1
      };
    }

    // Calculate bounds of all nodes
    const minX = Math.min(...nodes.map(n => n.position.x));
    const minY = Math.min(...nodes.map(n => n.position.y));
    const maxX = Math.max(...nodes.map(n => n.position.x + n.size.width));
    const maxY = Math.max(...nodes.map(n => n.position.y + n.size.height));

    // Add padding
    const padding = 50;
    const bounds = {
      minX: minX - padding,
      minY: minY - padding,
      maxX: maxX + padding,
      maxY: maxY + padding
    };

    // Calculate scale to fit content in minimap
    const contentWidth = bounds.maxX - bounds.minX;
    const contentHeight = bounds.maxY - bounds.minY;
    const scale = Math.min(
      miniMapSize.width / contentWidth,
      miniMapSize.height / contentHeight
    );

    return { bounds, scale };
  }, [nodes]);

  const getNodeColor = (node: ConversationNode) => {
    switch (node.type) {
      case 'topic':
        return 'hsl(var(--topic-node))';
      case 'message':
        return node.sender === 'ai' ? 'hsl(var(--ai-response))' : 'hsl(var(--user-message))';
      case 'code':
        return 'hsl(var(--code-block))';
      case 'action':
        return 'hsl(var(--action-item))';
      default:
        return 'hsl(var(--muted))';
    }
  };

  const handleMiniMapClick = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Convert minimap coordinates to canvas coordinates
    const canvasX = (x / scale) + bounds.minX;
    const canvasY = (y / scale) + bounds.minY;

    // Center the viewport on the clicked position
    const newPan = {
      x: -canvasX * viewport.zoom + canvasSize.width / 2,
      y: -canvasY * viewport.zoom + canvasSize.height / 2
    };

    onViewportChange(newPan);
  };

  // Calculate viewport rectangle in minimap coordinates
  const viewportRect = {
    x: (-viewport.pan.x / viewport.zoom - bounds.minX) * scale,
    y: (-viewport.pan.y / viewport.zoom - bounds.minY) * scale,
    width: (canvasSize.width / viewport.zoom) * scale,
    height: (canvasSize.height / viewport.zoom) * scale
  };

  return (
    <div className="fixed bottom-4 right-4 z-40">
      <div className="mini-map p-2">
        <div className="text-xs text-muted-foreground mb-2">Mini Map</div>
        <div
          className="relative bg-canvas-background border border-border rounded cursor-pointer overflow-hidden"
          style={{ width: miniMapSize.width, height: miniMapSize.height }}
          onClick={handleMiniMapClick}
        >
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-20">
            <svg width="100%" height="100%">
              <defs>
                <pattern
                  id="minimap-grid"
                  width={20 * scale}
                  height={20 * scale}
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d={`M ${20 * scale} 0 L 0 0 0 ${20 * scale}`}
                    fill="none"
                    stroke="hsl(var(--border))"
                    strokeWidth="1"
                  />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#minimap-grid)" />
            </svg>
          </div>

          {/* Nodes */}
          {nodes.map((node) => {
            const x = (node.position.x - bounds.minX) * scale;
            const y = (node.position.y - bounds.minY) * scale;
            const width = node.size.width * scale;
            const height = node.size.height * scale;

            return (
              <div
                key={node.id}
                className="absolute rounded-sm"
                style={{
                  left: x,
                  top: y,
                  width: Math.max(width, 4),
                  height: Math.max(height, 4),
                  backgroundColor: getNodeColor(node),
                  opacity: 0.8
                }}
              />
            );
          })}

          {/* Viewport indicator */}
          <div
            className="absolute border-2 border-primary bg-primary/20 rounded"
            style={{
              left: Math.max(0, viewportRect.x),
              top: Math.max(0, viewportRect.y),
              width: Math.min(viewportRect.width, miniMapSize.width - Math.max(0, viewportRect.x)),
              height: Math.min(viewportRect.height, miniMapSize.height - Math.max(0, viewportRect.y))
            }}
          />
        </div>
      </div>
    </div>
  );
};