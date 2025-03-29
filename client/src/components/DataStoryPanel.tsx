
import { Lightbulb, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { apiRequest } from "@/lib/queryClient";

export default function DataStoryPanel({ tableData }: { tableData: any }) {
  const [story, setStory] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);

  const generateStory = async () => {
    setIsGenerating(true);
    try {
      const response = await apiRequest("POST", "/api/generate-story", { tableData });
      const result = await response.json();
      setStory(result.story);
    } catch (error) {
      console.error("Error generating story:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-medium">Data Story</h3>
        <Button variant="ghost" size="sm" onClick={generateStory} disabled={isGenerating}>
          {isGenerating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Lightbulb className="h-4 w-4 mr-2" />
          )}
          {isGenerating ? "Generating..." : "Generate Story"}
        </Button>
      </div>
      {story ? (
        <div className="prose dark:prose-invert max-w-none">
          {story.split('\n').map((paragraph, i) => (
            <p key={i} className="text-sm text-gray-600 dark:text-gray-300">{paragraph}</p>
          ))}
        </div>
      ) : (
        <div className="text-center p-6 text-gray-500">
          <Lightbulb className="h-10 w-10 mx-auto mb-4 opacity-50" />
          <p>Generate an AI-powered story from your data</p>
        </div>
      )}
    </div>
  );
}
