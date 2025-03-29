
import { motion } from "framer-motion";
import { ArrowRight, Table, FileSpreadsheet, FileText, BarChart, DatabaseIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

export default function Templates() {
  const [, setLocation] = useLocation();

  const templates = [
    {
      icon: <Table className="h-8 w-8" />,
      title: "Expense Tracker",
      description: "Convert messy expense lists into organized tables with categories and totals",
      example: "Grocery 50\nRent 1200\nUtilities 80",
    },
    {
      icon: <FileSpreadsheet className="h-8 w-8" />,
      title: "Contact List",
      description: "Transform contact information into structured tables with names, emails, and phones",
      example: "John Doe - john@email.com (555) 123-4567",
    },
    {
      icon: <FileText className="h-8 w-8" />,
      title: "Product Catalog",
      description: "Create product listings with prices, SKUs, and descriptions",
      example: "Red T-Shirt Size L Cotton $25.99",
    },
    {
      icon: <BarChart className="h-8 w-8" />,
      title: "Sales Report",
      description: "Convert sales data into analyzable tables with trends and metrics",
      example: "Q1 Sales: $50k Units: 500\nQ2 Sales: $75k Units: 750",
    },
    {
      icon: <DatabaseIcon className="h-8 w-8" />,
      title: "Inventory List",
      description: "Structure inventory data with quantities, locations, and status",
      example: "Laptop x5 - Warehouse A - In Stock",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <motion.h1 
            className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 to-violet-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Ready-to-Use Templates
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 dark:text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Choose a template to quickly transform your data
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {templates.map((template, index) => (
            <motion.div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-6">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-blue-500/10 text-blue-500 mx-auto mb-6">
                  {template.icon}
                </div>
                <h3 className="text-xl font-semibold text-center mb-4">{template.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                  {template.description}
                </p>
                <div className="bg-gray-50 dark:bg-gray-900 rounded p-4 mb-6">
                  <pre className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {template.example}
                  </pre>
                </div>
                <Button 
                  className="w-full"
                  onClick={() => {
                    const params = new URLSearchParams();
                    params.set('template', template.example);
                    setLocation(`/?${params.toString()}`);
                  }}
                >
                  Use Template
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
