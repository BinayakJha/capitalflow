import { useState, useEffect } from "react";
import { TableData } from "@/context/WorkspaceContext";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, History } from "lucide-react";

interface TableVersionHistoryProps {
  versions: TableData[];
  currentVersionIdx: number;
  onSelectVersion: (index: number) => void;
}

export default function TableVersionHistory({
  versions,
  currentVersionIdx,
  onSelectVersion,
}: TableVersionHistoryProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [selectedViewMode, setSelectedViewMode] = useState<"side-by-side" | "stacked">("stacked");
  
  if (versions.length <= 1) {
    return null; // Don't show history if there's only one version
  }

  // Function to render a single table
  const renderTable = (tableData: TableData, label: string) => (
    <div className="overflow-auto">
      <div className="text-sm font-medium text-gray-500 mb-2">{label}</div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            {tableData.columns.map((column, i) => (
              <th
                key={i}
                className="px-4 py-2 text-left text-xs font-medium text-gray-600 dark:text-gray-300 uppercase tracking-wider border border-gray-200 dark:border-gray-700"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.rows.slice(0, 5).map((row, i) => (
            <tr key={i} className={i % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}>
              {tableData.columns.map((column, j) => (
                <td
                  key={j}
                  className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-700"
                >
                  {row[column] !== undefined ? String(row[column]) : ""}
                </td>
              ))}
            </tr>
          ))}
          {tableData.rows.length > 5 && (
            <tr>
              <td
                colSpan={tableData.columns.length}
                className="px-4 py-2 text-sm text-gray-500 italic text-center border border-gray-200 dark:border-gray-700"
              >
                {tableData.rows.length - 5} more rows...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // Calculate differences between versions
  const calculateDifferences = (oldData: TableData, newData: TableData) => {
    const differences = {
      columns: {
        added: newData.columns.filter(col => !oldData.columns.includes(col)),
        removed: oldData.columns.filter(col => !newData.columns.includes(col)),
      },
      rowCount: newData.rows.length - oldData.rows.length,
    };
    
    return differences;
  };

  // Define previous and current versions based on currentVersionIdx
  const previousVersion = versions[currentVersionIdx - 1] || versions[0];
  const currentVersion = versions[currentVersionIdx];
  
  // Calculate differences
  const differences = calculateDifferences(previousVersion, currentVersion);

  return (
    <div className="mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowHistory(!showHistory)}
        className="mb-2 flex items-center gap-1 text-gray-600 dark:text-gray-300 border-gray-300 dark:border-gray-600"
      >
        <History className="h-4 w-4" />
        {showHistory ? "Hide Version History" : "Show Version History"}
      </Button>
      
      {showHistory && (
        <Card className="border-gray-200 dark:border-gray-700 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex justify-between items-center">
              <span>Table Version History</span>
              <Tabs defaultValue="stacked" onValueChange={(value) => setSelectedViewMode(value as "side-by-side" | "stacked")}>
                <TabsList className="h-8">
                  <TabsTrigger value="stacked" className="text-xs h-6">Stacked</TabsTrigger>
                  <TabsTrigger value="side-by-side" className="text-xs h-6">Side by Side</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardTitle>
            <CardDescription>
              Version {currentVersionIdx + 1} of {versions.length}
              {differences.columns.added.length > 0 && (
                <span className="ml-2 text-green-600 dark:text-green-400">
                  +{differences.columns.added.length} columns added
                </span>
              )}
              {differences.columns.removed.length > 0 && (
                <span className="ml-2 text-red-600 dark:text-red-400">
                  -{differences.columns.removed.length} columns removed
                </span>
              )}
              {differences.rowCount !== 0 && (
                <span className={`ml-2 ${differences.rowCount > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {differences.rowCount > 0 ? '+' : ''}{differences.rowCount} rows
                </span>
              )}
            </CardDescription>
          </CardHeader>
          
          <CardContent className="pt-2">
            <ScrollArea className="h-80 rounded-md border dark:border-gray-700">
              {selectedViewMode === "stacked" ? (
                <div className="space-y-6 p-4">
                  {renderTable(currentVersion, "Current Version")}
                  <div className="flex justify-center">
                    <ArrowUp className="h-6 w-6 text-gray-400" />
                  </div>
                  {renderTable(previousVersion, "Previous Version")}
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4 p-4">
                  {renderTable(previousVersion, "Previous Version")}
                  {renderTable(currentVersion, "Current Version")}
                </div>
              )}
            </ScrollArea>
            
            <div className="flex justify-between mt-4">
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentVersionIdx <= 0}
                onClick={() => onSelectVersion(currentVersionIdx - 1)}
              >
                <ArrowUp className="h-4 w-4 mr-1" /> Previous Version
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                disabled={currentVersionIdx >= versions.length - 1}
                onClick={() => onSelectVersion(currentVersionIdx + 1)}
              >
                <ArrowDown className="h-4 w-4 mr-1" /> Next Version
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}