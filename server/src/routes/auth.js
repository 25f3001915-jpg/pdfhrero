import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const router = express.Router()

// Generate JWT token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '7d'
    })
}

// @route   POST /api/auth/signup
// @desc    Register a new user
// @access  Public
router.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body

        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            })
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password
        })

        // Generate token
        const token = generateToken(user._id)

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body

        // Check for user
        const user = await User.findOne({ email }).select('+password')
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Check password
        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            })
        }

        // Generate token
        const token = generateToken(user._id)

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                isPremium: user.isPremium
            }
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized'
            })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const user = await User.findById(decoded.id).select('-password')

        res.json({
            success: true,
            user
        })
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized'
        })
    }
})

export default router
