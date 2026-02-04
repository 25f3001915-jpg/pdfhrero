# PDFMasterPro

A complete, advanced PDF processing web application with 30+ tools for managing, converting, and editing PDF documents.

![PDFMasterPro](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## 🚀 Features

### Organize PDF
- **Merge PDF** - Combine multiple PDFs into one document
- **Split PDF** - Split PDF into multiple files by pages or ranges
- **Rotate PDF** - Rotate pages to correct orientation (90°, 180°, 270°)

### Optimize PDF
- **Compress PDF** - Reduce file size with quality options (low/medium/high)

### Convert To PDF
- **Image to PDF** - Convert JPG, PNG, GIF, WebP to PDF
- **Word to PDF** - Convert DOC/DOCX to PDF
- **Excel to PDF** - Convert XLS/XLSX to PDF (coming soon)
- **PowerPoint to PDF** - Convert PPT/PPTX to PDF (coming soon)

### Convert From PDF
- **PDF to Image** - Extract pages as JPG or PNG images
- **PDF to Word** - Convert to editable DOCX format
- **PDF to Excel** - Extract tables to XLSX (coming soon)

### Edit PDF
- **Watermark PDF** - Add text or image watermarks with custom opacity
- **Add Page Numbers** - Custom positioning and formatting (coming soon)
- **Crop PDF** - Trim margins or specific areas (coming soon)

### PDF Security
- **Protect PDF** - Add password protection with encryption
- **Unlock PDF** - Remove password protection
- **Sign PDF** - Add digital signatures (coming soon)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI library
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **React Dropzone** - File upload
- **PDF.js** - PDF preview

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **pdf-lib** - PDF manipulation
- **Sharp** - Image processing
- **Multer** - File uploads

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB 6+
- Git

### Clone Repository
```bash
git clone https://github.com/yourusername/pdfmasterpro.git
cd pdfmasterpro
```

### Backend Setup
```bash
cd server
npm install

# Create .env file
cp .env.example .env

# Edit .env with your configuration
# Start MongoDB (if not running)
# mongod

# Run server
npm run dev
```

### Frontend Setup
```bash
cd client
npm install

# Run development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `server` directory:

```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/pdfmasterpro
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads
```

## 📱 Usage

1. **Upload Files** - Drag and drop or click to browse
2. **Select Tool** - Choose from 30+ PDF processing tools
3. **Configure Options** - Set quality, rotation, watermark text, etc.
4. **Process** - Click the process button
5. **Download** - Get your processed PDF instantly

## 🎨 Screenshots

### Homepage
Beautiful landing page with categorized tools and dark mode support.

### PDF Tools
Each tool has a dedicated page with file upload, options, and preview.

### Dashboard
Track your processing history and manage your account.

## 🔐 Security Features

- **File Validation** - Only allowed file types accepted
- **Rate Limiting** - Prevents abuse
- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcrypt encryption
- **Auto File Cleanup** - Files deleted after processing
- **HTTPS Ready** - SSL/TLS support

## 🚀 Deployment

### Production Build

```bash
# Build frontend
cd client
npm run build

# The built files will be in client/dist
# Configure your server to serve these files
```

### Deploy to Vercel (Frontend)

```bash
cd client
vercel deploy --prod
```

### Deploy to Railway/Render (Backend)

1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically on push

### Docker Deployment

```bash
docker-compose up -d
```

## 📚 API Documentation

### Authentication

**POST** `/api/auth/signup`
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**POST** `/api/auth/login`
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### PDF Operations

**POST** `/api/pdf/merge`
- Upload: `files[]` (multipart/form-data)
- Returns: Merged PDF file

**POST** `/api/pdf/compress`
- Upload: `file` (multipart/form-data)
- Body: `level` (low/medium/high)
- Returns: Compressed PDF file

See full API documentation at `/api/docs` (coming soon)

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**PDFMasterPro Team**

## 🙏 Acknowledgments

- pdf-lib for PDF manipulation
- React team for amazing framework
- Tailwind CSS for beautiful styling
- All open-source contributors

## 📞 Support

For support, email support@pdfmasterpro.com or join our Discord server.

## 🗺️ Roadmap

- [ ] OCR support for scanned PDFs
- [ ] Batch processing for multiple files
- [ ] Custom workflows automation
- [ ] API access for developers
- [ ] Mobile apps (iOS/Android)
- [ ] Desktop app (Electron)
- [ ] AI-powered features
- [ ] Collaboration tools
- [ ] Premium subscription plans

---

Made with ❤️ by PDFMasterPro Team
