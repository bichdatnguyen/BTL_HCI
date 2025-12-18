import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Thành công! Đang chuyển về trang đăng nhập...");
        // Đợi 2 giây rồi chuyển trang
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setError(data.message || "Không thể đặt lại mật khẩu.");
      }
    } catch (err) {
      setError("Lỗi kết nối Server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        <div className="bg-card rounded-3xl shadow-lg p-12">
          <h1 className="text-4xl font-bold text-foreground text-center mb-4">
            Khôi phục mật khẩu
          </h1>
          <p className="text-center text-muted-foreground mb-8">
            Nhập thông tin xác minh để đặt lại mật khẩu mới
          </p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Tên đăng nhập cũ
              </label>
              <input
                type="text"
                placeholder="Ví dụ: user123"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Email đăng ký
              </label>
              <input
                type="email"
                placeholder="Ví dụ: email@domain.com"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="border-t border-border my-4"></div>

            {/* New Password */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu mới"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            {/* Confirm New Password */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Nhập lại mật khẩu mới
              </label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            {/* Thông báo */}
            {error && (
              <div className="text-red-500 text-center font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}
            {message && (
              <div className="text-green-600 text-center font-medium bg-green-50 p-3 rounded-xl border border-green-200">
                {message}
              </div>
            )}

            {/* Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground rounded-3xl px-6 py-4 text-lg font-bold hover:opacity-90 transition-opacity mt-4 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Đổi mật khẩu"}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center mt-8">
            <Link
              to="/login"
              className="text-lg font-medium text-primary hover:opacity-80 transition-opacity"
            >
              ← Quay lại đăng nhập
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
