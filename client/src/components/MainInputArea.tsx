import { useState, useRef, useEffect, ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { 
  Paperclip, 
  Mic, 
  MicOff,
  RefreshCw, 
  ChevronRight, 
  File,
  Image,
  FileText,
  FileSpreadsheet,
  FileIcon,
  Sparkles
} from "lucide-react";
import { useLocation } from "wouter";

interface MainInputAreaProps {
  onTransform: (input: string, fileData?: any) => void;
}

export default function MainInputArea({ onTransform }: MainInputAreaProps) {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [inputText, setInputText] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [fileType, setFileType] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [fileData, setFileData] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Voice recording timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingTime(0);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      handleFileUpload(file);
    }
  };

  const handleFileUpload = async (file: File) => {
    setFileType(file.type);
    const reader = new FileReader();

    if (file.type.includes('pdf') || file.type.includes('image')) {
      reader.onload = (e) => {
        setFileData(e.target?.result); // This will be base64 data
        if (file.type.includes('image')) {
          toast({
            title: "Processing Image",
            description: "AI is analyzing your image to extract tabular data...",
            duration: 5000,
          });
        }
      };
      reader.readAsDataURL(file);
    } else {
      reader.onload = (e) => {
        setFileData(e.target?.result);
      };
      reader.readAsText(file);
    }
  };

  const getFileTypeIcon = (type: string) => {
    if (type.match('text.*') || type === 'application/json') {
      return <FileText className="h-8 w-8 text-blue-500" />;
    } else if (type.match('image.*')) {
      return <Image className="h-8 w-8 text-green-500" />;
    } else if (type.match('application/pdf')) {
      return <FileIcon className="h-8 w-8 text-red-500" />;
    } else if (type.match('application/vnd.ms-excel') || type.match('application/vnd.openxmlformats-officedocument.spreadsheetml')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
    } else {
      return <File className="h-8 w-8 text-gray-500" />;
    }
  };

  const handleVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window)) {
      toast({
        title: "Voice Input Not Available",
        description: "Your browser doesn't support voice input.",
        variant: "destructive"
      });
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      return;
    }

    setIsRecording(true);
    setIsProcessingVoice(true);

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsProcessingVoice(false);
      setIsRecording(true);
    };

    let finalTranscript = '';

    recognition.onresult = (event: any) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          finalTranscript += transcript;
        }
      }

      if (finalTranscript) {
        setInputText(prevText => 
          prevText + (prevText ? "\n\n" : "") + finalTranscript.trim());
      }
    };

    recognition.onend = () => {
      setIsRecording(false);
      if (finalTranscript) {
        setInputText(prevText => 
          prevText + (prevText ? "\n\n" : "") + finalTranscript.trim());
      }
    };

    recognition.onerror = (event: any) => {
      setIsRecording(false);
      setIsProcessingVoice(false);
      toast({
        title: "Voice Input Error",
        description: "An error occurred while processing voice input.",
        variant: "destructive"
      });
    };

    recognition.start();
  };

  const handleTransformClick = () => {
    if (inputText.trim() || fileName) {
      onTransform(inputText, fileData);
    } else {
      toast({
        title: "Input required",
        description: "Please enter some text or upload a file first.",
        variant: "destructive"
      });
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const examplePrompts = [
    "Organize expense list into a table",
    "Format messy sales data",
    "Extract contacts from text",
    "Generate a sales report table",
    "Create product inventory from description"
  ];

  const handleExampleClick = (example: string) => {
    setInputText(example);
  };

  return (
    <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl">
      <div className="px-6 py-8 sm:px-10">
        <div className="mb-6">
          <label htmlFor="data-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Enter your data or type a prompt
          </label>
          <div className="relative">
            <Textarea
              id="data-input"
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste your data or type a prompt like 'Organize this into a table'..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 transition duration-300"
            />
            <div className="absolute right-3 bottom-3 flex space-x-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                title="Attach file"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <button
                onClick={handleVoiceInput}
                className={`p-1.5 rounded-full transition-colors ${
                  isRecording
                    ? "text-red-500 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900"
                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
                title={isRecording ? "Stop recording" : "Start voice input"}
              >
                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
              </button>
            </div>
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
          />

          {/* File upload area */}
          <div
            className={`mt-4 border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              isDragging
                ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                : "border-gray-300 dark:border-gray-600"
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {fileName ? (
              <div className="flex items-center justify-center space-x-3">
                {fileType && getFileTypeIcon(fileType)}
                <span className="text-sm text-gray-600 dark:text-gray-300">{fileName}</span>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-gray-600 dark:text-gray-300 mb-2 hidden sm:block">
                  Drag & drop files here or click the paperclip icon above
                </p>
                <p className="text-gray-600 dark:text-gray-300 mb-2 sm:hidden">
                  Tap the paperclip icon to upload a file
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Supported formats: CSV, Excel, Text, PDF, Images (including photos of tables, receipts, or handwritten data)
                </p>
                {fileType?.includes('image') && (
                  <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                    <Sparkles className="inline-block h-4 w-4 mr-1" />
                    AI will analyze and extract tabular data from your image
                  </p>
                )}
              </div>
            )}
          </div>

          {isRecording && (
            <div className="mt-2 text-sm text-red-500">
              Recording... {recordingTime}s
            </div>
          )}
        </div>

        {/* Example Prompts */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Try these examples:</p>
          <div className="flex flex-wrap gap-2">
            {examplePrompts.map((prompt, index) => (
              <button 
                key={index}
                className="text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-3 py-1 rounded-full text-gray-700 dark:text-gray-300 transition duration-300"
                onClick={() => handleExampleClick(prompt)}
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2">
          <Button
            onClick={() => setLocation("/templates")}
            className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg flex items-center"
          >
            <Sparkles className="h-4 w-4 mr-1" />
            Browse Templates
          </Button>
          <Button
            onClick={handleTransformClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg flex items-center space-x-2"
          >
            <span>Transform</span>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}