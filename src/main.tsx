import App from "@/App";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Toaster } from "@/components/ui/toaster";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router } from 'react-router-dom';
import { ChatProvider } from "./context/chat-context";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <ChatProvider>
      <SidebarProvider>
        <Router>
          <AppSidebar />
          <App />
          <Toaster />
        </Router>
      </SidebarProvider>
    </ChatProvider>
  </React.StrictMode>,
);
