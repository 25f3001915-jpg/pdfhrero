import { useState } from 'react'
import { Upload, FileText, Download, AlertCircle, CheckCircle } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function SignPDF() {
    const [file, setFile] = useState(null)
    const [signatureName, setSignatureName] = useState('')
    const [signatureReason, setSignatureReason] = useState('')
    const [signatureLocation, setSignatureLocation] = useState('')
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')

    const onDrop = (acceptedFiles) => {
        const selectedFile = acceptedFiles[0]
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile)
            setError('')
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

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (!file) {
            setError('Please select a PDF file')
            return
        }

        if (!signatureName.trim()) {
            setError('Please enter your name for the signature')
            return
        }

        setIsProcessing(true)
        setError('')
        setResult(null)

        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('name', signatureName)
            formData.append('reason', signatureReason)
            formData.append('location', signatureLocation)

            const token = localStorage.getItem('token')
            const response = await fetch('/api/advanced-pdf/sign', {
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
                    filename: `signed-${file.name}`
                })
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Failed to sign PDF')
            }
        } catch (err) {
            setError('Failed to process the file. Please try again.')
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Sign PDF
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Add digital signatures to your PDF documents with customizable name, reason, and location.
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

                                    {/* Signature Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Signature Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={signatureName}
                                                onChange={(e) => setSignatureName(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-card dark:text-white"
                                                placeholder="Enter your full name"
                                                required
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Reason (Optional)
                                            </label>
                                            <input
                                                type="text"
                                                value={signatureReason}
                                                onChange={(e) => setSignatureReason(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-card dark:text-white"
                                                placeholder="e.g., Document Approval"
                                            />
                                        </div>
                                    </div>

                                    <div className="mb-8">
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            Location (Optional)
                                        </label>
                                        <input
                                            type="text"
                                            value={signatureLocation}
                                            onChange={(e) => setSignatureLocation(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-card dark:text-white"
                                            placeholder="e.g., Mumbai, India"
                                        />
                                    </div>

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
                                        disabled={isProcessing || !file}
                                        className="w-full bg-gradient-to-r from-primary-600 to-secondary-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-primary-700 hover:to-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FileText className="w-5 h-5" />
                                                Sign PDF
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
                                            PDF signed successfully!
                                        </p>
                                        <a
                                            href={result.url}
                                            download={result.filename}
                                            className="w-full btn-primary flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" />
                                            Download Signed PDF
                                        </a>
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileText className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Your signed PDF will appear here
                                        </p>
                                    </div>
                                )}

                                {/* How it works */}
                                <div className="mt-8">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        How it works:
                                    </h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Add your name as the signature</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Include reason and location (optional)</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-green-500 mt-1">•</span>
                                            <span>Signature appears on last page of PDF</span>
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