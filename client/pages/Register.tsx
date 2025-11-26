import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();

  // 1. Thêm state cho username và thông báo lỗi
  const [username, setUsername] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState(""); // State để lưu lỗi từ server trả về

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); // Xóa lỗi cũ trước khi gửi mới

    // Kiểm tra mật khẩu trùng khớp
    if (passwords.password !== passwords.confirm) {
      setPasswordsMatch(false);
      return;
    }

    try {
      // 2. Gọi API xuống Server (Lưu ý cổng 5000)
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          password: passwords.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Nếu đăng ký thành công
        alert("Đăng ký thành công! Hãy đăng nhập ngay.");
        navigate("/login");
      } else {
        // Nếu lỗi (ví dụ: Tên đăng nhập đã tồn tại)
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối đến Server. Hãy kiểm tra lại.");
      console.error(err);
    }
  };

  const handlePasswordChange = (
    field: "password" | "confirm",
    value: string,
  ) => {
    const newPasswords = { ...passwords, [field]: value };
    setPasswords(newPasswords);
    if (field === "confirm" || (field === "password" && passwords.confirm)) {
      setPasswordsMatch(newPasswords.password === newPasswords.confirm);
    }
  };

  const handleGoogleSignup = () => {
    // Xử lý logic đăng ký Google sau
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Registration Card */}
        <div className="bg-card rounded-3xl shadow-lg p-12">
          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground text-center mb-12">
            Đăng ký tài khoản mới
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
                required
                // 3. Gắn state vào input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={passwords.password}
                onChange={(e) =>
                  handlePasswordChange("password", e.target.value)
                }
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-3">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập lại mật khẩu của bạn"
                className={`w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium text-foreground placeholder-muted-foreground border-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${!passwordsMatch ? "border-destructive" : "border-border"
                  }`}
                aria-label="Nhập lại mật khẩu"
                value={passwords.confirm}
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
                required
              />
              {!passwordsMatch && (
                <p className="text-destructive text-sm font-medium mt-2">
                  Mật khẩu không trùng khớp
                </p>
              )}
            </div>

            {/* 4. Hiển thị lỗi từ Server (nếu có) */}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative text-center">
                <span className="block sm:inline">{error}</span>
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              className="w-full bg-primary text-primary-foreground rounded-3xl px-6 py-4 text-lg font-bold hover:opacity-90 transition-opacity mt-8"
            >
              Đăng ký
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center mt-8 mb-8">
            <div className="flex-1 border-t border-border"></div>
            <span className="px-4 text-center text-muted-foreground font-medium">
              ——— Hoặc ———
            </span>
            <div className="flex-1 border-t border-border"></div>
          </div>

          {/* Google Signup Button */}
          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full bg-card border-2 border-border rounded-3xl px-6 py-4 text-lg font-bold text-foreground hover:bg-gray-50 transition-colors flex items-center justify-center gap-3"
          >
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 4C7.58 4 4 7.58 4 12s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8Z"
                fill="#4285F4"
              />
              <path
                d="M12 11v2h2.87c-.23 1.19-.97 2.21-2.03 2.85v2.2h3.28c1.92-1.77 3.02-4.37 3.02-7.4 0-.7-.08-1.4-.22-2.05H12v2.4Z"
                fill="#fff"
              />
              <path
                d="M9.64 15.26c-.52.41-1.17.65-1.87.65-1.8 0-3.27-1.47-3.27-3.29 0-1.82 1.47-3.29 3.27-3.29.7 0 1.35.24 1.87.65l1.58-1.58c-.92-.87-2.15-1.4-3.45-1.4-3.07 0-5.56 2.49-5.56 5.56 0 3.07 2.49 5.56 5.56 5.56 1.3 0 2.53-.53 3.45-1.4l-1.58-1.46Z"
                fill="#EA4335"
              />
            </svg>
            <span>Đăng ký bằng Google</span>
          </button>
        </div>

        {/* Back to Login Link */}
        <div className="text-center mt-8">
          <button
            onClick={() => navigate("/login")}
            className="text-lg font-medium text-foreground hover:opacity-80 transition-opacity cursor-pointer bg-none border-none p-0"
          >
            Đã có tài khoản?{" "}
            <span className="text-primary font-bold">Đăng nhập</span>
          </button>
        </div>
      </div>
    </div>
  );
}