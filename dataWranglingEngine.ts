import { callGemini } from "@/services/geminiService";
import { callLlama } from "@/services/llamaService";
import { extractHeadersAndRows, normalizeTable } from "@/utils/tableUtils";
import { classifyTableForChart } from "@/utils/chartClassifier";

interface RawInput {
  type: "image" | "text" | "csv";
  content: string; // base64 for image, raw string for text/csv
}

interface AIResponse {
  table: string[][];
  metadata: {
    inferredHeaders: string[];
    newColumns: string[];
    rowCount: number;
    confidence: number;
    chartType: string;
  };
}

export async function processData(input: RawInput): Promise<AIResponse> {
  const prompt = `
You are a data structuring expert. Given the following ${input.type === "image" ? "image-derived text" : input.type} content:

"${input.content}"

1. Extract and return a clean structured table.
2. Infer and include new helpful columns such as:
   - Percentage difference (if comparing)
   - Normalized score (relative to max/min)
3. Guess the type of chart that would best visualize this.
4. Return a confidence score for your extraction.

Respond in JSON with:
{
  "table": [ [headers], [...rows] ],
  "metadata": {
    "inferredHeaders": [...],
    "newColumns": [...],
    "rowCount": int,
    "confidence": 0.0–1.0,
    "chartType": "bar" | "line" | "pie" | "table"
  }
}
`;

  // Try Gemini first
  let geminiOutput;
  try {
    geminiOutput = await callGemini(prompt);
  } catch (err) {
    console.warn("Gemini failed, falling back to LLaMA...");
    geminiOutput = await callLlama(prompt); // fallback if Gemini fails
  }

  const structuredTable = extractHeadersAndRows(geminiOutput.table);
  const normalizedTable = normalizeTable(structuredTable);
  const chartType = classifyTableForChart(normalizedTable);

  return {
    table: normalizedTable,
    metadata: {
      inferredHeaders: normalizedTable[0],
      newColumns: geminiOutput.metadata?.newColumns || [],
      rowCount: normalizedTable.length - 1,
      confidence: geminiOutput.metadata?.confidence || 0.9,
      chartType,
    },
  };
}
