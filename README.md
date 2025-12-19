Ứng Dụng Hỗ Trợ Trẻ Khó Đọc (Dyslexia Support Platform)
Một nền tảng giáo dục tương tác được thiết kế dành riêng cho trẻ em mắc chứng khó đọc, kết hợp phương pháp "Học mà chơi" (Gamification) với các công nghệ hỗ trợ hiện đại như Chuyển văn bản thành giọng nói (TTS) và Nhận diện giọng nói (STT).

_🌟 Tính Năng Nổi Bật_

🎮 **Trò Chơi Giáo Dục (Gamification)**

Luyện Âm Vị (Pronunciation Game): Sử dụng công nghệ AI nhận diện giọng nói để chấm điểm phát âm của trẻ theo thời gian thực.

Ghép Từ Tương Ứng (Word Matching): Kéo thả hình ảnh vào từ vựng đúng để tăng khả năng nhận diện mặt chữ.

Tìm Từ Ẩn (Word Search): Rèn luyện sự tập trung và khả năng ghi nhớ từ vựng.

Truyện Tương Tác (Interactive Story): Cốt truyện rẽ nhánh tùy thuộc vào lựa chọn của bé.

📖 **Thư Viện Sách Thông Minh**

Book Reader: Chế độ đọc sách tập trung với font chữ dễ đọc.

Text-to-Speech: Tự động đọc sách cho bé nghe với giọng đọc tiếng Việt tự nhiên, có tô màu câu đang đọc (Karaoke style).

Upload Sách Cá Nhân: Cho phép tải lên sách (PDF/Text) để hệ thống hỗ trợ đọc.

⚙️ **Hệ Thống Quản Trị & Theo Dõi**

Admin Dashboard: Duyệt sách do người dùng tải lên, thống kê người dùng và nội dung.

Tiến độ học tập: Theo dõi chuỗi ngày học (Streak) và lịch sử hoạt động hàng ngày.

_🛠️ Công Nghệ Sử Dụng (Tech Stack)_

1. Frontend (Client)
   
Framework: ReactJS (Vite)

Ngôn ngữ: TypeScript (.tsx)

UI Library: Tailwind CSS, Shadcn/UI (Radix UI)

Icons: Lucide React

Web APIs: Web Speech API (SpeechSynthesis & SpeechRecognition), Drag & Drop API.

2.Backend (Server)

Runtime: Node.js

Framework: Express.js

Database: MongoDB & Mongoose ODM

File Handling: Multer (Upload file), PDF-parse



_🚀 Hướng Dẫn Cài Đặt (Installation)_

Để chạy dự án trên máy cục bộ, bạn cần cài đặt Node.js và MongoDB.


Bước 1: Clone dự án

git clone https://github.com/username/ten-du-an-cua-ban.git

cd ten-du-an-cua-ban


Bước 2: Cài đặt & Cấu hình Backend (Server)

Di chuyển vào thư mục server: cd server

Cài đặt các gói thư viện (dependencies): npm install


Hoặc nếu dùng yarn: 
yarn install

Tạo file môi trường .env: Tạo một file tên .env trong thư mục server/ và điền nội dung sau:

PORT=5000

MONGO_URI=mongodb://localhost:27017/dyslexia_db

Nếu dùng MongoDB Atlas, hãy thay đường dẫn trên bằng connection string của bạn

Khởi chạy Server: npm run dev

Server sẽ chạy tại: http://localhost:5000


Bước 3: Cài đặt & Cấu hình Frontend (Client)

Mở một cửa sổ terminal mới (giữ terminal server đang chạy), di chuyển vào thư mục client: cd client

Cài đặt dependencies: npm install

Khởi chạy Frontend: npm run dev

Truy cập ứng dụng: Mở trình duyệt và vào địa chỉ: http://localhost:5173 (hoặc port do Vite cấp).


_📂 Cấu Trúc Thư Mục_

project-root/

├── client/                 # Mã nguồn Frontend (React)

│   ├── public/             # Assets tĩnh

│   ├── src/

│   │   ├── components/     # Các component tái sử dụng (UI, Game logic)

│   │   ├── contexts/       # React Context (Auth, Header)

│   │   ├── data/           # Dữ liệu mẫu (WordBank, Stories)

│   │   ├── pages/          # Các trang chính (Home, Login, Games...)

│   │   └── App.tsx         # Routing chính

│   └── ...

├── server/                 # Mã nguồn Backend (Node.js)

│   ├── models/             # Mongoose Models (User, Book)

│   ├── uploads/            # Thư mục lưu file sách/ảnh tạm thời

│   ├── index.ts            # Entry point của Server & API Routes

│   └── ...

└── README.md

