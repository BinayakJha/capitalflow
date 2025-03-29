import { useState, useRef, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { ChevronRight } from "lucide-react";
import { useWorkspace } from "@/context/WorkspaceContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ChatInterfaceProps {
  onSubmitQuery: (query: string) => Promise<boolean>;
  aiPrompt: string;
  setAiPrompt: (prompt: string) => void;
  isProcessingAiEdit: boolean;
  setIsProcessingAiEdit: (processing: boolean) => void;
}

export default function ChatInterface({ 
  onSubmitQuery, 
  aiPrompt, 
  setAiPrompt, 
  isProcessingAiEdit, 
  setIsProcessingAiEdit 
}: ChatInterfaceProps) {
  const [query, setQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { messages } = useWorkspace();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim() || isSubmitting) return;

    setIsSubmitting(true);

    const success = await onSubmitQuery(query);

    if (success) {
      setQuery("");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-1/2">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-medium">AI Assistant</h3>
      </div>

      <div className="flex-grow p-2 sm:p-4 overflow-y-auto space-y-4"> {/* This line was changed */}
        {messages.map((message, index) => (
          <div key={index} className={`flex items-start ${message.role === 'user' ? 'justify-end' : ''}`}>
            {message.role === 'ai' && (
              <Avatar className="flex-shrink-0 bg-blue-500 rounded-full w-8 h-8 flex items-center justify-center text-white">
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
            )}

            <div 
              className={`${
                message.role === 'user' 
                  ? 'mr-3 bg-blue-50 dark:bg-blue-900/30' 
                  : 'ml-3 bg-gray-100 dark:bg-gray-700'
              } p-3 rounded-lg max-w-[80%]`}
            >
              <p className="text-sm">{message.content}</p>
            </div>

            {message.role === 'user' && (
              <Avatar className="flex-shrink-0 bg-gray-200 dark:bg-gray-600 rounded-full w-8 h-8 flex items-center justify-center">
                <AvatarFallback>You</AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="relative">
          <Input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-4 py-2 pr-12 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            placeholder="Ask a question about your data..."
            disabled={isSubmitting}
          />
          <button
            type="submit"
            className="absolute right-2 top-2 text-blue-500 hover:text-blue-600 disabled:opacity-50"
            disabled={isSubmitting}
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </form>
    </div>
  );
}