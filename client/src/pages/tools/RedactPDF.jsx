import { useState, useRef } from 'react'
import { Upload, FileText, Download, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useDropzone } from 'react-dropzone'
import { Document, Page } from 'react-pdf'
import 'react-pdf/dist/esm/Page/AnnotationLayer.css'
import 'react-pdf/dist/esm/Page/TextLayer.css'

export default function RedactPDF() {
    const [file, setFile] = useState(null)
    const [redactions, setRedactions] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [numPages, setNumPages] = useState(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [pdfScale, setPdfScale] = useState(1.0)
    
    const pdfContainerRef = useRef(null)

    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile)
            setRedactions([])
            setError('')
            setCurrentPage(1)
        } else {
            setError('Please select a valid PDF file')
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    })

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages)
    }

    const addRedaction = (page, x, y, width, height) => {
        const newRedaction = {
            id: Date.now(),
            page: page - 1, // 0-based index
            x,
            y,
            width,
            height,
            reason: 'Sensitive Information'
        }
        setRedactions([...redactions, newRedaction])
    }

    const removeRedaction = (id) => {
        setRedactions(redactions.filter(r => r.id !== id))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!file) {
            setError('Please select a PDF file')
            return
        }

        if (redactions.length === 0) {
            setError('Please add at least one redaction area')
            return
        }

        setIsProcessing(true)
        setError('')
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('redactions', JSON.stringify(redactions))

            const token = localStorage.getItem('token')
            const response = await fetch('/api/advanced-pdf/redact', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const blob = await response.blob()
                const url = window.URL.createObjectURL(blob)
                setResult({
                    url,
                    filename: `redacted-${file.name}`
                })
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Failed to redact PDF')
            }
        } catch (err) {
            setError('Failed to process the file. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    const handleMouseDown = (e) => {
        if (!isPreviewMode) {
            const rect = e.currentTarget.getBoundingClientRect()
            const startX = e.clientX - rect.left
            const startY = e.clientY - rect.top
            
            const handleMouseMove = (moveEvent) => {
                const currentX = moveEvent.clientX - rect.left
                const currentY = moveEvent.clientY - rect.top
                const width = Math.abs(currentX - startX)
                const height = Math.abs(currentY - startY)
                const x = Math.min(startX, currentX)
                const y = Math.min(startY, currentY)
                
                // Update temporary selection (you'd implement this visually)
                console.log(`Selection: x=${x}, y=${y}, width=${width}, height=${height}`)
            }
            
            const handleMouseUp = () => {
                document.removeEventListener('mousemove', handleMouseMove)
                document.removeEventListener('mouseup', handleMouseUp)
                // Add the redaction area
                addRedaction(currentPage, startX, startY, 100, 30) // Default size
            }
            
            document.addEventListener('mousemove', handleMouseMove)
            document.addEventListener('mouseup', handleMouseUp)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
            <div className="container-custom">
                <div className="max-w-7xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Redact PDF
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Permanently remove sensitive information from your PDF documents by blacking out selected areas.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Tool Panel */}
                        <div className="lg:col-span-2">
                            <div className="card p-8">
                                <form onSubmit={handleSubmit}>
                                    {/* File Upload */}
                                    <div className="mb-8">
                                        <label className="block text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                            Upload PDF File
                                        </label>
                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
                                                isDragActive
                                                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                                                    : 'border-gray-300 dark:border-dark-border hover:border-primary-500'
                                            }`}
                                        >
                                            <input {...getInputProps()} />
                                            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                            {file ? (
                                                <div className="text-center">
                                                    <p className="font-medium text-gray-900 dark:text-white">
                                                        {file.name}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                                    </p>
                                                </div>
                                            ) : (
                                                <div>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                        {isDragActive
                                                            ? 'Drop your PDF here'
                                                            : 'Drag & drop your PDF file here, or click to browse'}
                                                    </p>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                                        Supports PDF files up to {localStorage.getItem('maxFileSize') ? 
                                                            `${localStorage.getItem('maxFileSize') / (1024*1024)}MB` : '50MB'}
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* PDF Viewer and Redaction Tools */}
                                    {file && (
                                        <div className="mb-8">
                                            <div className="flex justify-between items-center mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                                                    PDF Preview & Redaction
                                                </h3>
                                                <div className="flex items-center gap-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => setIsPreviewMode(!isPreviewMode)}
                                                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-dark-card rounded-lg hover:bg-gray-200 dark:hover:bg-dark-bg transition-colors"
                                                    >
                                                        {isPreviewMode ? (
                                                            <>
                                                                <EyeOff className="w-4 h-4" />
                                                                Edit Mode
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Eye className="w-4 h-4" />
                                                                Preview Mode
                                                            </>
                                                        )}
                                                    </button>
                                                    <div className="flex items-center gap-2">
                                                        <button
                                                            onClick={() => setPdfScale(Math.max(0.5, pdfScale - 0.1))}
                                                            className="px-3 py-1 bg-gray-100 dark:bg-dark-card rounded"
                                                        >
                                                            -
                                                        </button>
                                                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-12 text-center">
                                                            {Math.round(pdfScale * 100)}%
                                                        </span>
                                                        <button
                                                            onClick={() => setPdfScale(Math.min(2.0, pdfScale + 0.1))}
                                                            className="px-3 py-1 bg-gray-100 dark:bg-dark-card rounded"
                                                        >
                                                            +
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden">
                                                <div 
                                                    ref={pdfContainerRef}
                                                    className="relative bg-gray-100 dark:bg-dark-card"
                                                    onMouseDown={handleMouseDown}
                                                >
                                                    <Document
                                                        file={file}
                                                        onLoadSuccess={onDocumentLoadSuccess}
                                                    >
                                                        <Page
                                                            pageNumber={currentPage}
                                                            scale={pdfScale}
                                                            renderTextLayer={false}
                                                            renderAnnotationLayer={false}
                                                        />
                                                    </Document>
                                                </div>

                                                {/* Page Controls */}
                                                {numPages > 1 && (
                                                    <div className="flex justify-between items-center p-4 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border">
                                                        <button
                                                            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                                            disabled={currentPage === 1}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-lg disabled:opacity-50"
                                                        >
                                                            Previous
                                                        </button>
                                                        <span className="text-gray-600 dark:text-gray-400">
                                                            Page {currentPage} of {numPages}
                                                        </span>
                                                        <button
                                                            onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))}
                                                            disabled={currentPage === numPages}
                                                            className="px-4 py-2 bg-gray-100 dark:bg-dark-bg rounded-lg disabled:opacity-50"
                                                        >
                                                            Next
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Redaction List */}
                                            {redactions.length > 0 && (
                                                <div className="mt-4">
                                                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                                                        Redaction Areas ({redactions.length})
                                                    </h4>
                                                    <div className="space-y-2 max-h-40 overflow-y-auto">
                                                        {redactions.map((redaction) => (
                                                            <div key={redaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                                                                        Page {redaction.page + 1}
                                                                    </p>
                                                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                                                        {redaction.reason}
                                                                    </p>
                                                                </div>
                                                                <button
                                                                    type="button"
                                                                    onClick={() => removeRedaction(redaction.id)}
                                                                    className="text-red-500 hover:text-red-700"
                                                                >
                                                                    Remove
                                                                </button>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                                            <div className="flex items-center gap-2">
                                                <AlertCircle className="w-5 h-5 text-red-500" />
                                                <p className="text-red-700 dark:text-red-400">{error}</p>
                                            </div>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <button
                                        type="submit"
                                        disabled={isProcessing || !file || redactions.length === 0}
                                        className="w-full bg-gradient-to-r from-red-600 to-orange-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-red-700 hover:to-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-5 h-5" />
                                                Redact PDF
                                            </>
                                        )}
                                    </button>
                                </form>
                            </div>
                        </div>

                        {/* Preview Panel */}
                        <div className="lg:col-span-1">
                            <div className="card p-6 sticky top-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                    Preview & Result
                                </h3>
                                
                                {result ? (
                                    <div className="text-center">
                                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <CheckCircle className="w-8 h-8 text-green-500" />
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            PDF redacted successfully!
                                        </p>
                                        <a
                                            href={result.url}
                                            download={result.filename}
                                            className="w-full btn-primary flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Redacted PDF
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Your redacted PDF will appear here
                                        </p>
                                    </div>
                                )}

                                {/* Instructions */}
                                <div className="mt-8">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        How to redact:
                                    </h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>Click and drag to select areas to redact</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>Switch to preview mode to see redactions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-red-500 mt-1">•</span>
                                            <span>Redacted content is permanently removed</span>
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}