
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Download, Save } from "lucide-react";
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
} from "recharts";

interface VisualizationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tableData: any;
  visualizationData: any;
}

export default function VisualizationDialog({
  open,
  onOpenChange,
  tableData,
  visualizationData,
}: VisualizationDialogProps) {
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleSaveToExcel = async () => {
    // Implementation for saving to Excel
    const response = await fetch('/api/save-visualization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ tableData, visualizationData }),
    });
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'visualization-report.xlsx';
    a.click();
  };

  const handleDownloadImage = () => {
    // Implementation for downloading chart as image
    const svg = document.querySelector('.visualization-container svg');
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg);
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = 'visualization.png';
        a.href = canvas.toDataURL('image/png');
        a.click();
      };
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  const renderVisualization = () => {
    if (!visualizationData) return null;

    if (visualizationData.type === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <RechartsBarChart data={visualizationData.data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={visualizationData.xAxis} />
            <YAxis />
            <Tooltip />
            <Bar dataKey={visualizationData.yAxis} fill="#3B82F6" />
          </RechartsBarChart>
        </ResponsiveContainer>
      );
    }

    if (visualizationData.type === 'line') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={visualizationData.data} margin={{ top: 20, right: 30, left: 20, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={visualizationData.xAxis} />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey={visualizationData.yAxis} stroke="#8B5CF6" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (visualizationData.type === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={visualizationData.data}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={150}
              fill="#8884d8"
              dataKey={visualizationData.yAxis}
            >
              {visualizationData.data.map((entry: any, index: number) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vw] h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Data Visualization Analysis</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4">
          <div className="visualization-container mb-8">
            {renderVisualization()}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['bar', 'line', 'pie'].map((type) => (
              <div key={type} className="p-4 border rounded-lg">
                <h3 className="font-medium mb-2 capitalize">{type} Chart Analysis</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {`This ${type} chart visualization helps identify ${
                    type === 'bar' ? 'comparative data across categories' :
                    type === 'line' ? 'trends over time' :
                    'proportional distribution'
                  }.`}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <Button onClick={handleDownloadImage} variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Download Image
          </Button>
          <Button onClick={handleSaveToExcel}>
            <Save className="h-4 w-4 mr-2" />
            Save to Excel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
