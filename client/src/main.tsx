import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Handle Firebase redirect result on page load
import { handleRedirectResult } from "@/lib/firebase";
handleRedirectResult();

createRoot(document.getElementById("root")!).render(<App />);
