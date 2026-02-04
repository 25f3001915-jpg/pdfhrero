import { motion } from 'framer-motion'
import {
    Merge, Split, Minimize, Image, RotateCw, Droplet,
    Lock, Unlock, FileText, FileImage, FileSpreadsheet,
    FilePlus, Scissors, Trash2, FileOutput, RefreshCw
} from 'lucide-react'
import ToolCard from '../components/ToolCard'

export default function Home() {
    const tools = [
        // Organize PDF
        {
            id: 'ocr',
            title: 'OCR PDF',
            description: 'Convert scanned documents and images into editable text.',
            icon: 'Scan',
            color: 'from-blue-500 to-cyan-500',
            link: '/ocr'
        },
        {
            id: 'organize',
            title: 'Organize PDF',
            description: 'Sort pages of your PDF file however you like.',
            icon: 'Layers',
            color: 'from-indigo-500 to-purple-500',
            link: '/organize'
        },
        {
            id: 'page-numbers',
            title: 'Page Numbers',
            description: 'Add page numbers into PDFs with ease.',
            icon: 'Hash',
            color: 'from-pink-500 to-rose-500',
            link: '/page-numbers'
        },
        {
            icon: Merge,
            title: 'Merge PDF',
            description: 'Combine multiple PDFs into one document',
            path: '/merge-pdf',
            color: 'primary',
            category: 'organize'
        },
        {
            icon: Split,
            title: 'Split PDF',
            description: 'Split PDF into multiple files',
            path: '/split-pdf',
            color: 'secondary',
            category: 'organize'
        },
        {
            icon: RotateCw,
            title: 'Rotate PDF',
            description: 'Rotate PDF pages to any angle',
            path: '/rotate-pdf',
            color: 'info',
            category: 'organize'
        },

        // Optimize PDF
        {
            icon: Minimize,
            title: 'Compress PDF',
            description: 'Reduce PDF file size while maintaining quality',
            path: '/compress-pdf',
            color: 'success',
            category: 'optimize'
        },

        // Convert to PDF
        {
            icon: Image,
            title: 'Image to PDF',
            description: 'Convert JPG, PNG images to PDF',
            path: '/image-to-pdf',
            color: 'warning',
            category: 'convert-to'
        },
        {
            icon: FileText,
            title: 'Word to PDF',
            description: 'Convert Word documents to PDF',
            path: '/word-to-pdf',
            color: 'info',
            category: 'convert-to'
        },

        // Convert from PDF
        {
            icon: FileImage,
            title: 'PDF to Image',
            description: 'Convert PDF pages to images',
            path: '/pdf-to-image',
            color: 'danger',
            category: 'convert-from'
        },
        {
            icon: FileText,
            title: 'PDF to Word',
            description: 'Convert PDF to editable Word document',
            path: '/pdf-to-word',
            color: 'primary',
            category: 'convert-from'
        },

        // Edit PDF
        {
            icon: Droplet,
            title: 'Watermark PDF',
            description: 'Add text or image watermarks to PDF',
            path: '/watermark-pdf',
            color: 'secondary',
            category: 'edit'
        },

        // Security
        {
            icon: Lock,
            title: 'Protect PDF',
            description: 'Add password protection to PDF',
            path: '/protect-pdf',
            color: 'danger',
            category: 'security'
        },
        {
            icon: Unlock,
            title: 'Unlock PDF',
            description: 'Remove password from PDF',
            path: '/unlock-pdf',
            color: 'success',
            category: 'security'
        },
        {
            icon: Minimize,
            title: 'Compress Image',
            description: 'Reduce image size with quality control',
            path: '/compress-image',
            color: 'success',
            category: 'image-tools'
        },
        {
            icon: RefreshCw,
            title: 'Convert Image',
            description: 'Convert between JPG, PNG, WEBP formats',
            path: '/convert-image',
            color: 'warning',
            category: 'image-tools'
        },
    ]

    const categories = [
        { id: 'organize', name: 'Organize PDF', icon: FilePlus },
        { id: 'optimize', name: 'Optimize PDF', icon: Minimize },
        { id: 'image-tools', name: 'Image Tools', icon: Image },
        { id: 'convert-to', name: 'Convert to PDF', icon: FileOutput },
        { id: 'convert-from', name: 'Convert from PDF', icon: FileImage },
        { id: 'edit', name: 'Edit PDF', icon: FileText },
        { id: 'security', name: 'PDF Security', icon: Lock },
    ]

    return (
        <div>
            {/* Hero Section */}
            <section className="hero-gradient text-white section-padding">
                <div className="container-custom">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-4xl mx-auto"
                    >
                        <h1 className="mb-6 animate-fade-in">
                            Professional PDF Tools
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-slide-up">
                            Merge, split, compress, convert, and edit your PDFs with ease.
                            Fast, secure, and completely free.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up">
                            <a href="#tools" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                                Get Started Free
                            </a>
                            <a href="#features" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
                                Learn More
                            </a>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="section-padding bg-white dark:bg-dark-bg">
                <div className="container-custom">
                    <div className="text-center mb-12">
                        <h2 className="mb-4 gradient-text">Why Choose PDFMasterPro?</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Professional-grade PDF tools with enterprise security and lightning-fast processing
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="card p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">100% Secure</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Your files are encrypted and automatically deleted after processing
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="card p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <FileText className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">30+ PDF Tools</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Complete suite of tools for all your PDF processing needs
                            </p>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            className="card p-8 text-center"
                        >
                            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Minimize className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-semibold mb-3">Lightning Fast</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Process your PDFs in seconds with our optimized algorithms
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Tools Section */}
            <section id="tools" className="section-padding bg-gray-50 dark:bg-dark-card">
                <div className="container-custom">
                    {categories.map((category) => {
                        const categoryTools = tools.filter(tool => tool.category === category.id)
                        if (categoryTools.length === 0) return null

                        return (
                            <div key={category.id} className="mb-16 last:mb-0">
                                <div className="flex items-center space-x-3 mb-8">
                                    <category.icon className="w-8 h-8 text-primary-600" />
                                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
                                        {category.name}
                                    </h2>
                                </div>
                                <div className="tool-grid">
                                    {categoryTools.map((tool, index) => (
                                        <motion.div
                                            key={tool.path}
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.5, delay: index * 0.1 }}
                                            viewport={{ once: true }}
                                        >
                                            <ToolCard {...tool} />
                                        </motion.div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </section>

            {/* CTA Section */}
            <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
                <div className="container-custom text-center">
                    <h2 className="mb-6">Ready to Get Started?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of users who trust PDFMasterPro for their PDF processing needs
                    </p>
                    <a href="#tools" className="btn-primary bg-white text-primary-600 hover:bg-gray-100">
                        Start Processing PDFs
                    </a>
                </div>
            </section>
        </div>
    )
}
