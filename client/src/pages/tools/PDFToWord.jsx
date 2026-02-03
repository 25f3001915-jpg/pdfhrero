import { useState } from 'react'
import { FileText, Download, ArrowRight } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'

export default function PDFToWord() {
    const [file, setFile] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [wordFile, setWordFile] = useState(null)

    const handleFileSelected = (selectedFiles) => {
        setFile(selectedFiles[0])
    }

    const handleConvert = async () => {
        if (!file) {
            toast.error('Please select a PDF file')
            return
        }

        // This feature requires advanced server-side processing not currently installed
        toast.error('This feature is currently under maintenance. Please try "PDF to Image" instead.')
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <FileText className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">PDF to Word</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Convert PDF documents to editable Word format (DOCX).
                    </p>
                </div>

                <div className="card p-8 mb-8">
                    <FileUploader
                        onFilesSelected={handleFileSelected}
                        acceptedFileTypes={{ 'application/pdf': ['.pdf'] }}
                        maxFiles={1}
                        multiple={false}
                    />
                </div>

                {file && !wordFile && (
                    <div className="text-center mb-8">
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
                                    <FileText className="w-5 h-5" />
                                    <span>Convert to Word</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {wordFile && (
                    <div className="card p-8 text-center animate-slide-up">
                        <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Download className="w-8 h-8 text-green-600" />
                        </div>
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            Conversion Complete!
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400 mb-6">
                            Your PDF has been converted to an editable Word document
                        </p>
                        <a
                            href={wordFile}
                            download="document.docx"
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download Word Document</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
