import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Register() {
  const navigate = useNavigate();

  // State
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [passwords, setPasswords] = useState({ password: "", confirm: "" });
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Kiểm tra mật khẩu trùng khớp
    if (passwords.password !== passwords.confirm) {
      setPasswordsMatch(false);
      return;
    }

    setLoading(true);

    try {
      // Gọi API xuống Server
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username,
          email: email,
          password: passwords.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Đăng ký thành công! Hãy đăng nhập ngay.");
        navigate("/login");
      } else {
        setError(data.message || "Đăng ký thất bại");
      }
    } catch (err) {
      setError("Không thể kết nối đến Server. Hãy kiểm tra lại.");
      console.error(err);
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6 py-8">
      <div className="w-full max-w-lg">
        {/* Registration Card */}
        <div className="bg-card rounded-3xl shadow-lg p-12">
          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground text-center mb-8">
            Đăng ký tài khoản
          </h1>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            {/* Username Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Tên đăng nhập
              </label>
              <input
                type="text"
                placeholder="Ví dụ: user123"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Email
              </label>
              <input
                type="email"
                placeholder="Ví dụ: email@domain.com"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Mật khẩu
              </label>
              <input
                type="password"
                placeholder="Nhập mật khẩu"
                className="w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border border-border focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                value={passwords.password}
                onChange={(e) =>
                  handlePasswordChange("password", e.target.value)
                }
                required
              />
            </div>

            {/* Confirm Password Input */}
            <div>
              <label className="block text-lg font-semibold text-foreground mb-2">
                Nhập lại mật khẩu
              </label>
              <input
                type="password"
                placeholder="Xác nhận mật khẩu"
                className={`w-full bg-background rounded-3xl px-6 py-4 text-lg font-medium border-2 focus:outline-none focus:ring-2 focus:ring-primary transition-all ${
                  !passwordsMatch ? "border-red-500" : "border-border"
                }`}
                value={passwords.confirm}
                onChange={(e) =>
                  handlePasswordChange("confirm", e.target.value)
                }
                required
              />
              {!passwordsMatch && (
                <p className="text-red-500 text-sm font-medium mt-2">
                  Mật khẩu không trùng khớp
                </p>
              )}
            </div>

            {/* Hiển thị lỗi */}
            {error && (
              <div className="text-red-500 text-center font-medium bg-red-50 p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {/* Signup Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-primary text-primary-foreground rounded-3xl px-6 py-4 text-lg font-bold hover:opacity-90 transition-opacity mt-4 ${loading ? "opacity-70" : ""}`}
            >
              {loading ? "Đang xử lý..." : "Đăng ký ngay"}
            </button>
          </form>

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
    </div>
  );
}
