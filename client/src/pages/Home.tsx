import { useState, useEffect } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import MainInputArea from "@/components/MainInputArea";
import FeaturesOverview from "@/components/FeaturesOverview";
import ProcessingState from "@/components/ProcessingState";
import { useLocation } from "wouter";
import { useWorkspace } from "@/context/WorkspaceContext";
import { apiRequest } from "@/lib/queryClient";
import { ArrowRight, Table, FileSpreadsheet, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

function handleTemplateSelect(template: string) {
  window.location.href = `/?template=${encodeURIComponent(template)}`;
}

export default function Home() {
  const [showProcessing, setShowProcessing] = useState(false);
  const [, setLocation] = useLocation();
  const {
    setInputText,
    setIsProcessing,
    setTableData,
    updateProcessingProgress,
    resetWorkspace,
  } = useWorkspace();
  const searchParams = new URLSearchParams(window.location.search);
  const templateData = searchParams.get('template');

  useEffect(() => {
    if (templateData) {
      handleTransformData(decodeURIComponent(templateData));
    }
  }, [templateData]);

  // Helper function to determine if input suggests structured table or entity extraction
  const detectTransformationType = (input: string): { endpoint: string; payload: any } => {
    // Check for specific keywords that might indicate entity extraction
    const entityKeywords = [
      { keyword: "extract contacts", type: "people" },
      { keyword: "extract people", type: "people" },
      { keyword: "extract companies", type: "companies" },
      { keyword: "extract organizations", type: "companies" },
      { keyword: "extract products", type: "products" },
      { keyword: "extract locations", type: "locations" },
      { keyword: "extract addresses", type: "locations" },
      { keyword: "extract dates", type: "dates" },
      { keyword: "extract events", type: "events" },
    ];

    // Check for structured table types
    const tableTypeKeywords = [
      { keyword: "sales", type: "sales" },
      { keyword: "inventory", type: "inventory" },
      { keyword: "customer", type: "customer" },
      { keyword: "product", type: "product" },
      { keyword: "expense", type: "expense" },
      { keyword: "finance", type: "finance" },
      { keyword: "report", type: "report" },
    ];

    // Check for entity extraction requests first
    for (const entity of entityKeywords) {
      if (input.toLowerCase().includes(entity.keyword)) {
        return {
          endpoint: "/api/extract-entities",
          payload: { text: input, entityType: entity.type }
        };
      }
    }

    // Check for structured table requests with specific types
    for (const tableType of tableTypeKeywords) {
      if (input.toLowerCase().includes(tableType.keyword)) {
        return {
          endpoint: "/api/structured-table",
          payload: { text: input, tableType: tableType.type }
        };
      }
    }

    // If no specific transformation detected, fallback to general transform
    return {
      endpoint: "/api/transform",
      payload: { text: input }
    };
  };

  const handleTransformData = async (input: string, fileData: any = null) => {
    try {
      // Reset any previous workspace data
      resetWorkspace();

      // Update state to show processing view
      setInputText(input);
      setShowProcessing(true);
      setIsProcessing(true);

      // Update progress steps
      updateProcessingProgress({
        percentage: 15,
        steps: [
          { label: "Reading and processing data", status: "in-progress" },
          { label: "Identifying data structure", status: "pending" },
          { label: "Creating structured table", status: "pending" },
          { label: "Preparing workspace", status: "pending" },
        ],
      });

      // First progress update - data read
      setTimeout(() => {
        updateProcessingProgress({
          percentage: 35,
          steps: [
            { label: "Reading and processing data", status: "completed" },
            { label: "Identifying data structure", status: "in-progress" },
            { label: "Creating structured table", status: "pending" },
            { label: "Preparing workspace", status: "pending" },
          ],
        });
      }, 1000);

      // Second progress update - structure identified
      setTimeout(() => {
        updateProcessingProgress({
          percentage: 65,
          steps: [
            { label: "Reading and processing data", status: "completed" },
            { label: "Identifying data structure", status: "completed" },
            { label: "Creating structured table", status: "in-progress" },
            { label: "Preparing workspace", status: "pending" },
          ],
        });
      }, 2000);

      let endpoint = "/api/transform";
      let payload: any = {};

      if (fileData) {
        // If this is a file upload, use the file transformation endpoint
        endpoint = "/api/transform";
        payload = { fileData, fileName: input };  // Input contains file name in this case
      } else {
        // For text input, determine the best transformation type based on content
        const transformation = detectTransformationType(input);
        endpoint = transformation.endpoint;
        payload = transformation.payload;
      }

      console.log(`Using endpoint: ${endpoint} for transformation`);

      // Actual API call
      const response = await apiRequest("POST", endpoint, payload);
      const result = await response.json();

      // Extract the table data from the response
      // Different endpoints structure their responses differently
      const data = endpoint === "/api/transform" 
        ? result 
        : (result.tableData || result);

      if (data) {
        // Set the transformed data
        setTableData(data);

        // Final progress update - all complete
        updateProcessingProgress({
          percentage: 100,
          steps: [
            { label: "Reading and processing data", status: "completed" },
            { label: "Identifying data structure", status: "completed" },
            { label: "Creating structured table", status: "completed" },
            { label: "Preparing workspace", status: "completed" },
          ],
        });

        // Delay to show completion before redirecting
        setTimeout(() => {
          setIsProcessing(false);
          setShowProcessing(false);
          setLocation("/workspace");
        }, 500);
      }
    } catch (error) {
      console.error("Error transforming data:", error);
      setIsProcessing(false);
      setShowProcessing(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow">
        {showProcessing ? (
          <ProcessingState />
        ) : (
          <>
            <section id="landing-hero" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                  AI-Powered Data Transformation
                </h1>
                <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-8">
                  From raw input to structured tables—effortless, intuitive, and magical.
                </p>
              </div>

              <MainInputArea onTransform={handleTransformData} />

              {/* Stats Section */}
              <div className="py-12 bg-gray-50 dark:bg-gray-900/50 my-16 rounded-xl">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto text-center">
                  <div className="p-6">
                    <div className="text-4xl font-bold text-blue-500 mb-2">99%</div>
                    <div className="text-gray-600 dark:text-gray-300">Accuracy Rate</div>
                  </div>
                  <div className="p-6">
                    <div className="text-4xl font-bold text-violet-500 mb-2">50K+</div>
                    <div className="text-gray-600 dark:text-gray-300">Tables Processed</div>
                  </div>
                  <div className="p-6">
                    <div className="text-4xl font-bold text-emerald-500 mb-2">2M+</div>
                    <div className="text-gray-600 dark:text-gray-300">Data Points Analyzed</div>
                  </div>
                </div>
              </div>

              <FeaturesOverview />

              {/* How It Works Section */}
              <div className="py-16">
                <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-blue-500">1</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Input Your Data</h3>
                    <p className="text-gray-600 dark:text-gray-400">Paste any unstructured data into the input box</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 bg-violet-100 dark:bg-violet-900 rounded-full flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-violet-500">2</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">AI Processing</h3>
                    <p className="text-gray-600 dark:text-gray-400">Our AI analyzes and structures your data instantly</p>
                  </div>
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center mb-4">
                      <span className="text-xl font-bold text-emerald-500">3</span>
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Get Results</h3>
                    <p className="text-gray-600 dark:text-gray-400">Download your clean, structured data in seconds</p>
                  </div>
                </div>
              </div>

              {/* Templates Section */}
              <section className="py-12 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4">
                  <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent">
                      Start with a Template
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      Choose from our pre-built templates to get started quickly
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div onClick={() => handleTemplateSelect("Grocery 50\nRent 1200\nUtilities 80")} className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                        <Table className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Expense Tracker</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Convert messy expense lists into organized tables</p>
                    </div>
                    <div onClick={() => handleTemplateSelect("John Doe - john@email.com (555) 123-4567")} className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                        <FileSpreadsheet className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Contact List</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Transform contact information into structured tables</p>
                    </div>
                    <div onClick={() => handleTemplateSelect("Red T-Shirt Size L Cotton $25.99")} className="cursor-pointer bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                      <div className="flex items-center justify-center h-12 w-12 rounded-full bg-blue-500/10 text-blue-500 mb-4">
                        <FileText className="h-6 w-6" />
                      </div>
                      <h3 className="text-lg font-semibold mb-2">Product Catalog</h3>
                      <p className="text-gray-600 dark:text-gray-400 text-sm">Create product listings with prices and descriptions</p>
                    </div>
                  </div>
                  <div className="text-center mt-8">
                    <Button onClick={() => setLocation('/templates')} variant="outline">
                      View All Templates
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </section>
            </section>
          </>
        )}
      </main>
      <Footer />
    </div>
  );
}