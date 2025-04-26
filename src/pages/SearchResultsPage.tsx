
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import SearchBar from '@/components/SearchBar';
import MentionsTable from '@/components/MentionsTable';
import { Button } from '@/components/ui/button';
import { Mention } from '@/types';
import { 
  getMentionsByAsset, 
  getMentionsByChannel,
  getUniqueAssets, 
  getUniqueChannels
} from '@/data/mockData';

const SearchResultsPage: React.FC = () => {
  const { query } = useParams<{ query: string }>();
  const navigate = useNavigate();
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [filterOptions, setFilterOptions] = useState<string[]>([]);
  const [currentFilter, setCurrentFilter] = useState('all');
  const [searchType, setSearchType] = useState<'channel' | 'asset' | null>(null);
  
  useEffect(() => {
    if (!query) return;
    
    // Try to determine if this is a channel or asset search
    const matchingChannels = getUniqueChannels().filter(
      channel => channel.toLowerCase().includes(query.toLowerCase())
    );
    
    const matchingAssets = getUniqueAssets().filter(
      asset => asset.toLowerCase().includes(query.toLowerCase())
    );
    
    // If exact match with an asset, treat as asset search
    if (matchingAssets.includes(query)) {
      const assetMentions = getMentionsByAsset(query);
      setMentions(assetMentions);
      setFilterOptions(getUniqueChannels());
      setSearchType('asset');
    } 
    // If exact match with a channel, treat as channel search
    else if (matchingChannels.includes(query)) {
      const channelMentions = getMentionsByChannel(query);
      setMentions(channelMentions);
      setFilterOptions(getUniqueAssets());
      setSearchType('channel');
    }
    // More matches for assets than channels, treat as asset search
    else if (matchingAssets.length > matchingChannels.length) {
      const assetMentions = getMentionsByAsset(query);
      setMentions(assetMentions);
      setFilterOptions(getUniqueChannels());
      setSearchType('asset');
    } 
    // Default to channel search
    else {
      const channelMentions = getMentionsByChannel(query);
      setMentions(channelMentions);
      setFilterOptions(getUniqueAssets());
      setSearchType('channel');
    }
  }, [query]);
  
  const handleFilterChange = (value: string) => {
    setCurrentFilter(value);
    
    if (value === 'all') {
      // Reset to unfiltered results
      if (searchType === 'asset' && query) {
        setMentions(getMentionsByAsset(query));
      } else if (searchType === 'channel' && query) {
        setMentions(getMentionsByChannel(query));
      }
      return;
    }
    
    // Apply the filter
    if (searchType === 'asset' && query) {
      // Filter by channel
      setMentions(getMentionsByAsset(query).filter(m => m.youtube_channel === value));
    } else if (searchType === 'channel' && query) {
      // Filter by asset
      setMentions(getMentionsByChannel(query).filter(m => m.Asset === value));
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
        <SearchBar onSearch={handleSearch} />
      </header>
      
      <main>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            {searchType === 'asset' 
              ? `Mentions for Asset: "${query}"` 
              : `${query}`}
          </h2>
          
          <MentionsTable 
            mentions={mentions} 
            filterOptions={filterOptions}
            filterLabel={searchType === 'asset' ? "Filter by Channel" : "Filter by Asset"}
            onFilterChange={handleFilterChange}
            expandedView={searchType}
            isExpandable={true}
          />
        </div>
      </main>
    </div>
  );
};

export default SearchResultsPage;
