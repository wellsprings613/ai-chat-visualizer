export interface ConversationMessage {
  id: string;
  role: 'human' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface ConversationData {
  id: string;
  title: string;
  messages: ConversationMessage[];
  totalMessages: number;
  createdAt: Date;
  format: ConversationFormat;
}

export interface DetectedFormat {
  type: 'chatgpt_json' | 'claude_text' | 'generic_chat' | 'pdf' | 'unknown';
  confidence: number; // 0-1
  preview: string;
  messageCount?: number;
  estimatedTokens?: number;
}

export interface UploadFile {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'analyzing' | 'processing' | 'completed' | 'error';
  detectedFormat?: DetectedFormat;
  error?: string;
}

export interface ProcessingStatus {
  status: 'idle' | 'detecting' | 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  message: string;
  currentFile?: string;
}

export type ConversationFormat = 'chatgpt_json' | 'claude_text' | 'generic_chat' | 'pdf' | 'paste';

export interface Conversation {
  id: string;
  user_id: string;
  title: string;
  original_filename?: string;
  file_type: ConversationFormat;
  upload_date: string;
  processing_status: 'pending' | 'processing' | 'completed' | 'error';
  total_messages: number;
  main_topics: string[];
  raw_content?: string;
  processed_data?: ConversationData;
  created_at: string;
}

export interface Profile {
  id: string;
  email?: string;
  full_name?: string;
  conversations_count: number;
  created_at: string;
}