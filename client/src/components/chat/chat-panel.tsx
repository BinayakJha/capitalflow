import { useState, useRef, useEffect } from 'react';
import { sendChatMessage, fetchChatHistory } from '@/lib/api';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ChatMessage } from '@shared/types';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface ChatPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChatPanel({ isOpen, onClose }: ChatPanelProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: chatHistory, isLoading: isHistoryLoading } = useQuery({
    queryKey: ['/api/chat/history'],
    queryFn: fetchChatHistory,
  });

  const sendMessageMutation = useMutation({
    mutationFn: sendChatMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/chat/history'] });
    },
    onError: (error) => {
      toast({
        title: 'Error sending message',
        description: (error as Error).message || 'Failed to send message',
        variant: 'destructive',
      });
    },
  });

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!message.trim()) return;
    
    const userMessage = message;
    setMessage('');
    setIsLoading(true);
    
    // Optimistic update
    const optimisticMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    
    queryClient.setQueryData(['/api/chat/history'], (old: ChatMessage[] = []) => [
      ...old,
      optimisticMessage,
    ]);
    
    try {
      await sendMessageMutation.mutateAsync(userMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Sample initial messages if no chat history is available
  const sampleMessages: ChatMessage[] = [
    {
      role: 'ai',
      content: "👋 Hello! I'm CapitalFlow, your AI-powered financial assistant. I can help you understand your business finances better.\n\nYou can ask me questions like:\n- \"What's my cash flow projection for next quarter?\"\n- \"How can I improve my profit margins?\"\n- \"What tax deductions is my business eligible for?\"\n- \"Explain my current debt-to-equity ratio.\"\n- \"How do my financial metrics compare to industry standards?\"",
      timestamp: new Date(Date.now() - 1000 * 60 * 60),
    },
  ];

  const messages = chatHistory?.length ? chatHistory : sampleMessages;

  return (
    <div
      className={`fixed inset-y-0 right-0 w-full md:w-96 bg-white shadow-xl z-20 transform transition-transform duration-300 ease-in-out ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col">
        <div className="flex-shrink-0 px-4 py-2 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center">
            <svg className="h-6 w-6 mr-2 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900">CapitalFlow Assistant</h3>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="rounded-full text-gray-400 hover:text-gray-500"
          >
            <span className="sr-only">Close panel</span>
            <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
        
        <div className="flex-1 p-4 overflow-y-auto" id="chat-messages">
          {isHistoryLoading ? (
            <div className="flex justify-center py-10">
              <svg className="animate-spin h-6 w-6 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div 
                key={index}
                className={`chat-message ${
                  msg.role === 'user' 
                    ? 'user-message text-sm text-white p-3 mb-4 ml-auto bg-primary' 
                    : 'ai-message text-sm text-gray-800 p-3 mb-4 bg-gray-100'
                } max-w-[80%] ${
                  msg.role === 'user' 
                    ? 'rounded-[18px_18px_0_18px]' 
                    : 'rounded-[18px_18px_18px_0]'
                }`}
              >
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        // Customize how different elements are rendered
                        h1: ({node, ...props}) => <h1 className="text-lg font-bold mt-2 mb-1" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-base font-bold mt-2 mb-1" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                        p: ({node, ...props}) => <p className="mb-2" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc ml-4 mb-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                        li: ({node, ...props}) => <li className="mb-1" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-bold" {...props} />,
                        em: ({node, ...props}) => <em className="italic" {...props} />,
                        a: ({node, ...props}) => <a className="text-primary underline" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-2 border-gray-300 pl-4 italic my-2" {...props} />,
                        code: ({node, className, children, ...props}) => {
                          const match = /language-(\w+)/.exec(className || '');
                          const isInline = !className || !match;
                          
                          return isInline 
                            ? <code className="bg-gray-200 px-1 rounded text-xs" {...props}>{children}</code> 
                            : <pre className="bg-gray-800 text-white p-2 rounded text-xs overflow-x-auto my-2"><code {...props}>{children}</code></pre>
                        }
                      }}
                    >
                      {msg.content}
                    </ReactMarkdown>
                  </div>
                )}
              </div>
            ))
          )}
          
          {isLoading && (
            <div className="chat-message ai-message text-sm text-gray-800 p-3 mb-4 bg-gray-100 rounded-[18px_18px_18px_0] max-w-[80%]">
              <p className="loading-dots">Thinking</p>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
        
        <div className="flex-shrink-0 p-4 border-t border-gray-200">
          <div className="relative">
            <Input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask a question about your finances..."
              disabled={isLoading}
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleSendMessage}
              disabled={isLoading || !message.trim()}
              className="absolute inset-y-0 right-0 px-3 flex items-center"
            >
              <svg 
                className={`h-5 w-5 ${
                  message.trim() && !isLoading 
                    ? 'text-primary hover:text-primary/80' 
                    : 'text-gray-400'
                }`} 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </Button>
          </div>
          <div className="mt-2 text-xs text-gray-500 flex items-center">
            <svg className="h-4 w-4 mr-1 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Powered by Gemini & Claude AI
          </div>
        </div>
      </div>
    </div>
  );
}
