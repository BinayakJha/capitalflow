import { TableData } from "@shared/schema";

// Function to generate visualizations based on table data
export async function generateVisualization(tableData: TableData) {
  try {
    // Analyze the table data to determine what kind of visualization would be appropriate
    const { columns, rows } = tableData;
    
    // Find numeric columns
    const numericColumns = columns.filter(col => {
      // Check if column has numeric values (accounting for currency and percentage formats)
      return rows.some(row => {
        const val = row[col];
        return val && typeof val === 'string' && 
               !isNaN(parseFloat(val.toString().replace(/[$,%]/g, '')));
      });
    });
    
    // Find date columns
    const dateColumns = columns.filter(col => {
      // Check for date-like column names or values
      const isDateName = col.toLowerCase().includes('date') || 
                        col.toLowerCase().includes('day') || 
                        col.toLowerCase().includes('month');
                        
      // Check for date-formatted values
      const hasDateValues = rows.some(row => {
        const val = row[col];
        if (!val || typeof val !== 'string') return false;
        
        // Check for common date formats
        return /^\d{4}-\d{2}-\d{2}$/.test(val) || // YYYY-MM-DD
               /^\d{1,2}\/\d{1,2}\/\d{2,4}$/.test(val); // MM/DD/YYYY or DD/MM/YYYY
      });
      
      return isDateName || hasDateValues;
    });
    
    // Find categorical columns
    const categoricalColumns = columns.filter(col => {
      // Exclude date and numeric columns
      if (dateColumns.includes(col) || numericColumns.includes(col)) {
        return false;
      }
      
      // Check for limited number of distinct values
      const uniqueValues = new Set();
      for (const row of rows) {
        if (row[col] !== undefined && row[col] !== null && row[col] !== '') {
          uniqueValues.add(row[col].toString());
        }
      }
      
      // If there are relatively few unique values compared to total rows, it's likely categorical
      return uniqueValues.size <= Math.min(rows.length * 0.5, 10);
    });
    
    // Determine the visualization type based on available columns
    if (dateColumns.length > 0 && numericColumns.length > 0) {
      // Time series data - use a line chart
      return generateLineChart(tableData, dateColumns[0], numericColumns[0]);
    } else if (categoricalColumns.length > 0 && numericColumns.length > 0) {
      // Categorical vs numeric - use a bar chart
      return generateBarChart(tableData, categoricalColumns[0], numericColumns[0]);
    } else if (categoricalColumns.length > 0) {
      // Just categories - use a pie chart
      return generatePieChart(tableData, categoricalColumns[0]);
    } else {
      // Default to a simple bar chart with the first two columns
      return generateBarChart(tableData, columns[0], columns[1]);
    }
  } catch (error) {
    console.error("Error generating visualization:", error);
    throw new Error("Failed to generate visualization");
  }
}

// Helper function to generate a line chart
function generateLineChart(tableData: TableData, xAxis: string, yAxis: string) {
  const { rows } = tableData;
  
  // Sort rows by date
  const sortedRows = [...rows].sort((a, b) => {
    const dateA = new Date(a[xAxis]);
    const dateB = new Date(b[xAxis]);
    return dateA.getTime() - dateB.getTime();
  });
  
  // Prepare data for the chart
  const chartData = sortedRows.map(row => {
    // Parse numeric value
    let value = row[yAxis];
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[$,%]/g, ''));
    }
    
    return {
      [xAxis]: row[xAxis],
      [yAxis]: isNaN(value) ? 0 : value
    };
  });
  
  return {
    type: 'line',
    title: `${yAxis} Over Time`,
    xAxis,
    yAxis,
    data: chartData
  };
}

// Helper function to generate a bar chart
function generateBarChart(tableData: TableData, xAxis: string, yAxis: string) {
  const { rows } = tableData;
  
  // Prepare data for the chart
  const chartData = rows.map(row => {
    // Parse numeric value
    let value = row[yAxis];
    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[$,%]/g, ''));
    }
    
    return {
      [xAxis]: row[xAxis],
      [yAxis]: isNaN(value) ? 0 : value
    };
  });
  
  return {
    type: 'bar',
    title: `${yAxis} by ${xAxis}`,
    xAxis,
    yAxis,
    data: chartData
  };
}

// Helper function to generate a pie chart
function generatePieChart(tableData: TableData, categoryColumn: string) {
  const { rows } = tableData;
  
  // Count occurrences of each category
  const categoryCounts = new Map();
  for (const row of rows) {
    const category = row[categoryColumn];
    if (category !== undefined && category !== null && category !== '') {
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1);
    }
  }
  
  // Prepare data for the chart
  const chartData = Array.from(categoryCounts.entries()).map(([category, count]) => ({
    name: category,
    value: count
  }));
  
  return {
    type: 'pie',
    title: `Distribution of ${categoryColumn}`,
    name: 'name',
    value: 'value',
    data: chartData
  };
}
