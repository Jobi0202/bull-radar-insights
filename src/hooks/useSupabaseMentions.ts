import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Mention } from '@/types';
import { toast } from '@/components/ui/sonner';
import { DateRange } from 'react-day-picker';

export type UseSupabaseMentionsResult = {
  mentions: Mention[];
  loading: boolean;
  error: Error | null;
  fetchMore: () => Promise<void>;
  hasMore: boolean;
  refresh: () => Promise<void>;
};

export type UseSupabaseMentionsOptions = {
  limit?: number;
  filter?: {
    type: 'asset' | 'channel';
    value: string;
  };
  dateRange?: DateRange;
};

export function useSupabaseMentions({
  limit = 100,
  filter,
  dateRange,
}: UseSupabaseMentionsOptions = {}): UseSupabaseMentionsResult {
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [fetchCount, setFetchCount] = useState(0);

  const fetchMentions = async (offsetValue: number, isRefresh = false) => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('Youtube Sentiment')
        .select('*')
        .order('Publish_date', { ascending: false });
      
      // Apply date range filter if provided
      if (dateRange?.from) {
        query = query.gte('Publish_date', dateRange.from.toISOString());
      }
      if (dateRange?.to) {
        query = query.lte('Publish_date', dateRange.to.toISOString());
      }
      
      // Apply search filter if provided
      if (filter) {
        if (filter.type === 'asset') {
          query = query.ilike('Asset', `%${filter.value}%`);
        } else if (filter.type === 'channel') {
          query = query.ilike('youtube_channel', `%${filter.value}%`);
        }
      }
      
      // Apply pagination
      query = query.range(offsetValue, offsetValue + limit - 1);
      
      const { data, error: supabaseError } = await query;
      
      if (supabaseError) {
        throw supabaseError;
      }

      const transformedData: Mention[] = (data || []).map(item => ({
        id: item.id?.toString() || '',
        created_at: item.created_at || new Date().toISOString(),
        youtube_channel: item.youtube_channel || '',
        Asset: item.Asset || '',
        Publish_date: item.Publish_date || new Date().toISOString(),
        Sentiment: item.Sentiment || 'Neutral',
        Analysis: item.Analysis || '',
        Score: typeof item.Score === 'number' ? item.Score : 0,
        Video_Name: item.Video_Name || '',
        URL: item.URL || '',
        VideoID: item.VideoID || ''
      }));
      
      if (isRefresh || offsetValue === 0) {
        setMentions(transformedData);
      } else {
        setMentions(prev => [...prev, ...transformedData]);
      }
      
      setHasMore(transformedData.length >= limit);
      setError(null);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentions';
      setError(new Error(errorMessage));
      toast.error("Failed to load data", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filters change
  useEffect(() => {
    fetchMentions(0, true);
    setOffset(0);
  }, [filter?.type, filter?.value, dateRange?.from, dateRange?.to]);

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    const newOffset = offset + limit;
    await fetchMentions(newOffset);
    setOffset(newOffset);
  };

  const refresh = async () => {
    return fetchMentions(0, true);
  };

  return { mentions, loading, error, fetchMore, hasMore, refresh };
}
