import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWorkspace } from "@/context/WorkspaceContext";
import { BarChart } from "lucide-react";
import VisualizationDialog from "./VisualizationDialog";
import { apiRequest } from "@/lib/queryClient";
import {
  BarChart as RechartsBarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function VisualizationPanel() {
  const { tableData, visualizationData, setVisualizationData } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleGenerateVisualization = async () => {
    if (!tableData) return;
    
    setLoading(true);
    
    try {
      const response = await apiRequest("POST", "/api/visualize", {
        tableData
      });
      
      const result = await response.json();
      
      if (result.visualizationData) {
        setVisualizationData(result.visualizationData);
      }
    } catch (error) {
      console.error("Error generating visualization:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderVisualization = () => {
    if (!visualizationData) {
      return (
        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="text-center p-6">
            <BarChart className="h-10 w-10 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">Ask the AI to generate visualizations</p>
            <p className="text-xs text-gray-500">Examples: "Show sales by category" or "Create a line chart for monthly revenue"</p>
          </div>
        </div>
      );
    }

    // Based on visualization type, render the appropriate chart
    if (visualizationData.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <RechartsBarChart data={visualizationData.data} margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey={visualizationData.xAxis} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={visualizationData.yAxis} fill="#3B82F6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    } else if (visualizationData.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={visualizationData.data} margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#555" />
            <XAxis dataKey={visualizationData.xAxis} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={visualizationData.yAxis} stroke="#8B5CF6" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      );
    } else if (visualizationData.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <PieChart margin={{ top: 20, right: 20, left: 20, bottom: 30 }}>
            <Pie
              data={visualizationData.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey={visualizationData.value}
              nameKey={visualizationData.name}
              label
            >
              {visualizationData.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      );
    }

    return <div>Unsupported visualization type</div>;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg flex flex-col h-1/2 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium">Visualizations</h3>
        <Button
          size="sm"
          className="text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 px-3 py-1 rounded-full h-auto"
          onClick={() => {
            handleGenerateVisualization();
            setDialogOpen(true);
          }}
          disabled={loading}
        >
          {loading ? "Generating..." : "Generate"}
        </Button>
        <VisualizationDialog 
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          tableData={tableData}
          visualizationData={visualizationData}
        />
      </div>
      
      <div className="flex-grow">
        {renderVisualization()}
      </div>
    </div>
  );
}
