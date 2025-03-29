import { TableData } from "@shared/schema";
import { processTextWithGemini } from "./geminiService";
import { parseCSVToTableData } from "./fileParser";

// Function to transform raw data into structured table
export async function transformData(inputData: string): Promise<TableData> {
  try {
    // Clean the input data first
    const cleanedInput = inputData
      .replace(/```csv/gi, '') // Remove CSV markdown
      .replace(/```/g, '') // Remove other markdown
      .trim(); // Remove extra whitespace

    // First, check if the input is already in CSV format
    if (isCSVLike(cleanedInput)) {
      return parseCSVToTableData(cleanedInput);
    }
    
    // If not a clean CSV, process with Gemini AI
    console.log("Processing with Gemini AI...");
    const prompt = `Convert the following text into a clean CSV format with appropriate column headers. Return only the CSV data, no markdown or other formatting:

${cleanedInput}`;
    const processedCSV = await processTextWithGemini(prompt);
    
    // Clean the AI response and convert to TableData structure
    const cleanedCSV = processedCSV
      .replace(/```csv/gi, '')
      .replace(/```/g, '')
      .trim();
    return parseCSVToTableData(cleanedCSV);
  } catch (error) {
    console.error("Error in Gemini AI data transformation:", error);
    
    // Fallback to traditional parsing if AI processing fails
    return fallbackTransformation(inputData);
  }
}

// Helper function to check if data is already in CSV format
function isCSVLike(data: string): boolean {
  const lines = data.split('\n').filter(line => line.trim());
  if (lines.length < 2) return false; // Need at least header + one data row
  
  // Check if all lines have roughly the same number of commas
  const commasInFirstLine = (lines[0].match(/,/g) || []).length;
  if (commasInFirstLine === 0) return false; // Not CSV if no commas
  
  // Check if at least 80% of lines have the same number of commas
  const lineCount = lines.length;
  let matchingCommaCount = 0;
  
  for (const line of lines) {
    const commaCount = (line.match(/,/g) || []).length;
    if (Math.abs(commaCount - commasInFirstLine) <= 1) { // Allow small variations
      matchingCommaCount++;
    }
  }
  
  return (matchingCommaCount / lineCount) >= 0.8;
}

// Fallback transformation method using traditional parsing
function fallbackTransformation(inputData: string): TableData {
  try {
    // Process the input data based on its content
    const lines = inputData.split('\n').filter(line => line.trim());
    
    if (lines.length === 0) {
      throw new Error("No data found in input");
    }
    
    // Try to detect if this is delimited data
    const firstLine = lines[0];
    const possibleDelimiters = [',', '\t', '|', ';'];
    let bestDelimiter = '';
    let maxColumns = 0;
    
    for (const delimiter of possibleDelimiters) {
      const columnCount = firstLine.split(delimiter).length;
      if (columnCount > maxColumns) {
        maxColumns = columnCount;
        bestDelimiter = delimiter;
      }
    }
    
    // If we found a consistent delimiter with multiple columns
    if (maxColumns > 1) {
      // Process as delimited data
      const headers = lines[0].split(bestDelimiter).map(h => h.trim());
      const rows = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(bestDelimiter).map(v => v.trim());
        if (values.length === headers.length) {
          const row: Record<string, any> = {};
          headers.forEach((header, index) => {
            row[header] = values[index];
          });
          rows.push(row);
        }
      }
      
      return {
        columns: headers,
        rows
      };
    } else {
      // If the input looks like a list of items
      if (inputData.includes(':')) {
        // Try to extract key-value pairs
        const rows = [];
        const columns = new Set<string>();
        
        for (const line of lines) {
          const parts = line.split(':');
          if (parts.length >= 2) {
            const key = parts[0].trim();
            const value = parts.slice(1).join(':').trim();
            columns.add(key);
            rows.push({ [key]: value });
          }
        }
        
        return {
          columns: Array.from(columns),
          rows
        };
      } else {
        // Generate a simple single-column table
        return {
          columns: ['Data'],
          rows: lines.map(line => ({ Data: line }))
        };
      }
    }
  } catch (error) {
    console.error("Error in fallback data transformation:", error);
    // Return a minimal valid structure if processing fails
    return {
      columns: ['Error'],
      rows: [{ Error: 'Could not process the input data. Please try a different format.' }]
    };
  }
}

