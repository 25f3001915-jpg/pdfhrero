import { useState } from 'react'
import { FileCode, Download, ArrowRight, Link as LinkIcon } from 'lucide-react'
import toast from 'react-hot-toast'

export default function HtmlToPDF() {
    const [url, setUrl] = useState('')
    const [processing, setProcessing] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState(null)

    const handleConvert = async () => {
        if (!url) {
            toast.error('Please enter a valid URL')
            return
        }

        setProcessing(true)
        try {
            const response = await fetch('/api/pdf/html-to-pdf', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Conversion failed')
            }

            const blob = await response.blob()
            const downloadUrl = window.URL.createObjectURL(blob)
            setDownloadUrl(downloadUrl)
            toast.success('Webpage converted successfully!')
        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Failed to convert webpage.')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <FileCode className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">HTML to PDF</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Convert any webpage to PDF by simply entering the URL.
                    </p>
                </div>

                <div className="card p-8 mb-8 max-w-2xl mx-auto">
                    <div className="flex items-center space-x-4">
                        <div className="relative flex-grow">
                            <LinkIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="url"
                                value={url}
                                onChange={(e) => setUrl(e.target.value)}
                                placeholder="https://example.com"
                                className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 bg-white dark:bg-dark-card text-gray-900 dark:text-white"
                            />
                        </div>
                        <button
                            onClick={handleConvert}
                            disabled={processing}
                            className="btn-primary whitespace-nowrap"
                        >
                            {processing ? 'Converting...' : 'Convert'}
                        </button>
                    </div>
                </div>

                {downloadUrl && (
                    <div className="card p-8 text-center animate-slide-up max-w-2xl mx-auto">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Conversion Complete!
                        </h3>
                        <a
                            href={downloadUrl}
                            download="webpage.pdf"
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download PDF</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
