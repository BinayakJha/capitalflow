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
        console.log('PDF Data:', documentData);
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
  const generateIncomeStatementPDF = (doc: jsPDF, documentData: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    const data = documentData.data;
    let yPos = 30;
  
    // Header
    doc.setFontSize(16);
    yPos += 8;
    doc.text("INCOME STATEMENT", pageWidth / 2, yPos, { align: 'center' });
  
    doc.setFontSize(10);
    yPos += 6;
    doc.setFont("helvetica", "normal");
    doc.text(`For Period: ${data.periodStart} to ${data.periodEnd}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 12;
  
    // Helpers
    const drawLineItem = (label: string, amount?: number, bold = false) => {
      doc.setFont("helvetica", bold ? "bold" : "normal");
      doc.setFontSize(11);
      doc.text(label, 30, yPos);
      if (amount !== undefined) {
        doc.text(`$${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, pageWidth - 30, yPos, { align: 'right' });
      }
      yPos += 8;
    };
  
    const drawUnderline = () => {
      yPos -= 2;
      doc.setDrawColor(0);
      doc.line(30, yPos, pageWidth - 30, yPos);
      yPos += 4;
    };
  
    const drawSpacing = (lines = 1) => {
      yPos += 4 * lines;
    };
  
    // --- Revenue Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("REVENUE", 30, yPos);
    yPos += 8;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (data.revenue?.categories?.length > 0) {
      data.revenue.categories.forEach((cat: any) => {
        drawLineItem(cat.category, cat.amount);
      });
    } else {
      drawLineItem("General Business Revenue", data.revenue?.total);
    }
  
    drawLineItem("Total Revenue", data.revenue?.total || 0, true);
    drawUnderline();
    drawSpacing();
  
    // --- Expenses Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EXPENSES", 30, yPos);
    yPos += 8;
  
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    if (data.expenses?.categories?.length > 0) {
      data.expenses.categories.forEach((cat: any) => {
        drawLineItem(cat.category, cat.amount);
      });
    } else {
      drawLineItem("General Business Expenses", data.expenses?.total);
    }
  
    drawLineItem("Total Expenses", data.expenses?.total || 0, true);
    drawUnderline();
    drawSpacing();
  
    // --- Summary Section ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text("SUMMARY", 30, yPos);
    yPos += 8;
  
    drawLineItem("Net Profit", data.profit, true);
    drawLineItem("Profit Margin (%)", data.profitMargin, true);
    drawUnderline();
    drawUnderline();
  
    // Footer
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text("Generated by CapitalFlow – AI-Powered Financial Assistant", 30, 285);
  };
  
  
  
  // Function to generate Cash Flow PDF
  const generateCashFlowPDF = (doc: jsPDF, data: any) => {
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPos = 50;
    const labelX = 30;
    const valueX = pageWidth - 30;
  
    const drawLine = () => {
      yPos += 2;
      doc.setDrawColor(160);
      doc.line(labelX, yPos, valueX, yPos);
      yPos += 6;
    };
  
    const drawRow = (
      label: string,
      value?: number | string,
      options: { bold?: boolean; italic?: boolean; color?: string } = {}
    ) => {
      const fontStyle = options.bold ? 'bold' : options.italic ? 'italic' : 'normal';
      doc.setFont('helvetica', fontStyle);
      doc.setFontSize(11);
  
      if (options.color === 'blue') doc.setTextColor(0, 0, 255);
      else doc.setTextColor(0, 0, 0);
  
      doc.text(label, labelX, yPos);
  
      if (value !== undefined) {
        const valStr =
          typeof value === 'number'
            ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
            : value;
        doc.text(valStr, valueX, yPos, { align: 'right' });
      }
  
      yPos += 8;
    };
  
    // === OPERATING ACTIVITIES ===
    drawRow('Cash Flow From Operations', undefined, { bold: true });
    drawRow('Net Earnings', data.data.operatingActivities.netIncome);
  
    drawRow('Additions to Cash', undefined, { italic: true });
    data.data.operatingActivities.adjustments
      .filter((a: any) => a.amount > 0)
      .forEach((adj: any) => {
        drawRow(adj.description, adj.amount);
      });
  
    drawRow('Subtractions From Cash', undefined, { italic: true });
    data.data.operatingActivities.adjustments
      .filter((a: any) => a.amount < 0)
      .forEach((adj: any) => {
        drawRow(adj.description, `(${Math.abs(adj.amount).toLocaleString()})`, { color: 'blue' });
      });
  
    drawRow('Net Cash From Operations', data.data.operatingActivities.netCash, { bold: true });
    drawLine();
  
    // === INVESTING ACTIVITIES ===
    drawRow('Cash Flow From Investing', undefined, { bold: true });
    data.data.investingActivities.items.forEach((item: any) => {
      const val = item.amount < 0
        ? `(${Math.abs(item.amount).toLocaleString()})`
        : item.amount;
      drawRow(item.description, val, item.amount < 0 ? { color: 'blue' } : {});
    });
    drawRow('Net Cash From Investing', data.data.investingActivities.netCash, { bold: true });
    drawLine();
  
    // === FINANCING ACTIVITIES ===
    drawRow('Cash Flow From Financing', undefined, { bold: true });
    data.data.financingActivities.items.forEach((item: any) => {
      drawRow(item.description, item.amount);
    });
    drawRow('Net Cash From Financing', data.data.financingActivities.netCash, { bold: true });
    drawLine();
  
    // === SUMMARY ===
    drawRow('Cash Flow Summary', undefined, { bold: true });
    drawRow('Net Change in Cash', data.data.netChange);
    drawRow('Starting Balance', data.data.startingBalance);
    drawRow('Ending Balance', data.data.endingBalance);
    drawLine();
  
    // === FINAL TOTAL ===
    drawRow(
      `Cash Flow for Period Ended`,
      data.data.endingBalance,
      { bold: true }
    );
  
    // === FOOTER ===
    yPos = 285;
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.setFont("helvetica", "italic");
    doc.text("This document was generated by CapitalFlow – AI-powered financial intelligence.", 20, yPos);
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