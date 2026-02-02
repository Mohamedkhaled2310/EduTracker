/**
 * Video URL Detection and Conversion Utilities
 * Automatically detects video platform and converts URLs to appropriate embed format
 */

export type VideoType = 'youtube' | 'vimeo' | 'direct' | 'unknown';

export interface VideoInfo {
    type: VideoType;
    embedUrl: string;
    originalUrl: string;
    platform?: string;
}

/**
 * Detect video type from URL
 */
export function detectVideoType(url: string): VideoType {
    if (!url) return 'unknown';

    const lowerUrl = url.toLowerCase();

    // YouTube detection
    if (
        lowerUrl.includes('youtube.com') ||
        lowerUrl.includes('youtu.be') ||
        lowerUrl.includes('youtube-nocookie.com')
    ) {
        return 'youtube';
    }

    // Vimeo detection
    if (lowerUrl.includes('vimeo.com')) {
        return 'vimeo';
    }

    // Direct video file detection
    if (
        lowerUrl.endsWith('.mp4') ||
        lowerUrl.endsWith('.webm') ||
        lowerUrl.endsWith('.ogg') ||
        lowerUrl.endsWith('.mov') ||
        lowerUrl.includes('.mp4?') ||
        lowerUrl.includes('.webm?')
    ) {
        return 'direct';
    }

    return 'unknown';
}

/**
 * Extract YouTube video ID from various URL formats
 */
export function extractYouTubeId(url: string): string | null {
    const patterns = [
        /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
        /youtube\.com\/watch\?.*v=([^&\n?#]+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Extract Vimeo video ID from URL
 */
export function extractVimeoId(url: string): string | null {
    const patterns = [
        /vimeo\.com\/(\d+)/,
        /vimeo\.com\/video\/(\d+)/,
        /player\.vimeo\.com\/video\/(\d+)/,
    ];

    for (const pattern of patterns) {
        const match = url.match(pattern);
        if (match && match[1]) {
            return match[1];
        }
    }

    return null;
}

/**
 * Convert YouTube URL to embed format
 */
export function getYouTubeEmbedUrl(url: string): string {
    const videoId = extractYouTubeId(url);
    if (!videoId) return url;

    // Use youtube-nocookie.com for better privacy
    return `https://www.youtube-nocookie.com/embed/${videoId}?rel=0&modestbranding=1`;
}

/**
 * Convert Vimeo URL to embed format
 */
export function getVimeoEmbedUrl(url: string): string {
    const videoId = extractVimeoId(url);
    if (!videoId) return url;

    return `https://player.vimeo.com/video/${videoId}`;
}

/**
 * Get video information including type and embed URL
 */
export function getVideoInfo(url: string): VideoInfo {
    const type = detectVideoType(url);
    let embedUrl = url;

    switch (type) {
        case 'youtube':
            embedUrl = getYouTubeEmbedUrl(url);
            break;
        case 'vimeo':
            embedUrl = getVimeoEmbedUrl(url);
            break;
        case 'direct':
            embedUrl = url; // Direct URLs don't need conversion
            break;
        default:
            embedUrl = url;
    }

    return {
        type,
        embedUrl,
        originalUrl: url,
        platform: type === 'youtube' ? 'YouTube' : type === 'vimeo' ? 'Vimeo' : undefined,
    };
}

/**
 * Check if URL is a valid video URL
 */
export function isValidVideoUrl(url: string): boolean {
    if (!url) return false;

    try {
        new URL(url);
        const type = detectVideoType(url);
        return type !== 'unknown';
    } catch {
        return false;
    }
}
