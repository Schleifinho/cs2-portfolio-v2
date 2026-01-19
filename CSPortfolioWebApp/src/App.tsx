import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import {VerifyEmail} from "@/pages/VerifyEmail";
import {RedirectIfAuthenticated} from "@/lib/Helper/redirectIfAuthenticated.ts";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* "App" pages */}
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Index />} />
          <Route path="/inventory" element={<Index />} />
          <Route path="/transactions" element={<Index />} />
          <Route path="/items" element={<Index />} />
          <Route path="/profile" element={<Index />} />

          {/* Auth pages */}
          <Route
              path="/login"
              element={
                <RedirectIfAuthenticated>
                  <Index />
                </RedirectIfAuthenticated>
              }
          />
          <Route
              path="/register"
              element={
                <RedirectIfAuthenticated>
                  <Index />
                </RedirectIfAuthenticated>
              }
          />
          <Route path="/verify-email" element={<VerifyEmail />} />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
