import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, AlertCircle } from 'lucide-react';
import { progressApi } from '@/lib/api';
import { getVideoInfo, type VideoType } from '@/lib/utils/videoUtils';

interface VideoPlayerProps {
    videoUrl: string;
    lessonId: string;
    initialProgress?: number;
    onProgressUpdate?: (progress: number, watched: boolean) => void;
    onVideoComplete?: () => void;
}

export default function VideoPlayer({
    videoUrl,
    lessonId,
    initialProgress = 0,
    onProgressUpdate,
    onVideoComplete
}: VideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [videoInfo, setVideoInfo] = useState(() => getVideoInfo(videoUrl));
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(initialProgress);
    const [duration, setDuration] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showControls, setShowControls] = useState(true);
    const progressSaveInterval = useRef<NodeJS.Timeout | null>(null);

    // Update video info when URL changes
    useEffect(() => {
        setVideoInfo(getVideoInfo(videoUrl));
    }, [videoUrl]);

    useEffect(() => {
        if (videoRef.current && initialProgress > 0 && videoInfo.type === 'direct') {
            videoRef.current.currentTime = initialProgress;
        }
    }, [initialProgress, videoInfo.type]);

    useEffect(() => {
        // Auto-save progress every 10 seconds (only for direct videos)
        if (isPlaying && videoInfo.type === 'direct') {
            progressSaveInterval.current = setInterval(() => {
                saveProgress();
            }, 10000);
        } else {
            if (progressSaveInterval.current) {
                clearInterval(progressSaveInterval.current);
            }
        }

        return () => {
            if (progressSaveInterval.current) {
                clearInterval(progressSaveInterval.current);
            }
        };
    }, [isPlaying, currentTime, videoInfo.type]);

    const saveProgress = async () => {
        if (!videoRef.current || videoInfo.type !== 'direct') return;

        const progress = Math.floor(videoRef.current.currentTime);
        const watched = (progress / duration) >= 0.9; // 90% completion threshold

        try {
            await progressApi.updateVideoProgress(lessonId, progress, watched);
            onProgressUpdate?.(progress, watched);

            if (watched && onVideoComplete) {
                onVideoComplete();
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    };

    const togglePlay = () => {
        if (!videoRef.current || videoInfo.type !== 'direct') return;

        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
    };

    const handleLoadedMetadata = () => {
        if (!videoRef.current) return;
        setDuration(videoRef.current.duration);
    };

    const handleSeek = (value: number[]) => {
        if (!videoRef.current) return;
        const newTime = value[0];
        videoRef.current.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleVolumeChange = (value: number[]) => {
        if (!videoRef.current) return;
        const newVolume = value[0];
        videoRef.current.volume = newVolume;
        setVolume(newVolume);
        setIsMuted(newVolume === 0);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        const newMuted = !isMuted;
        videoRef.current.muted = newMuted;
        setIsMuted(newMuted);
    };

    const toggleFullscreen = () => {
        const element = videoInfo.type === 'direct' ? videoRef.current : iframeRef.current;
        if (!element) return;

        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            element.requestFullscreen();
        }
    };

    const restart = () => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = 0;
        setCurrentTime(0);
        videoRef.current.play();
        setIsPlaying(true);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleVideoEnd = () => {
        setIsPlaying(false);
        saveProgress();
    };

    // Render iframe for YouTube/Vimeo
    if (videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') {
        return (
            <Card className="overflow-hidden">
                <div className="relative bg-black">
                    <iframe
                        ref={iframeRef}
                        src={videoInfo.embedUrl}
                        className="w-full aspect-video"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Video Player"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                        {videoInfo.platform}
                    </div>
                </div>
            </Card>
        );
    }

    // Render video tag for direct files
    if (videoInfo.type === 'direct') {
        return (
            <Card className="overflow-hidden">
                <div
                    className="relative bg-black group"
                    onMouseEnter={() => setShowControls(true)}
                    onMouseLeave={() => setShowControls(isPlaying ? false : true)}
                >
                    <video
                        ref={videoRef}
                        src={videoInfo.embedUrl}
                        className="w-full aspect-video"
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={handleLoadedMetadata}
                        onEnded={handleVideoEnd}
                        onClick={togglePlay}
                    />

                    {/* Controls overlay */}
                    <div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'
                            }`}
                    >
                        {/* Progress bar */}
                        <Slider
                            value={[currentTime]}
                            max={duration || 100}
                            step={1}
                            onValueChange={handleSeek}
                            className="mb-4"
                        />

                        <div className="flex items-center justify-between text-white">
                            <div className="flex items-center gap-2">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={togglePlay}
                                    className="text-white hover:bg-white/20"
                                >
                                    {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                                </Button>

                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={restart}
                                    className="text-white hover:bg-white/20"
                                >
                                    <RotateCcw className="w-4 h-4" />
                                </Button>

                                <div className="flex items-center gap-2">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={toggleMute}
                                        className="text-white hover:bg-white/20"
                                    >
                                        {isMuted || volume === 0 ? (
                                            <VolumeX className="w-5 h-5" />
                                        ) : (
                                            <Volume2 className="w-5 h-5" />
                                        )}
                                    </Button>
                                    <Slider
                                        value={[isMuted ? 0 : volume]}
                                        max={1}
                                        step={0.1}
                                        onValueChange={handleVolumeChange}
                                        className="w-20"
                                    />
                                </div>

                                <span className="text-sm">
                                    {formatTime(currentTime)} / {formatTime(duration)}
                                </span>
                            </div>

                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={toggleFullscreen}
                                className="text-white hover:bg-white/20"
                            >
                                <Maximize className="w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </div>
            </Card>
        );
    }

    // Fallback for unknown video types
    return (
        <Card className="overflow-hidden">
            <div className="bg-muted p-12 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">نوع الفيديو غير مدعوم</h3>
                <p className="text-sm text-muted-foreground mb-4">
                    الرابط المقدم لا يبدو أنه رابط فيديو صالح
                </p>
                <p className="text-xs text-muted-foreground">
                    الأنواع المدعومة: YouTube, Vimeo, MP4, WebM
                </p>
                <a
                    href={videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline text-sm mt-4 inline-block"
                >
                    فتح الرابط في نافذة جديدة
                </a>
            </div>
        </Card>
    );
}
