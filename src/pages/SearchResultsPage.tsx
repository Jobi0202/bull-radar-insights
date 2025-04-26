
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import MentionsTable from '@/components/MentionsTable';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
import Autocomplete from '@/components/Autocomplete';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSupabaseMentions } from '@/hooks/useSupabaseMentions';
import { supabase } from '@/integrations/supabase/client';

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const [searchType, setSearchType] = useState<'channel' | 'asset' | null>(null);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  
  const { mentions, loading, error, fetchMore, hasMore } = useSupabaseMentions({
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
        // Check for channel matches
        const { data: channelData } = await supabase
          .from('Youtube Sentiment')
          .select('youtube_channel')
          .ilike('youtube_channel', `%${query}%`)
          .limit(1);
          
        // Check for asset matches
        const { data: assetData } = await supabase
          .from('Youtube Sentiment')
          .select('Asset')
          .ilike('Asset', `%${query}%`)
          .limit(1);
        
        // Count exact matches
        const exactChannelMatch = channelData?.some(
          item => item.youtube_channel?.toLowerCase() === query.toLowerCase()
        );
        
        const exactAssetMatch = assetData?.some(
          item => item.Asset?.toLowerCase() === query.toLowerCase()
        );
        
        // Set search type based on matches
        if (exactChannelMatch || (!exactAssetMatch && channelData && channelData.length > 0)) {
          setSearchType('channel');
          // Load filter options (assets)
          loadFilterOptions('Asset');
        } else {
          setSearchType('asset');
          // Load filter options (channels)
          loadFilterOptions('youtube_channel');
        }
      } catch (error) {
        console.error('Error determining search type:', error);
      }
    };

    determineSearchType();
  }, [query]);
  
  const loadFilterOptions = async (column: string) => {
    if (!query) return;
    
    try {
      const filterColumn = column;
      const whereColumn = column === 'Asset' ? 'youtube_channel' : 'Asset';
      const whereValue = query;
      
      const { data } = await supabase
        .from('Youtube Sentiment')
        .select(filterColumn)
        .ilike(whereColumn, `%${whereValue}%`)
        .order(filterColumn);
      
      if (data) {
        // Extract unique values
        const options = Array.from(
          new Set(
            data
              .map(item => item[filterColumn as keyof typeof item] as string)
              .filter(Boolean)
          )
        );
        
        setFilterOptions(options);
      }
    } catch (error) {
      console.error('Error loading filter options:', error);
    }
  };
  
  const handleFilterChange = (value: string) => {
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
          <CardHeader className="bg-primary/5 dark:bg-primary/10">
            <CardTitle className="text-xl font-semibold">
              {searchType === 'asset' 
                ? `Mentions for Asset: "${query}"` 
                : `${query}`}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <MentionsTable 
              mentions={mentions} 
              filterOptions={filterOptions}
              filterLabel={searchType === 'asset' ? "Filter by Channel" : "Filter by Asset"}
              onFilterChange={handleFilterChange}
              expandedView={searchType}
              isExpandable={true}
              loading={loading}
              hasMore={hasMore}
              onLoadMore={fetchMore}
            />
          </CardContent>
        </Card>

        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md mt-4">
            Error loading data: {error.message}
          </div>
        )}
      </main>
    </div>
  );
};

export default SearchResultsPage;
