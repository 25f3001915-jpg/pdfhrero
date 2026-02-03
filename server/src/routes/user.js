import express from 'express'
import { protect } from '../middleware/auth.js'
import User from '../models/User.js'

const router = express.Router()

// @route   GET /api/user/profile
// @desc    Get user profile with recent activity
// @access  Private
router.get('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select('-password')

        // Format recent activity
        const recentFiles = user.recentActivity.slice(0, 10).map(activity => ({
            name: activity.fileName,
            operation: activity.operation,
            date: activity.timestamp
        }))

        res.json({
            success: true,
            user: {
                name: user.name,
                email: user.email,
                isPremium: user.isPremium,
                filesProcessed: user.filesProcessed,
                createdAt: user.createdAt
            },
            recentFiles
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })
    }
})

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const { name, email } = req.body

        const user = await User.findById(req.user._id)

        if (name) user.name = name
        if (email) user.email = email

        await user.save()

        res.json({
            success: true,
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

export default router