// Function to enhance data based on selected option
export async function enhanceData(enhancement: string, tableData: TableData): Promise<TableData> {
  // Make a deep copy of the input data to avoid modifying the original
  const updatedData = {
    columns: [...tableData.columns],
    rows: JSON.parse(JSON.stringify(tableData.rows))
  };
  
  try {
    switch (enhancement) {
      case "Clean Data":
        return cleanData(updatedData);
      case "Auto-Detect Categories":
        return detectCategories(updatedData);
      case "Merge Similar Rows":
        return mergeSimilarRows(updatedData);
      case "Fill Missing Values":
        return fillMissingValues(updatedData);
      default:
        // If unknown enhancement, return unchanged data
        return tableData;
    }
  } catch (error) {
    console.error(`Error applying enhancement "${enhancement}":`, error);
    // Return the original data if enhancement fails
    return tableData;
  }
}

// Helper function to clean data
function cleanData(tableData: TableData): TableData {
  // Remove any rows with empty values in all columns
  const cleanedRows = tableData.rows.filter(row => {
    return Object.values(row).some(value => 
      value !== undefined && value !== null && value !== ''
    );
  });
  
  // Standardize date formats
  for (const row of cleanedRows) {
    for (const col of tableData.columns) {
      if (typeof row[col] === 'string') {
        // Clean up values
        row[col] = row[col].trim();
        
        // Standardize date format if the column name suggests a date
        if (col.toLowerCase().includes('date')) {
          const dateValue = row[col];
          // Try to parse and standardize the date
          try {
            const date = new Date(dateValue);
            if (!isNaN(date.getTime())) {
              row[col] = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
            }
          } catch (e) {
            // Keep original if date parsing fails
          }
        }
        
        // Standardize currency format if the column name suggests money
        if (col.toLowerCase().includes('price') || 
            col.toLowerCase().includes('revenue') || 
            col.toLowerCase().includes('cost')) {
          const value = row[col];
          if (typeof value === 'string' && value.includes('$')) {
            // Extract the number from a currency string
            const numericValue = value.replace(/[$,]/g, '');
            if (!isNaN(parseFloat(numericValue))) {
              row[col] = `$${parseFloat(numericValue).toFixed(2)}`;
            }
          }
        }
      }
    }
  }
  
  return {
    columns: tableData.columns,
    rows: cleanedRows
  };
}

// Helper function to detect categories
function detectCategories(tableData: TableData): TableData {
  // Add a new DataType column
  const updatedColumns = [...tableData.columns, 'DataType'];
  
  const updatedRows = tableData.rows.map(row => {
    const updatedRow = { ...row, DataType: {} };
    
    for (const col of tableData.columns) {
      const value = row[col];
      if (typeof value === 'string') {
        // Detect date
        if (/^\d{4}-\d{2}-\d{2}$/.test(value) || 
            /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(value)) {
          updatedRow.DataType[col] = 'Date';
        }
        // Detect currency
        else if (/^\$?\d+(\.\d{2})?$/.test(value) || 
                /^\$?\d{1,3}(,\d{3})*(\.\d{2})?$/.test(value)) {
          updatedRow.DataType[col] = 'Currency';
        }
        // Detect percentage
        else if (/^\d+(\.\d+)?%$/.test(value)) {
          updatedRow.DataType[col] = 'Percentage';
        }
        // Detect category-like values
        else if (['electronics', 'accessories', 'wearables'].includes(value.toLowerCase())) {
          updatedRow.DataType[col] = 'Category';
        }
        // Detect product IDs
        else if (/^[A-Z]{2,3}-\d{3,6}$/.test(value)) {
          updatedRow.DataType[col] = 'ProductID';
        }
      }
    }
    
    // Flatten the DataType object to a string
    const dataTypes = Object.entries(updatedRow.DataType)
      .map(([col, type]) => `${col}: ${type}`)
      .join(', ');
    
    updatedRow.DataType = dataTypes || 'No special types detected';
    
    return updatedRow;
  });
  
  return {
    columns: updatedColumns,
    rows: updatedRows
  };
}

