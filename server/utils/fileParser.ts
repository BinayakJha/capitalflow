import { 
  extractTableFromImage, 
  extractTableFromPDF, 
  processCSVWithGemini 
} from './geminiService';
import Papa from 'papaparse';

// Helper function to parse different file types
export async function parseFile(fileData: string, fileName: string = ''): Promise<string> {
  try {
    // Check if the fileData is a base64 data URL
    if (fileData.startsWith('data:')) {
      // Extract file type from MIME type
      const mimeMatch = fileData.match(/data:(.*?);/);
      const mimeType = mimeMatch ? mimeMatch[1] : '';
      
      if (mimeType) {
        if (mimeType.includes('image')) {
          // Use Gemini AI to extract table data from the image
          console.log("Processing image with Gemini AI...");
          return await extractTableFromImage(fileData);
        } else if (mimeType.includes('pdf')) {
          // For PDF files, we'd ideally use a PDF extraction library first,
          // then pass the extracted text to Gemini
          console.log("Processing PDF with Gemini AI...");
          
          // In a production app, we would extract text from PDF first
          // Here we're passing the base64 content directly
          return await extractTableFromPDF(fileData);
        } else if (mimeType.includes('spreadsheet') || 
                  mimeType.includes('excel') || 
                  mimeType.includes('csv')) {
          // For CSV data, clean it with Gemini
          console.log("Processing spreadsheet data...");
          
          // If it's base64 encoded, decode it first
          const content = fileData.includes('base64,') 
            ? atob(fileData.split('base64,')[1])
            : fileData;
            
          return await processCSVWithGemini(content);
        }
      }
    } else if (fileName) {
      // Check file extension for non-base64 data
      const extension = fileName.split('.').pop()?.toLowerCase();
      
      if (extension === 'csv') {
        return await processCSVWithGemini(fileData);
      } else if (extension === 'txt' || extension === 'json') {
        // For text files, return as is
        return fileData;
      }
    }
    
    // For direct text data or when we can't determine the type
    return fileData;
  } catch (error) {
    console.error("Error parsing file:", error);
    throw new Error("Failed to parse file data");
  }
}

// Helper function to convert CSV string to TableData
export function parseCSVToTableData(csvString: string): any {
  try {
    const parsedResult = Papa.parse(csvString, {
      header: true,
      skipEmptyLines: true
    });
    
    if (parsedResult.errors && parsedResult.errors.length > 0) {
      console.warn("CSV parsing warnings:", parsedResult.errors);
    }
    
    return {
      columns: parsedResult.meta.fields || [],
      rows: parsedResult.data
    };
  } catch (error) {
    console.error("Error parsing CSV to table data:", error);
    throw new Error("Failed to parse CSV to table structure");
  }
}
