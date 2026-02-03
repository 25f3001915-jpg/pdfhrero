import { Link } from 'react-router-dom'
import { FileText, Github, Twitter, Linkedin, Mail } from 'lucide-react'

export default function Footer() {
    const currentYear = new Date().getFullYear()

    const toolCategories = [
        {
            title: 'Organize',
            tools: [
                { name: 'Merge PDF', path: '/merge-pdf' },
                { name: 'Split PDF', path: '/split-pdf' },
                { name: 'Rotate PDF', path: '/rotate-pdf' },
            ]
        },
        {
            title: 'Optimize',
            tools: [
                { name: 'Compress PDF', path: '/compress-pdf' },
            ]
        },
        {
            title: 'Convert',
            tools: [
                { name: 'Image to PDF', path: '/image-to-pdf' },
                { name: 'PDF to Image', path: '/pdf-to-image' },
                { name: 'Word to PDF', path: '/word-to-pdf' },
                { name: 'PDF to Word', path: '/pdf-to-word' },
            ]
        },
        {
            title: 'Security',
            tools: [
                { name: 'Protect PDF', path: '/protect-pdf' },
                { name: 'Unlock PDF', path: '/unlock-pdf' },
                { name: 'Watermark PDF', path: '/watermark-pdf' },
            ]
        }
    ]

    return (
        <footer className="bg-gray-900 text-gray-300">
            <div className="container-custom py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
                    {/* Brand */}
                    <div className="lg:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                                <FileText className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold font-display text-white">
                                PDFMasterPro
                            </span>
                        </Link>
                        <p className="text-sm text-gray-400 mb-4">
                            Professional PDF processing tools. Fast, secure, and easy to use.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="hover:text-primary-400 transition-colors">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Tool Categories */}
                    {toolCategories.map((category) => (
                        <div key={category.title}>
                            <h3 className="text-white font-semibold mb-4">{category.title}</h3>
                            <ul className="space-y-2">
                                {category.tools.map((tool) => (
                                    <li key={tool.path}>
                                        <Link
                                            to={tool.path}
                                            className="text-sm hover:text-primary-400 transition-colors"
                                        >
                                            {tool.name}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
                    <p className="text-sm text-gray-400">
                        © {currentYear} PDFMasterPro. All rights reserved.
                    </p>
                    <div className="flex space-x-6 mt-4 md:mt-0">
                        <Link to="/privacy" className="text-sm hover:text-primary-400 transition-colors">
                            Privacy Policy
                        </Link>
                        <Link to="/terms" className="text-sm hover:text-primary-400 transition-colors">
                            Terms of Service
                        </Link>
                        <Link to="/contact" className="text-sm hover:text-primary-400 transition-colors">
                            Contact
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}
