
import { useState } from 'react'
import { RefreshCw, ArrowRight, Download } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'

export default function ConvertImage() {
    const [file, setFile] = useState(null)
    const [format, setFormat] = useState('jpg')
    const [processing, setProcessing] = useState(false)
    const [processedFile, setProcessedFile] = useState(null)

    const handleFileSelected = (files) => {
        setFile(files[0])
        setProcessedFile(null)
    }

    const handleConvert = async () => {
        if (!file) return

        setProcessing(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('format', format)

            const response = await fetch('/api/image/convert', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || errorData.error || 'Conversion failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            setProcessedFile(url)
            toast.success('Image converted successfully!')
        } catch (error) {
            toast.error('Failed to convert image')
            console.error(error)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <RefreshCw className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">Convert Image</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Convert images between formats easily. Supports JPG, PNG, WEBP, GIF, and TIFF.
                    </p>
                </div>

                <div className="card p-8 mb-8">
                    <FileUploader
                        onFilesSelected={handleFileSelected}
                        acceptedFileTypes={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.tiff', '.gif']
                        }}
                        maxFiles={1}
                        multiple={false}
                    />
                </div>

                {file && !processedFile && (
                    <div className="card p-8 mb-8">
                        <div className="max-w-md mx-auto">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Convert to:
                            </label>
                            <select
                                value={format}
                                onChange={(e) => setFormat(e.target.value)}
                                className="w-full p-3 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 text-lg"
                            >
                                <option value="jpg">JPG / JPEG</option>
                                <option value="png">PNG (Transparent)</option>
                                <option value="webp">WebP (High Efficiency)</option>
                                <option value="tiff">TIFF (High Quality)</option>
                                <option value="gif">GIF</option>
                            </select>
                        </div>

                        <div className="mt-8 text-center">
                            <button
                                onClick={handleConvert}
                                disabled={processing}
                                className="btn-primary inline-flex items-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="spinner w-5 h-5 border-2"></div>
                                        <span>Converting...</span>
                                    </>
                                ) : (
                                    <>
                                        <RefreshCw className="w-5 h-5" />
                                        <span>Convert Now</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {processedFile && (
                    <div className="card p-8 text-center animate-slide-up">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Ready to Download!
                        </h3>
                        <a
                            href={processedFile}
                            download={`converted-image.${format}`}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download {format.toUpperCase()}</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
