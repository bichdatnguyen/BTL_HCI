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

// ==========================================
// SCHEMA CHO SÁCH CÁ NHÂN (PERSONAL BOOKS)
// ==========================================
const PersonalBookSchema = new mongoose.Schema({
  title: { type: String, required: true },       // Tên sách
  coverUrl: { type: String },                    // Link ảnh bìa
  fileUrl: { type: String },                     // Link file sách (PDF/Doc)
  // QUAN TRỌNG NHẤT: Trường này lưu ID của người sở hữu
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  createdAt: { type: Date, default: Date.now }
});

const PersonalBookModel = mongoose.model("personal_books", PersonalBookSchema);

// ==========================================
// 1. SCHEMA SÁCH HỆ THỐNG (SYSTEM BOOKS)
// ==========================================
const BookSchema = new mongoose.Schema({
  title: { type: String, required: true },       // Tên sách
  author: { type: String, default: "Sưu tầm" },  // Tác giả
  category: { type: String, required: true },    // Thể loại: Cổ tích, Khoa học...
  level: { type: String, enum: ['Dễ', 'Trung bình', 'Khó'], default: 'Dễ' }, // Độ khó
  description: { type: String },                 // Mô tả ngắn
  coverUrl: { type: String },                    // Link ảnh bìa
  content: { type: String },                     // Nội dung truyện (nếu là dạng text)
  pdfUrl: { type: String },                      // Link file PDF (nếu là dạng đọc file)
  isPremium: { type: Boolean, default: false },  // Sách VIP mới đọc được (tính năng mở rộng sau này)
});

// Lưu vào collection tên là 'system_books'
const BookModel = mongoose.model("system_books", BookSchema);

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

// ==========================================
// 2. API QUẢN LÝ SÁCH HỆ THỐNG
// ==========================================

// A. API Lấy danh sách sách (Có bộ lọc tìm kiếm)
// Cách dùng: 
// - Lấy hết: GET /api/books
// - Lọc: GET /api/books?category=Truyện Cổ Tích&level=Dễ
app.get('/api/books', async (req, res) => {
  try {
    const { category, level, search } = req.query;

    // Tạo bộ lọc động
    let query: any = {};
    if (category) query.category = category;
    if (level) query.level = level;
    if (search) {
      // Tìm kiếm tương đối theo tên sách (không cần gõ đúng 100%)
      query.title = { $regex: search, $options: 'i' };
    }

    const books = await BookModel.find(query);
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải sách: " + err.message });
  }
});

// B. API Xem chi tiết 1 cuốn sách (Để vào màn hình đọc)
// Cách dùng: GET /api/books/654abc... (ID của sách)
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// C. API Thêm sách mới vào kho (Dành cho Admin/Giáo viên nhập liệu)
// Cách dùng: POST /api/books (Gửi JSON body)
app.post('/api/books', async (req, res) => {
  try {
    // Chỉ lấy các trường cần thiết để bảo mật
    const { title, author, category, level, description, coverUrl, content, pdfUrl } = req.body;

    const newBook = new BookModel({
      title, author, category, level, description, coverUrl, content, pdfUrl
    });

    await newBook.save();
    res.status(201).json({ message: "Đã thêm sách vào hệ thống!", book: newBook });
  } catch (err) {
    res.status(500).json({ message: "Lỗi thêm sách: " + err.message });
  }
});

// ==========================================
// API XỬ LÝ SÁCH CÁ NHÂN
// ==========================================

// 1. API Lấy sách của TÔI (Chỉ lấy sách của user đang đăng nhập)
// Frontend gọi: GET /api/my-books?userId=...
app.get("/api/my-books", async (req, res) => {
  try {
    const { userId } = req.query; // Frontend phải gửi kèm userId lên

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Tìm trong kho sách cá nhân, chỉ lấy cuốn nào có userId trùng khớp
    const myBooks = await PersonalBookModel.find({ userId: userId }).sort({ createdAt: -1 });

    res.json(myBooks);
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// 2. API Tải sách mới lên (Thêm vào thư viện cá nhân)
// Frontend gọi: POST /api/my-books
app.post("/api/my-books", async (req, res) => {
  try {
    const { title, coverUrl, fileUrl, userId } = req.body;

    // Tạo cuốn sách mới
    const newBook = new PersonalBookModel({
      title,
      coverUrl: coverUrl || "https://example.com/default-cover.png", // Ảnh mặc định nếu ko có
      fileUrl,
      userId // Gắn nhãn: Sách này là của userId này
    });

    await newBook.save();
    res.status(201).json({ message: "Thêm sách thành công", book: newBook });

  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// =========================================================
// API NẠP DỮ LIỆU MẪU (DÙNG 1 LẦN RỒI XÓA)
// =========================================================
app.get('/api/seed-full-library', async (req, res) => {
  try {
    // Xóa hết sách cũ để tránh trùng lặp (nếu muốn)
    // await BookModel.deleteMany({}); 

    const sampleBooks = [
      // 1. TRUYỆN CỔ TÍCH (category phải khớp chữ trong Frontend)
      {
        title: "Tấm Cám",
        author: "Dân gian",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3062/3062634.png", // Hình cô Tấm (ví dụ)
      },
      {
        title: "Sự Tích Cây Khế",
        author: "Dân gian",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/427/427538.png", // Hình chim
      },
      {
        title: "Thạch Sanh",
        author: "Dân gian",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3408/3408545.png", // Hình dũng sĩ
      },

      // 2. PHIÊU LƯU
      {
        title: "Dế Mèn Phiêu Lưu Ký",
        author: "Tô Hoài",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/616/616430.png", // Hình dế
      },
      {
        title: "Đảo Giấu Vàng",
        author: "Robert Louis",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2896/2896593.png", // Hình bản đồ
      },

      // 3. KHOA HỌC
      {
        title: "10 Vạn Câu Hỏi Vì Sao",
        author: "Nhiều tác giả",
        category: "Khoa học",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2021/2021575.png", // Hình nguyên tử
      },
      {
        title: "Khám Phá Vũ Trụ",
        author: "NASA",
        category: "Khoa học",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3212/3212624.png", // Hình tên lửa
      },

      // 4. KÌ ẢO
      {
        title: "Harry Potter",
        author: "J.K. Rowling",
        category: "Kì ảo",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/9103/9103233.png", // Hình mũ phù thủy
      }
    ];

    await BookModel.insertMany(sampleBooks);
    res.send("✅ Đã nạp thành công sách vào thư viện!");
  } catch (err) {
    res.status(500).send("Lỗi: " + err.message);
  }
});

// index.ts
// API xem chi tiết 1 cuốn sách
app.get('/api/books/:id', async (req, res) => {
  try {
    const book = await BookModel.findById(req.params.id);
    if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Lỗi ID sách không hợp lệ" });
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