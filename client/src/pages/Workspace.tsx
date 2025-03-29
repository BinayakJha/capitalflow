import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import Header from "@/components/Header";
import DataStoryPanel from "@/components/DataStoryPanel";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw, Sparkles, Mic } from "lucide-react";
import DataTable from "@/components/DataTable";
import ChatInterface from "@/components/ChatInterface";
import VisualizationPanel from "@/components/VisualizationPanel";
import { useWorkspace } from "@/context/WorkspaceContext";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast"; // Import useToast

export default function Workspace() {
  const { toast } = useToast(); // Add toast variable from hook
  const [, setLocation] = useLocation();
  const { tableData, addMessage, updateProcessingProgress, setTableData } = useWorkspace();
  const [aiPrompt, setAiPrompt] = useState("");
  const [isProcessingAiEdit, setIsProcessingAiEdit] = useState(false);

  useEffect(() => {
    // Redirect if no table data is available
    if (!tableData) {
      setLocation("/");
    }
  }, [tableData, setLocation]);

  const handleAiEditRequest = async () => {
    if (!tableData || !aiPrompt.trim()) return;

    setIsProcessingAiEdit(true);

    try {
      // Submit AI edit request to API
      const response = await apiRequest("POST", "/api/ai-edit", {
        prompt: aiPrompt,
        tableData
      });

      const result = await response.json();

      if (result.updatedData) {
        // Add AI response to chat history
        addMessage({ role: "ai", content: result.explanation || "I've updated the table based on your request." });

        // Update the table with AI-generated version
        setTableData(result.updatedData);
      }
    } catch (error) {
      console.error("Error processing AI edit:", error);
      addMessage({ role: "ai", content: "I'm sorry, I couldn't process that edit request." });
    } finally {
      setIsProcessingAiEdit(false);
      setAiPrompt("");
    }
  };

  const handleChatQuery = async (query: string) => {
    try {
      // Add user message to chat
      addMessage({ role: "user", content: query });

      // Make API request to process the query
      const response = await apiRequest("POST", "/api/query", {
        query,
        tableData: tableData,
      });

      const result = await response.json();

      // Add AI response to chat
      addMessage({ role: "ai", content: result.response });

      // If there's updated table data, update it
      if (result.updatedData) {
        setTableData(result.updatedData);
        updateProcessingProgress({
          percentage: 100,
          status: "Applied changes from query",
          steps: [
            { label: "Processing query", status: "completed" },
            { label: "Applying changes", status: "completed" },
            { label: "Updating data", status: "completed" },
          ]
        });
      }

      return true;
    } catch (error) {
      console.error("Error processing chat query:", error);
      addMessage({ 
        role: "ai", 
        content: "Sorry, I couldn't process that request. Please try again." 
      });
      return false;
    }
  };

  if (!tableData) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        <section id="data-workspace" className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex flex-col h-[calc(100vh-120px)]">
            <div className="flex-grow flex flex-col lg:flex-row gap-6">
              {/* Left Panel - Data Table */}
              <DataTable />

              {/* Right Panel - AI Edit & Visualization */}
              <div className="w-full lg:w-96 flex flex-col gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col">
                  <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="font-medium">AI Table Editor</h3>
                  </div>
                  <div className="p-4">
                    <div className="relative">
                      <div className="relative">
                        <Textarea
                          placeholder="Examples: 'Add a new Status column with default value Pending', 'Remove duplicate rows', 'Convert dates to yyyy-mm-dd format'"
                          className="min-h-[100px] pr-10"
                          value={aiPrompt}
                          onChange={(e) => setAiPrompt(e.target.value)}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute right-2 bottom-2 h-8 w-8 rounded-full"
                          onClick={() => {
                            const recognition = new (window as any).webkitSpeechRecognition();
                            recognition.continuous = false;
                            recognition.lang = 'en-US';

                            recognition.onstart = () => {
                              toast({
                                title: "Listening...",
                                description: "Speak your table editing instructions",
                              });
                            };

                            recognition.onresult = (event: any) => {
                              const transcript = event.results[0][0].transcript;
                              setAiPrompt(transcript);
                            };

                            recognition.onerror = () => {
                              toast({
                                title: "Error",
                                description: "Failed to recognize speech. Please try again.",
                                variant: "destructive"
                              });
                            };

                            recognition.start();
                          }}
                        >
                          <Mic className="h-4 w-4" />
                        </Button>
                      </div>
                      <Button 
                        className="mt-4 w-full"
                        onClick={handleAiEditRequest} 
                        disabled={isProcessingAiEdit || !aiPrompt.trim()}
                      >
                        {isProcessingAiEdit ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Edit Table
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mb-6">
                  <DataStoryPanel tableData={tableData} />
                </div>
                <VisualizationPanel />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}