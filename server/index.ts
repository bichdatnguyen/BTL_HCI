import "dotenv/config"; // Nạp biến môi trường từ file .env đầu tiên
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 5000; // Lấy PORT từ .env hoặc mặc định là 5000

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // Thêm từ file mẫu 2 để xử lý form tốt hơn

// =========================================================
// PHẦN 1: KẾT NỐI MONGODB & MODEL
// =========================================================

const connectDB = async () => {
  try {
    // Lấy URI từ file .env để bảo mật
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ Lỗi kết nối MongoDB: ${error.message}`);
    process.exit(1); // Dừng chương trình nếu lỗi
  }
};

// Gọi hàm kết nối
connectDB();

// User Schema
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  streak: { type: Number, default: 0 },        // Mặc định là 0
  lastLoginDate: { type: Date, default: null }
});
const UserModel = mongoose.model("users", UserSchema);

// =========================================================
// PHẦN 2: API AUTHENTICATION
// =========================================================

// API Đăng ký
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new UserModel({ username, password: hashedPassword });
    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// API Đăng nhập
app.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 1. Tìm user trong DB
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // 2. Kiểm tra mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // =========================================================
    // XỬ LÝ TÍNH TOÁN STREAK (CHUỖI NGÀY HỌC)
    // =========================================================

    const now = new Date();
    // Lấy ngày hôm nay (set giờ về 00:00:00 để so sánh chuẩn theo ngày)
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Nếu user chưa có trường streak (user cũ), coi như là 0
    let currentStreak = user.streak || 0;

    // Nếu user đã từng đăng nhập trước đó
    if (user.lastLoginDate) {
      const lastLogin = new Date(user.lastLoginDate);
      const lastLoginDateOnly = new Date(lastLogin.getFullYear(), lastLogin.getMonth(), lastLogin.getDate());

      // Tính khoảng cách thời gian giữa hôm nay và lần cuối đăng nhập
      const oneDay = 1000 * 60 * 60 * 24;
      const diffTime = today.getTime() - lastLoginDateOnly.getTime();
      const diffDays = Math.round(diffTime / oneDay);

      if (diffDays === 1) {
        // Nếu lần cuối là hôm qua -> Tăng streak
        currentStreak += 1;
      } else if (diffDays > 1) {
        // Nếu lần cuối cách đây hơn 1 ngày (bỏ học) -> Reset về 1
        currentStreak = 1;
      }
      // Nếu diffDays === 0 (đăng nhập lại trong cùng ngày) -> Giữ nguyên
    } else {
      // Lần đầu tiên đăng nhập trong đời -> Streak = 1
      currentStreak = 1;
    }

    // Cập nhật dữ liệu mới vào user đang đứng
    user.streak = currentStreak;
    user.lastLoginDate = now;

    // LƯU LẠI VÀO MONGODB (Bước quan trọng nhất)
    await user.save();

    // =========================================================

    // Trả về kết quả
    res.json({
      message: "Đăng nhập thành công",
      userId: user._id,
      streak: currentStreak // Gửi streak về frontend để hiển thị
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// =========================================================
// PHẦN 3: API DỮ LIỆU SÁCH
// =========================================================

const books = [
  {
    id: 1,
    title: "Dế Mèn Phiêu Lưu Ký",
    author: "Tô Hoài",
    category: "Phiêu Lưu",
    coverUrl: "https://example.com/demen.jpg",
    description: "Cuộc phiêu lưu của chú Dế Mèn qua bao vùng đất...",
    level: "Trung bình"
  },
  {
    id: 2,
    title: "Tấm Cám",
    author: "Dân gian",
    category: "Truyện Cổ Tích",
    coverUrl: "https://example.com/tamcam.jpg",
    description: "Câu chuyện về cô Tấm hiền lành và mẹ con Cám...",
    level: "Dễ"
  },
];

// API Lấy sách (có lọc theo category)
app.get('/api/books', (req, res) => {
  const category = req.query.category;
  if (category) {
    const filteredBooks = books.filter(book => book.category === category);
    res.json(filteredBooks);
  } else {
    res.json(books);
  }
});

// API Ping (để test server sống hay chết - lấy từ mẫu 2)
app.get("/api/ping", (req, res) => {
  res.json({ message: "Server is alive!" });
});

// =========================================================
// KHỞI ĐỘNG SERVER
// =========================================================
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});