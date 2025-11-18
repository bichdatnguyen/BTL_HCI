import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { HeaderProvider, usePageHeader } from "@/contexts/HeaderContext";
import { ProfileProvider } from "@/contexts/ProfileContext";
import Index from "./pages/Index";
import Games from "./pages/Games";
import Library from "./pages/Library";
import CategoryView from "./pages/CategoryView";
import WordMatching from "./pages/WordMatching";
import WordSearch from "./pages/WordSearch";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ProfileSelection from "./pages/ProfileSelection";
import ManageProfiles from "./pages/ManageProfiles";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const header = usePageHeader();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className="flex-1 ml-32 flex flex-col">
        {/* Module Header - Sticky */}
        {header && (
          <div className="sticky top-0 z-40 bg-background border-b border-border shadow-sm px-8 md:px-12 py-6">
            <PageHeader
              title={header.title}
              subtitle={header.subtitle}
              userName={header.userName}
              streakCount={header.streakCount}
              onCheckIn={header.onCheckIn}
            />
          </div>
        )}

        {/* Content Body - Scrollable */}
        <main className="flex-1 overflow-y-auto px-8 md:px-12">
          <div className="pt-8 md:pt-12">{children}</div>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ProfileProvider>
            <HeaderProvider>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/profile-selection" element={<ProfileSelection />} />
                <Route
                  path="/manage-profiles"
                  element={
                    <Layout>
                      <ManageProfiles />
                    </Layout>
                  }
                />
                <Route
                  path="/"
                  element={
                    <Layout>
                      <Index />
                    </Layout>
                  }
                />
                <Route
                  path="/games/matching"
                  element={
                    <Layout>
                      <WordMatching />
                    </Layout>
                  }
                />
                <Route
                  path="/games/word-search"
                  element={
                    <Layout>
                      <WordSearch />
                    </Layout>
                  }
                />
                <Route
                  path="/games"
                  element={
                    <Layout>
                      <Games />
                    </Layout>
                  }
                />
                <Route
                  path="/library"
                  element={
                    <Layout>
                      <Library />
                    </Layout>
                  }
                />
                <Route
                  path="/library/category/:categoryId"
                  element={
                    <Layout>
                      <CategoryView />
                    </Layout>
                  }
                />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HeaderProvider>
          </ProfileProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
