import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import "./styles.css";
import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export default function App() {
  return (
    <StrictMode>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  );
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <nav className="border-b border-border bg-card sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="font-display text-xl font-semibold">
              <Link to="/" className="hover:text-foreground/80 transition-colors">
                Tirbeo Docs
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                to="/" 
                className="text-sm hover:text-foreground/80 transition-colors"
              >
                Home
              </Link>
              <Link 
                to="/getting-started" 
                className="text-sm hover:text-foreground/80 transition-colors"
              >
                Getting Started
              </Link>
              <Link 
                to="/api" 
                className="text-sm hover:text-foreground/80 transition-colors"
              >
                API Reference
              </Link>
              <ThemeToggle className="ml-4" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/getting-started" element={<GettingStartedPage />} />
          <Route path="/api" element={<ApiReferencePage />} />
        </Routes>
      </main>
    </div>
  );
}

function HomePage() {
  return (
    <div className="text-center space-y-8">
      <h1 className="font-display text-5xl font-semibold tracking-tight">
        Tirbeo Documentation
      </h1>
      <p className="text-xl text-ink-soft max-w-2xl mx-auto">
        Complete documentation for the Tirbeo platform, including APIs, guides, and technical specifications.
      </p>
      <div className="grid md:grid-cols-3 gap-6 mt-12">
        <Card title="Getting Started" description="Quick start guide and setup instructions" />
        <Card title="API Reference" description="Complete API documentation and examples" />
        <Card title="Tutorials" description="Step-by-step guides and best practices" />
      </div>
    </div>
  );
}

function GettingStartedPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="font-display text-4xl font-semibold">Getting Started</hice>
      <p className="text-ink-soft">
        Welcome to Tirbeo! This guide will help you set up your development environment and start building.
      </p>
    </div>
  );
}

function ApiReferencePage() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h1 className="font-display text-4xl font-semibold">API Reference</h1>
      <p className="text-ink-soft">
        Complete API documentation for all Tirbeo endpoints and services.
      </p>
    </div>
  );
}

function Card({ title, description }: { title: string; description: string }) {
  return (
    <div className="border border-border bg-card rounded-lg p-6 hover:border-border-hover transition-colors">
      <h3 className="font-display text-xl font-semibold mb-2">{title}</h3>
      <p className="text-ink-soft">{description}</p>
    </div>
  );
}
