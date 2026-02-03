import { useCallback, useState, useMemo } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function FileUploader({
    onFilesSelected,
    acceptedFileTypes = { 'application/pdf': ['.pdf'] },
    maxFiles = 1,
    maxSize = 10 * 1024 * 1024, // 10MB default
    multiple = false,
    showPreview = true,
    allowDuplicates = false,
    onUploadProgress,
    disabled = false
}) {
    const [files, setFiles] = useState([])
    const [isUploading, setIsUploading] = useState(false)
    const [uploadProgress, setUploadProgress] = useState({})

    const onDrop = useCallback(async (acceptedFiles, rejectedFiles) => {
        if (disabled) return;
        
        if (rejectedFiles.length > 0) {
            rejectedFiles.forEach(({ file, errors }) => {
                errors.forEach(error => {
                    if (error.code === 'file-too-large') {
                        toast.error(`${file.name} is too large. Max size is ${maxSize / 1024 / 1024}MB`)
                    } else if (error.code === 'file-invalid-type') {
                        toast.error(`${file.name} has invalid type. Accepted: ${Object.keys(acceptedFileTypes).join(', ')}`)
                    } else if (error.code === 'too-many-files') {
                        toast.error(`Maximum ${maxFiles} files allowed`)
                    } else {
                        toast.error(`Error with ${file.name}: ${error.message}`)
                    }
                })
            })
            return
        }

        // Filter duplicates if not allowed
        let filteredFiles = acceptedFiles;
        if (!allowDuplicates && files.length > 0) {
            const existingNames = files.map(f => f.name);
            filteredFiles = acceptedFiles.filter(file => !existingNames.includes(file.name));
            
            if (filteredFiles.length !== acceptedFiles.length) {
                const duplicateCount = acceptedFiles.length - filteredFiles.length;
                toast.warning(`${duplicateCount} duplicate file(s) ignored`);
            }
        }

        if (filteredFiles.length === 0) return;

        const newFiles = filteredFiles.map(file => ({
            file,
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            size: file.size,
            type: file.type,
            lastModified: file.lastModified,
            progress: 0,
            status: 'pending'
        }));

        try {
            setIsUploading(true);
            
            // Simulate upload progress
            if (onUploadProgress) {
                newFiles.forEach(fileObj => {
                    let progress = 0;
                    const interval = setInterval(() => {
                        progress += Math.random() * 15;
                        if (progress >= 100) {
                            progress = 100;
                            clearInterval(interval);
                            setUploadProgress(prev => ({
                                ...prev,
                                [fileObj.id]: 100
                            }));
                        } else {
                            setUploadProgress(prev => ({
                                ...prev,
                                [fileObj.id]: progress
                            }));
                        }
                        onUploadProgress(fileObj.id, progress);
                    }, 100);
                });
            }

            setFiles(prev => multiple ? [...prev, ...newFiles] : newFiles);
            onFilesSelected(filteredFiles);
            toast.success(`${filteredFiles.length} file(s) uploaded successfully`);
        } catch (error) {
            toast.error('Upload failed. Please try again.');
            console.error('Upload error:', error);
        } finally {
            setIsUploading(false);
        }
    }, [onFilesSelected, multiple, maxSize, acceptedFileTypes, maxFiles, files, allowDuplicates, disabled, onUploadProgress])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: acceptedFileTypes,
        maxFiles,
        maxSize,
        multiple
    })

    const removeFile = useCallback((id) => {
        setFiles(prev => {
            const fileToRemove = prev.find(f => f.id === id);
            const updated = prev.filter(f => f.id !== id);
            
            // Clear upload progress for removed file
            setUploadProgress(prevProgress => {
                const newProgress = { ...prevProgress };
                delete newProgress[id];
                return newProgress;
            });
            
            // Notify parent of remaining files
            if (onFilesSelected) {
                onFilesSelected(updated.map(f => f.file));
            }
            
            if (fileToRemove) {
                toast.success(`Removed ${fileToRemove.name}`);
            }
            
            return updated;
        });
    }, [onFilesSelected]);

    const clearAll = useCallback(() => {
        setFiles([]);
        setUploadProgress({});
        if (onFilesSelected) {
            onFilesSelected([]);
        }
        toast.success('All files cleared');
    }, [onFilesSelected]);

    const getFileIcon = (fileName) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        switch (ext) {
            case 'pdf': return '📄';
            case 'jpg': case 'jpeg': case 'png': case 'gif': return '🖼️';
            case 'doc': case 'docx': return '📝';
            case 'xls': case 'xlsx': return '📊';
            default: return '📁';
        }
    };

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getTotalSize = useMemo(() => {
        return files.reduce((total, file) => total + file.size, 0);
    }, [files]);

    return (
        <div className="w-full">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
                <input {...getInputProps()} disabled={disabled} />
                <div className="flex flex-col items-center p-8">
                    {isUploading ? (
                        <Loader2 className="w-16 h-16 mb-4 text-primary-600 animate-spin" />
                    ) : (
                        <Upload className={`w-16 h-16 mb-4 ${isDragActive ? 'text-primary-600' : 'text-gray-400'}`} />
                    )}
                    
                    {isDragActive ? (
                        <p className="text-lg font-semibold text-primary-600 mb-2">Drop files here...</p>
                    ) : disabled ? (
                        <p className="text-lg font-semibold text-gray-500 mb-2">Uploader disabled</p>
                    ) : (
                        <>
                            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Drag & drop files here
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                or click to browse
                            </p>
                            <button 
                                className="btn-primary" 
                                disabled={disabled}
                            >
                                Select Files
                            </button>
                        </>
                    )}
                    
                    <div className="mt-4 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                            Max file size: {formatFileSize(maxSize)} • 
                            {multiple ? `Max ${maxFiles} files` : 'Single file'}
                        </p>
                        {Object.keys(acceptedFileTypes).length > 0 && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                Accepted: {Object.keys(acceptedFileTypes).join(', ')}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* File List Header */}
            {files.length > 0 && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Uploaded Files ({files.length})
                            <span className="text-sm font-normal text-gray-500 ml-2">
                                ({formatFileSize(getTotalSize)} total)
                            </span>
                        </h3>
                        <button
                            onClick={clearAll}
                            className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                            Clear All
                        </button>
                    </div>
                    
                    <div className="space-y-3">
                        {files.map((fileItem) => (
                            <div
                                key={fileItem.id}
                                className="card p-4 transition-all duration-200 hover:shadow-md"
                            >
                                <div className="flex items-start space-x-4">
                                    <div className="flex-shrink-0">
                                        <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-2xl">
                                            {getFileIcon(fileItem.name)}
                                        </div>
                                    </div>
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate mr-2">
                                                {fileItem.name}
                                            </h4>
                                            <div className="flex items-center space-x-2 flex-shrink-0">
                                                {uploadProgress[fileItem.id] > 0 && uploadProgress[fileItem.id] < 100 ? (
                                                    <div className="flex items-center space-x-2">
                                                        <div className="w-24 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                                                            <div 
                                                                className="h-full bg-primary-600 transition-all duration-300"
                                                                style={{ width: `${uploadProgress[fileItem.id]}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                                            {Math.round(uploadProgress[fileItem.id])}%
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                                        {formatFileSize(fileItem.size)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        <div className="mt-2 flex items-center justify-between">
                                            <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                                                <span>Type: {fileItem.type || 'Unknown'}</span>
                                                <span>Modified: {new Date(fileItem.lastModified).toLocaleDateString()}</span>
                                            </div>
                                            <button
                                                onClick={() => removeFile(fileItem.id)}
                                                disabled={isUploading}
                                                className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <X className="w-4 h-4 text-red-500" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
