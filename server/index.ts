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
  lastLoginDate: { type: Date, default: null },
  role: { type: String, default: "user" },
  name: { type: String, default: "" },          // Tên hiển thị (Tên của tớ)
  avatar: { type: String, default: "🐶" },      // Avatar mặc định là Chó
  birthday: { type: String, default: "" }       // Ngày sinh
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

app.post("/api/my-books", async (req, res) => {
  try {
    // Nhận thêm uploadedBy từ frontend gửi lên
    const { title, coverUrl, fileUrl, userId, uploadedBy } = req.body;

    const newBook = new PersonalBookModel({
      title,
      coverUrl,
      fileUrl,
      userId,
      uploadedBy: uploadedBy || "Ẩn danh", // Lưu tên người upload
      status: "pending" // Luôn luôn là pending khi mới up
    });

    await newBook.save();
    res.status(201).json({ message: "Đã gửi sách chờ duyệt", book: newBook });
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
// API NẠP CÂU CHUYỆN CỔ TÍCH & NGỤ NGÔN
// =========================================================
app.get('/api/seed-stories', async (req, res) => {
  try {
    // 1. Xóa dữ liệu cũ để tránh trùng lặp
    await BookModel.deleteMany({});

    // 2. Danh sách 13 cuốn sách đã được chuẩn hóa
    const newBooks = [
      // --- NHÓM TRUYỆN CỔ TÍCH / NGỤ NGÔN ---
      {
        title: "Cáo, Thỏ và Gà Trống",
        author: "Dân gian",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069172.png", // Hình con cáo
        content: `Ngày xửa ngày xưa, trong một khu rừng nọ, có hai người bạn Thỏ và Cáo. 
                  Thỏ sở hữu một ngôi nhà ấm áp được làm bằng gỗ, trong khi Cáo lại có một căn nhà bằng băng mong manh. 
                  Khi mùa xuân đến, nhà của Cáo tan chảy bởi ánh nắng mặt trời, khiến Cáo không còn nơi trú ẩn. 
                  Nó đành tìm đến nhà Thỏ và xin được tá túc tạm thời.
                  Thỏ, vốn là một chú bé tốt bụng, đã vui vẻ chào đón Cáo và cho phép Cáo vào nhà. 
                  Tuy nhiên, thay vì biết ơn, Cáo đã lợi dụng sự yếu đuối của Thỏ và đuổi Thỏ ra khỏi nhà để chiếm lấy ngôi nhà cho riêng mình. 
                  Thỏ vô cùng đau khổ và buồn bã. Nó lang thang trong khu rừng, vừa đi vừa khóc, không biết phải làm gì tiếp theo.
                  May mắn thay, Thỏ gặp được Gà Trống, một người bạn thông minh và dũng cảm. 
                  Gà Trống nghe xong câu chuyện của Thỏ, liền vác hái trên vai và quyết tâm giúp đỡ Thỏ lấy lại nhà.
                  Gà Trống cất tiếng gáy vang dội, đồng thời dọa nạt Cáo bằng những lời hát đầy uy lực. 
                  Cáo vốn là một kẻ hèn nhát, nên nó đã vô cùng sợ hãi trước sự dũng cảm của Gà Trống. 
                  Lo sợ Gà Trống sẽ tấn công mình, Cáo đành vội vã bỏ chạy khỏi nhà Thỏ. 
                  Nhờ sự giúp đỡ của Gà Trống, Thỏ đã lấy lại được ngôi nhà của mình và sống hạnh phúc từ đó về sau.`
      },
      {
        title: "Rùa và Thỏ",
        author: "Aesop",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/616/616554.png", // Hình rùa
        content: `Ngày xửa ngày xưa, có một chú Rùa và một chú Thỏ sống chung trong một khu rừng. Thỏ nổi tiếng với tốc độ phi thường, trong khi Rùa lại di chuyển rất chậm chạp.
Một hôm, Thỏ và Rùa tranh luận xem ai nhanh hơn. Thỏ kiêu ngạo tin rằng mình sẽ dễ dàng chiến thắng Rùa trong một cuộc đua. Rùa tuy biết mình chậm hơn nhưng vẫn muốn thử sức.
Cuộc đua bắt đầu. Thỏ phóng đi như một mũi tên, bỏ xa Rùa phía sau. Nhìn thấy Rùa di chuyển chậm chạp, Thỏ quá tự tin và quyết định nghỉ ngơi dưới bóng cây. Thỏ ngủ thiếp đi trong khi Rùa vẫn kiên trì bò từng bước một.
Khi Thỏ thức dậy, nó hốt hoảng nhận ra Rùa đã đến gần đích. Thỏ cố gắng chạy hết sức nhưng đã quá muộn. Rùa đã về đích trước và trở thành người chiến thắng.`
      },
      {
        title: "Ngỗng Đẻ Trứng Vàng",
        author: "Ngụ ngôn",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069186.png", // Hình trứng vàng
        content: `Ngày xửa ngày xưa, có một đôi vợ chồng nông dân nghèo may mắn được sở hữu một con ngỗng có khả năng đẻ trứng vàng, mỗi ngày một quả. Tuy nhiên, lòng tham lam dần len lỏi vào tâm trí họ. Thay vì trân trọng và biết ơn con ngỗng, họ lại mong muốn có được nhiều vàng hơn nữa để nhanh chóng trở nên giàu có.
Họ tưởng tượng rằng nếu con ngỗng có thể đẻ ra những quả trứng vàng, thì chắc chắn bên trong bụng của nó phải được làm bằng vàng ròng. Với suy nghĩ nông nổi, họ quyết định mổ bụng con ngỗng để lấy hết vàng trong một lần.
Đầy hân hoan và háo hức, họ mổ con ngỗng ra, nhưng sự thật phũ phàng đã giáng đòn mạnh vào lòng tham của họ. Bụng con ngỗng hoàn toàn bình thường, không hề có chút vàng nào như họ mong đợi.
Hậu quả của lòng tham lam đã khiến họ mất đi con ngỗng đẻ trứng vàng quý giá – nguồn thu nhập duy nhất của họ. Từ đó, họ phải sống trong cảnh nghèo khó và hối hận vì sự ngu ngốc của mình.`
      },
      {
        title: "Sự Tích Hoa Cúc Trắng",
        author: "Cổ tích Nhật Bản",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2926/2926726.png", // Hình bông hoa
        content: `Ngày xửa ngày xưa, có một cô bé hiếu thảo sống cùng mẹ trong một túp lều tranh. Một ngày nọ, mẹ của cô lâm bệnh nặng, nhưng vì nhà nghèo không có tiền mua thuốc, khiến cô vô cùng buồn bã và lo lắng.
Một hôm, khi đang ngồi khóc bên đường, cô bé gặp một ông lão tốt bụng. Khi biết được hoàn cảnh của cô, ông lão liền chỉ cho cô bé cách tìm kiếm một bông hoa kỳ diệu trong rừng sâu có khả năng kéo dài tuổi thọ cho mẹ. Ông còn cho biết, mỗi cánh hoa kỳ diệu sẽ tương ứng với số ngày mà mẹ em có thể sống.
Thế là ngay hôm sau, cô bé đã lên đường tìm kiếm bông hoa. Cô bé phải vượt qua nhiều chướng ngại vật nguy hiểm và đối mặt với nhiều loài quái vật hung dữ. Tuy nhiên, với lòng hiếu thảo và quyết tâm mãnh liệt, cô bé cuối cùng cũng tìm thấy bông hoa kỳ diệu.
Tuy nhiên, khi đếm số cánh hoa, cô bé chỉ thấy có bốn cánh, đồng nghĩa với việc mẹ cô chỉ có thể sống thêm bốn ngày. Không cam chịu, cô bé dùng bàn tay nhỏ bé xé từng cánh hoa lớn thành những cánh hoa nhỏ hơn, khiến số lượng cánh hoa tăng lên không đếm xuể.
Nhờ lòng hiếu thảo và sự hy sinh cao cả, mẹ cô đã được cứu sống một cách kỳ diệu. Bông hoa kỳ diệu cũng được đổi tên thành “Bông hoa cúc trắng” để ghi nhớ lòng hiếu thảo vô bờ bến của cô.`
      },
      {
        title: "Công và Quạ",
        author: "Sưu tầm",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/1998/1998767.png", // Hình chim công
        content: `Sống trong khu rừng rậm rạp, đôi bạn thân Công và Quạ luôn tự ti về ngoại hình của mình. Một ngày, khi cùng trò chuyện về vẻ đẹp của các loài chim muông, Công và Quạ nảy sinh ý tưởng tô điểm cho nhau để trở nên rực rỡ hơn.
Công được Quạ tô điểm bằng những mảng màu lấp lánh, khiến bộ lông của Công trở nên vô cùng nổi bật. Đến lượt Công tô điểm cho Quạ, bỗng tiếng chim non ríu rít vang vọng khắp nơi báo hiệu thời gian kiếm ăn đã đến. Quạ háo hức muốn tham gia cùng bầy chim, nên vội vã đề xuất:
“Để tiết kiệm thời gian, chi bằng anh cứ đổ hết mực lên mình em, em sẽ đen nhánh như vậy cũng đẹp mà!”
Công đồng ý và đổ hết đĩa mực lên người Quạ. Lông vũ của Quạ từ đó nhuộm một màu đen tuyền, không còn vẻ đẹp tự nhiên vốn có.`
      },
      {
        title: "Hai Con Gà Trống",
        author: "Aesop",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/1864/1864472.png", // Hình gà
        content: `Trên một trang trại rộng lớn, hai chú gà trống được sinh ra từ cùng một gà mẹ và được nuôi dưỡng cùng nhau. Khi lớn lên, hai chú gà trở nên oai phong, lộng lẫy với bộ lông mượt mà và tiếng gáy vang dội.
Tuy nhiên, trái ngược với tình thương yêu ruột thịt, hai chú gà luôn ganh đua, cãi vã và tranh giành vị trí làm chủ trang trại. Mỗi chú gà đều tin rằng mình đẹp đẽ, mạnh mẽ hơn và xứng đáng được làm “Vua” của trang trại.
Cuối cùng, không thể chịu đựng được sự tranh chấp dai dẳng, hai chú gà quyết định giải quyết bằng một trận chiến kịch liệt. Sau một hồi giao tranh căng thẳng, một chú gà đã chiến thắng và nhảy lên hàng rào, vỗ cánh oai hùng và cất tiếng gáy vang dội để ca tụng chiến thắng của mình.
Thế nhưng, niềm vui ngắn chẳng tày gang. Khi chú gà đang đắm chìm trong chiến thắng, một con chim ưng khổng lồ bất ngờ lao xuống từ bầu trời, tóm gọn chú gà và bay đi mất.`
      },
      {
        title: "Lừa Hay Hát",
        author: "Ngụ ngôn",
        category: "Truyện Cổ Tích",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2313/2313393.png", // Hình con lừa
        content: `Ngày xưa, có một người đàn ông giặt thuê nuôi một chú lừa để giúp mình vận chuyển quần áo từ nhà ra bờ sông và trở về. Tuy nhiên, chú lừa này lại rất kén ăn và không thích những thức ăn mà người chủ dành cho nó. Do vậy, nó thường xuyên lén lút đi đến cánh đồng gần đó để tìm kiếm thức ăn ngon hơn.
Một hôm, khi đang lang thang trên cánh đồng, chú lừa gặp gỡ một con cáo tinh ranh và nhanh chóng kết bạn với nó. Hai con vật cùng nhau khám phá cánh đồng và bất ngờ phát hiện ra một vườn dưa hấu chín mọng, thơm ngon.
Quá đỗi thích thú, chú lừa say sưa thưởng thức những trái dưa hấu ngọt ngào. Trong lúc ăn, chú lừa nảy sinh ý muốn khoe khoang giọng hát của mình. Tuy nhiên, con cáo đã lập tức cảnh báo:
“Này bạn lừa, nếu bạn hát, tiếng hát của bạn sẽ thu hút sự chú ý của người dân trong làng. Họ sẽ biết chúng ta đang phá hoại mùa màng của họ và sẽ đến đây đuổi đánh chúng ta.”
Bỏ ngoài tai lời khuyên của con cáo, chú lừa vẫn kiên quyết cất tiếng hát vang vọng khắp cánh đồng. Khi đó, cáo đã tức khắc chạy khỏi cánh đồng, cùng lúc khi nghe thấy tiếng hát của lừa, người dân trong làng lập tức cầm gậy gộc kéo đến và đánh đuổi chú thảm thương.`
      },

      // --- NHÓM PHIÊU LƯU ---
      {
        title: "Chú Thỏ Tinh Khôn",
        author: "Dân gian",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069176.png", // Hình thỏ
        content: `Một chú Thỏ đang ngon miệng nhai ngấu ngọn cỏ non mọc ven bờ sông. Bỗng dưng, một con Cá Sấu to lớn xuất hiện, lén lút bò đến gần Thỏ. Thỏ không hề hay biết, vẫn tiếp tục mải mê ăn cỏ.
Nhận thấy cơ hội, Cá Sấu bất ngờ mở miệng to và đớp gọn Thỏ vào mồm. Thỏ hoảng hốt, cố gắng vùng vẫy nhưng không thể thoát ra. Hơn thế, để chế giễu và đe dọa Thỏ thôi vùng vẫy, Cá Sấu đã phát ra âm thanh “hu hu” thật to từ cổ họng. Để đánh lạc hướng Cá Sấu, Thỏ giả vờ bình tĩnh và nói:
“Này Cá Sấu, ông kêu “hu hu” tôi chẳng sợ đâu! Chỉ khi ông kêu “ha ha” thì tôi mới sợ chết khiếp!”
Nghe Thỏ nói vậy, Cá Sấu đắc chí há to miệng và kêu lên “ha ha”. Tận dụng cơ hội này, Thỏ nhanh chóng nhảy phốc khỏi miệng Cá Sấu, quay lại cười nhạo và phi nhanh vào tận rừng sâu.`
      },
      {
        title: "Khỉ Và Cá Heo",
        author: "Aesop",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2809/2809765.png", // Hình cá heo
        content: `Vào một buổi sáng như thường lệ, các thủy thủ hăng hái chuẩn bị lên đường cho hành trình dài trên chiếc thuyền buồm. Cùng đi với họ còn có một chú khỉ tinh nghịch.
Khi thuyền ra khơi lênh đênh trên đại dương, bất ngờ một cơn bão dữ dội ập đến, khiến con thuyền chìm nghỉm trong phút chốc. Toàn bộ thủy thủ đoàn, bao gồm cả chú khỉ, đều rơi xuống biển và chật vật bám lấy những mảnh vỡ còn sót lại.
Đúng lúc tưởng chừng như không còn hy vọng, một chú cá heo dũng cảm xuất hiện và cứu vớt chú khỉ khỏi tay tử thần. Cá heo cõng chú khỉ trên lưng và bơi đến hòn đảo gần nhất để tránh bão.
Khi đặt chân lên hòn đảo hoang vắng, chú khỉ vênh váo khoe khoang với cá heo:
“Hòn đảo này chẳng xa lạ gì với tớ đâu! Tớ là hoàng tử khỉ ở đây, và vua chính là bạn thân của tớ đấy!”
Nghe vậy, cá heo mỉm cười và đáp lời:
“Thật tuyệt vời! Vậy thì bây giờ bạn có thể trở thành vua của hòn đảo này rồi!”
Chú khỉ tò mò hỏi:
“Làm thế nào để trở thành vua?”
Cá heo thong thả bơi ra xa, rồi quay lại giải thích:
“Đơn giản thôi! Bạn là con vật duy nhất trên hòn đảo này, vậy đương nhiên bạn sẽ là vua rồi!”
Lúc này, chú khỉ mới nhận ra hậu quả của thói khoác lác và dối trá. Cá heo đã bơi đi rất xa, bỏ lại nó một mình trên hoang đảo đầy hoang vu.`
      },
      {
        title: "Chú Vịt Xám Ham Chơi",
        author: "Sưu tầm",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/2619/2619213.png", // Hình vịt
        content: `Vào một ngày đẹp trời, Vịt mẹ dẫn đàn vịt con đi dạo trong khu rừng xanh mát. Trước khi đi, Vịt mẹ dặn dò đàn con: “Các con phải đi theo sát mẹ, không được tách ra đi một mình kẻo bị cáo bắt ăn thịt nhé!”
Đàn vịt con ngoan ngoãn gật đầu đồng ý. Tuy nhiên, vừa bước vào khu rừng, chú Vịt Xám tinh nghịch đã quên lời mẹ dặn, tách khỏi đàn, vui chơi ở mọi ngóc ngách của khu rừng.
Đến khi nhìn lại thì trời đã tối đen như mực, Vịt Xám ngẩng đầu lên và nhận ra mình đã lạc mất mẹ. Lo lắng và sợ hãi, Vịt Xám kêu to gọi mẹ. Tiếng kêu của Vịt Xám thu hút sự chú ý của một con cáo vốn đang ẩn nấp trong bụi cây nhanh chóng lao đến bờ ao, sẵn sàng tấn công Vịt Xám.
May mắn thay, Vịt mẹ đã kịp xuất hiện và kéo Vịt Xám xuống bờ ao, thoát chết trong gang tấc. Trải qua sự việc nguy hiểm này, Vịt Xám vô cùng hối hận. Từ đó, chú Vịt Xám luôn ngoan ngoãn và đi theo sát mẹ mọi lúc mọi nơi.`
      },
      {
        title: "Chú Cún Con Đi Lạc",
        author: "Đời sống",
        category: "Phiêu Lưu",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/1998/1998627.png", // Hình cún
        content: `Cậu bé Tí có nuôi một chú cún cưng vô cùng đáng yêu. Một ngày nọ, chú cún cưng của Tí bỗng dưng biến mất khiến cậu vô cùng lo lắng. Cậu bé tìm mọi ngóc ngách trong nhà nhưng không tìm thấy chú cún ở đâu. Không nản lòng, Tí quyết định đi tìm cún khắp nơi từ sáng đến tối.
Màn đêm buông xuống, bóng tối bao trùm, Tí đành quay trở về nhà với tâm trạng buồn bã. Khi đi ngang qua nhà anh hàng xóm, Tí chợt nảy ra ý hỏi thăm xem biết đâu chú cún đã lang thang đến đây.
“Anh An ơi, từ sáng đến giờ, anh có nhìn thấy chú cún nhỏ của em ở đâu không ạ? Em đã tìm nó khắp nơi mà không thấy.” – Tí hỏi với giọng đầy hy vọng.
“Có chứ!” – Anh An trả lời, tay chỉ về phía một góc sân. “Có một chú cún đang gặm xương ở đằng kia kìa. Lúc nãy anh không biết là cún của em nên không báo cho em biết.”
Niềm vui vỡ òa trong lòng Tí. Cậu bé vội vã chạy đến chỗ chú cún, chờ cho đến khi chú gặm xong cục xương rồi nhẹ nhàng bế chú vào lòng. “Cảm ơn anh Tí nhiều ạ!” – Tí nói với vẻ mặt hạnh phúc.`
      },

      // --- NHÓM KHOA HỌC / KỸ NĂNG ---
      {
        title: "Lợn Con Đi Thăm Bạn",
        author: "Kỹ năng sống",
        category: "Khoa học",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/3069/3069179.png", // Hình lợn
        content: `Lợn con là một chú bé vô cùng dễ thương, nhưng nó lại có một thói quen xấu là không thích tắm rửa. Do vậy, cơ thể Lợn con thường xuyên bám đầy bụi bẩn khiến làn da trở nên lấm lem, loang lổ màu đen và tỏa ra mùi hôi khó chịu.
Một ngày nọ, Gấu con gửi thiệp mời các bạn đến nhà chơi. Lợn con cũng nhận được thiệp mời và háo hức đến nhà Gấu con.
“Cốc cốc cốc…” Lợn con gõ cửa. Gấu con ra mở cửa và ngạc nhiên hỏi: “Bạn là ai vậy? Tớ không nhớ đã mời bạn đến chơi.”
Lợn con đáp: “Tớ là Lợn con đây mà! Bạn Gấu con đã mời tớ đến nhà chơi mà.”
Gấu con nhìn Lợn con với vẻ mặt nghi ngờ: “Tớ nhớ Lợn con là một chú bé trắng hồng rất xinh đẹp, nhưng tại sao bạn lại đen sì thế? Hơn nữa, trên người bạn còn có mùi hôi khó chịu giống như mùi của Cáo. Có phải bạn là Cáo giả mạo thành Lợn con không?”
Thỏ con và Chó con cũng chạy đến và hít hít người Lợn con: “Bạn ấy hôi quá! Chắc chắn là Cáo gian xảo giả mạo thành Lợn con rồi! Chúng ta hãy đuổi nó đi!”
Các bạn liền cầm gậy đuổi đánh Lợn con. Lợn con hoảng sợ, vừa chạy vừa hét lên: “Tớ không phải là Cáo! Tớ là Lợn con đây mà!”
Tuy nhiên, các bạn vẫn không tin và tiếp tục đuổi đánh Lợn con. Lợn chạy đến một cái ao nhỏ, vô tình trượt chân và ngã “tùm” xuống nước. Nó liền nhân cơ hội này để vội vàng tắm rửa, kỳ cọ cho đến khi cơ thể sạch sẽ. Sau khi tắm xong, Lợn con trèo lên bờ. Gấu con ngạc nhiên hỏi: “Lợn con ơi, thật kỳ lạ! Vừa nãy rõ ràng chúng tớ nhìn thấy một con Cáo rơi xuống ao, tại sao bây giờ lại là bạn nhỉ?”
Lợn con ngượng ngùng giải thích: “Vừa nãy không phải là Cáo rơi xuống ao đâu, mà chính là tớ đây. Vì tớ lười tắm rửa nên người mới bẩn và hôi như vậy, khiến các bạn hiểu lầm.”
Nghe xong lời giải thích, các bạn của Lợn con đều bật cười. Chúng kéo tay Lợn con về nhà Gấu con và cùng nhau vui vẻ ăn uống, múa hát.`
      },
      {
        title: "Vịt Con Gọn Gàng",
        author: "Kỹ năng sống",
        category: "Khoa học",
        coverUrl: "https://cdn-icons-png.flaticon.com/512/826/826963.png", // Hình vịt nhỏ
        content: `Vịt con vốn là một chú bé tinh nghịch và hay để lộ phần mông khi đi lại. Một hôm, khi đang dạo chơi trong rừng, Vịt con nghe thấy tiếng Thỏ hát trêu mình:
“Lêu lêu xấu hổ, để hở cả mông, mà chạy lông nhông.”
Vịt con nghe vậy, mặt đỏ bừng vì xấu hổ. Khi đi qua một cây cổ thụ, Vịt con lại nghe tiếng Khỉ hát:
“Gió thổi, lá sen bay, lộ cả mông ra ngoài.”
Lòng Vịt con càng thêm xấu hổ và bật khóc nức nở. Về đến nhà, Vịt con kể lại toàn bộ câu chuyện cho mẹ nghe. Nghe xong, mẹ Vịt mỉm cười và nói:
“Con yêu, từ nay con phải sửa đổi thói quen xấu này nhé! Hãy luôn gọn gàng và chỉnh tề trong mọi lúc mọi nơi.”
Vịt con ngoan ngoãn gật đầu và đi thay quần áo ngay lập tức.`
      }
    ];

    await BookModel.insertMany(newBooks);
    res.send("✅ Đã nạp thành công 13 câu chuyện vào thư viện!");
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

// ==========================================
// API THỐNG KÊ (Dành cho Admin)
// ==========================================

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