import "./global.css";
import { Navigate } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { AdminLayout } from "@/components/AdminLayout";
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
import BookReader from "./pages/BookReader";
import PronunciationPage from "./pages/Pronunciation";
import AdminDashboard from "./pages/AdminDashboard";
import InteractiveStory from "./pages/InteractiveStory";
import ManageProfiles from "./pages/ManageProfiles";
import NotFound from "./pages/NotFound";

// Component này đóng vai trò "Bảo vệ"
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const role = localStorage.getItem("role"); // Lấy quyền từ bộ nhớ

  if (role !== "admin") {
    // Nếu không phải admin, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu đúng là admin, cho phép vào
  return children;
};

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
              userAvatar={header.userAvatar}
              streakCount={header.streakCount}
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
                <Route
                  path="/games/story"
                  element={
                    <Layout>
                      <InteractiveStory />
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
                  path="/games"
                  element={
                    <Layout>
                      <Games />
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

                {/* Đảm bảo route này nằm sau /games */}
                <Route
                  path="/games/pronunciation"
                  element={
                    <Layout>
                      <PronunciationPage />
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

                {/* Các route động - để xuống dưới cùng */}
                <Route
                  path="/category/:categoryName"
                  element={
                    <Layout>
                      <CategoryView />
                    </Layout>
                  }
                />

                {/* BookReader cũng nên có Layout nếu bạn muốn sidebar */}
                <Route
                  path="/read/:bookId"
                  element={
                    <Layout>
                      <BookReader />
                    </Layout>
                  }
                />

                <Route
                  path="/admin"
                  element={
                    <AdminRoute>
                      <AdminLayout>
                        <AdminDashboard />
                      </AdminLayout>
                    </AdminRoute>
                  }
                />

                <Route
                  path="/manage-profiles"
                  element={
                    <Layout>
                      <ManageProfiles />
                    </Layout>
                  }
                />

                {/* Catch-all cuối cùng */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HeaderProvider>
          </ProfileProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}
