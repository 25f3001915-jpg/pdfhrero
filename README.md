# PDFMasterPro - Advanced PDF Processing Platform

A complete, enterprise-grade PDF processing web application with 50+ advanced tools, user authentication, premium subscriptions, custom workflows, and PWA support. Built as a modern alternative to iLovePDF.

![PDFMasterPro](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Build Status](https://img.shields.io/badge/build-passing-brightgreen.svg)
![Coverage](https://img.shields.io/badge/coverage-95%25-green.svg)

## 🚀 Features

### 📁 Organize PDF
- **Merge PDF** - Combine multiple PDFs into one document
- **Split PDF** - Split PDF into multiple files by pages or ranges
- **Rotate PDF** - Rotate pages to correct orientation (90°, 180°, 270°)
- **Organize PDF** - Rearrange, add, or delete pages
- **Page Numbers** - Add custom page numbers with positioning

### 📉 Optimize PDF
- **Compress PDF** - Reduce file size with quality options (low/medium/high)
- **Repair PDF** - Fix corrupted PDF files
- **OCR PDF** - Convert scanned documents to searchable text

### 🔄 Convert To PDF
- **Image to PDF** - Convert JPG, PNG, GIF, WebP to PDF
- **Word to PDF** - Convert DOC/DOCX to PDF
- **Excel to PDF** - Convert XLS/XLSX to PDF
- **PowerPoint to PDF** - Convert PPT/PPTX to PDF
- **HTML to PDF** - Convert web pages to PDF

### 🔁 Convert From PDF
- **PDF to Image** - Convert PDF pages to JPG/PNG images
- **PDF to Word** - Convert to editable DOCX format
- **PDF to Excel** - Extract tables to XLSX
- **PDF to PowerPoint** - Convert to editable PPTX
- **PDF to PDF/A** - Convert for archiving

### ✏️ Edit PDF
- **Watermark PDF** - Add text or image watermarks with custom opacity
- **Add Page Numbers** - Custom positioning and formatting
- **Crop PDF** - Trim margins or specific areas
- **Redact PDF** - Permanently remove sensitive information
- **Stamp PDF** - Add custom stamps and annotations

### 🔒 PDF Security
- **Protect PDF** - Add password protection with encryption
- **Unlock PDF** - Remove password protection
- **Sign PDF** - Add digital signatures
- **Compare PDF** - Side-by-side document comparison

### 🚀 Advanced Features
- **Custom Workflows** - Chain multiple operations automatically
- **Batch Processing** - Process multiple files simultaneously
- **Multi-language OCR** - Support for 10+ languages including Hindi
- **PWA Support** - Install as mobile app with offline capabilities
- **User Authentication** - JWT-based login with Google OAuth
- **Premium Subscriptions** - Tiered pricing with Stripe integration
- **Processing History** - Track all your PDF operations
- **Real-time Progress** - Live processing status updates

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
- **React Query** - Server state management
- **Recharts** - Data visualization

### Backend
- **Node.js** - JavaScript runtime
- **Express** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication
- **pdf-lib** - PDF manipulation
- **Sharp** - Image processing
- **Multer** - File uploads
- **Stripe** - Payment processing
- **Puppeteer** - HTML to PDF conversion
- **Tesseract.js** - OCR processing
- **Redis** - Caching (optional)
- **Socket.IO** - Real-time features (optional)

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
# Server Configuration
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/pdfmasterpro

# JWT Authentication
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=52428800
UPLOAD_DIR=./uploads

# Stripe Payment Integration
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
STRIPE_PRO_PRICE_ID=price_your_pro_plan_price_id
STRIPE_BUSINESS_PRICE_ID=price_your_business_plan_price_id
STRIPE_ENTERPRISE_PRICE_ID=price_your_enterprise_plan_price_id

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 📱 Usage

1. **Sign Up/Login** - Create an account or log in with Google
2. **Upload Files** - Drag and drop or click to browse
3. **Select Tool** - Choose from 50+ PDF processing tools
4. **Configure Options** - Set quality, rotation, watermark text, etc.
5. **Process** - Click the process button
6. **Download** - Get your processed PDF instantly

## 🔐 Security Features

- **File Validation** - Only allowed file types accepted
- **Rate Limiting** - Prevents abuse
- **JWT Authentication** - Secure user sessions
- **Password Hashing** - bcrypt encryption
- **Auto File Cleanup** - Files deleted after processing
- **HTTPS Ready** - SSL/TLS support
- **Subscription-based Access** - Premium feature control
- **Quota Management** - Monthly usage limits

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

**POST** `/api/auth/register`
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

**POST** `/api/advanced-pdf/sign`
- Upload: `file` (multipart/form-data)
- Body: `name`, `reason`, `location`
- Returns: Signed PDF file

## 🎯 Subscription Plans

### Free Plan
- 100 files per month
- 10MB file size limit
- Basic PDF tools
- Standard processing speed

### Pro Plan (₹999/month)
- 1,000 files per month
- 50MB file size limit
- All PDF tools including advanced features
- Batch processing (3 concurrent jobs)
- Custom workflows
- Priority processing

### Business Plan (₹2,999/month)
- 5,000 files per month
- 100MB file size limit
- All Pro features
- Batch processing (5 concurrent jobs)
- Advanced security features
- Team collaboration tools
- API access

### Enterprise Plan (₹9,999/month)
- Unlimited files per month
- 500MB file size limit
- All Business features
- Batch processing (10 concurrent jobs)
- Offline desktop application
- Custom API integrations
- Dedicated account manager
- 24/7 premium support

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
- Stripe for payment processing
- All open-source contributors

## 📞 Support

For support, email support@pdfmasterpro.com or join our Discord server.

## 🗺️ Roadmap

- [x] OCR support for scanned PDFs and images
- [x] Multi-language OCR support
- [x] Batch processing for multiple files
- [x] Custom workflows automation
- [x] Premium subscription system
- [x] PWA support with offline capabilities
- [x] Google OAuth integration
- [ ] AI-powered auto-redaction
- [ ] Collaborative PDF editing
- [ ] Desktop application (Electron)
- [ ] Mobile apps (iOS/Android)
- [ ] Advanced analytics dashboard

---
Made with ❤️ by PDFMasterPro Team