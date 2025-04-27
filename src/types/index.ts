
export type SentimentType = 'Strong Bullish' | 'Slightly Bullish' | 'Bullish' | 'Strong Bearish' | 'Slightly Bearish' | 'Bearish' | 'Neutral (Hold)' | 'Neutral';

export interface Mention {
  id: string;
  created_at: string;
  youtube_channel: string;
  Asset: string;
  Publish_date: string;
  Sentiment: SentimentType;
  Analysis: string;
  Score: number;
  Video_Name: string;
  URL: string;
  VideoID: string;
}

export interface ChannelAssetDetails {
  Name?: string | null;
  Type?: string | null;
  ImageURL?: string | null;
  Description?: string | null;
  ChannelURL?: string | null;
}
