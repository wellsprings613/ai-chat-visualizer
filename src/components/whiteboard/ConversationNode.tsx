import { useState, useRef } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { MessageSquare, Code, Target, Circle, MoreHorizontal } from 'lucide-react';
import { ConversationNode as NodeType } from '@/types/whiteboard';
import { cn } from '@/lib/utils';

interface ConversationNodeProps {
  node: NodeType;
  isSelected: boolean;
  onSelect: (nodeId: string, multi: boolean) => void;
  onMove: (nodeId: string, newPosition: { x: number; y: number }) => void;
  onDoubleClick: (nodeId: string) => void;
  zoom: number;
  searchQuery: string;
}

export const ConversationNode = ({
  node,
  isSelected,
  onSelect,
  onMove,
  onDoubleClick,
  zoom,
  searchQuery
}: ConversationNodeProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPosition, setDragStartPosition] = useState<{ x: number; y: number } | null>(null);
  const nodeRef = useRef<HTMLDivElement>(null);

  const getNodeIcon = () => {
    switch (node.type) {
      case 'topic':
        return Circle;
      case 'message':
        return MessageSquare;
      case 'code':
        return Code;
      case 'action':
        return Target;
      default:
        return Circle;
    }
  };

  const getNodeClassName = () => {
    const baseClasses = "absolute transition-all duration-200 rounded-lg border-2 border-transparent overflow-hidden";
    const cursorClass = isDragging ? "cursor-grabbing" : "cursor-grab";
    
    let typeClasses = "";
    switch (node.type) {
      case 'topic':
        typeClasses = "node-topic";
        break;
      case 'message':
        typeClasses = node.sender === 'ai' ? "node-ai" : "node-user";
        break;
      case 'code':
        typeClasses = "node-code";
        break;
      case 'action':
        typeClasses = "node-action";
        break;
    }

    const shapeClasses = node.type === 'topic' ? "rounded-full" : 
                        node.type === 'action' ? "transform rotate-45" : 
                        "rounded-lg";

    return cn(
      baseClasses,
      cursorClass,
      typeClasses,
      shapeClasses,
      isSelected && "ring-4 ring-primary ring-opacity-50",
      isDragging && "z-50 shadow-2xl scale-105"
    );
  };

  const handleDragStart = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    event.stopPropagation();
    setIsDragging(true);
    setDragStartPosition({ x: node.position.x, y: node.position.y });
  };

  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    event.stopPropagation();
    if (!isDragging || !dragStartPosition) return;
    
    // Use delta instead of offset for precise 1:1 movement
    const newPosition = {
      x: dragStartPosition.x + info.offset.x / zoom,
      y: dragStartPosition.y + info.offset.y / zoom
    };
    
    onMove(node.id, newPosition);
  };

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    event.stopPropagation();
    setIsDragging(false);
    setDragStartPosition(null);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id, e.ctrlKey || e.metaKey);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDoubleClick(node.id);
  };

  const highlightText = (text: string, query: string) => {
    if (!query) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="search-highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const Icon = getNodeIcon();

  // Special handling for diamond shape (action nodes)
  const contentClasses = node.type === 'action' ? "transform -rotate-45" : "";

  return (
    <motion.div
      ref={nodeRef}
      className={getNodeClassName()}
      style={{
        left: node.position.x,
        top: node.position.y,
        width: node.size.width,
        height: node.size.height,
      }}
      drag
      dragMomentum={false}
      dragElastic={0}
      dragTransition={{ 
        power: 0,
        timeConstant: 0
      }}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={handleDragEnd}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      whileHover={!isDragging ? { scale: 1.05 } : {}}
      whileTap={!isDragging ? { scale: 0.95 } : {}}
      animate={{
        scale: isDragging ? 1.05 : 1,
        zIndex: isDragging ? 50 : 1,
        boxShadow: isDragging ? "0 20px 40px rgba(0,0,0,0.15)" : "0 4px 8px rgba(0,0,0,0.1)"
      }}
    >
      <div className={cn("p-3 h-full flex flex-col", contentClasses)}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <Icon className="h-4 w-4 flex-shrink-0" />
          <div className="text-xs opacity-75">
            {new Date(node.timestamp).toLocaleTimeString()}
          </div>
        </div>

        {/* Title */}
        <div className="font-semibold text-sm mb-1 line-clamp-2">
          {highlightText(node.title, searchQuery)}
        </div>

        {/* Content */}
        <div className={cn(
          "text-xs opacity-90 flex-1 overflow-hidden",
          node.type === 'code' ? "font-mono whitespace-pre-wrap" : "line-clamp-3"
        )}>
          {highlightText(node.content, searchQuery)}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-current opacity-30">
          <div className="text-xs">
            {node.sender === 'ai' ? 'AI' : 'User'}
          </div>
          <div className="text-xs">
            {node.connections.length} connected
          </div>
        </div>
      </div>

      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white" />
      )}
    </motion.div>
  );
};