
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from 'lucide-react';
import MentionsTable from '@/components/mentions/MentionsTable';
import ChannelAssetDetails from '@/components/ChannelAssetDetails';
import { Mention } from '@/types';

interface SearchResultsProps {
  query: string | undefined;
  searchType: 'channel' | 'asset' | null;
  mentions: Mention[];
  loading: boolean;
  determining: boolean;
  error: Error | null;
  hasMore: boolean;
  filterOptions: string[];
  currentFilter: string;
  onFilterChange: (value: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onChannelClick?: (channel: string) => void;
}

const SearchResults = ({
  query,
  searchType,
  mentions,
  loading,
  determining,
  error,
  hasMore,
  filterOptions,
  currentFilter,
  onFilterChange,
  onLoadMore,
  onRefresh,
  onChannelClick,
}: SearchResultsProps) => {
  return (
    <main>
      {query && searchType && (
        <Card className="mb-6 overflow-hidden">
          <CardContent className="p-6">
            <ChannelAssetDetails 
              type={searchType} 
              name={query}
            />
          </CardContent>
        </Card>
      )}

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
            onClick={onRefresh} 
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
            onFilterChange={onFilterChange}
            expandedView={searchType}
            isExpandable={true}
            loading={loading || determining}
            hasMore={hasMore}
            onLoadMore={onLoadMore}
            onChannelClick={onChannelClick}
          />
        </CardContent>
      </Card>
    </main>
  );
};

export default SearchResults;
