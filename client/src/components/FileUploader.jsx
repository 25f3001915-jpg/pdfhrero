import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FileUploader({
    onFilesSelected,
    acceptedFileTypes = { 'application/pdf': ['.pdf'] },
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB default
    multiple = false
}) {
    const [files, setFiles] = useState([])

    const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach(error => {
                    if (error.code === 'file-too-large') {
                        toast.error(`${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`)
                    } else if (error.code === 'file-invalid-type') {
                        toast.error(`${file.name} has invalid type`)
                    } else {
                        toast.error(`Error with ${file.name}: ${error.message}`)
                    }
                })
            })
            return
        }

        const newFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            progress: 0
        }))

        setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles)
        onFilesSelected(acceptedFiles)
        toast.success(`${acceptedFiles.length} file(s) uploaded successfully`)
    }, [onFilesSelected, multiple, maxSize])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles,
        maxSize,
        multiple
    })

    const removeFile = (id) => {
        setFiles(prev => prev.filter(f => f.id !== id))
    }

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                <div className="flex flex-col items-center">
                    <Upload className={`w-16 h-16 mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    {isDragActive ? (
                        <p className="text-lg font-semibold text-primary-600">Drop files here...</p>
                    ) : (
                        <>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Drag & drop files here
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                or click to browse
                            </p>
                            <button className="btn-primary">
                                Select Files
                            </button>
                            <p className="text-xs text-gray-400 mt-4">
                                Max file size: {maxSize / 1024 / 1024}MB
                            </p>
                        </>
                    )}
                </div>
            </div>

            {/* File List */}
            {files.length > 0 && (
                <div className="mt-6 space-y-3">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Uploaded Files ({files.length})
                    </h3>
                    {files.map((fileItem) => (
                        <div
                            key={fileItem.id}
                            className="card p-4 flex items-center justify-between"
                        >
                            <div className="flex items-center space-x-3 flex-1">
                                <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center">
                                    <File className="w-5 h-5 text-primary-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                        {fileItem.name}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatFileSize(fileItem.size)}
                                    </p>
                                </div>
                                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                            </div>
                            <button
                                onClick={() => removeFile(fileItem.id)}
                                className="ml-4 p-2 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5 text-red-500" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
