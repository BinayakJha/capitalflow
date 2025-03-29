import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold, GenerativeModel } from '@google/generative-ai';

// Access Gemini API key from env
const apiKey = "AIzaSyCDSeOpimxne2qBdbtBDY6HLIePu6KxYo0";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);

// Safety settings to filter out harmful content
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Configure the generation parameters
const generationConfig = {
  temperature: 0.4,  // Lower temperature for more deterministic outputs
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 2048,
};

// Initialize Gemini-2.0-flash model
const model: GenerativeModel = genAI.getGenerativeModel({
  model: "gemini-2.0-flash", // Using the latest Flash model for faster processing
  safetySettings,
  generationConfig,
});

/**
 * Process text data using Gemini to extract structured data
 */
export async function processTextWithGemini(text: string): Promise<string> {
  try {
    const prompt = `
      Extract structured data from the following text and convert it into a well-formatted table.
      If the text contains multiple items with similar properties, organize them into a coherent table with appropriate headers.
      If there are key-value pairs, convert them into a table with columns for keys and values.
      Your response should be formatted as a CSV string with the first row containing column headers.
      Only respond with the CSV formatted data, no additional explanations.

      Here's the text:
      
      ${text}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const textResponse = response.text();

    return textResponse;
  } catch (error) {
    console.error('Error processing text with Gemini:', error);
    throw new Error('Failed to process text with AI');
  }
}

/**
 * Extract tabular data from image content
 */
export async function extractTableFromImage(base64Image: string): Promise<string> {
  try {
    // Remove data URL prefix if present
    const base64Content = base64Image.includes('base64,') 
      ? base64Image.split('base64,')[1] 
      : base64Image;
    
    // Create an image part for the model
    const imageParts = [
      {
        inlineData: {
          data: base64Content,
          mimeType: "image/jpeg", // Adjust based on actual image type
        },
      },
    ];

    const prompt = `
      Extract any tabular or structured data from this image.
      If there's a table, extract all rows and columns with their data.
      If there's no clear table but there is structured data, organize it into a logical table format.
      Format your response as a CSV string with the first row containing column headers.
      Only respond with the CSV data, no additional explanations.
    `;

    const result = await model.generateContent([prompt, ...imageParts]);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error extracting table from image:', error);
    throw new Error('Failed to extract data from image');
  }
}

/**
 * Process PDF content to extract structured data
 */
export async function extractTableFromPDF(pdfText: string): Promise<string> {
  try {
    const prompt = `
      Extract structured tabular data from the following PDF text content.
      Identify tables, lists, or any structured information and convert it into a well-formatted table.
      Format your response as a CSV string with the first row containing column headers.
      Only respond with the CSV data, no additional explanations.

      Here's the PDF content:
      
      ${pdfText}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error extracting table from PDF:', error);
    throw new Error('Failed to extract data from PDF');
  }
}

/**
 * Parse CSV content and ensure it's well-formatted
 */
export async function processCSVWithGemini(csvContent: string): Promise<string> {
  try {
    const prompt = `
      Parse and clean the following CSV data.
      Fix any formatting issues, ensure consistent delimiters, and handle missing values.
      Format your response as a clean CSV string with the first row containing column headers.
      Only respond with the cleaned CSV data, no additional explanations.

      Here's the CSV content:
      
      ${csvContent}
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error processing CSV with Gemini:', error);
    throw new Error('Failed to process CSV data');
  }
}

/**
 * Enhance table data based on user instructions
 */
export async function enhanceTableWithGemini(tableData: any, instructions: string): Promise<string> {
  try {
    // Convert table data to CSV format for the prompt
    const headers = tableData.columns.join(',');
    const rows = tableData.rows.map((row: any) => {
      return tableData.columns.map((col: string) => {
        const value = row[col] || '';
        // Handle values with commas by quoting them
        return value.toString().includes(',') ? `"${value}"` : value;
      }).join(',');
    }).join('\n');
    
    const csvData = `${headers}\n${rows}`;

    const prompt = `
      Enhance the following table data based on these instructions: "${instructions}"
      
      Here's the current table data in CSV format:
      
      ${csvData}
      
      Respond with the enhanced CSV data only, keeping the same column headers.
      Only include the CSV data in your response, no explanations.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error enhancing table with Gemini:', error);
    throw new Error('Failed to enhance table data');
  }
}

/**
 * Answer questions about the table data
 */
export async function answerTableQuestionWithGemini(tableData: any, question: string): Promise<string> {
  try {
    // Convert table data to CSV format for the prompt
    const headers = tableData.columns.join(',');
    const rows = tableData.rows.map((row: any) => {
      return tableData.columns.map((col: string) => {
        const value = row[col] || '';
        return value.toString().includes(',') ? `"${value}"` : value;
      }).join(',');
    }).join('\n');
    
    const csvData = `${headers}\n${rows}`;

    const prompt = `
      Based on the following table data, answer this question: "${question}"
      
      Table data (CSV format):
      ${csvData}
      
      Provide a concise and accurate answer based only on the data provided.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error answering question with Gemini:', error);
    throw new Error('Failed to answer question about the data');
  }
}