// Helper function to merge similar rows
function mergeSimilarRows(tableData: TableData): TableData {
  // Group rows by some key columns
  const keyColumns = tableData.columns.filter(col => 
    !col.toLowerCase().includes('quantity') && 
    !col.toLowerCase().includes('price') && 
    !col.toLowerCase().includes('revenue')
  );
  
  if (keyColumns.length === 0) {
    // If no suitable key columns, return the original data
    return tableData;
  }
  
  const mergedRowsMap = new Map();
  
  for (const row of tableData.rows) {
    // Create a key from the key columns
    const key = keyColumns.map(col => row[col]).join('|');
    
    if (mergedRowsMap.has(key)) {
      // Merge numeric values
      const mergedRow = mergedRowsMap.get(key);
      for (const col of tableData.columns) {
        if (!keyColumns.includes(col)) {
          const value = row[col];
          if (typeof value === 'string' && /^\d+(\.\d+)?$/.test(value.replace(/[$,%]/g, ''))) {
            const numValue = parseFloat(value.replace(/[$,%]/g, ''));
            const existingValue = mergedRow[col];
            const existingNumValue = existingValue ? parseFloat(existingValue.replace(/[$,%]/g, '')) : 0;
            
            // Determine the format of the original value
            const isPercent = value.includes('%');
            const isCurrency = value.includes('$');
            
            // Update the merged value with the sum
            const updatedValue = (existingNumValue + numValue).toString();
            
            // Apply the formatting
            if (isPercent) {
              mergedRow[col] = `${updatedValue}%`;
            } else if (isCurrency) {
              mergedRow[col] = `$${updatedValue}`;
            } else {
              mergedRow[col] = updatedValue;
            }
          }
        }
      }
    } else {
      // Create a new entry
      mergedRowsMap.set(key, { ...row });
    }
  }
  
  return {
    columns: tableData.columns,
    rows: Array.from(mergedRowsMap.values())
  };
}

// Helper function to fill missing values
function fillMissingValues(tableData: TableData): TableData {
  const updatedRows = tableData.rows.map(row => {
    const updatedRow = { ...row };
    
    for (const col of tableData.columns) {
      if (updatedRow[col] === undefined || updatedRow[col] === null || updatedRow[col] === '') {
        // For numeric columns, use average
        const isNumericColumn = tableData.rows.some(r => {
          const val = r[col];
          return val && typeof val === 'string' && !isNaN(parseFloat(val.replace(/[$,%]/g, '')));
        });
        
        if (isNumericColumn) {
          // Calculate average
          let sum = 0;
          let count = 0;
          for (const r of tableData.rows) {
            if (r[col] !== undefined && r[col] !== null && r[col] !== '') {
              const numVal = parseFloat(r[col].toString().replace(/[$,%]/g, ''));
              if (!isNaN(numVal)) {
                sum += numVal;
                count++;
              }
            }
          }
          
          if (count > 0) {
            const avg = sum / count;
            updatedRow[col] = avg.toFixed(2);
          } else {
            updatedRow[col] = '0';
          }
        } else {
          // For non-numeric columns, use the most common value
          const valueCounts = new Map();
          for (const r of tableData.rows) {
            if (r[col] !== undefined && r[col] !== null && r[col] !== '') {
              const value = r[col].toString();
              valueCounts.set(value, (valueCounts.get(value) || 0) + 1);
            }
          }
          
          if (valueCounts.size > 0) {
            // Find the most common value
            let mostCommonValue = '';
            let maxCount = 0;
            for (const [value, count] of valueCounts.entries()) {
              if (count > maxCount) {
                mostCommonValue = value;
                maxCount = count;
              }
            }
            
            updatedRow[col] = mostCommonValue;
          } else {
            updatedRow[col] = 'Unknown';
          }
        }
      }
    }
    
    return updatedRow;
  });
  
  return {
    columns: tableData.columns,
    rows: updatedRows
  };
}

// Sample data generator for demonstration purposes
function generateSampleSalesData(): TableData {
  return {
    columns: ['Date', 'Product', 'Category', 'Quantity', 'Price', 'Revenue'],
    rows: [
      {
        Date: '2023-01-05',
        Product: 'Laptop Pro',
        Category: 'Electronics',
        Quantity: '3',
        Price: '$1,200.00',
        Revenue: '$3,600.00'
      },
      {
        Date: '2023-01-12',
        Product: 'Wireless Mouse',
        Category: 'Accessories',
        Quantity: '10',
        Price: '$49.99',
        Revenue: '$499.90'
      },
      {
        Date: '2023-01-18',
        Product: 'Smart Watch',
        Category: 'Wearables',
        Quantity: '5',
        Price: '$299.95',
        Revenue: '$1,499.75'
      },
      {
        Date: '2023-02-03',
        Product: 'Wireless Keyboard',
        Category: 'Accessories',
        Quantity: '7',
        Price: '$79.99',
        Revenue: '$559.93'
      },
      {
        Date: '2023-02-10',
        Product: 'Laptop Pro',
        Category: 'Electronics',
        Quantity: '2',
        Price: '$1,200.00',
        Revenue: '$2,400.00'
      }
    ]
  };
}
