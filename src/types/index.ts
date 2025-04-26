
export interface Mention {
  id: string;
  created_at: string;
  youtube_channel: string;
  Asset: string;
  Publish_date: string;
  Sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  Analysis: string;
  Score: number;
  Video_Name: string;
  URL: string;
  VideoID: string;
}
