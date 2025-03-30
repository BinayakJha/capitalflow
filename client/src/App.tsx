import { Switch, Route } from "wouter";
import { useEffect, useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "./lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { AuthProvider } from "./context/auth-context";
import { ChatProvider } from "./context/chat-context";

// Pages
import NotFound from "@/pages/not-found";
import LoginPage from "@/pages/login";
import SignupPage from "@/pages/signup";
import Dashboard from "@/pages/dashboard";
import Documents from "@/pages/documents";
import DocumentView from "@/pages/documents/view";
import IncomeStatement from "@/pages/documents/income-statement";
import CashFlowStatement from "@/pages/documents/cash-flow";
import AuditPrep from "@/pages/documents/audit-prep";
import Settings from "@/pages/settings";
import Profile from "@/pages/profile";
import LoanCalculator from "@/pages/loan-calculator";

function Router() {
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  if (isInitializing) {
    // Show simple loading state while Firebase auth initializes
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={LoginPage} />
      <Route path="/login" component={LoginPage} />
      <Route path="/signup" component={SignupPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/documents" component={Documents} />
      <Route path="/documents/income-statement" component={IncomeStatement} />
      <Route path="/documents/cash-flow" component={CashFlowStatement} />
      <Route path="/documents/audit-prep" component={AuditPrep} />
      <Route path="/documents/:id" component={DocumentView} />
      <Route path="/settings" component={Settings} />
      <Route path="/profile" component={Profile} />
      <Route path="/loan-calculator" component={LoanCalculator} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ChatProvider>
          <Router />
          <Toaster />
        </ChatProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
