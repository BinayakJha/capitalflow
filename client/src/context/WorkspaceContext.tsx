import { createContext, useContext, useState, ReactNode } from "react";

export interface DataRow {
  [key: string]: string | number | null;
}

export interface Transformation {
  type: string;
  description: string;
  timestamp: number;
}

export interface TableData {
  columns: string[];
  rows: DataRow[];
}

interface WorkspaceContextType {
  inputText: string;
  setInputText: (text: string) => void;
  isProcessing: boolean;
  setIsProcessing: (status: boolean) => void;
  tableData: TableData | null;
  setTableData: (data: TableData | null) => void;
  tableVersions: TableData[];
  currentVersionIdx: number;
  setTableVersion: (index: number) => void;
  transformations: Transformation[];
  addTransformation: (transformation: Omit<Transformation, "timestamp">) => void;
  messages: { role: "user" | "ai"; content: string }[];
  addMessage: (message: { role: "user" | "ai"; content: string }) => void;
  visualizationData: any | null;
  setVisualizationData: (data: any | null) => void;
  processingProgress: {
    percentage: number;
    status: string;
    steps: { label: string; status: "completed" | "in-progress" | "pending" }[];
  };
  updateProcessingProgress: (progress: Partial<WorkspaceContextType["processingProgress"]>) => void;
  resetWorkspace: () => void;
}

const initialState = {
  inputText: "",
  isProcessing: false,
  tableData: null,
  tableVersions: [],
  currentVersionIdx: 0,
  transformations: [],
  messages: [{ role: "ai", content: "I've transformed your data into a structured table. You can now edit, filter, or visualize it." }],
  visualizationData: null,
  processingProgress: {
    percentage: 0,
    status: "Starting...",
    steps: [
      { label: "Reading and processing data", status: "pending" },
      { label: "Identifying data structure", status: "pending" },
      { label: "Creating structured table", status: "pending" },
      { label: "Preparing workspace", status: "pending" },
    ],
  },
};

const WorkspaceContext = createContext<WorkspaceContextType>({
  ...initialState as any,
  setInputText: () => {},
  setIsProcessing: () => {},
  setTableData: () => {},
  setTableVersion: () => {},
  addTransformation: () => {},
  addMessage: () => {},
  setVisualizationData: () => {},
  updateProcessingProgress: () => {},
  resetWorkspace: () => {},
});

export const useWorkspace = () => useContext(WorkspaceContext);

export const WorkspaceProvider = ({ children }: { children: ReactNode }) => {
  const [inputText, setInputText] = useState(initialState.inputText);
  const [isProcessing, setIsProcessing] = useState(initialState.isProcessing);
  const [tableData, setTableDataState] = useState<TableData | null>(initialState.tableData);
  const [tableVersions, setTableVersions] = useState<TableData[]>(initialState.tableVersions);
  const [currentVersionIdx, setCurrentVersionIdx] = useState(initialState.currentVersionIdx);
  const [transformations, setTransformations] = useState<Transformation[]>(initialState.transformations);
  const [messages, setMessages] = useState(initialState.messages);
  const [visualizationData, setVisualizationData] = useState(initialState.visualizationData);
  const [processingProgress, setProcessingProgress] = useState(initialState.processingProgress);

  // Keep track of table versions
  const setTableData = (data: TableData | null) => {
    if (data) {
      // Add new version to history
      const newVersions = [...tableVersions, data];
      setTableVersions(newVersions);
      setCurrentVersionIdx(newVersions.length - 1);
    }
    setTableDataState(data);
  };

  // Select a specific version from history
  const setTableVersion = (index: number) => {
    if (index >= 0 && index < tableVersions.length) {
      setCurrentVersionIdx(index);
      setTableDataState(tableVersions[index]);
    }
  };

  const addTransformation = (transformation: Omit<Transformation, "timestamp">) => {
    setTransformations([...transformations, { ...transformation, timestamp: Date.now() }]);
  };

  const addMessage = (message: { role: "user" | "ai"; content: string }) => {
    setMessages([...messages, message]);
  };

  const updateProcessingProgress = (progress: Partial<typeof processingProgress>) => {
    setProcessingProgress({ ...processingProgress, ...progress });
  };

  const resetWorkspace = () => {
    setInputText(initialState.inputText);
    setIsProcessing(initialState.isProcessing);
    setTableDataState(initialState.tableData);
    setTableVersions(initialState.tableVersions);
    setCurrentVersionIdx(initialState.currentVersionIdx);
    setTransformations(initialState.transformations);
    setMessages(initialState.messages);
    setVisualizationData(initialState.visualizationData);
    setProcessingProgress(initialState.processingProgress);
  };

  return (
    <WorkspaceContext.Provider
      value={{
        inputText,
        setInputText,
        isProcessing,
        setIsProcessing,
        tableData,
        setTableData,
        tableVersions,
        currentVersionIdx,
        setTableVersion,
        transformations,
        addTransformation,
        messages,
        addMessage,
        visualizationData,
        setVisualizationData,
        processingProgress,
        updateProcessingProgress,
        resetWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
};
