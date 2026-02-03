import { Link } from 'react-router-dom'
import { Moon, Sun, Menu, X, FileText } from 'lucide-react'
import { useState } from 'react'

export default function Navbar({ darkMode, toggleDarkMode }) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

    return (
        <nav className="sticky top-0 z-50 glass border-b border-gray-200 dark:border-dark-border">
            <div className="container-custom">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-2 group">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300">
                            <FileText className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-xl font-bold font-display gradient-text hidden sm:block">
                            PDFHero
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-8">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                            Home
                        </Link>
                        <Link to="/#tools" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                            Tools
                        </Link>
                        <Link to="/dashboard" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                            Dashboard
                        </Link>

                        {/* Dark Mode Toggle */}
                        <button
                            onClick={toggleDarkMode}
                            className="p-2 rounded-lg bg-gray-200 dark:bg-dark-card hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors"
                            aria-label="Toggle dark mode"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-700" />
                            )}
                        </button>

                        {/* Auth Buttons */}
                        <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors">
                            Login
                        </Link>
                        <Link to="/signup" className="btn-primary">
                            Sign Up
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className="md:hidden p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-card transition-colors"
                    >
                        {mobileMenuOpen ? (
                            <X className="w-6 h-6" />
                        ) : (
                            <Menu className="w-6 h-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {mobileMenuOpen && (
                    <div className="md:hidden py-4 space-y-4 animate-slide-up">
                        <Link
                            to="/"
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Home
                        </Link>
                        <Link
                            to="/#tools"
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Tools
                        </Link>
                        <Link
                            to="/dashboard"
                            className="block text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 font-medium transition-colors"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Dashboard
                        </Link>
                        <button
                            onClick={toggleDarkMode}
                            className="flex items-center space-x-2 text-gray-700 dark:text-gray-300 font-medium"
                        >
                            {darkMode ? (
                                <>
                                    <Sun className="w-5 h-5" />
                                    <span>Light Mode</span>
                                </>
                            ) : (
                                <>
                                    <Moon className="w-5 h-5" />
                                    <span>Dark Mode</span>
                                </>
                            )}
                        </button>
                        <div className="pt-4 space-y-2">
                            <Link
                                to="/login"
                                className="block w-full text-center btn-outline"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Login
                            </Link>
                            <Link
                                to="/signup"
                                className="block w-full text-center btn-primary"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                Sign Up
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}
