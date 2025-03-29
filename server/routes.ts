import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import z from "zod";
import { transformData, enhanceData } from "./utils/dataProcessor";
import { parseFile, parseCSVToTableData } from "./utils/fileParser";
import { generateVisualization } from "./utils/visualizationGenerator";
import { answerTableQuestionWithGemini, enhanceTableWithGemini } from "./utils/geminiService";
import { generateStructuredTable, extractEntities } from "./utils/structuredTableGenerator";

export async function registerRoutes(app: Express): Promise<Server> {
  // Data transformation endpoint
  app.post("/api/transform", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string().optional(),
        fileData: z.any().optional(),
        fileName: z.string().optional(),
      }).refine(data => data.text || data.fileData, {
        message: "Either text or fileData must be provided"
      });

      const { text, fileData, fileName } = schema.parse(req.body);
      console.log(`Processing transformation request: ${fileName || "text input"}`);

      let inputData;
      if (fileData) {
        // Handle file data
        console.log(`Parsing file: ${fileName || "unknown file"}`);
        inputData = await parseFile(fileData, fileName || "");
      } else if (text) {
        // Handle text input
        console.log("Processing text input");
        inputData = text;
      }

      if (!inputData) {
        throw new Error("No valid input data provided");
      }

      // Transform the data into a structured table using AI-powered transformation
      console.log("Transforming data into structured table");
      const transformedData = await transformData(inputData);
      
      // Return the structured data
      res.json(transformedData);
    } catch (error: any) {
      console.error("Error transforming data:", error);
      res.status(400).json({ 
        error: error.message || "Failed to transform data",
        processingInfo: {
          aiProcessed: false,
          errorDetails: error.stack || "Unknown error"
        }
      });
    }
  });

  // Query endpoint for chat interface
  app.post("/api/query", async (req, res) => {
    try {
      const schema = z.object({
        query: z.string(),
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { query, tableData } = schema.parse(req.body);
      console.log(`Processing query: "${query}"`);

      // Use Gemini to answer questions about the table
      const answer = await answerTableQuestionWithGemini(tableData, query);
      let updatedData = null;

      // For specific operations that require data manipulation, process the data
      if (query.toLowerCase().includes("sort") || query.toLowerCase().includes("order")) {
        // Sort the data
        const sortedData = { ...tableData };
        
        // Try to determine which column to sort by
        const columnMatches = tableData.columns.filter(col => 
          query.toLowerCase().includes(col.toLowerCase())
        );
        
        if (columnMatches.length > 0) {
          const sortColumn = columnMatches[0];
          const sortDescending = query.toLowerCase().includes("highest") || 
                                query.toLowerCase().includes("descending") || 
                                query.toLowerCase().includes("desc");
          
          sortedData.rows = [...tableData.rows].sort((a, b) => {
            let aVal = a[sortColumn];
            let bVal = b[sortColumn];
            
            // Check if the values are numeric (possibly with currency symbols)
            if (typeof aVal === 'string' && typeof bVal === 'string') {
              aVal = parseFloat(aVal.replace(/[$,]/g, ''));
              bVal = parseFloat(bVal.replace(/[$,]/g, ''));
            }
            
            if (typeof aVal === 'number' && typeof bVal === 'number') {
              return sortDescending ? bVal - aVal : aVal - bVal;
            } else if (typeof aVal === 'string' && typeof bVal === 'string') {
              return sortDescending ? bVal.localeCompare(aVal) : aVal.localeCompare(bVal);
            }
            return 0;
          });
          
          updatedData = sortedData;
        }
      } else if (query.toLowerCase().includes("remove duplicate") || query.toLowerCase().includes("deduplicate")) {
        // Remove duplicates
        const deduplicatedRows = [];
        const seen = new Set();
        
        for (const row of tableData.rows) {
          // Create a unique key from all values
          const key = JSON.stringify(Object.values(row));
          if (!seen.has(key)) {
            seen.add(key);
            deduplicatedRows.push(row);
          }
        }
        
        updatedData = {
          ...tableData,
          rows: deduplicatedRows
        };
      } else if (query.toLowerCase().includes("filter") || query.toLowerCase().includes("show only")) {
        // Attempt to extract filter criteria
        const columnMatches = tableData.columns.filter(col => 
          query.toLowerCase().includes(col.toLowerCase())
        );
        
        if (columnMatches.length > 0) {
          const filterColumn = columnMatches[0];
          let filterValue = "";
          
          // Extract the filter value from the query
          const words = query.split(" ");
          const columnIndex = words.findIndex(word => 
            word.toLowerCase().includes(filterColumn.toLowerCase())
          );
          
          if (columnIndex >= 0 && columnIndex < words.length - 2) {
            // Look for potential filter values after the column name
            // Simplistic approach: take the next word that isn't a common preposition

app.post('/api/save-visualization', async (req, res) => {
  const { tableData, visualizationData } = req.body;
  const XLSX = require('xlsx');
  
  // Create a new workbook
  const wb = XLSX.utils.book_new();
  
  // Convert table data to worksheet
  const ws = XLSX.utils.json_to_sheet(tableData.rows);
  XLSX.utils.book_append_sheet(wb, ws, "Data");
  
  // Write to buffer
  const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  
  // Send the file
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=visualization-report.xlsx');
  res.send(buffer);
});

            const skipWords = ["with", "by", "where", "is", "equals", "equal", "to", "than", "containing"];
            for (let i = columnIndex + 1; i < words.length; i++) {
              if (!skipWords.includes(words[i].toLowerCase())) {
                filterValue = words[i].replace(/['",.]/g, '');
                break;
              }
            }
          }
          
          if (filterValue) {
            const filteredRows = tableData.rows.filter(row => {
              const cellValue = String(row[filterColumn] || "").toLowerCase();
              return cellValue.includes(filterValue.toLowerCase());
            });
            
            updatedData = {
              ...tableData,
              rows: filteredRows
            };
          }
        }
      }

      res.json({
        response: answer,
        updatedData
      });
    } catch (error: any) {
      console.error("Error processing query:", error);
      res.status(400).json({ error: error.message || "Failed to process query" });
    }
  });

  // Data enhancement endpoint
  app.post("/api/enhance", async (req, res) => {
    try {
      const schema = z.object({
        enhancement: z.string(),
        instructions: z.string().optional(),
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { enhancement, instructions, tableData } = schema.parse(req.body);
      console.log(`Enhancing data with: ${enhancement}`);

      let updatedData;

      // If custom instructions are provided, use Gemini to apply them
      if (instructions) {
        console.log(`Applying custom enhancement instructions: ${instructions}`);
        const enhancedCSV = await enhanceTableWithGemini(tableData, instructions);
        // Parse the CSV response from Gemini back to TableData format
        updatedData = parseCSVToTableData(enhancedCSV);
      } else {
        // Fall back to predefined enhancements
        updatedData = await enhanceData(enhancement, tableData);
      }

      res.json({
        updatedData
      });
    } catch (error: any) {
      console.error("Error enhancing data:", error);
      res.status(400).json({ error: error.message || "Failed to enhance data" });
    }
  });

  // Visualization endpoint
  app.post("/api/visualize", async (req, res) => {
    try {
      const schema = z.object({
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { tableData } = schema.parse(req.body);

      // Generate visualization
      const visualizationData = await generateVisualization(tableData);

      res.json({
        visualizationData
      });
    } catch (error: any) {
      console.error("Error generating visualization:", error);
      res.status(400).json({ error: error.message || "Failed to generate visualization" });
    }
  });

  // Structured table generation endpoint
  app.post("/api/structured-table", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string(),
        columns: z.array(z.string()).optional(),
        tableType: z.string().optional()
      });

      const { text, columns, tableType } = schema.parse(req.body);
      console.log(`Generating structured table${tableType ? ` of type: ${tableType}` : ''}`);

      // Generate structured table using Gemini AI
      const tableData = await generateStructuredTable(text, columns, tableType);

      res.json({
        tableData
      });
    } catch (error: any) {
      console.error("Error generating structured table:", error);
      res.status(400).json({ error: error.message || "Failed to generate structured table" });
    }
  });

  // Entity extraction endpoint
  app.post("/api/extract-entities", async (req, res) => {
    try {
      const schema = z.object({
        text: z.string(),
        entityType: z.string()
      });

      const { text, entityType } = schema.parse(req.body);
      console.log(`Extracting ${entityType} entities from text`);

      // Extract entities using Gemini AI
      const tableData = await extractEntities(text, entityType);

      res.json({
        tableData
      });
    } catch (error: any) {
      console.error("Error extracting entities:", error);
      res.status(400).json({ error: error.message || "Failed to extract entities" });
    }
  });
  
  // AI-assisted table editing endpoint
  app.post("/api/ai-edit", async (req, res) => {
    try {
      const schema = z.object({
        prompt: z.string(),
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { prompt, tableData } = schema.parse(req.body);
      console.log(`Processing AI table edit request: "${prompt}"`);

      // Use Gemini to apply the edit instruction to the table
      const enhancedCSV = await enhanceTableWithGemini(tableData, prompt);
      
      // Parse the CSV response from Gemini back to TableData format
      const updatedData = parseCSVToTableData(enhancedCSV);
      
      // Generate an explanation for the changes made
      const explanation = await answerTableQuestionWithGemini(
        updatedData, 
        `Explain briefly what changes were made to the table based on the instruction: "${prompt}". Keep the explanation concise.`
      );

      res.json({
        updatedData,
        explanation
      });
    } catch (error: any) {
      console.error("Error processing AI edit:", error);
      res.status(400).json({ error: error.message || "Failed to process AI edit request" });
    }
  });
  
  // Auto-clean table endpoint
  app.post("/api/auto-clean", async (req, res) => {
    try {
      const schema = z.object({
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { tableData } = schema.parse(req.body);
      console.log("Running auto-clean on table data");

      // A comprehensive cleaning prompt that addresses common table issues
      const cleaningPrompt = `
        Thoroughly clean and improve this table by:
        1. Fixing any formatting inconsistencies
        2. Standardizing date formats (to YYYY-MM-DD)
        3. Standardizing numeric values (use proper decimal points)
        4. Removing any duplicate rows
        5. Filling in obvious missing values
        6. Ensuring consistent capitalization in text fields
        7. Correcting spelling errors
        8. Removing any extraneous spaces or characters
        9. Detecting and standardizing units (e.g., currency symbols)
        10. Identifying and fixing any data type issues
        Return the cleaned table data only, maintaining the original structure where possible.
      `;

      // Use the same Gemini enhancement function but with a comprehensive cleaning prompt
      const enhancedCSV = await enhanceTableWithGemini(tableData, cleaningPrompt);
      
      // Parse the CSV response from Gemini back to TableData format
      const updatedData = parseCSVToTableData(enhancedCSV);
      
      // Generate a summary of the cleaning changes made
      const cleaningSummary = await answerTableQuestionWithGemini(
        updatedData, 
        "What improvements and fixes were made to clean this table? List the main changes in a concise bullet-point format."
      );

      res.json({
        updatedData,
        cleaningSummary
      });
    } catch (error: any) {
      console.error("Error auto-cleaning table:", error);
      res.status(400).json({ error: error.message || "Failed to auto-clean table" });
    }
  });
  
  // Formula evaluation endpoint
  app.post("/api/evaluate-formula", async (req, res) => {
    try {
      const schema = z.object({
        formula: z.string(),
        formulaType: z.string().optional(),
        columnName: z.string().optional(),
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { formula, formulaType, columnName, tableData } = schema.parse(req.body);
      console.log(`Evaluating ${formulaType || 'custom'} formula: "${formula}"`);

      // Prepare a prompt for Gemini to apply the formula to the table
      let formulaPrompt = `Apply the following formula to the table data: ${formula}`;
      
      if (formulaType && formulaType !== 'custom') {
        // Handle predefined formula types
        if (formulaType === 'sum') {
          formulaPrompt = `Calculate the sum of the ${columnName} column and add a new row with the result.`;
        } else if (formulaType === 'average') {
          formulaPrompt = `Calculate the average of the ${columnName} column and add a new row with the result.`;
        } else if (formulaType === 'max') {
          formulaPrompt = `Find the maximum value in the ${columnName} column and add a new row with the result.`;
        } else if (formulaType === 'min') {
          formulaPrompt = `Find the minimum value in the ${columnName} column and add a new row with the result.`;
        } else if (formulaType === 'count') {
          formulaPrompt = `Count the number of non-empty values in the ${columnName} column and add a new row with the result.`;
        } else if (formulaType === 'percentage') {
          formulaPrompt = `Calculate each value in the ${columnName} column as a percentage of the total and add a new column with the results.`;
        } else if (formulaType === 'growth') {
          formulaPrompt = `Calculate the growth rate between consecutive values in the ${columnName} column and add a new column with the results.`;
        }
      }
      
      // Use Gemini to apply the formula to the table
      const enhancedCSV = await enhanceTableWithGemini(tableData, formulaPrompt);
      
      // Parse the CSV response from Gemini back to TableData format
      const updatedData = parseCSVToTableData(enhancedCSV);
      
      // Generate an explanation of the formula result
      const explanation = await answerTableQuestionWithGemini(
        updatedData, 
        `Explain what the formula "${formula}" did to the table data. Keep it simple and concise.`
      );

      res.json({
        updatedData,
        explanation
      });
    } catch (error: any) {
      console.error("Error evaluating formula:", error);
      res.status(400).json({ error: error.message || "Failed to evaluate formula" });
    }
  });

  // Story generation endpoint
  app.post("/api/generate-story", async (req, res) => {
    try {
      const schema = z.object({
        tableData: z.object({
          columns: z.array(z.string()),
          rows: z.array(z.record(z.any()))
        })
      });

      const { tableData } = schema.parse(req.body);
      console.log("Generating data story");

      // Use Gemini to generate an insightful story about the data
      const prompt = `Analyze this table data and create a concise, insightful story about what the data reveals. 
      Include key patterns, trends, and notable insights. Format the response in 2-3 short paragraphs.
      Focus on the most interesting aspects of the data.`;

      const story = await answerTableQuestionWithGemini(tableData, prompt);

      res.json({ story });
    } catch (error: any) {
      console.error("Error generating story:", error);
      res.status(400).json({ error: error.message || "Failed to generate story" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
