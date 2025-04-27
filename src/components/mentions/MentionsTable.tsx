import { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableHead, 
  TableHeader, 
  TableRow,
  TableCell  // Added this import
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mention } from '@/types';
import MentionRow from './MentionRow';
import MentionDetails from './MentionDetails';

interface MentionsTableProps {
  mentions: Mention[];
  isExpandable?: boolean;
  filterOptions?: string[];
  filterLabel?: string;
  onFilterChange?: (value: string) => void;
  expandedView?: 'channel' | 'asset';
  onLoadMore?: () => void;
  hasMore?: boolean;
  loading?: boolean;
  onChannelClick?: (channel: string) => void;
}

const MentionsTable = ({ 
  mentions, 
  isExpandable = false, 
  filterOptions = [],
  filterLabel = "Filter",
  onFilterChange,
  expandedView,
  onLoadMore,
  hasMore = false,
  loading = false,
  onChannelClick
}: MentionsTableProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="space-y-4">
      {filterOptions.length > 0 && onFilterChange && (
        <div className="flex items-center gap-2">
          <Select onValueChange={onFilterChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder={`${filterLabel}: All`} />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="all">{filterLabel}: All</SelectItem>
                {filterOptions.map(option => (
                  <SelectItem key={option} value={option}>{option}</SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      )}
      
      <div className="table-container">
        <Table>
          <TableHeader>
            <TableRow>
              {expandedView !== 'channel' && (
                <TableHead className="w-[180px] min-w-[120px]">Channel</TableHead>
              )}
              {expandedView !== 'asset' && (
                <TableHead className="w-[150px] min-w-[100px]">Asset</TableHead>
              )}
              <TableHead className="w-[110px] min-w-[90px]">Date</TableHead>
              <TableHead className="min-w-[120px]">Sentiment</TableHead>
              <TableHead className="hidden md:table-cell">Video</TableHead>
              {isExpandable && <TableHead className="w-[80px]"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {mentions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  {loading ? 'Loading...' : 'No results found.'}
                </TableCell>
              </TableRow>
            ) : (
              mentions.map((mention) => (
                <>
                  <MentionRow
                    key={`row-${mention.id}`}
                    mention={mention}
                    expandedView={expandedView}
                    onChannelClick={onChannelClick}
                    isExpanded={expandedId === mention.id}
                    onToggleExpand={() => toggleExpand(mention.id)}
                    isExpandable={isExpandable}
                  />
                  {expandedId === mention.id && (
                    <MentionDetails
                      key={`details-${mention.id}`}
                      mention={mention}
                      expandedView={expandedView}
                    />
                  )}
                </>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {hasMore && (
        <div className="flex justify-center mt-4">
          <Button 
            onClick={onLoadMore} 
            variant="default" 
            className="w-full max-w-xs"
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Load More Results'}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MentionsTable;