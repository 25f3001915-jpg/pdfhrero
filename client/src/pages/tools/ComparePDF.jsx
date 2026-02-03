import { useState } from 'react'
import { Upload, FileText, Download, AlertCircle, CheckCircle, FileDiff } from 'lucide-react'
import { useDropzone } from 'react-dropzone'

export default function ComparePDF() {
    const [files, setFiles] = useState([])
    const [isProcessing, setIsProcessing] = useState(false)
    const [result, setResult] = useState(null)
    const [error, setError] = useState('')
    const [comparisonResult, setComparisonResult] = useState(null)

    const onDrop = (acceptedFiles) => {
        const validFiles = acceptedFiles.filter(file => file.type === 'application/pdf')
        
        if (validFiles.length + files.length > 2) {
            setError('You can only compare 2 PDF files')
            return
        }

        if (validFiles.length > 0) {
            setFiles([...files, ...validFiles])
            setError('')
        } else {
            setError('Please select valid PDF files')
        }
    }

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 2
    })

    const removeFile = (index) => {
        setFiles(files.filter((_, i) => i !== index))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        
        if (files.length !== 2) {
            setError('Please select exactly 2 PDF files to compare')
            return
        }

        setIsProcessing(true)
        setError('')
        setResult(null)
        setComparisonResult(null)

        try {
            const formData = new FormData()
            files.forEach((file, index) => {
                formData.append('files', file)
            })

            const token = localStorage.getItem('token')
            const response = await fetch('/api/advanced-pdf/compare', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            })

            if (response.ok) {
                const data = await response.json()
                setComparisonResult(data.result)
                
                if (data.result.areIdentical) {
                    setResult({
                        message: 'The PDF files are identical',
                        type: 'identical'
                    })
                } else {
                    setResult({
                        message: 'Differences found between the PDF files',
                        type: 'different'
                    })
                }
            } else {
                const errorData = await response.json()
                setError(errorData.message || 'Failed to compare PDFs')
            }
        } catch (err) {
            setError('Failed to process the files. Please try again.')
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
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileDiff className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                            Compare PDFs
                        </h1>
                        <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Compare two PDF files side by side to identify differences in content, formatting, and structure.
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
                                            Upload PDF Files to Compare (2 files required)
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
                                            <div>
                                                <p className="text-gray-600 dark:text-gray-400 mb-2">
                                                    {isDragActive
                                                        ? 'Drop your PDF files here'
                                                        : 'Drag & drop 2 PDF files here, or click to browse'}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    Supports PDF files up to {localStorage.getItem('maxFileSize') ? 
                                                        `${localStorage.getItem('maxFileSize') / (1024*1024)}MB` : '50MB'} each
                                                </p>
                                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                    {files.length}/2 files selected
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Selected Files */}
                                    {files.length > 0 && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Selected Files
                                            </h3>
                                            <div className="space-y-3">
                                                {files.map((file, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-bg rounded-lg">
                                                        <div className="flex items-center space-x-4">
                                                            <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                                                <FileText className="w-5 h-5 text-primary-600" />
                                                            </div>
                                                            <div>
                                                                <p className="font-medium text-gray-900 dark:text-white">
                                                                    {file.name}
                                                                </p>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            className="text-red-500 hover:text-red-700 p-2"
                                                        >
                                                            Remove
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Comparison Results */}
                                    {comparisonResult && (
                                        <div className="mb-8">
                                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                                                Comparison Results
                                            </h3>
                                            <div className={`p-4 rounded-lg ${
                                                comparisonResult.areIdentical 
                                                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                                                    : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                                            }`}>
                                                <div className="flex items-center gap-2 mb-3">
                                                    {comparisonResult.areIdentical ? (
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                    ) : (
                                                        <AlertCircle className="w-5 h-5 text-yellow-500" />
                                                    )}
                                                    <span className={`font-medium ${
                                                        comparisonResult.areIdentical 
                                                            ? 'text-green-700 dark:text-green-400' 
                                                            : 'text-yellow-700 dark:text-yellow-400'
                                                    }`}>
                                                        {comparisonResult.areIdentical 
                                                            ? 'Files are identical' 
                                                            : 'Differences detected'}
                                                    </span>
                                                </div>
                                                
                                                {comparisonResult.differences.length > 0 && (
                                                    <div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                                            Differences found:
                                                        </p>
                                                        <ul className="text-sm space-y-1">
                                                            {comparisonResult.differences.map((diff, index) => (
                                                                <li key={index} className="flex items-start gap-2">
                                                                    <span className="text-red-500 mt-1">•</span>
                                                                    <span className="text-gray-700 dark:text-gray-300">
                                                                        {diff.description} {diff.page && `(Page ${diff.page})`}
                                                                    </span>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </div>
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
                                        disabled={isProcessing || files.length !== 2}
                                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Comparing...
                                            </>
                                        ) : (
                                            <>
                                                <FileDiff className="w-5 h-5" />
                                                Compare PDFs
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
                                    Comparison Results
                                </h3>
                                
                                {result ? (
                                    <div className="text-center">
                                        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ${
                                            result.type === 'identical' 
                                                ? 'bg-green-100 dark:bg-green-900/20' 
                                                : 'bg-yellow-100 dark:bg-yellow-900/20'
                                        }`}>
                                            {result.type === 'identical' ? (
                                                <CheckCircle className="w-8 h-8 text-green-500" />
                                            ) : (
                                                <AlertCircle className="w-8 h-8 text-yellow-500" />
                                            )}
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            {result.message}
                                        </p>
                                        {result.type === 'different' && (
                                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                                Check the detailed differences in the comparison results
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center py-12">
                                        <FileDiff className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                                        <p className="text-gray-500 dark:text-gray-400">
                                            Upload 2 PDF files to compare
                                        </p>
                                    </div>
                                )}

                                {/* How it works */}
                                <div className="mt-8">
                                    <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                                        How comparison works:
                                    </h4>
                                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-500 mt-1">•</span>
                                            <span>Compares page count and dimensions</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-500 mt-1">•</span>
                                            <span>Analyzes content structure</span>
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="text-purple-500 mt-1">•</span>
                                            <span>Highlights formatting differences</span>
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