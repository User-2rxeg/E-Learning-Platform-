
'use client';
import { useState } from 'react';
interface PDFViewerProps {
    src: string;
    title?: string;
    onComplete?: () => void;
    className?: string;
}
export function PDFViewer({ src, title, onComplete, className }: PDFViewerProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
// Ensure the PDF URL is properly formatted
    const getPDFUrl = () => {
        if (src.startsWith('http')) return src;

        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:3555';
        return `${baseUrl}/${src}`;
    };

    const handleLoad = () => {
        setIsLoading(false);
        setError(null);
    };

    const handleError = () => {
        setError('Failed to load PDF. Trying alternate viewer...');
        setIsLoading(false);
    };

    const pdfUrl = getPDFUrl();

    return (
        <div className={`pdf-viewer-container ${className || ''}`}>
            {isLoading && (
                <div className="pdf-loading">
                    <div className="spinner"/>
                    <p>Loading PDF...</p>
                </div>
            )}

            {error ? (
                // Fallback to Google Docs viewer if iframe fails
                <div className="pdf-fallback">
                    <iframe
                        src={`https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true`}
                        className="pdf-viewer"
                        onLoad={handleLoad}
                    />
                    <div className="pdf-actions">
                        <a href={pdfUrl} download className="download-button">
                            Download PDF
                        </a>
                        <button onClick={onComplete} className="complete-button">
                            Mark as Complete
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    <iframe
                        src={`${pdfUrl}#toolbar=0`}
                        className="pdf-viewer"
                        onLoad={handleLoad}
                        onError={handleError}
                        style={{display: isLoading ? 'none' : 'block'}}
                    />
                    <div className="pdf-actions">
                        <a href={pdfUrl} download className="download-button">
                            Download PDF
                        </a>
                        <button onClick={onComplete} className="complete-button">
                            Mark as Complete
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

