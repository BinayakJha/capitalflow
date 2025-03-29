import { TableData } from "@shared/schema";
import { processTextWithGemini } from "./geminiService";
import { parseCSVToTableData } from "./fileParser";

/**
 * Generate a structured table from text with specific columns
 * 
 * @param text The input text to process
 * @param columns Optional array of column names to include in the structured table
 * @param tableType Optional type of table to generate (e.g., "sales", "contacts", "inventory")
 * @returns A TableData object with the structured data
 */
export async function generateStructuredTable(
  text: string,
  columns?: string[],
  tableType?: string
): Promise<TableData> {
  try {
    // Create a prompt specifying the desired table structure
    let prompt = `
      Extract structured data from the following text and convert it into a well-formatted table.
      ${tableType ? `The data should be organized as a ${tableType} table.` : ''}
      ${columns && columns.length > 0 
        ? `Include specifically these columns in the resulting table: ${columns.join(', ')}.` 
        : 'Identify the most appropriate columns based on the content.'}
      Your response should be formatted as a CSV string with the first row containing column headers.
      Only respond with the CSV formatted data, no additional explanations.

      Here's the text:
      
      ${text}
    `;

    console.log(`Generating structured table with ${columns ? 'specified columns' : 'auto-detected columns'}`);
    
    // Process with Gemini AI
    const processedCSV = await processTextWithGemini(prompt);
    
    // Convert the processed CSV to TableData structure
    const tableData = parseCSVToTableData(processedCSV);
    
    return tableData;
  } catch (error) {
    console.error("Error generating structured table:", error);
    
    // Return a minimal valid structure if processing fails
    return {
      columns: columns || ['Error'],
      rows: [{ 
        [columns?.[0] || 'Error']: 'Failed to generate structured table. Please try with different input or column specifications.' 
      }]
    };
  }
}

/**
 * Extract specific entities from text and organize into a structured table
 * 
 * @param text The input text to process
 * @param entityType The type of entities to extract (e.g., "people", "companies", "products")
 * @returns A TableData object with the extracted entities
 */
export async function extractEntities(
  text: string,
  entityType: string
): Promise<TableData> {
  try {
    // Create a prompt for entity extraction
    const prompt = `
      Extract all ${entityType} from the following text.
      For each ${entityType}, identify relevant attributes and properties.
      Organize the extracted information into a table format with appropriate columns.
      Your response should be formatted as a CSV string with the first row containing column headers.
      Only respond with the CSV formatted data, no additional explanations.

      Here's the text:
      
      ${text}
    `;

    console.log(`Extracting ${entityType} entities from text`);
    
    // Process with Gemini AI
    const processedCSV = await processTextWithGemini(prompt);
    
    // Convert the processed CSV to TableData structure
    const tableData = parseCSVToTableData(processedCSV);
    
    return tableData;
  } catch (error) {
    console.error(`Error extracting ${entityType} entities:`, error);
    
    // Return a minimal valid structure if processing fails
    return {
      columns: [`${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`, 'Error'],
      rows: [{ 
        [`${entityType.charAt(0).toUpperCase() + entityType.slice(1)}`]: 'Entity extraction failed',
        'Error': 'Please try with different text or entity type' 
      }]
    };
  }
}