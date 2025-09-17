// // components/VideoPlayer.tsx - NEW COMPONENT
//
// import  { useState, useRef, useEffect } from 'react';
//
// interface VideoPlayerProps {
//     src: string;
//     title?: string;
//     onProgress?: (currentTime: number, duration: number) => void;
//     onComplete?: () => void;
//     className?: string;
// }
//
// export const VideoPlayer: React.FC<VideoPlayerProps> = ({
//                                                             src,
//                                                             title,
//                                                             onProgress,
//                                                             onComplete,
//                                                             className = ''
//                                                         }) => {
//     const videoRef = useRef<HTMLVideoElement>(null);
//     const [isPlaying, setIsPlaying] = useState(false);
//     const [currentTime, setCurrentTime] = useState(0);
//     const [duration, setDuration] = useState(0);
//     const [isLoading, setIsLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [volume, setVolume] = useState(1);
//     const [isMuted, setIsMuted] = useState(false);
//     const [playbackRate, setPlaybackRate] = useState(1);
//
//     // Handle video loading
//     useEffect(() => {
//         const video = videoRef.current;
//         if (!video) return;
//
//         const handleLoadStart = () => setIsLoading(true);
//         const handleLoadedData = () => {
//             setIsLoading(false);
//             setError(null);
//             setDuration(video.duration);
//         };
//         const handleError = () => {
//             setIsLoading(false);
//             setError('Failed to load video. Please check the file format or try again.');
//         };
//
//         video.addEventListener('loadstart', handleLoadStart);
//         video.addEventListener('loadeddata', handleLoadedData);
//         video.addEventListener('error', handleError);
//
//         return () => {
//             video.removeEventListener('loadstart', handleLoadStart);
//             video.removeEventListener('loadeddata', handleLoadedData);
//             video.removeEventListener('error', handleError);
//         };
//     }, [src]);
//
//     // Handle time updates
//     const handleTimeUpdate = () => {
//         const video = videoRef.current;
//         if (!video) return;
//
//         const current = video.currentTime;
//         setCurrentTime(current);
//
//         if (onProgress) {
//             onProgress(current, video.duration);
//         }
//
//         // Auto-complete at 90%
//         if (video.duration > 0 && current / video.duration > 0.9) {
//             if (onComplete) {
//                 onComplete();
//             }
//         }
//     };
//
//     const togglePlay = () => {
//         const video = videoRef.current;
//         if (!video) return;
//
//         if (isPlaying) {
//             video.pause();
//         } else {
//             video.play().catch(console.error);
//         }
//     };
//
//     const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
//         const video = videoRef.current;
//         if (!video || !duration) return;
//
//         const rect = e.currentTarget.getBoundingClientRect();
//         const percentage = (e.clientX - rect.left) / rect.width;
//         const newTime = percentage * duration;
//
//         video.currentTime = newTime;
//         setCurrentTime(newTime);
//     };
//
//     const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//         const video = videoRef.current;
//         const newVolume = parseFloat(e.target.value);
//
//         if (video) {
//             video.volume = newVolume;
//             setVolume(newVolume);
//             setIsMuted(newVolume === 0);
//         }
//     };
//
//     const toggleMute = () => {
//         const video = videoRef.current;
//         if (!video) return;
//
//         if (isMuted) {
//             video.volume = volume;
//             video.muted = false;
//             setIsMuted(false);
//         } else {
//             video.volume = 0;
//             video.muted = true;
//             setIsMuted(true);
//         }
//     };
//
//     const changePlaybackRate = (rate: number) => {
//         const video = videoRef.current;
//         if (video) {
//             video.playbackRate = rate;
//             setPlaybackRate(rate);
//         }
//     };
//
//     const formatTime = (time: number) => {
//         const minutes = Math.floor(time / 60);
//         const seconds = Math.floor(time % 60);
//         return `${minutes}:${seconds.toString().padStart(2, '0')}`;
//     };
//
//     const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
//
//     if (error) {
//         return (
//             <div className={`video-player-error ${className}`}>
//                 <div className="error-content">
//                     <svg className="error-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
//                               d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
//                     </svg>
//                     <h3>Video Error</h3>
//                     <p>{error}</p>
//                     <button onClick={() => window.location.reload()}>Retry</button>
//                 </div>
//             </div>
//         );
//     }
//
//     return (
//         <div className={`video-player ${className}`}>
//             <div className="video-container">
//                 <video
//                     ref={videoRef}
//                     src={src}
//                     onPlay={() => setIsPlaying(true)}
//                     onPause={() => setIsPlaying(false)}
//                     onTimeUpdate={handleTimeUpdate}
//                     onLoadedMetadata={(e) => {
//                         const video = e.target as HTMLVideoElement;
//                         setDuration(video.duration);
//                     }}
//                     className="video-element"
//                 >
//                     <source src={src} type="video/mp4" />
//                     <source src={src} type="video/webm" />
//                     Your browser does not support the video tag.
//                 </video>
//
//                 {isLoading && (
//                     <div className="video-loading">
//                         <div className="loading-spinner" />
//                         <p>Loading video...</p>
//                     </div>
//                 )}
//
//                 {/* Custom Controls */}
//                 <div className="video-controls">
//                     <div className="progress-bar" onClick={handleSeek}>
//                         <div className="progress-background">
//                             <div
//                                 className="progress-fill"
//                                 style={{ width: `${progressPercentage}%` }}
//                             />
//                         </div>
//                     </div>
//
//                     <div className="controls-row">
//                         <div className="controls-left">
//                             <button className="control-button" onClick={togglePlay}>
//                                 {isPlaying ? (
//                                     <svg fill="currentColor" viewBox="0 0 20 20">
//                                         <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
//                                     </svg>
//                                 ) : (
//                                     <svg fill="currentColor" viewBox="0 0 20 20">
//                                         <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
//                                     </svg>
//                                 )}
//                             </button>
//
//                             <div className="volume-control">
//                                 <button className="control-button" onClick={toggleMute}>
//                                     {isMuted || volume === 0 ? (
//                                         <svg fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.771L4.216 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.216l4.167-3.771zm0 0a1 1 0 011.617-.771L15.216 5.5H18a1 1 0 011 1v7a1 1 0 01-1 1h-2.784l-4.216 3.271A1 1 0 0110 16.5v-12a1 1 0 011.617-.771z" clipRule="evenodd" />
//                                         </svg>
//                                     ) : (
//                                         <svg fill="currentColor" viewBox="0 0 20 20">
//                                             <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.771L4.216 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.216l4.167-3.771zm2.91 1.38a1 1 0 011.393-.288A6.002 6.002 0 0118 10a6.002 6.002 0 01-4.314 5.832 1 1 0 11-.782-1.84A4.002 4.002 0 0016 10a4.002 4.002 0 00-3.096-3.902 1 1 0 01-.288-1.393z" clipRule="evenodd" />
//                                         </svg>
//                                     )}
//                                 </button>
//                                 <input
//                                     type="range"
//                                     min="0"
//                                     max="1"
//                                     step="0.1"
//                                     value={isMuted ? 0 : volume}
//                                     onChange={handleVolumeChange}
//                                     className="volume-slider"
//                                 />
//                             </div>
//
//                             <div className="time-display">
//                                 {formatTime(currentTime)} / {formatTime(duration)}
//                             </div>
//                         </div>
//
//                         <div className="controls-right">
//                             <div className="playback-speed">
//                                 <select
//                                     value={playbackRate}
//                                     onChange={(e) => changePlaybackRate(parseFloat(e.target.value))}
//                                     className="speed-selector"
//                                 >
//                                     <option value={0.5}>0.5x</option>
//                                     <option value={0.75}>0.75x</option>
//                                     <option value={1}>1x</option>
//                                     <option value={1.25}>1.25x</option>
//                                     <option value={1.5}>1.5x</option>
//                                     <option value={2}>2x</option>
//                                 </select>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//
//             {title && (
//                 <div className="video-title">
//                     <h3>{title}</h3>
//                 </div>
//             )}
//         </div>
//     );
// };
//

// src/components/VideoPlayer.tsx - NEW FILE
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