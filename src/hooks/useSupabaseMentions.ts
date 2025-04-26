
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Mention } from '@/types';

export type UseSupabaseMentionsResult = {
  mentions: Mention[];
  loading: boolean;
  error: Error | null;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
};

export type UseSupabaseMentionsOptions = {
  limit?: number;
  filter?: {
    type: 'asset' | 'channel';
    value: string;
  };
};

export function useSupabaseMentions({
  limit = 100,
  filter,
}: UseSupabaseMentionsOptions = {}): UseSupabaseMentionsResult {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchMentions = async (offsetValue: number) => {
    try {
      console.log('Fetching mentions with offset:', offsetValue, 'limit:', limit);
      setLoading(true);
      
      let query = supabase
        .from('Youtube Sentiment')
        .select('*')
        .order('Publish_date', { ascending: false })
        .range(offsetValue, offsetValue + limit - 1);
      
      if (filter) {
        console.log('Applying filter:', filter.type, filter.value);
        if (filter.type === 'asset') {
          query = query.ilike('Asset', `%${filter.value}%`);
        } else if (filter.type === 'channel') {
          query = query.ilike('youtube_channel', `%${filter.value}%`);
        }
      }
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        console.error('Supabase error:', supabaseError);
        throw new Error(supabaseError.message);
      }
      
      console.log('Fetched data count:', data?.length || 0);
      
      // Transform the data to match the Mention type
      const transformedData: Mention[] = data ? data.map(item => ({
        id: item.id.toString(),
        created_at: item.created_at,
        youtube_channel: item.youtube_channel || '',
        Asset: item.Asset || '',
        Publish_date: item.Publish_date || new Date().toISOString(),
        Sentiment: (item.Sentiment as 'Bullish' | 'Bearish' | 'Neutral') || 'Neutral',
        Analysis: item.Analysis || '',
        Score: item.Score || 0,
        Video_Name: item.Video_Name || '',
        URL: item.URL || '',
        VideoID: item.VideoID || ''
      })) : [];
      
      if (offsetValue === 0) {
        setMentions(transformedData);
      } else {
        setMentions(prev => [...prev, ...transformedData]);
      }
      
      setHasMore(data && data.length === limit);
      setError(null);
    } catch (err) {
      console.error('Error fetching mentions:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch mentions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentions(0);
    setOffset(0);
  }, [filter?.type, filter?.value]);

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    const newOffset = offset + limit;
    await fetchMentions(newOffset);
    setOffset(newOffset);
  };

  return { mentions, loading, error, fetchMore, hasMore };
}
