import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generatePDF } from '@/lib/api';
import { jsPDF } from 'jspdf';
import { useToast } from '@/hooks/use-toast';

interface PdfGeneratorProps {
  documentId: number;
  documentType: string;
  documentTitle: string;
}

export function PdfGenerator({ documentId, documentType, documentTitle }: PdfGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleDownload = async () => {
    try {
      setIsGenerating(true);
      
      // Get the document data from the server
      const documentData = await generatePDF(documentId);
      
      // Create a new PDF document
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Add title
      doc.setFontSize(18);
      doc.text(documentTitle, pageWidth / 2, 20, { align: 'center' });
      
      // Add metadata
      doc.setFontSize(10);
      const currentDate = new Date().toLocaleDateString();
      doc.text(`Generated on: ${currentDate}`, pageWidth / 2, 30, { align: 'center' });
      
      // Add different content based on document type
      if (documentType === 'income_statement') {
        generateIncomeStatementPDF(doc, documentData);
      } else if (documentType === 'cash_flow') {
        generateCashFlowPDF(doc, documentData);
      } else {
        // Generic document rendering
        doc.setFontSize(12);
        doc.text('Document Content:', 20, 50);
        
        if (documentData.content && typeof documentData.content === 'string') {
          const textLines = doc.splitTextToSize(documentData.content, pageWidth - 40);
          doc.text(textLines, 20, 60);
        } else {
          doc.text('Content is not available in text format', 20, 60);
        }
      }
      
      // Save the PDF
      doc.save(`${documentTitle.replace(/\s+/g, '_')}.pdf`);
      
      toast({
        title: 'PDF Generated',
        description: 'Your document has been downloaded',
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Generation Failed',
        description: 'Failed to generate PDF. Try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  // Function to generate Income Statement PDF
  const generateIncomeStatementPDF = (doc: jsPDF, data: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 50;
    
    // Period information
    doc.setFontSize(12);
    doc.text(`Period: ${data.data.periodStart} to ${data.data.periodEnd}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Revenue Section
    doc.setFontSize(14);
    doc.text('Revenue', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    // Revenue categories
    if (data.data.revenue.categories && data.data.revenue.categories.length > 0) {
      data.data.revenue.categories.forEach((category: any) => {
        doc.text(`${category.category}`, 30, yPos);
        doc.text(`$${category.amount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Total revenue
    doc.setFontSize(12);
    yPos += 5;
    doc.text('Total Revenue:', 30, yPos);
    doc.text(`$${data.data.revenue.total.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 15;
    
    // Expenses Section
    doc.setFontSize(14);
    doc.text('Expenses', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(10);
    // Expense categories
    if (data.data.expenses.categories && data.data.expenses.categories.length > 0) {
      data.data.expenses.categories.forEach((category: any) => {
        doc.text(`${category.category}`, 30, yPos);
        doc.text(`$${category.amount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Total expenses
    doc.setFontSize(12);
    yPos += 5;
    doc.text('Total Expenses:', 30, yPos);
    doc.text(`$${data.data.expenses.total.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 15;
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text('Net Profit:', 30, yPos);
    doc.text(`$${data.data.profit.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 8;
    
    doc.text('Profit Margin:', 30, yPos);
    doc.text(`${(data.data.profitMargin).toFixed(2)}%`, pageWidth - 30, yPos, { align: 'right' });
  };
  
  // Function to generate Cash Flow PDF
  const generateCashFlowPDF = (doc: jsPDF, data: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 50;
    
    // Period information
    doc.setFontSize(12);
    doc.text(`Period: ${data.data.periodStart} to ${data.data.periodEnd}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    // Operating Activities
    doc.setFontSize(14);
    doc.text('Operating Activities', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text('Net Income:', 30, yPos);
    doc.text(`$${data.data.operatingActivities.netIncome.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 8;
    
    // Adjustments
    doc.setFontSize(10);
    if (data.data.operatingActivities.adjustments && data.data.operatingActivities.adjustments.length > 0) {
      data.data.operatingActivities.adjustments.forEach((adjustment: any) => {
        doc.text(`${adjustment.description}`, 40, yPos);
        doc.text(`$${adjustment.amount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Net cash from operations
    doc.setFontSize(12);
    yPos += 5;
    doc.text('Net Cash from Operating Activities:', 30, yPos);
    doc.text(`$${data.data.operatingActivities.netCash.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 15;
    
    // Investing Activities
    doc.setFontSize(14);
    doc.text('Investing Activities', 20, yPos);
    yPos += 10;
    
    // Investing items
    doc.setFontSize(10);
    if (data.data.investingActivities.items && data.data.investingActivities.items.length > 0) {
      data.data.investingActivities.items.forEach((item: any) => {
        doc.text(`${item.description}`, 30, yPos);
        doc.text(`$${item.amount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Net cash from investing
    doc.setFontSize(12);
    yPos += 5;
    doc.text('Net Cash from Investing Activities:', 30, yPos);
    doc.text(`$${data.data.investingActivities.netCash.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 15;
    
    // Financing Activities
    doc.setFontSize(14);
    doc.text('Financing Activities', 20, yPos);
    yPos += 10;
    
    // Financing items
    doc.setFontSize(10);
    if (data.data.financingActivities.items && data.data.financingActivities.items.length > 0) {
      data.data.financingActivities.items.forEach((item: any) => {
        doc.text(`${item.description}`, 30, yPos);
        doc.text(`$${item.amount.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
        yPos += 6;
      });
    }
    
    // Net cash from financing
    doc.setFontSize(12);
    yPos += 5;
    doc.text('Net Cash from Financing Activities:', 30, yPos);
    doc.text(`$${data.data.financingActivities.netCash.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 15;
    
    // Summary
    doc.setFontSize(14);
    doc.text('Summary', 20, yPos);
    yPos += 10;
    
    doc.setFontSize(12);
    doc.text('Net Change in Cash:', 30, yPos);
    doc.text(`$${data.data.netChange.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 8;
    
    doc.text('Starting Balance:', 30, yPos);
    doc.text(`$${data.data.startingBalance.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
    yPos += 8;
    
    doc.text('Ending Balance:', 30, yPos);
    doc.text(`$${data.data.endingBalance.toFixed(2)}`, pageWidth - 30, yPos, { align: 'right' });
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleDownload} 
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Generating...
        </>
      ) : (
        'Download PDF'
      )}
    </Button>
  );
}