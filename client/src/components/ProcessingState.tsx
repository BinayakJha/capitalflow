import { useWorkspace } from "@/context/WorkspaceContext";
import { Check, RefreshCw, Clock } from "lucide-react";

export default function ProcessingState() {
  const { processingProgress } = useWorkspace();
  const { percentage, steps } = processingProgress;

  return (
    <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden p-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="animate-pulse relative">
            <div className="absolute inset-0 bg-blue-400 opacity-30 rounded-full blur-xl"></div>
            <div className="relative bg-gradient-to-r from-blue-500 to-violet-500 w-20 h-20 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
          </div>
        </div>
        
        <h3 className="text-xl font-semibold mb-2">AI is transforming your data</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-8">This will just take a moment...</p>
        
        <div className="flex flex-col items-center">
          <div className="w-full max-w-md bg-gray-100 dark:bg-gray-700 rounded-full h-2.5 mb-6">
            <div 
              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          
          <div className="text-left w-full max-w-md">
            {steps.map((step, index) => (
              <div key={index} className="flex items-center space-x-2 mb-3">
                {step.status === "completed" ? (
                  <Check className="h-5 w-5 text-green-500" />
                ) : step.status === "in-progress" ? (
                  <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />
                ) : (
                  <Clock className="h-5 w-5 text-gray-400" />
                )}
                <span className={`text-gray-700 dark:text-gray-300 ${
                  step.status === "in-progress" ? "animate-pulse" : ""
                }`}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
