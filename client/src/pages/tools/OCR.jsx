
import { useState } from 'react'
import { Scan, Upload, FileText, Download, ArrowRight, Languages, Copy, Check } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'
import Tesseract from 'tesseract.js'

export default function OCR() {
    const [file, setFile] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [extractedText, setExtractedText] = useState('')
    const [language, setLanguage] = useState('eng')
    const [progress, setProgress] = useState(0)
    const [status, setStatus] = useState('')

    const languages = [
        { code: 'eng', name: 'English' },
        { code: 'hin', name: 'Hindi' },
        { code: 'spa', name: 'Spanish' },
        { code: 'fra', name: 'French' },
        { code: 'deu', name: 'German' },
        { code: 'ita', name: 'Italian' },
        { code: 'por', name: 'Portuguese' },
        { code: 'rus', name: 'Russian' },
        { code: 'chi_sim', name: 'Chinese (Simplified)' },
        { code: 'jpn', name: 'Japanese' },
        { code: 'ara', name: 'Arabic' }
    ]

    const handleFileSelected = (files) => {
        setFile(files[0])
        setExtractedText('')
        setProgress(0)
        setStatus('')
    }

    const handleOCR = async () => {
        if (!file) return

        setProcessing(true)
        setProgress(0)
        setStatus('Initializing OCR engine...')
        setExtractedText('')

        try {
            const result = await Tesseract.recognize(
                file,
                language,
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            setProgress(parseInt(m.progress * 100))
                            setStatus(`Scanning document... ${parseInt(m.progress * 100)}%`)
                        } else {
                            setStatus(m.status)
                        }
                    }
                }
            )

            setExtractedText(result.data.text)
            toast.success('Text extracted successfully!')
        } catch (error) {
            console.error(error)
            toast.error('Failed to extract text. Please try a clearer image.')
        } finally {
            setProcessing(false)
            setStatus('')
        }
    }

    const handleCopy = () => {
        navigator.clipboard.writeText(extractedText)
        toast.success('Text copied to clipboard!')
    }

    const handleDownload = () => {
        const element = document.createElement("a");
        const file = new Blob([extractedText], { type: 'text/plain' });
        element.href = URL.createObjectURL(file);
        element.download = "extracted_text.txt";
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Scan className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">OCR PDF Scanner</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Convert scanned documents and images into editable text using advanced browser-based OCR technology. 100% Privacy - Runs locally!
                    </p>
                </div>

                <div className="card p-8 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                <Languages className="w-4 h-4" />
                                Document Language
                            </label>
                            <select
                                value={language}
                                onChange={(e) => setLanguage(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 dark:border-dark-border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent dark:bg-dark-card dark:text-white"
                            >
                                {languages.map((lang) => (
                                    <option key={lang.code} value={lang.code}>
                                        {lang.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <FileUploader
                        onFilesSelected={handleFileSelected}
                        acceptedFileTypes={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp', '.bmp'],
                        }}
                        maxFiles={1}
                        multiple={false}
                    />
                </div>

                <div className="text-center mb-8">
                    {file && !processing && !extractedText && (
                        <button
                            onClick={handleOCR}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Scan className="w-5 h-5" />
                            <span>Start OCR Scan</span>
                        </button>
                    )}

                    {processing && (
                        <div className="max-w-md mx-auto">
                            <div className="mb-2 flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300">
                                <span>{status}</span>
                                <span>{progress}%</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                                <div
                                    className="bg-primary-600 h-2.5 rounded-full transition-all duration-300"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>

                {extractedText && (
                    <div className="card p-8 animate-slide-up">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center">
                                <FileText className="w-6 h-6 mr-2 text-primary-600" />
                                Extracted Text
                            </h3>
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleCopy}
                                    className="btn-outline py-1 px-3 text-sm flex items-center"
                                >
                                    <Copy className="w-4 h-4 mr-1" /> Copy
                                </button>
                                <button
                                    onClick={handleDownload}
                                    className="btn-primary py-1 px-3 text-sm flex items-center"
                                >
                                    <Download className="w-4 h-4 mr-1" /> Save as .txt
                                </button>
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-gray-900 p-6 rounded-xl border border-gray-200 dark:border-gray-700 max-h-96 overflow-y-auto whitespace-pre-wrap font-mono text-sm text-gray-700 dark:text-gray-300">
                            {extractedText}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
