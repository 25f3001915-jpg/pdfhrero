import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import rateLimit from 'express-rate-limit'
import path from 'path'
import { fileURLToPath } from 'url'

// Import routes
import authRoutes from './routes/authRoutes.js'
import pdfRoutes from './routes/pdf.js'
import imageRoutes from './routes/image.js'
import userRoutes from './routes/user.js'
import subscriptionRoutes from './routes/subscriptionRoutes.js'
import advancedPdfRoutes from './routes/advancedPdfRoutes.js'
import workflowRoutes from './routes/workflowRoutes.js'

// Load environment variables
dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true
}))

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parser middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Database connection (optional for development)
if (process.env.MONGODB_URI) {
    mongoose.connect(process.env.MONGODB_URI)
        .then(() => console.log('✅ MongoDB connected successfully'))
        .catch((err) => {
            console.warn('⚠️  MongoDB connection failed:', err.message)
            console.warn('⚠️  Running without database - auth features will be limited')
        })
} else {
    console.warn('⚠️  MONGODB_URI not set - running without database')
}

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/pdf', pdfRoutes)
app.use('/api/image', imageRoutes)
app.use('/api/user', userRoutes)
app.use('/api/subscription', subscriptionRoutes)
app.use('/api/advanced-pdf', advancedPdfRoutes)
app.use('/api/workflow', workflowRoutes)

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'PDFMasterPro API is running',
        timestamp: new Date().toISOString()
    })
})

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../../client/dist')))

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, '../../client/dist/index.html'))
    })
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    })
})

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    })
})

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`)
    console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`)
})

export default app
