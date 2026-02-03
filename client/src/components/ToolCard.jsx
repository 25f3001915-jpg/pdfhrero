import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'

export default function ToolCard({ icon: Icon, title, description, path, color = 'primary' }) {
    const colorClasses = {
        primary: 'from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700',
        secondary: 'from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700',
        success: 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700',
        warning: 'from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700',
        danger: 'from-red-500 to-red-600 hover:from-red-600 hover:to-red-700',
        info: 'from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700',
    }

    return (
        <Link to={path}>
            <motion.div
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.98 }}
                className="card card-hover p-6 h-full"
            >
                <div className={`w-14 h-14 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                    <Icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                    {title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {description}
                </p>
            </motion.div>
        </Link>
    )
}
