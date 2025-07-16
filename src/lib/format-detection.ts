import { DetectedFormat } from '@/types/conversation';

export const detectConversationFormat = (content: string): DetectedFormat => {
  const trimmedContent = content.trim();
  
  // ChatGPT JSON detection
  if (isChatGPTJSON(trimmedContent)) {
    const messageCount = extractChatGPTMessageCount(trimmedContent);
    return {
      type: 'chatgpt_json',
      confidence: 0.95,
      preview: `ChatGPT JSON Export (${messageCount} messages)`,
      messageCount,
      estimatedTokens: messageCount * 150 // rough estimate
    };
  }

  // Claude text detection
  if (isClaudeText(trimmedContent)) {
    const messageCount = extractClaudeMessageCount(trimmedContent);
    return {
      type: 'claude_text',
      confidence: 0.90,
      preview: `Claude Conversation (${messageCount} messages)`,
      messageCount,
      estimatedTokens: messageCount * 200
    };
  }

  // Generic chat patterns
  if (isGenericChat(trimmedContent)) {
    const messageCount = extractGenericMessageCount(trimmedContent);
    return {
      type: 'generic_chat',
      confidence: 0.75,
      preview: `Generic Chat Format (${messageCount} messages)`,
      messageCount,
      estimatedTokens: messageCount * 100
    };
  }

  // PDF content detection (already extracted text)
  if (isPDFContent(trimmedContent)) {
    return {
      type: 'pdf',
      confidence: 0.80,
      preview: 'PDF Document Content',
      estimatedTokens: Math.floor(trimmedContent.length / 4)
    };
  }

  return {
    type: 'unknown',
    confidence: 0.1,
    preview: 'Unknown format - will use AI parsing',
    estimatedTokens: Math.floor(trimmedContent.length / 4)
  };
};

const isChatGPTJSON = (content: string): boolean => {
  try {
    const parsed = JSON.parse(content);
    return (
      parsed.hasOwnProperty('mapping') &&
      parsed.hasOwnProperty('create_time') &&
      parsed.hasOwnProperty('title')
    );
  } catch {
    return false;
  }
};

const isClaudeText = (content: string): boolean => {
  const patterns = [
    /^(Human|Assistant|Claude):/m,
    /\n(Human|Assistant|Claude):/,
    /Human: .+\n\nAssistant:/s,
    /Assistant: .+\n\nHuman:/s
  ];
  return patterns.some(pattern => pattern.test(content));
};

const isGenericChat = (content: string): boolean => {
  const patterns = [
    /^(You|AI|User|Bot|Assistant|Me):/m,
    /\n(You|AI|User|Bot|Assistant|Me):/,
    /^\d{1,2}\/\d{1,2}\/\d{4}.+:/m, // Date stamps
    /^\[\d{1,2}:\d{2}\]/m // Time stamps
  ];
  return patterns.some(pattern => pattern.test(content));
};

const isPDFContent = (content: string): boolean => {
  // Look for typical PDF extraction patterns
  const pdfIndicators = [
    content.includes('Page '),
    content.includes('\f'), // Form feed character
    /\n\s*\d+\s*\n/.test(content), // Page numbers
    content.length > 1000 && content.split('\n').length > 20
  ];
  return pdfIndicators.filter(Boolean).length >= 2;
};

const extractChatGPTMessageCount = (content: string): number => {
  try {
    const parsed = JSON.parse(content);
    if (parsed.mapping) {
      return Object.keys(parsed.mapping).filter(key => 
        parsed.mapping[key]?.message?.content?.parts?.length > 0
      ).length;
    }
  } catch {
    // Fallback to string analysis
  }
  return Math.max(1, (content.match(/"role":/g) || []).length / 2);
};

const extractClaudeMessageCount = (content: string): number => {
  const matches = content.match(/^(Human|Assistant|Claude):/gm);
  return matches ? matches.length : 1;
};

