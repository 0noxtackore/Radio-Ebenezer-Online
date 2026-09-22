import {
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_URL,
} from "../config/constants";

export interface YouTubeResult {
  videoUrl: string;
  thumbnailUrl: string;
  isChannelFallback: boolean;
  videoTitle?: string;
}

const INVIDIOUS_INSTANCES = [
  "https://inv.nadeko.net",
  "https://invidious.nerdvpn.de",
  "https://invidious.private.coffee",
];

const FALLBACK_THUMBNAIL = "/img/logo.png";

function thumbFromVideoId(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

function normalizeText(text: string): string {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim();
}

function findBestMatch(
  videoTitles: { title: string; videoId: string; thumbnail: string }[],
  eventTitle: string
): { videoId: string; thumbnail: string; title: string } | null {
  const normalized = normalizeText(eventTitle);
  const keywords = normalized.split(/\s+/).filter((w) => w.length > 2);

  let best = null;
  let bestScore = 0;

  for (const video of videoTitles) {
    const vTitle = normalizeText(video.title);
    let score = 0;
    for (const kw of keywords) {
      if (vTitle.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = { videoId: video.videoId, thumbnail: video.thumbnail, title: video.title };
    }
  }

  return bestScore >= 1 ? best : null;
}

async function searchWithYouTubeAPI(eventTitle: string): Promise<YouTubeResult> {
  const query = encodeURIComponent(eventTitle);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${query}&channelId=${YOUTUBE_CHANNEL_ID}&type=video&order=date&maxResults=5&key=${YOUTUBE_API_KEY}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`YouTube API ${res.status}`);

  const data = await res.json();
  const item = data.items?.[0];

  if (item) {
    return {
      videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      thumbnailUrl: thumbFromVideoId(item.id.videoId),
      isChannelFallback: false,
      videoTitle: item.snippet.title,
    };
  }

  return {
    videoUrl: YOUTUBE_CHANNEL_URL,
    thumbnailUrl: FALLBACK_THUMBNAIL,
    isChannelFallback: true,
  };
}

async function searchWithInvidious(eventTitle: string): Promise<YouTubeResult> {
  for (const instance of INVIDIOUS_INSTANCES) {
    try {
      const url = `${instance}/api/v1/channels/${YOUTUBE_CHANNEL_ID}/latest`;
      const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
      if (!res.ok) continue;

      const videos: { title: string; videoId: string; videoThumbnails?: { url: string }[] }[] =
        await res.json();

      if (!videos.length) continue;

      const enriched = videos.map((v) => ({
        title: v.title,
        videoId: v.videoId,
        thumbnail: thumbFromVideoId(v.videoId),
      }));

      const match = findBestMatch(enriched, eventTitle);

      if (match) {
        return {
          videoUrl: `https://www.youtube.com/watch?v=${match.videoId}`,
          thumbnailUrl: thumbFromVideoId(match.videoId),
          isChannelFallback: false,
          videoTitle: match.title,
        };
      }

      return {
        videoUrl: `https://www.youtube.com/watch?v=${videos[0].videoId}`,
        thumbnailUrl: thumbFromVideoId(videos[0].videoId),
        isChannelFallback: false,
        videoTitle: videos[0].title,
      };
    } catch {
      continue;
    }
  }

  return {
    videoUrl: YOUTUBE_CHANNEL_URL,
    thumbnailUrl: FALLBACK_THUMBNAIL,
    isChannelFallback: true,
  };
}

export async function searchEventVideo(
  eventTitle: string
): Promise<YouTubeResult> {
  if (YOUTUBE_API_KEY) {
    try {
      return await searchWithYouTubeAPI(eventTitle);
    } catch {
      console.warn("YouTube API falló, intentando Invidious...");
    }
  }

  return searchWithInvidious(eventTitle);
}
