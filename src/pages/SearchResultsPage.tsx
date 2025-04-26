
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import MentionsTable from '@/components/MentionsTable';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Autocomplete from '@/components/Autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';
import { supabase } from '@/integrations/supabase/client';
import { RefreshCw } from 'lucide-react';

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
  
  // Determine if query is a channel or an asset
  useEffect(() => {
    const determineSearchType = async () => {
      if (!query) return;
      
      try {
        setDetermining(true);
        console.log('[SearchPage] Determining search type for query:', query);
        
        // Check for channel matches
        const { data: channelData, error: channelError } = await supabase
          .from('Youtube Sentiment')
          .select('youtube_channel')
          .ilike('youtube_channel', `%${query}%`)
          .limit(1);
          
        if (channelError) {
          console.error('[SearchPage] Error checking channel matches:', channelError);
          throw channelError;
        }

        // Check for asset matches
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
        
        // Count exact matches
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
        
        // Set search type based on matches
        if (exactChannelMatch || (!exactAssetMatch && channelData && channelData.length > 0)) {
          console.log('[SearchPage] Determined as channel search');
          setSearchType('channel');
          // Load filter options (assets)
          loadFilterOptions('Asset');
        } else {
          console.log('[SearchPage] Determined as asset search');
          setSearchType('asset');
          // Load filter options (channels)
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
        // Extract unique values
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
      // Reset to unfiltered results
      navigate(`/search/${encodeURIComponent(query || '')}`);
      return;
    }
    
    // Navigate to the appropriate filtered search
    if (searchType === 'asset') {
      // Filter by channel
      navigate(`/search/${encodeURIComponent(query || '')}?channel=${encodeURIComponent(value)}`);
    } else {
      // Filter by asset
      navigate(`/search/${encodeURIComponent(query || '')}?asset=${encodeURIComponent(value)}`);
    }
  };
  
  const handleSearch = (newQuery: string) => {
    navigate(`/search/${encodeURIComponent(newQuery)}`);
  };
  
  const handleRefresh = async () => {
    await refresh();
  };
  
  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <header className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            ← Back
          </Button>
          <Logo />
        </div>
        <div className="flex items-center gap-4">
          <Autocomplete 
            onSearch={handleSearch} 
            type={searchType === 'asset' ? 'channel' : 'asset'}
            placeholder="Search assets or channels..."
          />
          <ThemeToggle />
        </div>
      </header>
      
      <main>
        <Card className="overflow-hidden border-none shadow-lg">
          <CardHeader className="bg-primary/5 dark:bg-primary/10 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-semibold">
              {determining ? 'Searching...' : (
                searchType === 'asset' 
                  ? `Mentions for Asset: "${query}"` 
                  : `${query}`
              )}
            </CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRefresh} 
              disabled={loading || determining}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${(loading || determining) ? 'animate-spin' : ''}`} />
              {(loading || determining) ? 'Loading...' : 'Refresh'}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <MentionsTable 
              mentions={mentions} 
              filterOptions={filterOptions}
              filterLabel={searchType === 'asset' ? "Filter by Channel" : "Filter by Asset"}
              onFilterChange={handleFilterChange}
              expandedView={searchType}
              isExpandable={true}
              loading={loading || determining}
              hasMore={hasMore}
              onLoadMore={fetchMore}
            />
            
            {mentions.length === 0 && !loading && !determining && !error && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No results found for "{query}". Try a different search term.</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate('/')} 
                  className="mt-4"
                >
                  Return to Homepage
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              <div className="flex flex-col gap-2">
                <p>Error loading data: {error.message}</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleRefresh}
                  className="self-start"
                >
                  Try Again
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;
