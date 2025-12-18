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

// 1. Component Bảo vệ Admin: Chỉ cho phép role="admin" truy cập
const AdminRoute = ({ children }: { children: JSX.Element }) => {
  const role = localStorage.getItem("role"); // Lấy quyền từ bộ nhớ

  if (role !== "admin") {
    // Nếu không phải admin, đá về trang chủ
    return <Navigate to="/" replace />;
  }

  // Nếu đúng là admin, cho phép vào
  return children;
};

// 2. Component Bảo vệ Người dùng: Bắt buộc phải đăng nhập mới được vào
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const userId = localStorage.getItem("userId");

  if (!userId) {
    // Nếu không tìm thấy userId (chưa đăng nhập), đá về trang Login ngay lập tức
    return <Navigate to="/login" replace />;
  }

  return children;
};

const queryClient = new QueryClient();

function Layout({ children }: { children: React.ReactNode }) {
  const header = usePageHeader();

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />

      <div className="flex-1 ml-32 flex flex-col -screen overflow-y-scroll">
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
        <main className="flex-1 px-8 md:px-12">
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
                {/* --- CÁC ROUTE CÔNG KHAI (KHÔNG CẦN ĐĂNG NHẬP) --- */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* --- CÁC ROUTE CẦN BẢO VỆ (PHẢI ĐĂNG NHẬP) --- */}

                {/* Trang chủ */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Index />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Truyện tương tác */}
                <Route
                  path="/games/story"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <InteractiveStory />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Danh sách Game */}
                <Route
                  path="/games"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Games />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Game Nối từ */}
                <Route
                  path="/games/matching"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WordMatching />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Game Tìm từ */}
                <Route
                  path="/games/word-search"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <WordSearch />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Game Phát âm - Đảm bảo route này nằm sau /games */}
                <Route
                  path="/games/pronunciation"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <PronunciationPage />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Thư viện sách */}
                <Route
                  path="/library"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <Library />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Xem chi tiết thể loại sách */}
                <Route
                  path="/category/:categoryName"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <CategoryView />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Đọc sách */}
                <Route
                  path="/read/:bookId"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <BookReader />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* Quản lý hồ sơ */}
                <Route
                  path="/manage-profiles"
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <ManageProfiles />
                      </Layout>
                    </ProtectedRoute>
                  }
                />

                {/* --- ROUTE ADMIN (BẢO VỆ BẰNG ROLE) --- */}
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

                {/* Catch-all cuối cùng (Trang 404) */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HeaderProvider>
          </ProfileProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}