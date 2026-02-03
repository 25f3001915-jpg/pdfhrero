# PDFMasterPro Backend API

Enterprise-grade PDF processing platform backend built with Node.js, Express, and MongoDB.

## Features

### Core PDF Processing
- **Merge PDFs**: Combine multiple PDF files into one
- **Split PDFs**: Break PDFs into individual pages or ranges
- **Compress PDFs**: Reduce file size with advanced algorithms
- **Add Watermarks**: Text or image watermarks with customization
- **OCR Processing**: Multi-language OCR with accuracy tracking
- **Convert to Images**: Export PDF pages as high-quality images
- **PDF Validation**: Check PDF integrity and metadata

### User Management
- **Authentication**: JWT-based authentication with secure cookies
- **Google OAuth**: Social login integration
- **Role-based Access**: Free, Pro, Business, Enterprise tiers
- **Email Verification**: Secure email verification system
- **Password Reset**: Secure password recovery flow

### Subscription System
- **Stripe Integration**: Complete payment processing
- **Tier-based Features**: Different capabilities per subscription level
- **Usage Tracking**: Monitor file processing and storage usage
- **Quota Management**: Monthly limits based on subscription tier
- **Webhook Handling**: Automatic subscription status updates

### Workflow Automation
- **Custom Workflows**: Create multi-step processing pipelines
- **Workflow Execution**: Chain multiple operations together
- **Public Workflows**: Share useful workflows with community
- **Usage Analytics**: Track workflow performance and popularity

### Advanced Features
- **Real-time Processing**: Socket.io for progress updates
- **Batch Processing**: Handle multiple files simultaneously
- **Rate Limiting**: Tier-based API rate limits
- **Comprehensive Logging**: Winston logging with file rotation
- **Error Handling**: Detailed error responses with proper HTTP codes
- **Security**: Helmet, CORS, input sanitization, XSS protection

## Tech Stack

- **Runtime**: Node.js 20+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT, Google OAuth 2.0
- **Payment Processing**: Stripe
- **PDF Processing**: pdf-lib, Tesseract.js, Puppeteer
- **Image Processing**: Sharp
- **File Handling**: Multer, Archiver
- **Real-time**: Socket.io
- **Caching**: Redis (optional)
- **Logging**: Winston
- **Validation**: express-validator
- **Security**: Helmet, CORS, express-mongo-sanitize, xss-clean

## Prerequisites

- Node.js 20+ installed
- MongoDB database (local or Atlas)
- Stripe account for payment processing
- Google OAuth credentials (optional)
- Redis server (optional, for caching)

## Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd pdfmasterpro/server
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create environment file:**
```bash
cp .env.example .env
```

4. **Configure environment variables:**
Edit the `.env` file with your actual configuration:
- MongoDB connection string
- JWT secret key
- Stripe API keys
- Google OAuth credentials
- Email configuration

5. **Start MongoDB:**
```bash
# Local MongoDB
mongod

# Or use MongoDB Atlas (configure in .env)
```

6. **Run the application:**
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NODE_ENV` | Environment (development/production) | Yes |
| `PORT` | Server port | Yes |
| `MONGODB_URI` | MongoDB connection string | Yes |
| `JWT_SECRET` | JWT signing secret | Yes |
| `STRIPE_SECRET_KEY` | Stripe secret key | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No |
| `CLIENT_URL` | Frontend URL for CORS | Yes |

See `.env.example` for complete configuration options.

## API Documentation

### Authentication

```javascript
// Register
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}

// Login
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}

// Google Login
POST /api/auth/google
{
  "idToken": "google_id_token"
}
```

### PDF Processing

```javascript
// Merge PDFs
POST /api/pdf/merge
// multipart/form-data with multiple PDF files

// Split PDF
POST /api/pdf/split
// multipart/form-data with one PDF file

// Compress PDF
POST /api/pdf/compress
// multipart/form-data with one PDF file

// Add Watermark
POST /api/pdf/watermark
// multipart/form-data with PDF and optional image file