const extractGenericMessageCount = (content: string): number => {
  const patterns = [
    /^(You|AI|User|Bot|Assistant|Me):/gm,
    /^\d{1,2}\/\d{1,2}\/\d{4}.+:/gm,
    /^\[\d{1,2}:\d{2}\]/gm
  ];
  
  for (const pattern of patterns) {
    const matches = content.match(pattern);
    if (matches && matches.length > 1) {
      return matches.length;
    }
  }
  
  // Fallback: count line breaks as potential message separators
  return Math.max(1, content.split('\n\n').length);
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'application/json',
    'text/plain',
    'application/pdf',
    'text/csv',
    'application/zip'
  ];
  
  const allowedExtensions = ['.json', '.txt', '.pdf', '.csv', '.zip'];
  
  return allowedTypes.includes(file.type) || 
         allowedExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const generatePreviewText = (content: string, maxLength: number = 200): string => {
  const cleaned = content.replace(/\s+/g, ' ').trim();
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.substring(0, maxLength) + '...';
};

// Enhanced conversation parser
export const parseConversation = (content: string, format: DetectedFormat) => {
  switch (format.type) {
    case 'chatgpt_json':
      return parseChatGPTJSON(content);
    case 'claude_text':
      return parseClaudeText(content);
    case 'generic_chat':
      return parseGenericChat(content);
    case 'pdf':
      return parseGenericChat(content); // PDFs are treated as generic text after extraction
    default:
      return parseGenericChat(content); // Fallback
  }
};

const parseChatGPTJSON = (content: string) => {
  try {
    const data = JSON.parse(content);
    const messages = [];
    
    if (data.mapping) {
      // ChatGPT export format
      const nodes = Object.values(data.mapping) as any[];
      nodes.forEach((node: any, index) => {
        if (node.message && node.message.content && node.message.content.parts && node.message.content.parts.length > 0) {
          messages.push({
            id: node.id || `msg_${index}`,
            sender: node.message.author.role === 'user' ? 'user' : 'assistant',
            content: node.message.content.parts.join(''),
            timestamp: node.message.create_time ? new Date(node.message.create_time * 1000).toISOString() : null,
            order: index
          });
        }
      });
    }
    
    return messages.sort((a, b) => a.order - b.order);
  } catch (error) {
    return [];
  }
};

const parseClaudeText = (content: string) => {
  const messages = [];
  const parts = content.split(/^(Human|Assistant|Claude):\s*/m);
  
  for (let i = 1; i < parts.length; i += 2) {
    const sender = parts[i].toLowerCase();
    const content_text = parts[i + 1]?.trim();
    
    if (content_text) {
      messages.push({
        id: `msg_${messages.length + 1}`,
        sender: sender === 'human' ? 'user' : 'assistant',
        content: content_text,
        timestamp: null,
        order: messages.length
      });
    }
  }
  
  return messages;
};

const parseGenericChat = (content: string) => {
  const messages = [];
  const lines = content.split('\n');
  let currentMessage = null;
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine) {
      // Empty line might indicate message boundary
      if (currentMessage && currentMessage.content.trim()) {
        currentMessage.content += '\n';
      }
      continue;
    }
    
    // Enhanced speaker patterns
    const speakerMatch = trimmedLine.match(/^(You|User|ChatGPT|Assistant|AI|Bot|Me|Q|A|Question|Answer|Human|Claude):\s*(.*)/i);
    
    if (speakerMatch) {
      // Save previous message
      if (currentMessage && currentMessage.content.trim()) {
        currentMessage.content = currentMessage.content.trim();
        messages.push(currentMessage);
      }
      
      const speaker = speakerMatch[1].toLowerCase();
      const content_text = speakerMatch[2];
      
      currentMessage = {
        id: `msg_${messages.length + 1}`,
        sender: ['you', 'user', 'me', 'q', 'question', 'human'].includes(speaker) ? 'user' : 'assistant',
        content: content_text,
        timestamp: null,
        order: messages.length
      };
    } else if (currentMessage) {
      // Continue previous message
      currentMessage.content += '\n' + trimmedLine;
    } else {
      // Start a new message if no clear speaker (assume user)
      currentMessage = {
        id: `msg_${messages.length + 1}`,
        sender: 'user',
        content: trimmedLine,
        timestamp: null,
        order: messages.length
      };
    }
  }
  
  // Add final message
  if (currentMessage && currentMessage.content.trim()) {
    currentMessage.content = currentMessage.content.trim();
    messages.push(currentMessage);
  }
  
  return messages;
};