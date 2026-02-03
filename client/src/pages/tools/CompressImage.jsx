import { useState } from 'react'
import { Minimize, ArrowRight, Download, Sliders } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'

export default function CompressImage() {
    const [file, setFile] = useState(null)
    const [quality, setQuality] = useState(80)
    const [processing, setProcessing] = useState(false)
    const [processedFile, setProcessedFile] = useState(null)

    const handleFileSelected = (files) => {
        setFile(files[0])
        setProcessedFile(null)
    }

    const handleCompress = async () => {
        if (!file) {
            toast.error('Please select an image file first')
            return
        }

        setProcessing(true)
        try {
            console.log('Starting image compression...')
            console.log('File size:', file.size, 'bytes')
            console.log('Quality setting:', quality, '%')
            
            const formData = new FormData()
            formData.append('file', file)
            formData.append('quality', quality)

            const response = await fetch('/api/image/compress', {
                method: 'POST',
                body: formData
            })

            console.log('Response status:', response.status)
            
            if (!response.ok) {
                const errorText = await response.text()
                let errorMessage = 'Compression failed'
                
                try {
                    const errorData = JSON.parse(errorText)
                    errorMessage = errorData.message || errorData.error || errorMessage
                } catch (parseError) {
                    errorMessage = errorText || errorMessage
                }
                
                throw new Error(errorMessage)
            }

            const blob = await response.blob()
            console.log('Compressed file size:', blob.size, 'bytes')
            
            const url = window.URL.createObjectURL(blob)
            setProcessedFile(url)
            toast.success(`Image compressed successfully! Reduced from ${(file.size/1024).toFixed(1)}KB to ${(blob.size/1024).toFixed(1)}KB`)
        } catch (error) {
            console.error('Compression error:', error)
            toast.error(`Failed to compress image: ${error.message}`)
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Minimize className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">Compress Image</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Reduce your image file size without losing visible quality.
                    </p>
                </div>

                <div className="card p-8 mb-8">
                    <FileUploader
                        onFilesSelected={handleFileSelected}
                        acceptedFileTypes={{
                            'image/*': ['.png', '.jpg', '.jpeg', '.webp']
                        }}
                        maxFiles={1}
                        multiple={false}
                    />
                </div>

                {file && !processedFile && (
                    <div className="card p-8 mb-8">
                        <h3 className="text-lg font-semibold mb-6 flex items-center text-gray-900 dark:text-white">
                            <Sliders className="w-5 h-5 mr-2" />
                            Compression Settings
                        </h3>

                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                Image Quality: <span className="font-bold text-primary-600">{quality}%</span>
                            </label>
                            <input
                                type="range"
                                min="10"
                                max="100"
                                value={quality}
                                onChange={(e) => setQuality(e.target.value)}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                            />
                            <div className="flex justify-between text-xs text-gray-500 mt-2">
                                <span>Smallest Size (Low Quality)</span>
                                <span>Best Quality (Largest Size)</span>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleCompress}
                                disabled={processing}
                                className="btn-primary inline-flex items-center space-x-2"
                            >
                                {processing ? (
                                    <>
                                        <div className="spinner w-5 h-5 border-2"></div>
                                        <span>Compressing...</span>
                                    </>
                                ) : (
                                    <>
                                        <Minimize className="w-5 h-5" />
                                        <span>Compress Image</span>
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
                            Compression Complete!
                        </h3>
                        <a
                            href={processedFile}
                            download={`compressed-image-${Date.now()}.jpg`} // Extension will vary but backend handles generic download
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download Image</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