// OCR Processing
POST /api/pdf/ocr
// multipart/form-data with one PDF file
```

### Subscription Management

```javascript
// Get plans
GET /api/subscription/plans

// Create subscription
POST /api/subscription/create
{
  "plan": "pro",
  "paymentMethodId": "pm_card_visa"
}

// Get current subscription
GET /api/subscription
```

### Workflow Management

```javascript
// Create workflow
POST /api/workflow
{
  "name": "Document Processing",
  "description": "Process documents with compression and OCR",
  "steps": [
    {
      "operation": "compress",
      "parameters": { "quality": "medium" },
      "order": 1
    },
    {
      "operation": "ocr",
      "parameters": { "languages": ["eng"] },
      "order": 2
    }
  ]
}

// Execute workflow
POST /api/workflow/:id/execute
// multipart/form-data with files
```

## Database Models

### User Model
- User authentication and profile information
- Subscription tier and status
- Usage tracking and quota management
- Processing history and saved workflows
- Feature access control

### Subscription Model
- Stripe integration details
- Payment and billing information
- Tier-based limits and features
- Usage statistics and analytics

### Workflow Model
- Multi-step processing pipelines
- Execution tracking and statistics
- Community sharing features
- Performance optimization

### Processing History Model
- Detailed processing logs
- Performance metrics
- Error tracking and resolution
- Usage analytics

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevent abuse with tier-based limits
- **Input Validation**: Comprehensive data validation
- **File Validation**: Secure file upload handling
- **CORS Protection**: Controlled cross-origin requests
- **Helmet Security**: HTTP security headers
- **XSS Protection**: Cross-site scripting prevention
- **MongoDB Sanitization**: NoSQL injection prevention

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Production Checklist

1. **Environment Configuration**
   - Set `NODE_ENV=production`
   - Use strong JWT secret
   - Configure production database
   - Set up proper logging

2. **Security**
   - HTTPS only
   - Secure CORS configuration
   - Rate limiting enabled
   - Input validation enforced

3. **Performance**
   - Enable compression
   - Use Redis for caching
   - Optimize database indexes
   - Implement proper error handling

4. **Monitoring**
   - Set up logging
   - Monitor resource usage
   - Track error rates
   - Set up alerts

### Deployment Platforms

**Heroku:**
```bash
heroku create pdfmasterpro-api
git push heroku main
heroku config:set NODE_ENV=production
```

**Render:**
- Connect GitHub repository
- Set environment variables
- Deploy automatically on push

**AWS EC2:**
- Launch EC2 instance
- Install Node.js and MongoDB
- Deploy application
- Set up reverse proxy (Nginx)

## Folder Structure

```
src/
├── controllers/          # Request handlers
│   ├── authController.js
│   ├── pdfController.js
│   ├── workflowController.js
│   ├── subscriptionController.js
│   ├── userController.js
│   └── adminController.js
├── middleware/           # Custom middleware
│   ├── auth.js
│   └── errorHandler.js
├── models/              # Database models
│   ├── User.js
│   ├── Workflow.js
│   ├── ProcessingHistory.js
│   └── Subscription.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── pdfRoutes.js
│   ├── workflowRoutes.js
│   ├── subscriptionRoutes.js
│   ├── userRoutes.js
│   └── adminRoutes.js
├── services/            # Business logic
│   └── pdfService.js
├── utils/               # Utility functions
│   └── logger.js
├── app.js              # Express application
└── server.js           # Server entry point
```

## Error Handling

The API provides consistent error responses:

```json
{
  "status": "error",
  "message": "Descriptive error message",
  "stack": "Error stack trace (development only)"
}
```

Common HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `429`: Too Many Requests
- `500`: Internal Server Error

## Rate Limiting

API rate limits vary by subscription tier:
- **Free**: 100 requests per 15 minutes
- **Pro**: 500 requests per 15 minutes
- **Business**: 1000 requests per 15 minutes
- **Enterprise**: 5000 requests per 15 minutes

## Support

For issues and questions:
1. Check the documentation
2. Review error logs
3. Contact support team

## License

MIT License - see LICENSE file for details.