import {
  YOUTUBE_API_KEY,
  YOUTUBE_CHANNEL_ID,
  YOUTUBE_CHANNEL_URL,
  YOUTUBE_CHANNEL_BANNER,
} from "../config/constants";

export interface YouTubeResult {
  videoUrl: string;
  thumbnailUrl: string;
  isChannelFallback: boolean;
  videoTitle?: string;
}

const RSS_URL = `https://www.youtube.com/feeds/videos.xml?channel_id=${YOUTUBE_CHANNEL_ID}`;
const FALLBACK_THUMBNAIL = YOUTUBE_CHANNEL_BANNER;

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

interface RSSVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}

function parseRSSFeed(xmlText: string): RSSVideo[] {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  const entries = doc.querySelectorAll("entry");
  const videos: RSSVideo[] = [];

  entries.forEach((entry) => {
    const videoId = entry.querySelector("videoId")?.textContent;
    const title = entry.querySelector("title")?.textContent;
    const thumbEl = entry.querySelector("thumbnail");
    const thumbnail = thumbEl?.getAttribute("url") || "";

    if (videoId && title) {
      videos.push({ videoId, title, thumbnail });
    }
  });

  return videos;
}

function findBestMatch(
  videos: RSSVideo[],
  eventTitle: string
): RSSVideo | null {
  const normalized = normalizeText(eventTitle);
  const keywords = normalized.split(/\s+/).filter((w) => w.length > 2);

  let best: RSSVideo | null = null;
  let bestScore = 0;

  for (const video of videos) {
    const vTitle = normalizeText(video.title);
    let score = 0;
    for (const kw of keywords) {
      if (vTitle.includes(kw)) score++;
    }
    if (score > bestScore) {
      bestScore = score;
      best = video;
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
      thumbnailUrl: `https://img.youtube.com/vi/${item.id.videoId}/mqdefault.jpg`,
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

async function searchWithRSS(eventTitle: string): Promise<YouTubeResult> {
  try {
    const res = await fetch(RSS_URL);
    if (!res.ok) throw new Error(`RSS ${res.status}`);

    const xmlText = await res.text();
    const videos = parseRSSFeed(xmlText);

    if (!videos.length) {
      return {
        videoUrl: YOUTUBE_CHANNEL_URL,
        thumbnailUrl: FALLBACK_THUMBNAIL,
        isChannelFallback: true,
      };
    }

    const match = findBestMatch(videos, eventTitle);

    if (match) {
      return {
        videoUrl: `https://www.youtube.com/watch?v=${match.videoId}`,
        thumbnailUrl: match.thumbnail,
        isChannelFallback: false,
        videoTitle: match.title,
      };
    }

    return {
      videoUrl: `https://www.youtube.com/watch?v=${videos[0].videoId}`,
      thumbnailUrl: videos[0].thumbnail,
      isChannelFallback: false,
      videoTitle: videos[0].title,
    };
  } catch (err) {
    console.warn("RSS feed falló:", err);
    return {
      videoUrl: YOUTUBE_CHANNEL_URL,
      thumbnailUrl: FALLBACK_THUMBNAIL,
      isChannelFallback: true,
    };
  }
}

export async function searchEventVideo(
  eventTitle: string
): Promise<YouTubeResult> {
  if (YOUTUBE_API_KEY) {
    try {
      return await searchWithYouTubeAPI(eventTitle);
    } catch {
      console.warn("YouTube API falló, usando RSS feed...");
    }
  }

  return searchWithRSS(eventTitle);
}
