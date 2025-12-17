if (typeof global.DOMMatrix === 'undefined') {
  (global as any).DOMMatrix = class DOMMatrix {
    a = 1; b = 0; c = 0; d = 1; e = 0; f = 0; // Ma trận đơn vị mặc định
    constructor() { }
    // Các phương thức giả lập nếu cần thiết để tránh crash
    multiply() { return this; }
    translate() { return this; }
    scale() { return this; }
  };
}

import "dotenv/config"; // Nạp biến môi trường từ file .env đầu tiên
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import multer from 'multer';

const pdfParseLib = require('pdf-parse');

// Khởi tạo app
const app = express();
const PORT = process.env.PORT || 5000; // Lấy PORT từ .env hoặc mặc định là 5000
const upload = multer({ storage: multer.memoryStorage() });
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
  lastLoginDate: { type: Date, default: null },
  role: { type: String, default: "user" },
  name: { type: String, default: "" },          // Tên hiển thị (Tên của tớ)
  avatar: { type: String, default: "🐶" },      // Avatar mặc định là Chó
  birthday: { type: String, default: "" },       // Ngày sinh
  favorites: [{ type: String }],
  dailyProgress: {
    date: { type: String, default: "" }, // Lưu ngày hiện tại (ví dụ "2024-05-20")
    readSeconds: { type: Number, default: 0 }, // Số giây đã đọc
    gamesCount: { type: Number, default: 0 }   // Số game đã thắng
  }
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
  author: { type: String, default: "Đóng góp" }, // Tên tác giả sách
  uploadedBy: { type: String }, // Tên đăng nhập người upload (để Admin biết ai gửi)
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }, // Mặc định là chờ duyệt
  createdAt: { type: Date, default: Date.now },
  content: { type: String }
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

const ActivitySchema = new mongoose.Schema({
  type: { type: String, enum: ['user', 'book', 'system', 'exercise'], required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now } // Lưu thời gian thực
});

