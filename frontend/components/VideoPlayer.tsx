
'use client';
import { useRef, useEffect, useState } from 'react';
interface VideoPlayerProps {
    src: string;
    title?: string;
    onProgress?: (currentTime: number, duration: number) => void;
    onComplete?: () => void;
    className?: string;
}
export function VideoPlayer({ src, title, onProgress, onComplete, className }: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [hasCompleted, setHasCompleted] = useState(false);
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (onProgress && video.duration) {
                onProgress(video.currentTime, video.duration);

                // Auto-complete at 90%
                if (!hasCompleted && video.currentTime / video.duration > 0.9) {
                    setHasCompleted(true);
                    onComplete?.();
                }
            }
        };

        const handleLoadedData = () => {
            setIsLoading(false);
            setError(null);
        };

        const handleError = () => {
            setError('Failed to load video. Please check your connection.');
            setIsLoading(false);
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('loadeddata', handleLoadedData);
        video.addEventListener('error', handleError);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('loadeddata', handleLoadedData);
            video.removeEventListener('error', handleError);
        };
    }, [onProgress, onComplete, hasCompleted]);

    return (
        <div className={`video-player-container ${className || ''}`}>
            {isLoading && (
                <div className="video-loading">
                    <div className="spinner" />
                    <p>Loading video...</p>
                </div>
            )}

            {error && (
                <div className="video-error">
                    <p>{error}</p>
                    <button onClick={() => videoRef.current?.load()}>Retry</button>
                </div>
            )}

            <video
                ref={videoRef}
                src={src}
                controls
                controlsList="nodownload"
                className="video-player"
                style={{ display: isLoading || error ? 'none' : 'block' }}
            >
                <source src={src} type="video/mp4" />
                <source src={src.replace('.mp4', '.webm')} type="video/webm" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}

