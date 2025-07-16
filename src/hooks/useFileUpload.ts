import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { UploadFile, ProcessingStatus, DetectedFormat } from '@/types/conversation';
import { detectConversationFormat, validateFileType, parseConversation } from '@/lib/format-detection';
import { useToast } from '@/hooks/use-toast';

export const useFileUpload = () => {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus>({
    status: 'idle',
    progress: 0,
    message: ''
  });
  const { toast } = useToast();

  const addFiles = useCallback((newFiles: File[]) => {
    const validFiles = newFiles.filter(file => {
      if (!validateFileType(file)) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not a supported format`,
          variant: "destructive"
        });
        return false;
      }
      
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        toast({
          title: "File too large",
          description: `${file.name} exceeds the 50MB limit`,
          variant: "destructive"
        });
        return false;
      }
      
      return true;
    });

    const uploadFiles: UploadFile[] = validFiles.map(file => ({
      file,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      progress: 0,
      status: 'pending'
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
    
    // Auto-analyze files
    uploadFiles.forEach(uploadFile => {
      analyzeFile(uploadFile);
    });
  }, [toast]);

  const analyzeFile = useCallback(async (uploadFile: UploadFile) => {
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'analyzing' }
        : f
    ));

    try {
      const content = await readFileContent(uploadFile.file);
      const detectedFormat = detectConversationFormat(content);
      
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'pending',
              detectedFormat
            }
          : f
      ));
    } catch (error) {
      setFiles(prev => prev.map(f => 
        f.id === uploadFile.id 
          ? { 
              ...f, 
              status: 'error',
              error: 'Failed to analyze file'
            }
          : f
      ));
    }
  }, []);

  const readFileContent = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  };

  const uploadFile = useCallback(async (uploadFile: UploadFile): Promise<string> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const fileName = `${user.id}/${uploadFile.id}-${uploadFile.file.name}`;
    
    setFiles(prev => prev.map(f => 
      f.id === uploadFile.id 
        ? { ...f, status: 'uploading', progress: 0 }
        : f
    ));

    const { data, error } = await supabase.storage
      .from('conversation-uploads')
      .upload(fileName, uploadFile.file);

    if (error) throw error;
    return data.path;
  }, []);

  const processFiles = useCallback(async () => {
    const pendingFiles = files.filter(f => f.status === 'pending' && f.detectedFormat);
    if (pendingFiles.length === 0) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Please sign in to upload files');
      }

      setProcessingStatus({
        status: 'processing',
        progress: 0,
        message: 'Starting upload...'
      });

      for (let i = 0; i < pendingFiles.length; i++) {
        const file = pendingFiles[i];
        
        setProcessingStatus(prev => ({
          ...prev,
          progress: (i / pendingFiles.length) * 100,
          message: `Processing ${file.file.name}...`,
          currentFile: file.file.name
        }));

        // Upload file to storage
        const filePath = await uploadFile(file);
        
        // Read file content for database storage
        const content = await readFileContent(file.file);
        
        // Create conversation record
        const { error: dbError } = await supabase
          .from('conversations')
          .insert({
            user_id: user.id,
            title: file.file.name.replace(/\.[^/.]+$/, ''), // Remove extension
            original_filename: file.file.name,
            file_type: file.detectedFormat!.type,
            raw_content: content,
            total_messages: file.detectedFormat!.messageCount || 0,
            processing_status: 'pending'
          });

        if (dbError) throw dbError;

        setFiles(prev => prev.map(f => 
          f.id === file.id 
            ? { ...f, status: 'completed', progress: 100 }
            : f
        ));
      }

      setProcessingStatus({
        status: 'completed',
        progress: 100,
        message: `Successfully processed ${pendingFiles.length} file(s)`
      });

      toast({
        title: "Upload successful",
        description: `${pendingFiles.length} conversation(s) ready for visualization`,
      });

    } catch (error) {
      console.error('Upload error:', error);
      setProcessingStatus({
        status: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'Upload failed'
      });
      
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : 'Please try again',
        variant: "destructive"
      });
    }
  }, [files, uploadFile, toast]);

  const removeFile = useCallback((fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
    setProcessingStatus({
      status: 'idle',
      progress: 0,
      message: ''
    });
  }, []);

  const analyzeTextContent = useCallback((content: string): DetectedFormat => {
    return detectConversationFormat(content);
  }, []);

  const parseConversationContent = useCallback((content: string, format: DetectedFormat) => {
    return parseConversation(content, format);
  }, []);

  return {
    files,
    processingStatus,
    addFiles,
    removeFile,
    clearFiles,
    processFiles,
    analyzeTextContent,
    parseConversationContent
  };
};