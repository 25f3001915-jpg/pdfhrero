import { motion } from 'framer-motion'
import {
    Merge, Split, Minimize, Image, RotateCw, Droplet,
    Lock, Unlock, FileText, FileImage, FileSpreadsheet,
    FilePlus, Scissors, Trash2, FileOutput, RefreshCw,
    ScanSearch, Layers, Hash, FileSignature, EyeOff,
    FileDiff, Wrench, Globe, PenTool, Monitor, Briefcase,
    FileArchive, Camera, ScanText, Crop, Layout, PenLine
} from 'lucide-react'
import ToolCard from '../components/ToolCard'

export default function Home() {
    const tools = [
        // Row 1
        {
            icon: Merge,
            title: 'Merge PDF',
            description: 'Combine PDFs in the order you want with the easiest PDF merger available.',
            path: '/merge-pdf',
            color: 'danger'
        },
        {
            icon: Split,
            title: 'Split PDF',
            description: 'Separate one page or a whole set for easy conversion into independent PDF files.',
            path: '/split-pdf',
            color: 'danger'
        },
        {
            icon: Minimize,
            title: 'Compress PDF',
            description: 'Reduce file size while optimizing for maximal PDF quality.',
            path: '/compress-pdf',
            color: 'danger'
        },
        {
            icon: FileText,
            title: 'PDF to Word',
            description: 'Easily convert your PDF files into easy to edit DOC and DOCX documents.',
            path: '/pdf-to-word',
            color: 'primary'
        },
        {
            icon: Monitor,
            title: 'PDF to PowerPoint',
            description: 'Turn your PDF files into easy to edit PPT and PPTX slideshows.',
            path: '/pdf-to-powerpoint',
            color: 'danger'
        },

        // Row 2
        {
            icon: FileSpreadsheet,
            title: 'PDF to Excel',
            description: 'Pull data straight from PDFs into Excel spreadsheets in a few short seconds.',
            path: '/pdf-to-excel',
            color: 'success'
        },
        {
            icon: FileText,
            title: 'Word to PDF',
            description: 'Make DOC and DOCX files easy to read by converting them to PDF.',
            path: '/word-to-pdf',
            color: 'primary'
        },
        {
            icon: Monitor,
            title: 'PowerPoint to PDF',
            description: 'Make PPT and PPTX slideshows easy to view by converting them to PDF.',
            path: '/powerpoint-to-pdf',
            color: 'danger'
        },
        {
            icon: FileSpreadsheet,
            title: 'Excel to PDF',
            description: 'Make EXCEL spreadsheets easy to read by converting them to PDF.',
            path: '/excel-to-pdf',
            color: 'success'
        },
        {
            icon: PenTool,
            title: 'Edit PDF',
            description: 'Add text, images, shapes or freehand annotations to a PDF document.',
            path: '/edit-pdf',
            color: 'warning'
        },

        // Row 3
        {
            icon: FileImage,
            title: 'PDF to JPG',
            description: 'Convert each PDF page into a JPG or extract all images contained in a PDF.',
            path: '/pdf-to-image',
            color: 'warning'
        },
        {
            icon: Image,
            title: 'JPG to PDF',
            description: 'Convert JPG images to PDF in seconds. Easily adjust orientation and margins.',
            path: '/image-to-pdf',
            color: 'warning'
        },
        {
            icon: PenLine,
            title: 'Sign PDF',
            description: 'Sign yourself or request electronic signatures from others.',
            path: '/sign-pdf',
            color: 'danger'
        },
        {
            icon: Droplet,
            title: 'Watermark',
            description: 'Stamp an image or text over your PDF in seconds.',
            path: '/watermark-pdf',
            color: 'danger'
        },
        {
            icon: RotateCw,
            title: 'Rotate PDF',
            description: 'Rotate your PDFs the way you need them. You can even rotate multiple PDFs at once!',
            path: '/rotate-pdf',
            color: 'info'
        },

        // Row 4
        {
            icon: Globe,
            title: 'HTML to PDF',
            description: 'Convert webpages in HTML to PDF. Copy and paste the URL of the page you want.',
            path: '/html-to-pdf',
            color: 'info'
        },
        {
            icon: Unlock,
            title: 'Unlock PDF',
            description: 'Remove PDF password security, giving you the freedom to use your PDFs as you want.',
            path: '/unlock-pdf',
            color: 'secondary'
        },
        {
            icon: Lock,
            title: 'Protect PDF',
            description: 'Protect PDF files with a password. Encrypt PDF documents to prevent unauthorized access.',
            path: '/protect-pdf',
            color: 'secondary'
        },
        {
            icon: Layout,
            title: 'Organize PDF',
            description: 'Sort pages of your PDF file however you like. Delete PDF pages or add PDF pages.',
            path: '/organize',
            color: 'danger'
        },
        {
            icon: FileArchive,
            title: 'PDF to PDF/A',
            description: 'Transform your PDF to PDF/A, the ISO-standardized version of PDF for long-term archiving.',
            path: '/pdf-to-pdfa',
            color: 'danger'
        },

        // Row 5
        {
            icon: Wrench,
            title: 'Repair PDF',
            description: 'Repair a damaged PDF and recover data from corrupt PDF.',
            path: '/repair-pdf',
            color: 'danger'
        },
        {
            icon: Hash,
            title: 'Page Numbers',
            description: 'Add page numbers into PDFs with ease. Choose your positions, dimensions, typography.',
            path: '/page-numbers',
            color: 'danger'
        },
        {
            icon: Camera,
            title: 'Scan to PDF',
            description: 'Capture document scans from your mobile device and send them instantly to your browser.',
            path: '/scan-pdf',
            color: 'danger'
        },
        {
            icon: ScanText,
            title: 'OCR PDF',
            description: 'Easily convert scanned PDF into searchable and selectable documents.',
            path: '/ocr',
            color: 'danger'
        },
        {
            icon: FileDiff,
            title: 'Compare PDF',
            description: 'Show a side-by-side document comparison and easily spot changes.',
            path: '/compare-pdf',
            color: 'danger'
        },

        // Row 6
        {
            icon: EyeOff,
            title: 'Redact PDF',
            description: 'Permanently remove sensitive information from a PDF.',
            path: '/redact-pdf',
            color: 'secondary'
        },
        {
            icon: Crop,
            title: 'Crop PDF',
            description: 'Crop margins of PDF documents or select specific areas.',
            path: '/crop-pdf',
            color: 'danger'
        }
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
                        <h1 className="mb-6 animate-fade-in font-display font-bold text-4xl md:text-6xl">
                            Every tool you need to work with PDFs in one place
                        </h1>
                        <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-slide-up opacity-90">
                            Every tool you need to use PDFs, at your fingertips. All are 100% FREE and easy to use! Merge, split, compress, convert, rotate, unlock and watermark PDFs with just a few clicks.
                        </p>
                    </motion.div>
                </div>
            </section>

            {/* Tools Grid Section */}
            <section id="tools" className="section-padding bg-gray-50 dark:bg-dark-bg -mt-10 pt-10">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                        {tools.map((tool, index) => (
                            <motion.div
                                key={tool.path}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                                viewport={{ once: true }}
                            >
                                <ToolCard {...tool} />
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Info Section */}
            <section id="features" className="section-padding bg-white dark:bg-dark-card mt-12">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="mb-4 gradient-text text-3xl font-bold">The PDFHero Soluton</h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            We make PDF tasks easy so you can get your work done faster.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Lock className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Security First</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                We don't store your files. All documents are automatically deleted from our servers after processing.
                            </p>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                            <div className="w-16 h-16 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Globe className="w-8 h-8 text-red-600 dark:text-red-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Work Anywhere</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                PDFHero works on any device and browser. No software installation required.
                            </p>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.05 }} className="text-center">
                            <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Props className="w-8 h-8 text-green-600 dark:text-green-400" />
                            </div>
                            <h3 className="text-xl font-bold mb-3 dark:text-white">Premium Quality</h3>
                            <p className="text-gray-600 dark:text-gray-400">
                                Maintain the highest quality of your documents while reducing file size and converting formats.
                            </p>
                        </motion.div>
                    </div>
                </div>
            </section>
        </div>
    )
}

function Props(props) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 2v20" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
    )
}
