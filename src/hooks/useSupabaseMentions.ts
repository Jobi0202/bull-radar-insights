
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Mention } from '@/types';
import { toast } from '@/components/ui/sonner';

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
  const [fetchCount, setFetchCount] = useState(0);

  const fetchMentions = async (offsetValue: number, isRefresh = false) => {
    try {
      console.log(`[useSupabaseMentions] Fetching mentions (${fetchCount + 1}):`);
      console.log(`- Offset: ${offsetValue}`);
      console.log(`- Limit: ${limit}`);
      console.log(`- Filter:`, filter ? JSON.stringify(filter) : 'none');
      
      setLoading(true);
      
      let query = supabase
        .from('Youtube Sentiment')
        .select('*')
        .order('Publish_date', { ascending: false })
        .range(offsetValue, offsetValue + limit - 1);
      
      if (filter) {
        console.log(`[useSupabaseMentions] Applying filter: ${filter.type}="${filter.value}"`);
        if (filter.type === 'asset') {
          query = query.ilike('Asset', `%${filter.value}%`);
        } else if (filter.type === 'channel') {
          query = query.ilike('youtube_channel', `%${filter.value}%`);
        }
      }
      
      const { data, error: supabaseError, count } = await query;
      
      if (supabaseError) {
        console.error('[useSupabaseMentions] Supabase error:', supabaseError);
        setError(new Error(supabaseError.message));
        
        // Show toast for error
        toast.error("Failed to load data", {
          description: `Error: ${supabaseError.message}`,
        });
        
        return;
      }

      console.log(`[useSupabaseMentions] Response:`, {
        count: data?.length || 0,
        hasData: !!data && data.length > 0,
        firstItem: data && data.length > 0 ? data[0].id : null,
      });
      
      if (!data || data.length === 0) {
        console.log('[useSupabaseMentions] No data returned.');
        
        if (offsetValue === 0) {
          setMentions([]);
          setHasMore(false);
        }
        
        return;
      }
      
      // Transform the data to match the Mention type
      const transformedData: Mention[] = data.map(item => ({
        id: item.id?.toString() || '',
        created_at: item.created_at || new Date().toISOString(),
        youtube_channel: item.youtube_channel || '',
        Asset: item.Asset || '',
        Publish_date: item.Publish_date || new Date().toISOString(),
        Sentiment: (item.Sentiment as 'Bullish' | 'Bearish' | 'Neutral') || 'Neutral',
        Analysis: item.Analysis || '',
        Score: typeof item.Score === 'number' ? item.Score : 0,
        Video_Name: item.Video_Name || '',
        URL: item.URL || '',
        VideoID: item.VideoID || ''
      }));
      
      console.log(`[useSupabaseMentions] Transformed first item:`, transformedData[0]);
      
      if (isRefresh || offsetValue === 0) {
        setMentions(transformedData);
      } else {
        setMentions(prev => [...prev, ...transformedData]);
      }
      
      setHasMore(data.length >= limit);
      setFetchCount(prev => prev + 1);
      setError(null);
    } catch (err) {
      console.error('[useSupabaseMentions] Unhandled error:', err);
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch mentions';
      setError(new Error(errorMessage));
      
      toast.error("Failed to load data", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch and when filter changes
  useEffect(() => {
    console.log('[useSupabaseMentions] Initial fetch or filter changed:', filter);
    fetchMentions(0, true);
    setOffset(0);
  }, [filter?.type, filter?.value]);

  const fetchMore = async () => {
    if (loading || !hasMore) return;
    
    console.log('[useSupabaseMentions] Fetching more data');
    const newOffset = offset + limit;
    await fetchMentions(newOffset);
    setOffset(newOffset);
  };

  const refresh = async () => {
    console.log('[useSupabaseMentions] Manual refresh requested');
    return fetchMentions(0, true);
  };

  return { mentions, loading, error, fetchMore, hasMore, refresh };
}
