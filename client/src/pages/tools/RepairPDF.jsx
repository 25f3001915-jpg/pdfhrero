import { useState } from 'react'
import { Wrench, Download, ArrowRight } from 'lucide-react'
import FileUploader from '../../components/FileUploader'
import toast from 'react-hot-toast'

export default function RepairPDF() {
    const [file, setFile] = useState(null)
    const [processing, setProcessing] = useState(false)
    const [downloadUrl, setDownloadUrl] = useState(null)

    const handleFileSelected = (selectedFiles) => {
        setFile(selectedFiles[0])
        setDownloadUrl(null)
    }

    const handleRepair = async () => {
        if (!file) return

        setProcessing(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const response = await fetch('/api/pdf/repair', {
                method: 'POST',
                body: formData
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Repair failed')
            }

            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            setDownloadUrl(url)
            toast.success('PDF repaired successfully!')
        } catch (error) {
            console.error(error)
            toast.error(error.message || 'Failed to repair PDF')
        } finally {
            setProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg section-padding">
            <div className="container-custom max-w-4xl">
                <div className="text-center mb-12">
                    <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl">
                        <Wrench className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="mb-4 gradient-text">Repair PDF</h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        Recover data from a corrupted or damaged PDF document.
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

                {file && !downloadUrl && (
                    <div className="text-center mb-8">
                        <button
                            onClick={handleRepair}
                            disabled={processing}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            {processing ? (
                                <>
                                    <div className="spinner w-5 h-5 border-2"></div>
                                    <span>Repairing...</span>
                                </>
                            ) : (
                                <>
                                    <Wrench className="w-5 h-5" />
                                    <span>Repair PDF</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

                {downloadUrl && (
                    <div className="card p-8 text-center animate-slide-up">
                        <h3 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
                            PDF Recovered!
                        </h3>
                        <a
                            href={downloadUrl}
                            download={`repaired_${file.name}`}
                            className="btn-primary inline-flex items-center space-x-2"
                        >
                            <Download className="w-5 h-5" />
                            <span>Download File</span>
                        </a>
                    </div>
                )}
            </div>
        </div>
    )
}
