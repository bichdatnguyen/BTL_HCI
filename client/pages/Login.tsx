import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import type { LoginRequest } from "../../shared/api";
export default function Login() {
  const navigate = useNavigate();

  // 1. Khai báo state để lưu dữ liệu nhập và lỗi
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ nếu có

    try {
      // 2. Gọi API đăng nhập (Lưu ý cổng 5000)
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // 3. Đăng nhập thành công
        // Lưu userId vào bộ nhớ trình duyệt để dùng cho các trang sau
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("currentStreak", data.streak);
        // Chuyển hướng sang trang chọn hồ sơ
        navigate("/");
      } else {
        // Hiển thị lỗi từ server trả về (ví dụ: Sai mật khẩu)
        setError(data.message || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối đến Server. Vui lòng kiểm tra lại.");
      console.error(err);
    }
  };


  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Login Card */}
        <div className="bg-card rounded-3xl shadow-lg p-12">
          {/* Title */}
          <h1 className="text-5xl font-bold text-foreground text-center mb-12">
            Chào mừng trở lại!
          </h1>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username/Email Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Nhập tên đăng nhập của bạn"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                aria-label="Tên đăng nhập"
                // Gắn state vào input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu của bạn"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium text-foreground placeholder-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                aria-label="Mật khẩu"
                // Gắn state vào input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Hiển thị thông báo lỗi nếu có */}
            {error && (
              <div className="text-red-500 text-center font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-3xl px-6 py-4 text-lg font-bold hover:opacity-90 transition-opacity mt-8"
            >
              Đăng nhập
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center mt-8 mb-8">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-center text-muted-foreground font-medium">
            </span>
            <div className="flex-1 border-t border-border"></div>
          </div>

        </div>

        {/* Bottom Links */}
        <div className="text-center mt-8 space-y-4">
          <Link
            to="#"
            className="block text-lg font-medium text-primary hover:opacity-80 transition-opacity"
          >
            Quên mật khẩu?
          </Link>
          <div className="text-lg font-medium text-foreground">
            Chưa có tài khoản?{" "}
            <button
              onClick={() => navigate("/register")}
              className="text-primary font-bold hover:opacity-80 transition-opacity cursor-pointer bg-none border-none p-0"
            >
              Đăng ký
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}