import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose'; // Mới: Thư viện kết nối DB
import bcrypt from 'bcryptjs';   // Mới: Thư viện mã hóa mật khẩu

const app = express();
const PORT = 5000; // ĐỔI CỔNG: 3000 thường là của React, nên để Server là 5000

// Middleware
app.use(cors());
app.use(express.json());

// =========================================================
// PHẦN 1: KẾT NỐI MONGODB & USER MODEL
// =========================================================

// ⚠️ BẢO MẬT: Hãy thay <PASSWORD> bằng mật khẩu MỚI của bạn.
// Đừng để lộ chuỗi này lên GitHub công khai.
// Thay 'admin' và 'matkhau123456' bằng cái bạn vừa điền trong ảnh
const MONGO_URI = "mongodb+srv://db_hmi:31032005@readingapp.2xmxpva.mongodb.net/ReadingApp?retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Đã kết nối MongoDB thành công"))
  .catch((err) => console.error("❌ Lỗi kết nối MongoDB:", err));

// Tạo Schema (Khuôn mẫu) cho User
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // Mật khẩu sẽ được mã hóa
});

const UserModel = mongoose.model("users", UserSchema);

// =========================================================
// PHẦN 2: API AUTHENTICATION (Đăng ký / Đăng nhập)
// =========================================================

// API Đăng ký
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // Kiểm tra user tồn tại
    const existingUser = await UserModel.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Tên đăng nhập đã tồn tại" });
    }

    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);

    // Tạo user mới
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

    // Tìm user
    const user = await UserModel.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // So sánh mật khẩu
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Sai tên đăng nhập hoặc mật khẩu" });
    }

    // Trả về ID user để Frontend lưu lại
    res.json({ message: "Đăng nhập thành công", userId: user._id });
  } catch (err) {
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// =========================================================
// PHẦN 3: DỮ LIỆU SÁCH (MOCK DATA CŨ CỦA BẠN)
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
  // ... các sách khác giữ nguyên
];

app.get('/api/books', (req, res) => {
  const category = req.query.category;
  if (category) {
    const filteredBooks = books.filter(book => book.category === category);
    res.json(filteredBooks);
  } else {
    res.json(books);
  }
});

// =========================================================
// KHỞI ĐỘNG SERVER
// =========================================================
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});