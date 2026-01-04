// src/components/FileUpload.tsx
'use client';
import { useState, useRef } from 'react';
import { Upload, X, File, Video, Image, FileText, Loader } from 'lucide-react';
interface FileUploadProps {
    onUpload: (file: File) => Promise<any>;
    accept?: string;
    maxSize?: number; // in bytes
    label?: string;
    multiple?: boolean;
}
export default function FileUpload({
                                       onUpload,
                                       accept = '*',
                                       maxSize = 30 * 1024 * 1024, // 30MB default
                                       label = 'Upload File',
                                       multiple = false
                                   }: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
    const [error, setError] = useState<string>('');
    const inputRef = useRef<HTMLInputElement>(null);
    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['mp4', 'avi', 'mov', 'mkv'].includes(ext || '')) return Video;
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return Image;
        if (['pdf'].includes(ext || '')) return FileText;
        return File;
    };
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };
    const validateFile = (file: File) => {
        if (file.size > maxSize) {
            setError(`File size must be less than ${formatFileSize(maxSize)}`);
            return false;
        }
        setError('');
        return true;
    };
    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setDragActive(false);
        const files = Array.from(e.dataTransfer.files);
        if (!multiple && files.length > 1) {
            setError('Only one file allowed');
            return;
        }

        for (const file of files) {
            if (validateFile(file)) {
                await uploadFile(file);
            }
        }
    };
    const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        for (const file of files) {
            if (validateFile(file)) {
                await uploadFile(file);
            }
        }
    };
    const uploadFile = async (file: File) => {
        setUploading(true);
        try {
            const result = await onUpload(file);
            setUploadedFiles(prev => [...prev, { file, result }]);
            setError('');
        } catch (err: any) {
            setError(err.message || 'Upload failed');
        } finally {
            setUploading(false);
        }
    };
    const removeFile = (index: number) => {
        setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    };
    return (
        <div className="w-full">
            <div
                className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'} ${uploading ? 'pointer-events-none opacity-50' : ''}`}
                onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleChange}
                    className="hidden"
                />
                {uploading ? (
                    <div className="py-4">
                        <Loader className="w-8 h-8 text-blue-500 animate-spin mx-auto mb-2" />
                        <p className="text-sm text-gray-600">Uploading...</p>
                    </div>
                ) : (
                    <>
                        <Upload className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">
                            {label}
                        </p>
                        <button
                            type="button"
                            onClick={() => inputRef.current?.click()}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                            Select File{multiple ? 's' : ''}
                        </button>
                        <p className="text-xs text-gray-500 mt-2">
                            or drag and drop • Max size: {formatFileSize(maxSize)}
                        </p>
                    </>
                )}
            </div>

            {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
            )}

            {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                    {uploadedFiles.map((item, index) => {
                        const Icon = getFileIcon(item.file.name);
                        return (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <Icon className="w-5 h-5 text-gray-500" />
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">{item.file.name}</p>
                                        <p className="text-xs text-gray-500">{formatFileSize(item.file.size)}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => removeFile(index)}
                                    className="p-1 hover:bg-gray-200 rounded"
                                >
                                    <X className="w-4 h-4 text-gray-500" />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
