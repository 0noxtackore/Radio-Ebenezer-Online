import {
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_HANDLE,
  YOUTUBE_CHANNEL_URL,
} from "../config/constants";

export interface YouTubeResult {
  videoUrl: string;
  thumbnailUrl: string;
  isChannelFallback: boolean;
}

const FALLBACK_THUMBNAIL = "/img/logo.png";

export async function searchEventVideo(
  eventTitle: string
): Promise<YouTubeResult> {
  if (!YOUTUBE_API_KEY) {
    return {
      videoUrl: YOUTUBE_CHANNEL_URL,
      thumbnailUrl: FALLBACK_THUMBNAIL,
      isChannelFallback: true,
    };
  }

  try {
    const query = encodeURIComponent(`${eventTitle} ${YOUTUBE_CHANNEL_HANDLE}`);
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`YouTube API ${res.status}`);

    const data = await res.json();
    const item = data.items?.[0];

    if (item) {
      const videoId = item.id.videoId;
      return {
        videoUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: item.snippet.thumbnails?.medium?.url || FALLBACK_THUMBNAIL,
        isChannelFallback: false,
      };
    }
  } catch {
    console.warn("YouTube API falló, usando link del canal.");
  }

  return {
    videoUrl: YOUTUBE_CHANNEL_URL,
    thumbnailUrl: FALLBACK_THUMBNAIL,
    isChannelFallback: true,
  };
}
