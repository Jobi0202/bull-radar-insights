import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';
import { supabase } from '@/integrations/supabase/client';
import SearchHeader from '@/components/search/SearchHeader';
import SearchResults from '@/components/search/SearchResults';

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'channel' | 'asset' | null>(null);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [determining, setDetermining] = useState(true);
  
  const { mentions, loading, error, fetchMore, hasMore, refresh } = useSupabaseMentions({
    limit: 100,
    filter: searchType && query ? {
      type: searchType,
      value: query
    } : undefined
  });
  
  useEffect(() => {
    const determineSearchType = async () => {
      if (!query) return;
      
      try {
        setDetermining(true);
        console.log('[SearchPage] Determining search type for query:', query);
        
        const { data: channelData, error: channelError } = await supabase
          .from('Youtube Sentiment')
          .select('youtube_channel')
          .ilike('youtube_channel', `%${query}%`)
          .limit(1);
          
        if (channelError) {
          console.error('[SearchPage] Error checking channel matches:', channelError);
          throw channelError;
        }

        const { data: assetData, error: assetError } = await supabase
          .from('Youtube Sentiment')
          .select('Asset')
          .ilike('Asset', `%${query}%`)
          .limit(1);
        
        if (assetError) {
          console.error('[SearchPage] Error checking asset matches:', assetError);
          throw assetError;
        }
        
        console.log('[SearchPage] Match results:', {
          channelMatches: channelData?.length || 0,
          assetMatches: assetData?.length || 0
        });
        
        const exactChannelMatch = channelData?.some(
          item => item.youtube_channel?.toLowerCase() === query.toLowerCase()
        );
        
        const exactAssetMatch = assetData?.some(
          item => item.Asset?.toLowerCase() === query.toLowerCase()
        );
        
        console.log('[SearchPage] Exact matches:', {
          channelExact: exactChannelMatch,
          assetExact: exactAssetMatch
        });
        
        if (exactChannelMatch || (!exactAssetMatch && channelData && channelData.length > 0)) {
          console.log('[SearchPage] Determined as channel search');
          setSearchType('channel');
          loadFilterOptions('Asset');
        } else {
          console.log('[SearchPage] Determined as asset search');
          setSearchType('asset');
          loadFilterOptions('youtube_channel');
        }
      } catch (error) {
        console.error('[SearchPage] Error determining search type:', error);
      } finally {
        setDetermining(false);
      }
    };

    determineSearchType();
  }, [query]);
  
  const loadFilterOptions = async (column: string) => {
    if (!query) return;
    
    try {
      console.log(`[SearchPage] Loading filter options for ${column}`);
      
      const filterColumn = column;
      const whereColumn = column === 'Asset' ? 'youtube_channel' : 'Asset';
      const whereValue = query;
      
      const { data, error } = await supabase
        .from('Youtube Sentiment')
        .select(filterColumn)
        .ilike(whereColumn, `%${whereValue}%`)
        .order(filterColumn);
      
      if (error) {
        console.error('[SearchPage] Error loading filter options:', error);
        throw error;
      }
      
      if (data) {
        const options = Array.from(
          new Set(
            data
              .map(item => item[filterColumn as keyof typeof item] as string)
              .filter(Boolean)
          )
        );
        
        console.log(`[SearchPage] Loaded ${options.length} filter options`);
        setFilterOptions(options);
      }
    } catch (error) {
      console.error('[SearchPage] Error in loadFilterOptions:', error);
    }
  };
  
  const handleFilterChange = (value: string) => {
    console.log('[SearchPage] Filter changed to:', value);
    setCurrentFilter(value);
    
    if (value === 'all') {
      navigate(`/search/${encodeURIComponent(query || '')}`);
      return;
    }
    
    if (searchType === 'asset') {
      navigate(`/search/${encodeURIComponent(query || '')}?channel=${encodeURIComponent(value)}`);
    } else {
      navigate(`/search/${encodeURIComponent(query || '')}?asset=${encodeURIComponent(value)}`);
    }
  };
  
  const handleSearch = (newQuery: string, type: 'channel' | 'asset') => {
    navigate(`/search/${encodeURIComponent(newQuery)}`);
  };

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <SearchHeader onSearch={handleSearch} />
      
      <SearchResults
        query={query}
        searchType={searchType}
        mentions={mentions}
        loading={loading}
        determining={determining}
        error={error}
        hasMore={hasMore}
        filterOptions={filterOptions}
        currentFilter={currentFilter}
        onFilterChange={handleFilterChange}
        onLoadMore={fetchMore}
        onRefresh={refresh}
        onChannelClick={handleSearch}
      />

      {error && (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription>
            <div className="flex flex-col gap-2">
              <p>Error loading data: {error.message}</p>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={refresh}
                className="self-start"
              >
                Try Again
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SearchResultsPage;
