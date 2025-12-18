import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Login() {
  const navigate = useNavigate();

  // State
  const [loginInput, setLoginInput] = useState(""); // Username hoặc Email
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Gửi 'username' nhưng giá trị là loginInput (chứa email hoặc username)
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: loginInput, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu thông tin
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("username_login", data.name || loginInput);
        localStorage.setItem("currentStreak", data.streak);
        localStorage.setItem("role", data.role);
        localStorage.setItem("userName", data.name);
        localStorage.setItem("userAvatar", data.avatar);
        localStorage.setItem("userBirthday", data.birthday || "");

        // Chuyển hướng
        navigate(data.role === "admin" ? "/admin" : "/");
      } else {
        setError(data.message || "Đăng nhập thất bại");
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
          <h1 className="text-4xl font-bold text-foreground text-center mb-8">
            Chào mừng trở lại!
          </h1>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Input Username/Email */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Tên đăng nhập hoặc Email
              </label>
              <input
                type="text"
                placeholder="Nhập username hoặc email..."
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={loginInput}
                onChange={(e) => setLoginInput(e.target.value)}
                required
              />
            </div>

            {/* Input Password */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu..."
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-red-500 text-center font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground rounded-3xl px-6 py-4 text-lg font-bold hover:opacity-90 transition-opacity mt-4 ${loading ? "opacity-70" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </button>
          </form>

          {/* Footer Links */}
          <div className="text-center space-y-4 mt-8">
            <Link
              to="/forgot-password"
              className="block text-lg font-medium text-primary hover:opacity-80"
            >
              Quên mật khẩu?
            </Link>
            <div className="text-lg font-medium">
              Chưa có tài khoản?{" "}
              <button
                onClick={() => navigate("/register")}
                className="text-primary font-bold hover:opacity-80 bg-transparent border-none p-0 cursor-pointer"
              >
                Đăng ký
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
