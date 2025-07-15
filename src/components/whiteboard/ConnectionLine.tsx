import { useMemo } from 'react';
import { Connection, ConversationNode } from '@/types/whiteboard';
import * as d3 from 'd3';

interface ConnectionLineProps {
  connection: Connection;
  nodes: ConversationNode[];
  isActive?: boolean;
  opacity?: number;
}

export const ConnectionLine = ({ 
  connection, 
  nodes, 
  isActive = false, 
  opacity = 1 
}: ConnectionLineProps) => {
  const pathData = useMemo(() => {
    const fromNode = nodes.find(n => n.id === connection.from);
    const toNode = nodes.find(n => n.id === connection.to);
    
    if (!fromNode || !toNode) return '';

    // Calculate connection points from node centers
    const fromCenter = {
      x: fromNode.position.x + fromNode.size.width / 2,
      y: fromNode.position.y + fromNode.size.height / 2
    };
    
    const toCenter = {
      x: toNode.position.x + toNode.size.width / 2,
      y: toNode.position.y + toNode.size.height / 2
    };

    // Calculate edge points on node boundaries
    const fromEdge = getEdgePoint(fromCenter, fromNode.size, toCenter);
    const toEdge = getEdgePoint(toCenter, toNode.size, fromCenter);

    // Create smooth curved path
    const dx = toEdge.x - fromEdge.x;
    const dy = toEdge.y - fromEdge.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Control points for smooth curve
    const controlOffset = Math.min(distance * 0.4, 100);
    const controlX1 = fromEdge.x + controlOffset;
    const controlY1 = fromEdge.y;
    const controlX2 = toEdge.x - controlOffset;
    const controlY2 = toEdge.y;

    return `M ${fromEdge.x} ${fromEdge.y} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${toEdge.x} ${toEdge.y}`;
  }, [connection, nodes]);

  const getEdgePoint = (center: { x: number; y: number }, size: { width: number; height: number }, target: { x: number; y: number }) => {
    const dx = target.x - center.x;
    const dy = target.y - center.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance === 0) return center;
    
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    
    // Calculate intersection with rectangle boundary
    const slope = dy / dx;
    const absSlope = Math.abs(slope);
    
    if (absSlope <= halfHeight / halfWidth) {
      // Intersection with left/right edge
      const edgeX = dx > 0 ? halfWidth : -halfWidth;
      const edgeY = edgeX * slope;
      return { x: center.x + edgeX, y: center.y + edgeY };
    } else {
      // Intersection with top/bottom edge
      const edgeY = dy > 0 ? halfHeight : -halfHeight;
      const edgeX = edgeY / slope;
      return { x: center.x + edgeX, y: center.y + edgeY };
    }
  };

  if (!pathData) return null;

  return (
    <g>
      {/* Connection line */}
      <path
        d={pathData}
        className={isActive ? "connection-active" : "connection-line"}
        style={{ opacity }}
        strokeDasharray={isActive ? "5,5" : "none"}
      />
      
      {/* Arrowhead */}
      <defs>
        <marker
          id={`arrowhead-${connection.id}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isActive ? "hsl(var(--connection-active))" : "hsl(var(--connection-line))"}
            opacity={opacity}
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        className={isActive ? "connection-active" : "connection-line"}
        style={{ opacity }}
        fill="none"
        markerEnd={`url(#arrowhead-${connection.id})`}
      />
    </g>
  );
};