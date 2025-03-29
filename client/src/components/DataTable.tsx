import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useWorkspace, TableData, DataRow } from "@/context/WorkspaceContext";
import { 
  RefreshCw, 
  Download, 
  Edit,
  PencilLine, 
  Save, 
  Plus, 
  Trash2, 
  Sparkles, 
  MessageSquare,
  Mic,
  Wand2
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import TableVersionHistory from "./TableVersionHistory";
import { Label } from "@/components/ui/label"; // Added import for Label component
import ExportDialog from "./ExportDialog";
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
// Import the VisualizationDialog component.  Path may need adjustment.
import VisualizationDialog from './VisualizationDialog';


export default function DataTable() {
  const { 
    tableData, 
    setTableData, 
    tableVersions, 
    currentVersionIdx, 
    setTableVersion, 
    addMessage 
  } = useWorkspace();

  const { toast } = useToast();

  // Basic editing state
  const [activeEnhancement, setActiveEnhancement] = useState<string | null>("Clean Data");
  const [editingMode, setEditingMode] = useState<"none" | "manual" | "ai">("none");
  const [editingCell, setEditingCell] = useState<{rowIndex: number, colName: string} | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const [aiPrompt, setAiPrompt] = useState<string>("");
  const [isAiDialogOpen, setIsAiDialogOpen] = useState(false);
  const [isProcessingAiEdit, setIsProcessingAiEdit] = useState(false);

  // Auto-clean state
  const [isAutoCleaning, setIsAutoCleaning] = useState(false);
  const [isProcessingFormula, setIsProcessingFormula] = useState(false);

  const handleAiFormulaAssist = async (columnName?: string) => {
    if (!tableData) return;

    setIsProcessingFormula(true);
    try {
      const response = await apiRequest("POST", "/api/evaluate-formula", {
        tableData,
        columnName,
        formula: "",
        formulaType: "suggest"
      });

      const result = await response.json();

      if (result.suggestion) {
        setCustomFormula(result.suggestion);
        toast({
          title: "Formula Suggested",
          description: "AI has suggested a formula based on your data.",
        });
      }
    } catch (error) {
      console.error("Error getting formula suggestion:", error);
      toast({
        title: "Error",
        description: "Failed to get formula suggestion. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFormula(false);
    }
  };

  // Formula state
  const [formulaType, setFormulaType] = useState<string>("sum");
  const [formulaColumn, setFormulaColumn] = useState<string>("");
  const [customFormula, setCustomFormula] = useState<string>("");
  const [isFormulaDialogOpen, setIsFormulaDialogOpen] = useState(false);

  // Create a copy of the table data for editing
  const [editedTableData, setEditedTableData] = useState<TableData | null>(null);

  // References for inputs
  const aiInputRef = useRef<HTMLTextAreaElement>(null);

  // Initialize formula column when tableData changes
  useEffect(() => {
    if (tableData && tableData.columns.length > 0 && !formulaColumn) {
      setFormulaColumn(tableData.columns[0]);
    }
  }, [tableData, formulaColumn]);

  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [newColumnName, setNewColumnName] = useState("");

  const handleAddNewColumn = () => {
    if (!newColumnName.trim() || !tableData) return;

    const updatedData = {
      ...tableData,
      columns: [...tableData.columns, newColumnName],
      rows: tableData.rows.map(row => ({
        ...row,
        [newColumnName]: ""
      }))
    };

    setTableData(updatedData);
    setNewColumnName("");
    toast({
      title: "Column Added",
      description: `New column "${newColumnName}" has been added to the table.`,
    });
  };

  if (!tableData) return null;

  // Initialize edited table data if needed
  if (editingMode !== "none" && !editedTableData) {
    setEditedTableData(JSON.parse(JSON.stringify(tableData)));
  }

  const enhancements = [
    "Clean Data",
    "Auto-Detect Categories",
    "Merge Similar Rows",
    "Fill Missing Values"
  ];

  const handleEnhancement = async (enhancement: string) => {
    setActiveEnhancement(enhancement);

    try {
      // Submit enhancement request to API
      const response = await apiRequest("POST", "/api/enhance", {
        enhancement,
        tableData
      });

      const result = await response.json();

      if (result.updatedData) {
        setTableData(result.updatedData);
      }
    } catch (error) {
      console.error("Error applying enhancement:", error);
    }
  };

  const handleExport = (format: string) => {
    const data = tableData.rows;

    if (format === 'csv') {
      const csvContent = Papa.unparse(data);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'exported_data.csv';
      link.click();
    } else if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Data');
      XLSX.writeFile(wb, 'exported_data.xlsx');
    } else if (format === 'json') {
      const jsonStr = JSON.stringify(data, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = 'exported_data.json';
      link.click();
    }

    setIsExportDialogOpen(false);
    toast({
      title: "Export Complete",
      description: `Data exported successfully as ${format.toUpperCase()}`,
    });
  };

  // Manual editing functions
  const startCellEdit = (rowIndex: number, colName: string) => {
    if (editingMode !== "manual") return;

    const value = editedTableData?.rows[rowIndex][colName];
    setEditingCell({ rowIndex, colName });
    setEditValue(value !== undefined && value !== null ? value.toString() : "");
  };

  const saveCellEdit = () => {
    if (!editingCell || !editedTableData) return;

    const { rowIndex, colName } = editingCell;
    const newRows = [...editedTableData.rows];

    // Try to convert to number if it looks like one
    const numValue = !isNaN(Number(editValue)) ? Number(editValue) : editValue;
    newRows[rowIndex] = { ...newRows[rowIndex], [colName]: numValue };

    setEditedTableData({
      ...editedTableData,
      rows: newRows
    });

    setEditingCell(null);
    // Save changes immediately
    localStorage.setItem('tableData', JSON.stringify(editedTableData));
  };

  const cancelCellEdit = () => {
    setEditingCell(null);
  };

  const addNewRow = () => {
    if (!editedTableData) return;

    const newRow: DataRow = {};
    editedTableData.columns.forEach(col => {
      newRow[col] = "";
    });

    setEditedTableData({
      ...editedTableData,
      rows: [...editedTableData.rows, newRow]
    });
  };

  const deleteRow = (rowIndex: number) => {
    if (!editedTableData) return;

    const newRows = [...editedTableData.rows];
    newRows.splice(rowIndex, 1);

    setEditedTableData({
      ...editedTableData,
      rows: newRows
    });
  };

  const saveEditedTable = () => {
    if (!editedTableData) return;

    // Save the edited table as a new version
    setTableData(editedTableData);
    setEditingMode("none");
    setEditedTableData(null);
    setEditingCell(null);
    setEditValue("");
  };

  const cancelEditing = () => {
    setEditingMode("none");
    setEditedTableData(null);
    setEditingCell(null);
  };

  // AI-assisted editing
  const handleAiEditRequest = async () => {
    if (!tableData || !aiPrompt.trim()) return;

    setIsProcessingAiEdit(true);

    try {
      // Add user message to the chat history
      addMessage({ role: "user", content: aiPrompt });

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

        toast({
          title: "AI Edit Complete",
          description: "The table has been updated based on your instructions.",
        });
      }
    } catch (error) {
      console.error("Error processing AI edit:", error);
      addMessage({ role: "ai", content: "I'm sorry, I couldn't process that edit request." });

      toast({
        title: "Error",
        description: "Failed to process AI edit request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAiEdit(false);
      setIsAiDialogOpen(false);
      setAiPrompt("");
    }
  };

  // Auto-clean the table
  const handleAutoClean = async () => {
    if (!tableData) return;

    setIsAutoCleaning(true);

    try {
      toast({
        title: "Auto-Cleaning",
        description: "AI is cleaning and fixing your table data...",
      });

      // Submit auto-clean request to API
      const response = await apiRequest("POST", "/api/auto-clean", {
        tableData
      });

      const result = await response.json();

      if (result.updatedData) {
        // Update the table with cleaned version
        setTableData(result.updatedData);

        // Add a message to the chat log about what was cleaned
        if (result.cleaningSummary) {
          addMessage({
            role: "ai",
            content: `I've cleaned up your table data. ${result.cleaningSummary}`
          });
        }

        toast({
          title: "Auto-Clean Complete",
          description: "Your table has been cleaned and optimized.",
        });
      }
    } catch (error) {
      console.error("Error auto-cleaning table:", error);

      toast({
        title: "Error",
        description: "Failed to auto-clean the table. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAutoCleaning(false);
    }
  };

  // Apply formula to the table
  const handleApplyFormula = async () => {
    if (!tableData) return;

    setIsProcessingFormula(true);

    try {
      let formula = "";
      let payload: any = {
        tableData
      };

      if (customFormula.trim()) {
        // Use custom formula
        formula = customFormula;
        payload.formula = customFormula;
        payload.formulaType = "custom";
      } else {
        // Use predefined formula
        formula = `${formulaType} on ${formulaColumn}`;
        payload.formula = formula;
        payload.formulaType = formulaType;
        payload.columnName = formulaColumn;
      }

      toast({
        title: "Applying Formula",
        description: `Calculating ${formula}...`,
      });

      // Submit formula request to API
      const response = await apiRequest("POST", "/api/evaluate-formula", payload);

      const result = await response.json();

      if (result.updatedData) {
        // Update the table with the formula result
        setTableData(result.updatedData);

        // Add a message to the chat log about the formula result
        if (result.explanation) {
          addMessage({
            role: "ai",
            content: `Formula result: ${result.explanation}`
          });
        }

        toast({
          title: "Formula Applied",
          description: "The formula has been calculated and applied to your data.",
        });
      }
    } catch (error) {
      console.error("Error applying formula:", error);

      toast({
        title: "Error",
        description: "Failed to apply formula to the table. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingFormula(false);
      setIsFormulaDialogOpen(false);
      setCustomFormula("");
    }
  };

  const handleAddColumn = () => {
    // Improved Add Column functionality.  Replace with your actual implementation.
    if (!newColumnName.trim() || !tableData) return;
    const newColumn = { name: newColumnName, data: [] };
    const updatedColumns = [...tableData.columns, newColumnName];
    const updatedRows = tableData.rows.map((row) => ({ ...row, [newColumnName]: "" }));
    setTableData({ ...tableData, columns: updatedColumns, rows: updatedRows });
    setNewColumnName("");
    toast({ title: "Column Added", description: `New column "${newColumnName}" added.` });
  };


  return (
    <div className="flex-grow bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      {/* Version History */}
      {tableVersions.length > 0 && (
        <TableVersionHistory
          versions={tableVersions}
          currentVersionIdx={currentVersionIdx}
          onSelectVersion={setTableVersion}
        />
      )}

      <div className="flex justify-between items-center mb-6">
        {/* <h2 className="text-xl font-semibold">Structured Data</h2> */}
        <div className="flex flex-wrap gap-2 sm:flex-nowrap">
          {/* Editing mode buttons */}
          {editingMode === "none" ? (
            <>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 h-auto"
                onClick={() => setEditingMode("manual")}
              >
                <PencilLine className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Manual Edit</span>
                <span className="sm:hidden">Edit</span>
              </Button>


              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 h-auto"
                  >
                    <Sparkles className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">AI Edit</span>
                    <span className="sm:hidden">AI</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>AI Table Editing</DialogTitle>
                    <DialogDescription>
                      Describe the changes you'd like to make to the table and our AI will try to implement them.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="relative">
                      <Textarea
                        id="ai-prompt"
                        ref={aiInputRef}
                        placeholder="Examples: 'Add a new Status column with default value Pending', 'Remove duplicate rows', 'Convert dates to yyyy-mm-dd format'"
                        className="min-h-[100px] pr-10"
                        value={aiPrompt}
                        onChange={(e) => setAiPrompt(e.target.value)}
                      />
                      <div className="absolute right-3 bottom-3">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 rounded-full" 
                          title="Voice Input"
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
                    </div>
                  </div>
                  <DialogFooter>
                    <Button 
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
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Submit Request
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 h-auto"
                onClick={handleAutoClean}
                title="Auto-clean and fix table issues"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Auto-Clean</span>
                <span className="sm:hidden">Clean</span>
              </Button>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 h-auto"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Add Column</span>
                    <span className="sm:hidden">Column</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Column</DialogTitle>
                    <DialogDescription>
                      Enter the name for the new column and optionally let AI suggest a formula.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="name" className="text-right">
                        Name
                      </Label>
                      <Input
                        id="name"
                        value={newColumnName}
                        onChange={(e) => setNewColumnName(e.target.value)}
                        placeholder="Enter column name"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label className="text-right">Formula</Label>
                      <div className="col-span-3 flex gap-2">
                        <Input
                          id="formula"
                          placeholder="Enter formula or click Suggest"
                          className="flex-1"
                        />
                        <Button
                          variant="secondary"
                          onClick={handleAiFormulaAssist}
                          disabled={isProcessingFormula}
                        >
                          {isProcessingFormula ? (
                            <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4 mr-1" />
                          )}
                          Suggest
                        </Button>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleAddNewColumn}>
                      Add Column
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isFormulaDialogOpen} onOpenChange={setIsFormulaDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 h-auto"
                    title="Apply formulas to table data"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                      <path d="M4 15c-1.1 0-2-.9-2-2s.9-2 2-2h1v4H4zm5-4h3v4m6 0v-4h2c1.1 0 2 .9 2 2s-.9 2-2 2h-2z" />
                      <circle cx="12" cy="13" r="3" />
                      <path d="M5 9v-3a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3" />
                    </svg>
                    <span className="hidden sm:inline">Formula</span>
                    <span className="sm:hidden">Fx</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[550px]">
                  <DialogHeader>
                    <DialogTitle>Apply Formula to Table</DialogTitle>
                    <DialogDescription>
                      Choose a predefined formula or enter a custom one.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div>
                      <Tabs defaultValue="predefined">
                        <TabsList className="w-full">
                          <TabsTrigger value="predefined">Predefined Formulas</TabsTrigger>
                          <TabsTrigger value="custom">Custom Formula</TabsTrigger>
                        </TabsList>

                        <TabsContent value="predefined" className="pt-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="flex flex-col space-y-2">
                              <label className="text-sm font-medium">Formula Type</label>
                              <select 
                                className="p-2 border rounded-md bg-background text-foreground"
                                onChange={(e) => setFormulaType(e.target.value)}
                                value={formulaType}
                              >
                                <option value="sum">Sum</option>
                                <option value="average">Average</option>
                                <option value="max">Maximum</option>
                                <option value="min">Minimum</option>
                                <option value="count">Count</option>
                                <option value="percentage">Percentage</option>
                                <option value="growth">Growth Rate</option>
                              </select>
                            </div>

                            <div className="flex flex-col space-y-2">
                              <label className="text-sm font-medium">Column to Apply</label>
                              <select 
                                className="p-2 border rounded-md bg-background text-foreground"
                                onChange={(e) => setFormulaColumn(e.target.value)}
                                value={formulaColumn}
                              >
                                {tableData?.columns.map((column) => (
                                  <option key={column} value={column}>{column}</option>
                                ))}
                              </select>
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="custom" className="pt-4">
                          <div className="flex flex-col space-y-2">
                            <div className="flex justify-between items-center mb-2">
                              <label className="text-sm font-medium">Custom Formula</label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleAiFormulaAssist(formulaColumn)}
                                disabled={isProcessingFormula}
                              >
                                <Wand2 className="h-4 w-4 mr-2" />
                                AI Suggest
                              </Button>
                            </div>
                            <Textarea 
                              placeholder="Enter formula like: SUM(Column1) / COUNT(Column2)"
                              value={customFormula}
                              onChange={(e) => setCustomFormula(e.target.value)}
                              className="min-h-[80px]"
                            />
                            <p className="text-xs text-gray-500">
                              Examples: "Calculate profit by subtracting Cost from Price", "Find the average age grouped by Department"
                            </p>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button onClick={handleApplyFormula}>
                      Apply Formula
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 h-auto"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Export</span>
                    <span className="sm:hidden">Export</span>
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Export Data</DialogTitle>
                    <DialogDescription>
                      Choose a format to export your data
                    </DialogDescription>
                  </DialogHeader>
                  <div className="flex flex-col gap-4">
                    <Button onClick={() => handleExport('csv')}>Export as CSV</Button>
                    <Button onClick={() => handleExport('excel')}>Export as Excel</Button>
                    <Button onClick={() => handleExport('json')}>Export as JSON</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 h-auto"
                onClick={saveEditedTable}
              >
                <Save className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Save Changes</span>
                <span className="sm:hidden">Save</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 h-auto"
                onClick={handleAddColumn}
              >
                <Plus className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Add Column</span>
                <span className="sm:hidden">Column</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 h-auto"
                onClick={cancelEditing}
              >
                Cancel
              </Button>
              {editingMode === "manual" && (
                <Button
                  variant="outline"
                  size="sm"
                  className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 h-auto"
                  onClick={addNewRow}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Add Row</span>
                  <span className="sm:hidden">Add</span>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Data Enhancement Options */}
      {editingMode === "none" && (
        <div className="flex space-x-2 mb-6 overflow-x-auto pb-2">
          {enhancements.map((enhancement) => (
            <Button
              key={enhancement}
              variant={activeEnhancement === enhancement ? "secondary" : "outline"}
              size="sm"
              className={`whitespace-nowrap h-auto px-3 py-1.5 ${
                activeEnhancement === enhancement 
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" 
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
              onClick={() => handleEnhancement(enhancement)}
            >
              {enhancement}
            </Button>
          ))}
        </div>
      )}

      {/* Data Table */}
      <div className="overflow-x-auto" style={{ scrollbarWidth: 'thin' }}>
        <Table className="min-w-full">
          <TableHeader className="bg-gray-50 dark:bg-gray-800">
            <TableRow>
              {(editingMode === "none" ? tableData : editedTableData)?.columns.map((column, index) => (
                <TableHead 
                  key={index}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider"
                >
                  {column}
                </TableHead>
              ))}
              {editingMode === "manual" && (
                <TableHead className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {(editingMode === "none" ? tableData : editedTableData)?.rows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {(editingMode === "none" ? tableData : editedTableData)?.columns.map((column, colIndex) => (
                  <TableCell 
                    key={`${rowIndex}-${colIndex}`}
                    className={`px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 ${
                      editingMode === "manual" ? "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700" : ""
                    }`}
                    onClick={() => startCellEdit(rowIndex, column)}
                  >
                    {editingCell && 
                     editingCell.rowIndex === rowIndex && 
                     editingCell.colName === column ? (
                      <div className="flex items-center">
                        <Input
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveCellEdit();
                            if (e.key === "Escape") cancelCellEdit();
                          }}
                          className="p-1 text-sm"
                          autoFocus
                        />
                      </div>
                    ) : (
                      <>
                        {row[column] !== undefined && row[column] !== null ? row[column].toString() : ''}
                        {editingMode === "manual" && (
                          <Edit className="h-3 w-3 ml-2 inline-block opacity-20 hover:opacity-100" />
                        )}
                      </>
                    )}
                  </TableCell>
                ))}

                {editingMode === "manual" && (
                  <TableCell className="px-4 py-3 whitespace-nowrap text-sm">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteRow(rowIndex)}
                      className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}