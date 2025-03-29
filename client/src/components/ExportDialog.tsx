
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, FileSpreadsheet, FileJson } from "lucide-react";
import { motion } from "framer-motion";

interface ExportDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onExport: (format: string) => void;
}

export default function ExportDialog({ isOpen, onOpenChange, onExport }: ExportDialogProps) {
  const exportOptions = [
    {
      label: "CSV File",
      format: "csv",
      icon: Table,
      description: "Export as comma-separated values",
      color: "bg-blue-50 dark:bg-blue-900/20",
      hover: "hover:bg-blue-100 dark:hover:bg-blue-900/30",
      iconColor: "text-blue-600 dark:text-blue-400"
    },
    {
      label: "Excel File",
      format: "excel",
      icon: FileSpreadsheet,
      description: "Export as Microsoft Excel spreadsheet",
      color: "bg-green-50 dark:bg-green-900/20",
      hover: "hover:bg-green-100 dark:hover:bg-green-900/30",
      iconColor: "text-green-600 dark:text-green-400"
    },
    {
      label: "JSON File",
      format: "json",
      icon: FileJson,
      description: "Export as structured JSON data",
      color: "bg-purple-50 dark:bg-purple-900/20",
      hover: "hover:bg-purple-100 dark:hover:bg-purple-900/30",
      iconColor: "text-purple-600 dark:text-purple-400"
    }
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-2xl">Export Data</DialogTitle>
          <DialogDescription className="text-base">
            Choose your preferred export format
          </DialogDescription>
        </DialogHeader>
        <div className="px-6 pb-6">
          <div className="grid grid-cols-3 gap-4">
            {exportOptions.map((option, index) => (
              <motion.div
                key={option.format}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <button
                  className={`w-full group rounded-xl p-6 text-center transition-all duration-200 ${option.color} ${option.hover} border-2 border-transparent hover:border-${option.iconColor} hover:shadow-lg`}
                  onClick={() => onExport(option.format)}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className={`p-3 rounded-xl ${option.color} ${option.iconColor} ring-1 ring-${option.iconColor}/20`}>
                      <option.icon className="h-8 w-8" />
                    </div>
                    <div>
                      <h3 className="font-medium text-lg">{option.label}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{option.description}</p>
                    </div>
                  </div>
                </button>
              </motion.div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
