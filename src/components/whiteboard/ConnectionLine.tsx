interface ConnectionLineProps {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isHighlighted?: boolean;
}

export const ConnectionLine = ({ 
  sourceX, 
  sourceY, 
  targetX, 
  targetY, 
  isHighlighted = false 
}: ConnectionLineProps) => {
  // Calculate control points for a smooth curve
  const deltaX = targetX - sourceX;
  const deltaY = targetY - sourceY;
  
  const controlX1 = sourceX + deltaX * 0.3;
  const controlY1 = sourceY;
  const controlX2 = targetX - deltaX * 0.3;
  const controlY2 = targetY;

  const pathData = `M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}`;

  return (
    <g>
      <path
        d={pathData}
        stroke={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
        strokeWidth={isHighlighted ? 3 : 2}
        fill="none"
        strokeDasharray={isHighlighted ? "0" : "5,5"}
        opacity={isHighlighted ? 1 : 0.6}
        className="transition-all duration-300"
      />
      
      {/* Arrow marker */}
      <defs>
        <marker
          id={`arrowhead-${isHighlighted ? 'highlighted' : 'normal'}`}
          markerWidth="10"
          markerHeight="7"
          refX="9"
          refY="3.5"
          orient="auto"
        >
          <polygon
            points="0 0, 10 3.5, 0 7"
            fill={isHighlighted ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))"}
            opacity={isHighlighted ? 1 : 0.6}
          />
        </marker>
      </defs>
      
      <path
        d={pathData}
        stroke="transparent"
        strokeWidth={2}
        fill="none"
        markerEnd={`url(#arrowhead-${isHighlighted ? 'highlighted' : 'normal'})`}
      />
    </g>
  );
};