const ActivityModel = mongoose.model("activities", ActivitySchema);

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

    await new ActivityModel({
      type: 'user',
      message: `Tài khoản mới "${username}" vừa đăng ký thành công.`
    }).save();

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

    new ActivityModel({
      type: 'user',
      message: `Người dùng "${user.username}" vừa đăng nhập.`
    }).save();

    // =========================================================

    // Trả về kết quả
    const displayName = user.name || user.username;

    res.json({
      message: "Đăng nhập thành công",
      userId: user._id,
      streak: currentStreak, // Gửi streak về frontend để hiển thị
      role: user.role,
      name: displayName,
      avatar: user.avatar,
      birthday: user.birthday
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// ==========================================
// 2. API QUẢN LÝ SÁCH HỆ THỐNG
// ==========================================


// B. API Xem chi tiết 1 cuốn sách (Để vào màn hình đọc)
// // Cách dùng: GET /api/books/654abc... (ID của sách)
// app.get('/api/books/:id', async (req, res) => {
//   try {
//     const book = await BookModel.findById(req.params.id);
//     if (!book) return res.status(404).json({ message: "Không tìm thấy sách" });
//     res.json(book);
//   } catch (err) {
//     res.status(500).json({ message: "Lỗi: " + err.message });
//   }
// });

// C. API Thêm sách mới vào kho (Dành cho Admin/Giáo viên nhập liệu)
// Cách dùng: POST /api/books (Gửi JSON body)

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

// GET /api/my-books
// API Xem chi tiết sách (Sửa để tìm cả sách hệ thống VÀ sách cá nhân)
// index.ts

// API Lấy danh sách sách cá nhân của User (Đã sửa)
app.get('/api/my-books', async (req, res) => {
  try {
    const { userId } = req.query; // Lấy userId từ frontend gửi lên

    if (!userId) {
      return res.status(400).json({ message: "Thiếu userId" });
    }

    // Tìm sách trong collection PersonalBookModel có userId trùng khớp
    const books = await PersonalBookModel.find({ userId: userId }).sort({ createdAt: -1 });

    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Lỗi tải sách cá nhân: " + err.message });
  }
});

// SỬA LẠI API UPLOAD TRONG FILE index.ts
app.post("/api/my-books", upload.single('file'), async (req: any, res) => {
  try {
    // 1. Kiểm tra file
    if (!req.file) {
      return res.status(400).json({ message: "Vui lòng chọn file sách!" });
    }

    const { title, userId, uploadedBy } = req.body;
    let extractedContent = "";

    // 2. XỬ LÝ NỘI DUNG
    if (req.file.mimetype === 'application/pdf') {

      // --- ĐOẠN CODE DEBUG (THÊM VÀO ĐỂ SOI LỖI) ---
      console.log("------------------------------------------------");
      console.log("🔍 DEBUG pdf-parse:");
      console.log("1. Type:", typeof pdfParseLib);
      console.log("2. Keys:", Object.keys(pdfParseLib)); // Xem nó có chứa những hàm nào
      console.log("3. Content:", pdfParseLib);          // In nội dung ra xem
      console.log("------------------------------------------------");

      // Thử tìm hàm đúng một cách thông minh
      // Ưu tiên 1: .default (nếu import ES6)
      // Ưu tiên 2: .PDFParse (nếu là named export)
      // Ưu tiên 3: Chính nó (nếu là function)
      let pdfParse = pdfParseLib.default || pdfParseLib.PDFParse || pdfParseLib;

      if (typeof pdfParse !== 'function') {
        throw new Error(`Vẫn không tìm thấy hàm! Type hiện tại là: ${typeof pdfParse}`);
      }

      const data = await pdfParse(req.file.buffer);
      extractedContent = data.text;
      // ---------------------------------------------

    } else {
      // Nếu là .txt
      extractedContent = req.file.buffer.toString('utf-8');
    }

    // Kiểm tra nội dung rỗng
    if (!extractedContent || !extractedContent.trim()) {
      extractedContent = "Không đọc được nội dung (File ảnh hoặc PDF scan).";
    }

    // 3. Lưu vào Database
    const newBook = new PersonalBookModel({
      title,
      coverUrl: "",
      fileUrl: "",
      userId,
      uploadedBy: uploadedBy || "Ẩn danh",
      content: extractedContent,
      status: "pending"
    });

    await newBook.save();
    res.status(201).json({ message: "Upload thành công!", book: newBook });

  } catch (err) {
    console.error("❌ Lỗi chi tiết:", err); // Dòng này sẽ giúp bạn nhìn thấy lỗi rõ hơn
    res.status(500).json({ message: "Lỗi Server: " + err.message });
  }
});

// API Xóa sách cá nhân
app.delete("/api/my-books/:id", async (req, res) => {
  try {
    const bookId = req.params.id;
    // Tìm và xóa sách theo ID
    const deletedBook = await PersonalBookModel.findByIdAndDelete(bookId);

    if (!deletedBook) {
      return res.status(404).json({ message: "Không tìm thấy sách để xóa" });
    }

    res.json({ message: "Đã xóa sách thành công" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// 2. API Tải sách mới lên (Thêm vào thư viện cá nhân)
// Frontend gọi: POST /api/my-books
app.post("/api/my-books", async (req, res) => {
  try {
    // Nhận thêm content
    const { title, coverUrl, fileUrl, userId, uploadedBy, content } = req.body;

    const newBook = new PersonalBookModel({
      title,
      coverUrl,
      fileUrl,
      userId,
      uploadedBy: uploadedBy || "Ẩn danh",
      content: content || "Chưa có nội dung.", // <--- Lưu nội dung vào DB
      status: "pending"
    });
    await newBook.save();
    res.status(201).json({ message: "Thêm sách thành công", book: newBook });

  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// index.ts
// API xem chi tiết 1 cuốn sách
// API Lấy chi tiết 1 cuốn sách (Sửa để tìm cả 2 nơi)
app.get('/api/books/:id', async (req, res) => {
  try {
    // 1. Tìm trong Sách Hệ Thống trước
    let book = await BookModel.findById(req.params.id);

    // 2. Nếu không thấy, tìm tiếp trong Sách Cá Nhân
    if (!book) {
      book = await PersonalBookModel.findById(req.params.id);
    }

    // 3. Nếu vẫn không thấy thì báo lỗi
    if (!book) {
      return res.status(404).json({ message: "Không tìm thấy sách trong hệ thống" });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: "Lỗi ID sách không hợp lệ: " + err.message });
  }
});
// // ==========================================
// // API THỐNG KÊ (Dành cho Admin)
// // ==========================================

app.get('/api/stats/users', async (req, res) => {
  try {
    // Hàm countDocuments({}) sẽ đếm tổng số dòng trong collection users
    const count = await UserModel.countDocuments({});

    // Trả về số lượng: { count: 5 }
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: "Lỗi đếm user: " + err.message });
  }
});

// API Cập nhật thông tin người dùng
app.put("/api/users/profile", async (req, res) => {
  try {
    const { userId, name, avatar, birthday } = req.body;

    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Cập nhật thông tin
    user.name = name;
    user.avatar = avatar;
    user.birthday = birthday;

    await user.save();

    res.json({ message: "Cập nhật thành công", user });
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// --- ADMIN API ---

// 1. Lấy danh sách sách đang chờ duyệt
app.get("/api/admin/pending-books", async (req, res) => {
  try {
    const pendingBooks = await PersonalBookModel.find({ status: "pending" }).sort({ createdAt: -1 });
    res.json(pendingBooks);
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// 2. Duyệt sách (Approve)
app.put("/api/admin/approve/:bookId", async (req, res) => {
  try {
    await PersonalBookModel.findByIdAndUpdate(req.params.bookId, { status: "approved" });
    res.json({ message: "Đã duyệt sách thành công!" });
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// 3. Từ chối sách (Reject - Xóa luôn)
app.delete("/api/admin/reject/:bookId", async (req, res) => {
  try {
    await PersonalBookModel.findByIdAndDelete(req.params.bookId);
    res.json({ message: "Đã từ chối và xóa sách." });
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// index.ts

// 4. API Lấy thống kê tổng hợp (Dashboard)
// Trong file index.ts

// 4. API Lấy thống kê tổng hợp (Dashboard)
app.get("/api/admin/stats", async (req, res) => {
  try {
    const [userCount, systemBooksCount, pendingBooksCount, activities] = await Promise.all([
      UserModel.countDocuments({}),
      BookModel.countDocuments({}), // Chỉ đếm sách hệ thống
      // PersonalBookModel.countDocuments({}), // <-- BỎ DÒNG NÀY (Không đếm tổng sách cá nhân nữa)
      PersonalBookModel.countDocuments({ status: "pending" }),
      ActivityModel.find().sort({ timestamp: -1 }).limit(10)
    ]);

    const formattedActivities = activities.map(act => ({
      id: act._id,
      type: act.type,
      message: act.message,
      timestamp: new Date(act.timestamp).toLocaleString('vi-VN', { hour12: false })
    }));

    res.json({
      totalUsers: userCount,
      totalBooks: systemBooksCount, // <--- SỬA Ở ĐÂY: Chỉ lấy systemBooksCount
      pendingBooks: pendingBooksCount,
      activities: formattedActivities
    });

  } catch (err) {
    res.status(500).json({ message: "Lỗi thống kê: " + err.message });
  }
});

// --- API YÊU THÍCH (FAVORITES) ---

// API Lấy danh sách sách yêu thích của User (TRẢ VỀ FULL THÔNG TIN)
app.get('/api/users/:userId/favorites', async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Tìm user để lấy danh sách ID các sách đã thích
    const user = await UserModel.findById(userId);
    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    const favoriteIds = user.favorites || [];

    // 2. Tìm thông tin chi tiết của các cuốn sách dựa trên danh sách ID đó
    // Lưu ý: Chúng ta tìm ở cả bảng Sách hệ thống (BookModel) và Sách cá nhân (PersonalBookModel)
    // để đảm bảo sách nào cũng hiện được.

    const [systemBooks, personalBooks] = await Promise.all([
      BookModel.find({ _id: { $in: favoriteIds } }),       // Tìm trong kho sách hệ thống
      PersonalBookModel.find({ _id: { $in: favoriteIds } }) // Tìm trong kho sách cá nhân
    ]);

    // 3. Gộp kết quả lại và trả về
    const allFavoriteBooks = [...systemBooks, ...personalBooks];

    res.json(allFavoriteBooks);

  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
  }
});

// API Thả tim / Bỏ tim
app.post('/api/users/favorites', async (req, res) => {
  try {
    const { userId, bookId } = req.body;
    const user = await UserModel.findById(userId);

    if (!user) return res.status(404).json({ message: "User không tồn tại" });

    // Kiểm tra xem đã thích chưa
    if (!user.favorites) user.favorites = [];
    const index = user.favorites.indexOf(bookId);

    let isFavorite = false;
    if (index === -1) {
      // Chưa thích -> Thêm vào
      user.favorites.push(bookId);
      isFavorite = true;
    } else {
      // Đã thích -> Xóa đi
      user.favorites.splice(index, 1);
      isFavorite = false;
    }

    await user.save();
    res.json({ success: true, isFavorite });
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// API Cập nhật tiến độ (Đọc hoặc Chơi game)
app.post("/api/users/progress", async (req, res) => {
  try {
    const { userId, type, value } = req.body; // type: 'read' hoặc 'game'
    const user = await UserModel.findById(userId);

    // Kiểm tra ngày mới để reset
    const todayStr = new Date().toISOString().split('T')[0]; // "2024-05-20"

    if (user.dailyProgress.date !== todayStr) {
      // Sang ngày mới -> Reset về 0
      user.dailyProgress = { date: todayStr, readSeconds: 0, gamesCount: 0 };
    }

    // Cộng dồn tiến độ
    if (type === 'read') {
      user.dailyProgress.readSeconds += value; // value là số giây vừa đọc thêm
    } else if (type === 'game') {
      user.dailyProgress.gamesCount += 1; // Cộng thêm 1 game
    }

    await user.save();
    res.json({ message: "Đã cập nhật tiến độ", progress: user.dailyProgress });
  } catch (err) {
    res.status(500).json({ message: "Lỗi: " + err.message });
  }
});

// API Lấy tiến độ hiện tại (Để vẽ biểu đồ Dashboard)
app.get("/api/users/progress/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    // 1. Tìm user
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User không tồn tại" });
    }

    // 2. Lấy ngày hiện tại (theo chuẩn YYYY-MM-DD)
    const todayStr = new Date().toISOString().split('T')[0];

    // 3. Xử lý Logic hiển thị:
    // Nếu trong Database đang lưu tiến độ của ngày hôm qua (hoặc ngày cũ hơn),
    // thì khi hiển thị lên màn hình, ta phải trả về 0 hết.
    let displayProgress = user.dailyProgress;

    // Kiểm tra nếu dữ liệu cũ quá hạn
    if (!displayProgress || displayProgress.date !== todayStr) {
      displayProgress = {
        readSeconds: 0,
        gamesCount: 0,
        date: todayStr
      };

      // (Tùy chọn) Lưu lại trạng thái reset này vào DB luôn cho đồng bộ
      // user.dailyProgress = displayProgress;
      // await user.save();
    }

    // 4. Trả về dữ liệu
    res.json(displayProgress);

  } catch (err) {
    res.status(500).json({ message: "Lỗi server: " + err.message });
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